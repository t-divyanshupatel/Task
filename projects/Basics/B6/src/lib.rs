use std::fs;
use std::io;
use std::path::Path;

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
pub struct LogCounts {
    pub info: usize,
    pub warn: usize,
    pub error: usize,
}

impl LogCounts {
    pub fn total(&self) -> usize {
        self.info + self.warn + self.error
    }
}

#[derive(Debug)]
pub enum LogCounterError {
    MissingFile { path: String },
    ReadFailed { path: String, source: io::Error },
}

impl std::fmt::Display for LogCounterError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::MissingFile { path } => write!(f, "file not found: {path}"),
            Self::ReadFailed { path, source } => {
                write!(f, "failed to read {path}: {source}")
            }
        }
    }
}

impl std::error::Error for LogCounterError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::ReadFailed { source, .. } => Some(source),
            Self::MissingFile { .. } => None,
        }
    }
}

pub fn count_log_levels_from_str(content: &str) -> LogCounts {
    let mut counts = LogCounts::default();

    for line in content.lines() {
        match classify_line(line) {
            Some(LogLevel::Info) => counts.info += 1,
            Some(LogLevel::Warn) => counts.warn += 1,
            Some(LogLevel::Error) => counts.error += 1,
            None => {}
        }
    }

    counts
}

pub fn count_log_levels_from_file<P: AsRef<Path>>(path: P) -> Result<LogCounts, LogCounterError> {
    let path = path.as_ref();
    let path_display = path.display().to_string();

    if !path.exists() {
        return Err(LogCounterError::MissingFile {
            path: path_display,
        });
    }

    let content = fs::read_to_string(path).map_err(|source| LogCounterError::ReadFailed {
        path: path_display,
        source,
    })?;

    Ok(count_log_levels_from_str(&content))
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum LogLevel {
    Info,
    Warn,
    Error,
}

fn classify_line(line: &str) -> Option<LogLevel> {
    // Highest severity wins if a line mentions multiple levels.
    if contains_level(line, "ERROR") {
        Some(LogLevel::Error)
    } else if contains_level(line, "WARN") {
        Some(LogLevel::Warn)
    } else if contains_level(line, "INFO") {
        Some(LogLevel::Info)
    } else {
        None
    }
}

fn contains_level(line: &str, level: &str) -> bool {
    line.split(|c: char| !c.is_ascii_alphanumeric())
        .any(|token| token == level)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn counts_mixed_log_levels() {
        let input = "\
2024-01-01 INFO Server started
2024-01-01 WARN Disk space low
2024-01-01 ERROR Connection refused
[INFO] user logged in
";

        let counts = count_log_levels_from_str(input);

        assert_eq!(counts.info, 2);
        assert_eq!(counts.warn, 1);
        assert_eq!(counts.error, 1);
        assert_eq!(counts.total(), 4);
    }

    #[test]
    fn empty_file_returns_zero_counts() {
        let counts = count_log_levels_from_str("");

        assert_eq!(counts, LogCounts::default());
    }

    #[test]
    fn ignores_lines_without_levels() {
        let input = "debug trace\nplain text line\n";

        let counts = count_log_levels_from_str(input);

        assert_eq!(counts, LogCounts::default());
    }

    #[test]
    fn missing_file_returns_error() {
        let result = count_log_levels_from_file("/tmp/log-counter-does-not-exist.log");

        match result {
            Err(LogCounterError::MissingFile { path }) => {
                assert_eq!(path, "/tmp/log-counter-does-not-exist.log");
            }
            other => panic!("expected MissingFile error, got {other:?}"),
        }
    }

    #[test]
    fn error_takes_precedence_when_line_contains_multiple_levels() {
        let input = "INFO failed while handling ERROR\nWARN before ERROR\n";

        let counts = count_log_levels_from_str(input);

        assert_eq!(counts.info, 0);
        assert_eq!(counts.warn, 0);
        assert_eq!(counts.error, 2);
    }

    #[test]
    fn lowercase_levels_are_ignored() {
        let input = "info warn error\nsomething informational\n";

        let counts = count_log_levels_from_str(input);

        assert_eq!(counts, LogCounts::default());
    }

    #[test]
    fn counts_bracket_and_colon_formats() {
        let input = "[INFO] boot complete\nWARN: retry scheduled\nlevel=ERROR\n";

        let counts = count_log_levels_from_str(input);

        assert_eq!(counts.info, 1);
        assert_eq!(counts.warn, 1);
        assert_eq!(counts.error, 1);
    }

    #[test]
    fn counts_from_file_on_disk() {
        let dir = std::env::temp_dir().join("log-counter-tests");
        std::fs::create_dir_all(&dir).expect("failed to create temp dir");

        let path = dir.join("mixed.log");
        std::fs::write(
            &path,
            "INFO one\nWARN two\nERROR three\n[INFO] four\nplain line\n",
        )
        .expect("failed to write temp log");

        let counts = count_log_levels_from_file(&path).expect("expected readable temp file");

        assert_eq!(counts.info, 2);
        assert_eq!(counts.warn, 1);
        assert_eq!(counts.error, 1);
        assert_eq!(counts.total(), 4);

        std::fs::remove_file(path).ok();
    }
}
