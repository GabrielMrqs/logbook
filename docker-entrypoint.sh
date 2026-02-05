#!/bin/sh
set -eu

echo "Running database migrations..."
tries=0
until prisma migrate deploy; do
  tries=$((tries + 1))
  if [ "$tries" -ge 3 ]; then
    echo "Migrate deploy failed. Falling back to 'prisma db push --accept-data-loss'..."
    prisma db push --accept-data-loss
    break
  fi
  echo "Migration failed. Retrying in 2s..."
  sleep 2
done

echo "Starting app..."
exec "$@"
