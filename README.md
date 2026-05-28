# Visualizer

A Rails application with a containerized development environment.

## Getting Started with Docker

The easiest way to run this application is using Docker Compose.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) or [Colima](https://github.com/abiosoft/colima) installed.

### Start the Application

To build and start the services (Rails + PostgreSQL):

```bash
docker compose up --build
```

The application will be available at `http://localhost:3000`.

### Running Rails Commands

Since the application and database are running inside Docker, you should run Rails commands through `docker compose exec`:

```bash
# Prepare the database (create/migrate)
docker compose exec web bin/rails db:prepare

# Create a migration
docker compose exec web bin/rails generate migration AddFieldsToModel

# Open the Rails console
docker compose exec web bin/rails console

# Manually rebuild assets
docker compose exec web yarn build
docker compose exec web yarn build:css
```

### Troubleshooting Assets

If you see a `Propshaft::MissingAssetError`, it usually means the JavaScript or CSS hasn't been bundled. The application is configured to build assets automatically when it starts. If you make changes and they don't appear, you can run `make assets-build`.

### Database Access

The PostgreSQL database is exposed on your host at port `5432`. You can connect to it using local tools with:
- **Host**: `localhost`
- **Port**: `5432`
- **User**: `postgres`
- **Password**: `password`
