#!/bin/sh
set -eu

echo "Running database migrations..."
tries=0
until pnpm prisma migrate deploy; do
  tries=$((tries + 1))
  if [ "$tries" -ge 10 ]; then
    echo "Migration failed after $tries attempts."
    exit 1
  fi
  echo "Migration failed. Retrying in 2s..."
  sleep 2
done

echo "Starting app..."
exec "$@"
