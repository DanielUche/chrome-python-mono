#!/bin/bash
set -e

# Change to backend root so Alembic finds alembic.ini
cd "$(dirname "$0")/.."

echo "🔄 Creating database if it doesn't exist..."
PGPASSWORD=${POSTGRES_PASSWORD} createdb -h postgres -U ${POSTGRES_USER} ${POSTGRES_DB} 2>/dev/null || true

echo "🔄 Running database migrations..."
alembic upgrade head

echo "🚀 Starting uvicorn server..."
uvicorn app.main:app --host 0.0.0.0 --port 8000