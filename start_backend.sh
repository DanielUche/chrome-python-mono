#!/bin/bash
cd /Users/danieluche/Desktop/chrome-python-mono/backend
source ../.venv/bin/activate

# Load environment variables from .env
if [ -f ../.env ]; then
    export $(grep -v '^#' ../.env | xargs)
fi

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
