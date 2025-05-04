#!/bin/bash
set -e

# Create databases for each shard
for letter in {a..z}; do
  echo "Creating database urls_$letter"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE urls_$letter;
EOSQL
done

# Create databases for numeric shards
for num in {0..9}; do
  echo "Creating database urls_$num"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE urls_$num;
EOSQL
done

# Create default database
echo "Creating database urls_default"
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE DATABASE urls_default;
EOSQL

echo "All databases created successfully"
