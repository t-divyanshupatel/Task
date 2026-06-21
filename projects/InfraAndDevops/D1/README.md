# D1 — Terraform AWS Stack (S3 + Lambda + API Gateway)

Small **Terraform** project that provisions an AWS-style stack: **S3 bucket**, **Lambda function**, and **API Gateway REST API** with `GET /` and `GET /health` routes.

Built for **Infra & DevOps D1**: `.tf` files, variables, local backend, LocalStack test provider, `terraform validate` + `terraform plan` proof, and documented apply/destroy commands.

## Requirements checklist

| Requirement | Status |
|-------------|--------|
| `.tf` files and variables | `terraform/*.tf`, `variables.tf` |
| Provider and backend configuration | `providers.tf`, `versions.tf` (local backend) |
| `terraform validate` passes | See `proof/terraform-validate.txt` |
| Clean `terraform plan` | See `proof/terraform-plan.txt` (16 resources, LocalStack provider) |
| Apply + smoke test (LocalStack) | See `proof/terraform-apply-smoke.txt` (requires Docker) |
| README with apply and destroy | Below |
| Proof it works | `proof/` directory |

## What this stack creates

| Resource | Purpose |
|----------|---------|
| **S3 bucket** | Service data store (versioning + public access block) |
| **Lambda** | Python 3.11 handler (`lambda/handler.py`) |
| **IAM role** | Lambda execution role + basic logging policy |
| **API Gateway** | REST API with `GET /` and `GET /health` → Lambda proxy |
| **random_id** | Unique suffix for globally unique S3 bucket name |

### API routes (after apply)

| Method | Path | Backend |
|--------|------|---------|
| `GET` | `/` | Lambda (JSON hello response) |
| `GET` | `/health` | Lambda (same handler) |

## Project layout

```
D1/
├── terraform/
│   ├── versions.tf         # Terraform + providers + local backend
│   ├── providers.tf        # AWS provider (LocalStack or real AWS)
│   ├── variables.tf        # Input variables
│   ├── main.tf             # Locals + random bucket suffix
│   ├── s3.tf               # S3 bucket + versioning + access block
│   ├── lambda.tf           # IAM + Lambda function
│   ├── api_gateway.tf      # REST API + integrations + stage
│   ├── outputs.tf          # Bucket name, Lambda ARN, API URLs
│   ├── build/              # Generated lambda.zip (created at plan)
│   └── terraform.tfstate   # Local state (after apply)
├── lambda/
│   └── handler.py          # Lambda source code
├── docker-compose.yml      # LocalStack for local apply
├── scripts/
│   └── capture-proof.sh    # Regenerate proof/ validate + plan output
├── proof/
│   ├── terraform-validate.txt
│   └── terraform-plan.txt
├── .gitignore
└── README.md
```

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| **Terraform** | ≥ 1.5 | `validate`, `plan`, `apply`, `destroy` |
| **Docker** | 20+ | LocalStack (for local `apply` / `destroy`) |
| **curl** | any | Smoke-test API after apply |

Install Terraform: https://developer.hashicorp.com/terraform/install

Optional: this repo includes a downloaded binary at `D1/.tools/terraform` (macOS arm64) if system Terraform is not installed.

Verify:

```bash
terraform version
# or
./.tools/terraform version
```

## Provider and backend

### Backend — local (test)

State is stored on disk (no remote backend required):

```hcl
terraform {
  backend "local" {
    path = "terraform.tfstate"
  }
}
```

File location after apply: `terraform/terraform.tfstate`

### Provider — AWS with LocalStack (default)

By default `use_localstack = true` points the AWS provider at **LocalStack** (`http://127.0.0.1:4566`) with test credentials. This lets you **plan** without real AWS credentials and **apply** against a local emulator.

| Variable | Default | Description |
|----------|---------|-------------|
| `use_localstack` | `true` | Use LocalStack endpoints |
| `localstack_endpoint` | `http://127.0.0.1:4566` | LocalStack base URL |
| `aws_access_key` | `test` | Access key (LocalStack) |
| `aws_secret_key` | `test` | Secret key (LocalStack) |
| `aws_region` | `us-east-1` | AWS region |
| `project_name` | `d1-service` | Resource name prefix |
| `environment` | `dev` | Environment / API stage name |

