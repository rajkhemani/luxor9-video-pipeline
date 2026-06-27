.PHONY: build up down logs clean deploy

build:
	docker compose -f deploy/video-pipeline/docker-compose.yml build

up:
	docker compose -f deploy/video-pipeline/docker-compose.yml up -d

down:
	docker compose -f deploy/video-pipeline/docker-compose.yml down

logs:
	docker compose -f deploy/video-pipeline/docker-compose.yml logs -f

clean:
	docker compose -f deploy/video-pipeline/docker-compose.yml down -v

deploy:
	@echo "=== Building & Deploying Video Pipeline ==="
	cp deploy/video-pipeline/.env.example deploy/video-pipeline/.env || true
	docker compose -f deploy/video-pipeline/docker-compose.yml up -d --build
	@echo ""
	@echo "✅ Video Pipeline deployed!"
	@echo "   API: http://localhost:4000"
	@echo "   Health: http://localhost:4000/health"

# Production: with nginx + SSL
prod-up:
	docker compose -f deploy/video-pipeline/docker-compose.yml --profile production up -d

prod-down:
	docker compose -f deploy/video-pipeline/docker-compose.yml --profile production down
