.PHONY: visualizer-start visualizer-stop visualizer-clean web-bash db-bash db-prepare console assets-build

# Start the application and its dependencies
visualizer-start:
	docker compose up --build

# Stop the application
visualizer-stop:
	docker compose down

# Stop and remove all volumes (useful for fixing permission issues)
visualizer-clean:
	docker compose down -v
	rm -rf app/assets/builds/*

# Bash into the running Rails web container
web-bash:
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

# Build assets inside the web container (non-watch mode)
assets-build:
	docker compose exec web yarn install
	docker compose exec web yarn build
	docker compose exec web yarn build:css
