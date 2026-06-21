def handler(event, context):
    """Minimal Lambda handler for D1 API Gateway integration."""
    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": '{"status":"ok","service":"d1-lambda","message":"Hello from D1"}',
    }
