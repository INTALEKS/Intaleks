.PHONY: help setup up down restart logs clean db-studio db-migrate db-seed create-admin

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

setup: ## Initial setup - build and start all services with database migration and seeding
	@chmod +x setup-dev.sh
	@./setup-dev.sh

up: ## Start all services (client + server)
	@docker-compose up -d
	@echo "✅ Services started"
	@echo "🌐 Client: http://localhost:3000"
	@echo "🔧 Server: http://localhost:5001"

up-server: ## Start only server-related services (postgres, redis, server)
	@docker-compose -f docker-compose.server.yml up -d
	@echo "⏳ Waiting for services to be healthy..."
	@sleep 5
	@docker exec intaleks-server pnpm prisma migrate deploy
	@echo ""
	@echo "=========================================="
	@echo "✅ Server services ready!"
	@echo "=========================================="
	@echo "🔧 Server: http://localhost:5001"
	@echo "🗄️  PostgreSQL: localhost:5433"
	@echo "🔴 Redis: localhost:6379"

down: ## Stop all services
	@docker-compose down
	@echo "✅ Services stopped"

down-server: ## Stop only server-related services
	@docker-compose -f docker-compose.server.yml down
	@echo "✅ Server services stopped"

restart: ## Restart all services
	@docker-compose restart
	@echo "✅ Services restarted"

restart-server: ## Restart only the server
	@docker-compose restart server
	@echo "✅ Server restarted"

restart-client: ## Restart only the client
	@docker-compose restart client
	@echo "✅ Client restarted"

logs: ## View logs from all services
	@docker-compose logs -f

logs-server: ## View server logs
	@docker-compose logs -f server

logs-client: ## View client logs
	@docker-compose logs -f client

logs-db: ## View database logs
	@docker-compose logs -f postgres

ps: ## Show running containers
	@docker-compose ps

clean: ## Stop services and remove volumes (WARNING: deletes all data)
	@chmod +x docker-reset.sh
	@./docker-reset.sh

db-studio: ## Open Prisma Studio
	@cd server && pnpm db:studio

db-migrate: ## Run database migrations
	@cd server && DATABASE_URL="postgresql://intaleks:intaleks_dev_2024@localhost:5433/intaleks_dev" pnpm db:migrate

db-seed: ## Seed database with initial data
	@cd server && DATABASE_URL="postgresql://intaleks:intaleks_dev_2024@localhost:5433/intaleks_dev" pnpm run db:seed:all

create-admin: ## Create admin user interactively
	@cd server && DATABASE_URL="postgresql://intaleks:intaleks_dev_2024@localhost:5433/intaleks_dev" pnpm create-admin-interactive

shell-server: ## Open shell in server container
	@docker-compose exec server sh

shell-db: ## Open PostgreSQL shell
	@docker-compose exec postgres psql -U intaleks -d intaleks_dev

build: ## Rebuild all Docker images
	@docker-compose build

build-server: ## Rebuild server image
	@docker-compose build server

build-client: ## Rebuild client image
	@docker-compose build client
