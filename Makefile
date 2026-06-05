.PHONY: visualizer-start visualizer-stop visualizer-clean visualizer-bash db-bash db-prepare console bundle-install fix-permissions \
	assets-build build-js build-css logs-js logs-css logs-web \
	test test-all test-js test-js-coverage test-coverage lint ci

# Start the application and its dependencies
visualizer-start:
	docker compose up --build -d

# Stop the application
visualizer-stop:
	docker compose down

# Stop and remove all volumes (useful for fixing permission issues)
visualizer-clean:
	docker compose down -v
	rm -rf app/assets/builds/*

# Bash into the running Rails web container
visualizer-bash:
	docker compose exec web bash

# Bash into the running PostgreSQL database container
db-bash:
	docker compose exec db bash

# Run database setup/migrations inside the web container
db-prepare:
	docker compose exec web bin/rails db:prepare

# Open the Rails console inside the web container
console:
	docker compose exec web bin/rails console

# Fix permissions for files that need to be updated by the container
fix-permissions:
	chmod 666 Gemfile.lock yarn.lock

# Run bundle install inside the web container
bundle-install:
	docker compose exec web bundle install
	@echo "Note: If Gemfile.lock didn't update, try running 'make fix-permissions' first."

# --- Assets ---

# Build all assets (JS and CSS)
assets-build: build-js build-css

# Build JS assets manually
build-js:
	docker compose exec js yarn build

# Build CSS assets manually
build-css:
	docker compose exec css yarn build:css

# View logs for specific services
logs-js:
	docker compose logs -f js

logs-css:
	docker compose logs -f css

logs-web:
	docker compose logs -f web

# --- Testing & Quality ---

# Run all tests (Rails + JS)
test-all: test test-js

# Run Rails tests (default test)
test:
	docker compose exec web bin/rails test

# Run JavaScript tests (Vitest)
test-js:
	docker compose exec js yarn test

# Run JavaScript tests with coverage
test-js-coverage:
	docker compose exec js yarn coverage

# Run all tests with coverage (Rails + JS)
test-coverage:
	docker compose exec web bin/rails test
	docker compose exec js yarn coverage

# Run RuboCop for Ruby styling
lint:
	docker compose exec web bin/rubocop

# Run the complete CI suite inside the web container
ci:
	docker compose exec web bin/ci

# --- Infrastructure ---

colima-stop:
	colima stop

colima-start:
	colima start --memory 16

colima-stop-force:
	colima stop --force
