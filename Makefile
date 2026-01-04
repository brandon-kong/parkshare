docker-up:
	docker-compose -f infra/docker/docker-compose.yml --env-file .env up -d

api-dev:
	cd apps/api && air -c air.toml