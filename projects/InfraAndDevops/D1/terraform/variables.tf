variable "project_name" {
  description = "Short name prefix for all D1 resources."
  type        = string
  default     = "d1-service"
}

variable "environment" {
  description = "Deployment environment label (used in names and API stage)."
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "AWS region for resources."
  type        = string
  default     = "us-east-1"
}

variable "use_localstack" {
  description = "When true, point the AWS provider at LocalStack for local/test runs."
  type        = bool
  default     = true
}

variable "localstack_endpoint" {
  description = "Base URL for LocalStack (all AWS service endpoints)."
  type        = string
  default     = "http://127.0.0.1:4566"
}

variable "aws_access_key" {
  description = "AWS access key (use test credentials with LocalStack)."
  type        = string
  default     = "test"
  sensitive   = true
}

variable "aws_secret_key" {
  description = "AWS secret key (use test credentials with LocalStack)."
  type        = string
  default     = "test"
  sensitive   = true
}

variable "lambda_runtime" {
  description = "Python runtime for the API Lambda."
  type        = string
  default     = "python3.11"
}

variable "lambda_timeout" {
  description = "Lambda timeout in seconds."
  type        = number
  default     = 10
}
