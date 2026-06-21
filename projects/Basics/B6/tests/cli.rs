use std::path::PathBuf;
use std::process::Command;

fn bin_path() -> PathBuf {
    PathBuf::from(env!("CARGO_BIN_EXE_log-counter"))
}

fn sample_log_path() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("examples/sample.log")
}

#[test]
fn cli_prints_counts_for_sample_log() {
    let output = Command::new(bin_path())
        .arg(sample_log_path())
        .output()
        .expect("failed to run log-counter");

    assert!(output.status.success(), "expected success, got {:?}", output);

    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("INFO:  2"));
    assert!(stdout.contains("WARN:  1"));
    assert!(stdout.contains("ERROR: 1"));
}

#[test]
fn cli_missing_file_exits_with_code_1() {
    let output = Command::new(bin_path())
        .arg("definitely-missing-log-file.log")
        .output()
        .expect("failed to run log-counter");

    assert_eq!(output.status.code(), Some(1));

    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(stderr.contains("error: file not found: definitely-missing-log-file.log"));
}

#[test]
fn cli_without_args_exits_with_code_2() {
    let output = Command::new(bin_path())
        .output()
        .expect("failed to run log-counter");

    assert_eq!(output.status.code(), Some(2));

    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(stderr.contains("usage:"));
}
