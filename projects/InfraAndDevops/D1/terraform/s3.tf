resource "aws_s3_bucket" "service_data" {
  bucket = "${local.name_prefix}-data-${random_id.bucket_suffix.hex}"
}

resource "aws_s3_bucket_public_access_block" "service_data" {
  bucket = aws_s3_bucket.service_data.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "service_data" {
  bucket = aws_s3_bucket.service_data.id

  versioning_configuration {
    status = "Enabled"
  }
}
