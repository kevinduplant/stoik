#!/bin/bash
# Script to completely clean and restart Docker environment

echo "Stopping all containers..."
docker-compose down

echo "Removing all related containers..."
docker rm -f stoik-postgres stoik-redis 2>/dev/null || true

echo "Removing PostgreSQL and Redis volumes..."
docker volume rm stoik-postgres-data stoik-redis-data 2>/dev/null || true

echo "Prune unused volumes..."
docker volume prune -f

echo "Starting fresh environment..."
docker-compose up -d

echo "Waiting for PostgreSQL to initialize (15 seconds)..."
sleep 15

echo "Checking PostgreSQL status:"
docker exec -it stoik-postgres pg_isready -U postgres || echo "PostgreSQL not ready yet"

echo "Verifying PostgreSQL version:"
docker exec -it stoik-postgres psql -U postgres -c "SELECT version();" || echo "Cannot connect to PostgreSQL yet"

echo "Environment reset complete! Check the logs for any errors:"
echo "docker-compose logs postgres"
