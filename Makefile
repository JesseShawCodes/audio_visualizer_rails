.PHONY: visualizer-start visualizer-stop web-bash db-bash db-prepare console

# Start the application and its dependencies
visualizer-start:
	docker compose up --build

# Stop the application
visualizer-stop:
	docker compose down

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
