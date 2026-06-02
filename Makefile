.PHONY: visualizer-start visualizer-stop visualizer-clean visualizer-test visualizer-bash db-bash db-prepare console bundle-install assets-build fix-permissions

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

visualizer-test:
	bin/rails test

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

# Build assets inside the web container (non-watch mode)
assets-build:
	docker compose exec web yarn install
	docker compose exec web yarn build
	docker compose exec web yarn build:css

colima-stop:
	colima stop

colima-start:
	colima start --memory 16

colima-stop-force:
	colima stop --force