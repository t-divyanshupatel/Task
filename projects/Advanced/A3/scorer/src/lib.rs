//! Fraud scoring library — shared by CLI and unit tests.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TransactionIngest {
    pub transaction_id: String,
    pub user_id: String,
    pub amount: f64,
    pub currency: String,
    pub merchant_category: String,
    pub country_code: String,
    pub device_id: String,
    pub timestamp: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct FraudScoreResult {
    pub transaction_id: String,
    pub risk_score: f64,
    pub risk_level: String,
    pub reasons: Vec<String>,
}

const LOW_RISK_COUNTRIES: &[&str] = &["US", "CA", "GB", "DE", "FR", "AU"];
const HIGH_RISK_CATEGORIES: &[&str] = &["gambling", "crypto", "wire_transfer"];

/// Compute fraud risk score from a transaction payload.
pub fn score_transaction(tx: &TransactionIngest) -> Result<FraudScoreResult, String> {
    if tx.amount <= 0.0 {
        return Err("amount must be positive".into());
    }
    if tx.transaction_id.is_empty() {
        return Err("transaction_id is required".into());
    }

    let mut points = 0.0_f64;
    let mut reasons = Vec::new();

    if tx.amount >= 10_000.0 {
        points += 30.0;
        reasons.push("high_amount".into());
    } else if tx.amount >= 5_000.0 {
        points += 15.0;
        reasons.push("elevated_amount".into());
    }

    if HIGH_RISK_CATEGORIES.contains(&tx.merchant_category.as_str()) {
        points += 35.0;
        reasons.push("high_risk_category".into());
    }

    let country = tx.country_code.to_uppercase();
    if !LOW_RISK_COUNTRIES.contains(&country.as_str()) {
        points += 25.0;
        reasons.push("high_risk_country".into());
    }

    let risk_score = points.min(100.0);
    let risk_level = classify_level(risk_score);

    Ok(FraudScoreResult {
        transaction_id: tx.transaction_id.clone(),
        risk_score,
        risk_level: risk_level.to_string(),
        reasons,
    })
}

fn classify_level(score: f64) -> &'static str {
    if score >= 67.0 {
        "high"
    } else if score >= 34.0 {
        "medium"
    } else {
        "low"
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sample_tx(amount: f64, category: &str, country: &str) -> TransactionIngest {
        TransactionIngest {
            transaction_id: "550e8400-e29b-41d4-a716-446655440000".into(),
            user_id: "user-1".into(),
            amount,
            currency: "USD".into(),
            merchant_category: category.into(),
            country_code: country.into(),
            device_id: "dev-1".into(),
            timestamp: "2026-06-21T12:00:00Z".into(),
        }
    }

    #[test]
    fn low_risk_retail_us() {
        let result = score_transaction(&sample_tx(50.0, "retail", "US")).unwrap();
        assert_eq!(result.risk_score, 0.0);
        assert_eq!(result.risk_level, "low");
        assert!(result.reasons.is_empty());
    }

    #[test]
    fn high_risk_combined_rules() {
        let result = score_transaction(&sample_tx(15_000.0, "crypto", "NG")).unwrap();
        assert_eq!(result.risk_score, 90.0);
        assert_eq!(result.risk_level, "high");
        assert!(result.reasons.contains(&"high_amount".to_string()));
        assert!(result.reasons.contains(&"high_risk_category".to_string()));
        assert!(result.reasons.contains(&"high_risk_country".to_string()));
    }

    #[test]
    fn rejects_non_positive_amount() {
        let err = score_transaction(&sample_tx(0.0, "retail", "US")).unwrap_err();
        assert!(err.contains("positive"));
    }

    #[test]
    fn medium_risk_elevated_amount_abroad() {
        let result = score_transaction(&sample_tx(6_000.0, "retail", "NG")).unwrap();
        assert_eq!(result.risk_score, 40.0);
        assert_eq!(result.risk_level, "medium");
        assert!(result.reasons.contains(&"elevated_amount".to_string()));
        assert!(result.reasons.contains(&"high_risk_country".to_string()));
    }
}
