#!/bin/bash
echo Updating SovBot...

docker compose -f docker-compose.yml stop
git pull origin main
docker compose -f docker-compose.yml start

echo Update finished!
