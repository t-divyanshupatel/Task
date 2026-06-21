output "s3_bucket_name" {
  description = "Name of the S3 bucket for service data."
  value       = aws_s3_bucket.service_data.bucket
}

output "lambda_function_name" {
  description = "Deployed Lambda function name."
  value       = aws_lambda_function.api.function_name
}

output "lambda_function_arn" {
  description = "ARN of the Lambda function."
  value       = aws_lambda_function.api.arn
}

output "api_gateway_id" {
  description = "REST API Gateway ID."
  value       = aws_api_gateway_rest_api.api.id
}

output "api_gateway_invoke_url" {
  description = "Base invoke URL for the API Gateway stage."
  value       = "https://${aws_api_gateway_rest_api.api.id}.execute-api.${var.aws_region}.amazonaws.com/${var.environment}"
}

output "api_gateway_localstack_url" {
  description = "LocalStack URL pattern when use_localstack is true."
  value       = var.use_localstack ? "${var.localstack_endpoint}/restapis/${aws_api_gateway_rest_api.api.id}/${var.environment}/_user_request_" : null
}

output "health_endpoint_url" {
  description = "Full health check URL (AWS format)."
  value       = "https://${aws_api_gateway_rest_api.api.id}.execute-api.${var.aws_region}.amazonaws.com/${var.environment}/health"
}
