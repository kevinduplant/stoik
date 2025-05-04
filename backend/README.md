# Getting Started with URL Shortener backend

## Requirement

- Node
- Docker

## Installation

Initialize docker

```
chmod +x scripts/init-db.sh
docker-compose up -d
```

Install required packages

```
npm install
```

Build the project

```
npm run build
```

## Start the server

```
npm run start
```

## Reset the environment

```
chmod +x scripts/reset-docker-env.sh
./scripts/reset-docker-env.sh
```
