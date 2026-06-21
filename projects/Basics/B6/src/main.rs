use log_counter::{count_log_levels_from_file, LogCounterError};
use std::env;
use std::process;

fn main() {
    let args: Vec<String> = env::args().collect();

    if args.len() != 2 {
        eprintln!("usage: {} <log-file>", args.first().map(String::as_str).unwrap_or("log-counter"));
        process::exit(2);
    }

    let path = &args[1];

    match count_log_levels_from_file(path) {
        Ok(counts) => {
            println!("INFO:  {}", counts.info);
            println!("WARN:  {}", counts.warn);
            println!("ERROR: {}", counts.error);
        }
        Err(LogCounterError::MissingFile { path }) => {
            eprintln!("error: file not found: {path}");
            process::exit(1);
        }
        Err(err) => {
            eprintln!("error: {err}");
            process::exit(1);
        }
    }
}
