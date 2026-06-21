use fraud_scorer::{score_transaction, TransactionIngest};
use std::io::{self, Read};

fn main() {
    if let Err(msg) = run() {
        eprintln!("{{\"error\":\"{}\"}}", msg.replace('"', "\\\""));
        std::process::exit(1);
    }
}

fn run() -> Result<(), String> {
    let mut input = String::new();
    io::stdin()
        .read_to_string(&mut input)
        .map_err(|e| format!("read stdin: {e}"))?;

    let tx: TransactionIngest =
        serde_json::from_str(&input).map_err(|e| format!("invalid JSON: {e}"))?;

    let result = score_transaction(&tx)?;
    let json = serde_json::to_string(&result).map_err(|e| format!("encode JSON: {e}"))?;
    println!("{json}");
    Ok(())
}
