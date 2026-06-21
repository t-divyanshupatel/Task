.PHONY: bootstrap setup test clean run proof devcontainer

# Single command for fresh clone → ready to develop (installs deps + runs tests)
bootstrap:
	@./scripts/bootstrap.sh bootstrap

setup:
	@./scripts/bootstrap.sh setup

test:
	@./scripts/bootstrap.sh test

run:
	@test -x .venv/bin/uvicorn || (echo "Run 'make bootstrap' first" && exit 1)
	@.venv/bin/uvicorn app.main:app --reload --host 127.0.0.1 --port 8080

clean:
	rm -rf .venv .pytest_cache .mise

proof:
	@./scripts/capture-proof.sh
