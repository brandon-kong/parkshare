docker-up:
	docker-compose -f infra/docker/docker-compose.yml --env-file .env up -d

api-dev:
	cd apps/api && go run cmd/server.go