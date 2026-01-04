docker-up:
	docker-compose -f infra/docker/docker-compose.yml --env-file .env up -d