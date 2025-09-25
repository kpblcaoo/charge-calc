APP_NAME=charge-calc
IMAGE?=$(APP_NAME):latest
PORT?=8080
CONTAINER_NAME?=$(APP_NAME)-dev

.PHONY: help build run stop logs sh clean test docker-test

help:
	@echo "Targets:"
	@echo "  build        - Docker build image (IMAGE=$(IMAGE))"
	@echo "  run          - Run container mapped to PORT (host)"
	@echo "  stop         - Stop running container"
	@echo "  logs         - Follow container logs"
	@echo "  sh           - Shell into running container"
	@echo "  clean        - Remove image and dangling layers"
	@echo "  test         - Run vitest locally"
	@echo "  docker-test  - Run tests inside ephemeral container"

build:
	docker build -t $(IMAGE) .

run: stop
	docker run --rm -d -p $(PORT):80 --name $(CONTAINER_NAME) $(IMAGE)
	@echo "Running on http://localhost:$(PORT)"

stop:
	-@docker rm -f $(CONTAINER_NAME) >/dev/null 2>&1 || true

logs:
	docker logs -f $(CONTAINER_NAME)

sh:
	docker exec -it $(CONTAINER_NAME) /bin/sh

clean:
	-@docker rm -f $(CONTAINER_NAME) >/dev/null 2>&1 || true
	-@docker rmi $(IMAGE) >/dev/null 2>&1 || true
	@docker image prune -f >/dev/null 2>&1 || true

test:
	npm test

docker-test: build
	docker run --rm $(IMAGE) /bin/sh -c "echo 'No server-side tests (static build). Running unit tests locally is preferred.'"
