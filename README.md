# Getting started with URL Shortener

The purpose of the URL Shortener is to generate short URLs on demand. The backend is designed to handle as many links as Bitly, which processes 256 million per month (approximately 100 requests per second). To achieve this, we combine PostgreSQL sharding (to distribute the workload across multiple database instances), a Bloom Filter (to reduce the number of connections to the database), and Redis (for caching and quick access to the most recently generated URLs).
The frontend is a simple React app using Chakra UI.

## Start the backend

Go to the `backend` folder and follow README instructions

## Start the frontend

Go to the `frontend` folder and follow README instructions

## Run load test

Go to the `artillery` folder and follow README instructions