To target **real AWS**, set `use_localstack = false` and configure real credentials (see [Real AWS](#real-aws-optional)).

## Quick start — validate and plan (no Docker)

`terraform validate` and `terraform plan` work **without** LocalStack running when using the LocalStack provider configuration (plan is generated locally).

```bash
cd Task/projects/InfraAndDevops/D1/terraform

terraform init
terraform validate
terraform plan
```

Or regenerate proof files:

```bash
cd Task/projects/InfraAndDevops/D1
chmod +x scripts/capture-proof.sh
./scripts/capture-proof.sh
```

Expected validate:

```
Success! The configuration is valid.
```

Expected plan summary:

```
Plan: 16 to add, 0 to change, 0 to destroy.
```

Proof copies are saved in `proof/terraform-validate.txt` and `proof/terraform-plan.txt`.

## Apply and destroy (two terminals + LocalStack)

### Terminal 1 — start LocalStack

```bash
cd Task/projects/InfraAndDevops/D1
docker compose up
```

Wait until LocalStack is ready (port **4566**).

### Terminal 2 — apply Terraform

```bash
cd Task/projects/InfraAndDevops/D1/terraform

terraform init
terraform validate
terraform plan
terraform apply
```

Type `yes` when prompted (or use `terraform apply -auto-approve`).

Expected: **16 resources created**.

### Smoke test after apply

Show outputs:

```bash
terraform output
```

LocalStack API URL pattern:

```bash
# Replace API_ID from terraform output api_gateway_id
curl -s "http://127.0.0.1:4566/restapis/<API_ID>/dev/_user_request_/health"
```

Or use the output `api_gateway_localstack_url`:

```bash
curl -s "$(terraform output -raw api_gateway_localstack_url)health"
```

Expected JSON body includes `"status":"ok"`.

### Destroy

```bash
cd Task/projects/InfraAndDevops/D1/terraform
terraform destroy
```

Type `yes` (or `terraform destroy -auto-approve`).

Stop LocalStack in Terminal 1: `Ctrl+C` then `docker compose down`.

## Terraform commands reference

All commands run from `terraform/`:

| Command | Purpose |
|---------|---------|
| `terraform init` | Download providers, configure local backend |
| `terraform validate` | Check syntax and configuration |
| `terraform fmt` | Format `.tf` files |
| `terraform plan` | Preview changes |
| `terraform apply` | Create infrastructure |
| `terraform destroy` | Tear down all managed resources |
| `terraform output` | Show output values after apply |

### Useful variants

```bash
terraform plan -out=tfplan
terraform apply tfplan

terraform plan -destroy
terraform show
```

## Proof it works

Regenerate all proof files:

```bash
cd Task/projects/InfraAndDevops/D1
chmod +x scripts/capture-proof.sh
./scripts/capture-proof.sh
```

### Captured artifacts

| File | Contents |
|------|----------|
| [`proof/terraform-validate.txt`](proof/terraform-validate.txt) | `terraform validate` — Success |
| [`proof/terraform-plan.txt`](proof/terraform-plan.txt) | Full plan — **16 resources** to add |
| [`proof/terraform-apply-smoke.txt`](proof/terraform-apply-smoke.txt) | LocalStack apply + curl smoke test (when Docker available) |

### Plan resources (16)

1. `random_id.bucket_suffix`
2. `aws_s3_bucket.service_data`
3. `aws_s3_bucket_public_access_block.service_data`
4. `aws_s3_bucket_versioning.service_data`
5. `aws_iam_role.lambda_exec`
6. `aws_iam_role_policy_attachment.lambda_basic`
7. `aws_lambda_function.api`
8. `aws_api_gateway_rest_api.api`
9. `aws_api_gateway_resource.health`
10. `aws_api_gateway_method.get_root`
11. `aws_api_gateway_method.get_health`
12. `aws_api_gateway_integration.lambda_root`
13. `aws_api_gateway_integration.lambda_health`
14. `aws_lambda_permission.apigw_invoke`
15. `aws_api_gateway_deployment.api`
16. `aws_api_gateway_stage.api`

## Real AWS (optional)

1. Set `use_localstack = false` in a `terraform.tfvars` file:

```hcl
use_localstack = false
aws_region     = "us-east-1"
project_name   = "d1-service"
environment    = "dev"
```

2. Configure credentials (`aws configure`, or `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`).

3. Run `terraform plan` and `terraform apply` as usual.

**Warning:** This creates real billable resources. Always run `terraform destroy` when finished.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `terraform: command not found` | Install Terraform or use `D1/.tools/terraform` |
| `Error configuring the backend` | Run `terraform init` from `terraform/` |
| `connection refused` on apply | Start LocalStack: `docker compose up` |
| `docker: command not found` | Install Docker Desktop for local apply |
| S3 bucket name conflict (real AWS) | Change `project_name` or re-run (random suffix) |
| Stale plan | Run `terraform plan` again after config changes |

## Dependencies (providers)

| Provider | Version | Use |
|----------|---------|-----|
| `hashicorp/aws` | ~> 5.0 | S3, Lambda, API Gateway, IAM |
| `hashicorp/archive` | ~> 2.4 | Zip Lambda source |
| `hashicorp/random` | ~> 3.6 | Unique S3 bucket suffix |

Lock file: `terraform/.terraform.lock.hcl` (commit this for reproducible `init`).
