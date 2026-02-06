#!/bin/sh
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  export DATABASE_URL="file:/data/dev.db"
fi

echo "Running database migrations..."
prisma migrate deploy --schema /app/prisma/schema.prisma

echo "Starting app..."
exec "$@"
