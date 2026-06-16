# Log Counter (Rust)

Small CLI that reads a log file and counts lines containing `INFO`, `WARN`, or `ERROR` log levels.

## Example

Given `examples/sample.log`:

```
2024-06-16 INFO Application started
2024-06-16 WARN Retrying request
2024-06-16 ERROR Database unavailable
[INFO] Health check passed
```

Running the tool prints:

```
INFO:  2
WARN:  1
ERROR: 1
```

## Prerequisites

Install Rust via [rustup](https://rustup.rs/) if you do not already have `cargo` on your PATH.

## Build

```bash
cd Task/Basics/B6
cargo build
```

Release binary:

```bash
cargo build --release
```

## Run

```bash
cargo run -- examples/sample.log
```

Or after building:

```bash
./target/debug/log-counter examples/sample.log
```

Missing file (graceful error, exit code 1):

```bash
cargo run -- missing.log
# error: file not found: missing.log
```

## Test

```bash
cargo test
```

Run tests with output:

```bash
cargo test -- --nocapture
```

## Check

```bash
cargo check
```

## Format & lint

```bash
cargo fmt
cargo clippy
```
