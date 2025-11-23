# Chrome History Tracker

A full-stack application for tracking and analyzing browser history metrics with a Chrome extension, FastAPI backend, and React frontend.

## Architecture

- **Backend:** FastAPI + PostgreSQL (Python 3.12)
- **Frontend:** React 19 + TypeScript + Vite
- **Extension:** Chrome Manifest v3
- **Infrastructure:** Docker + docker-compose

## Overview

![Chrome History Tracker](./sample.png)

## Prerequisites

- Docker & docker-compose (v2.0+)
- Node.js (v18+)
- Python 3.10+ (for local development)

## Quick Start

## Setup Environment

Create a `.env` file from the example:

```bash
cp .env.docker.example .env
```

Update the `.env` file with your values:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=chrome_history
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/chrome_history
DEBUG=false
LOG_LEVEL=INFO
```

## Start Backend & Database

The backend startup script automatically runs database migrations before starting the application.

```bash
docker-compose up -d
```

This will:
- Start PostgreSQL database on port `5432`
- Start FastAPI backend on port `8000`
- Run Alembic migrations (`alembic upgrade head`)
- Create the database if it doesn't exist

**Check containers are running:**

```bash
docker-compose ps
```

**View logs:**

```bash
docker-compose logs -f backend
docker-compose logs -f postgres
```

**Stop containers:**

```bash
docker-compose down
```

## Install Frontend Dependencies

```bash
cd frontend
npm install
```

## Build Chrome Extension

```bash
cd frontend
npm run build
```

The extension will be built to `frontend/dist/`.

## Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `frontend/dist` directory
5. The extension icon should appear in your toolbar

## Running Tests

### Backend Tests

Run backend tests using the test script:

```bash
cd backend
./run_tests.sh
```

This runs all backend tests including:
- Service layer tests
- Schema validation tests
- API endpoint tests

### Frontend Tests

Run frontend tests with npm:

```bash
cd frontend
npm run test              # Run tests once
npm run test:ui           # Run tests with interactive UI
npm run test:coverage     # Run tests with coverage report
```

## API Documentation

Once the backend is running, visit:

- **API Docs (Swagger):** http://localhost:8000/docs
- **Alternative Docs (ReDoc):** http://localhost:8000/redoc

### Available Endpoints

- `GET /health` - Health check
- `POST /visits` - Record a page visit with metrics
- `GET /visits?url={url}&limit={limit}` - Get visit history for a URL
- `GET /metrics?url={url}` - Get aggregated metrics for a URL

## Development

### Backend Development

**Run backend locally (without Docker):**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Update .env to use localhost instead of postgres
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chrome_history

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development

**Run dev server with hot reload:**

```bash
cd frontend
npm run dev
```

Visit http://localhost:5173 to see the React app.

**Lint code:**

```bash
npm run lint
```

## Troubleshooting

### Database Connection Issues

If you see "could not translate host name 'postgres'":
- Make sure you're using `postgres` (not `localhost`) in DATABASE_URL when running in Docker
- For local development, use `localhost` instead

### Extension Not Recording Metrics

1. Check the Service Worker console: `chrome://extensions/` → Your extension → "Service Worker" link
2. Check the content script console: Open DevTools on any webpage → Console tab
3. Verify backend is running: `curl http://localhost:8000/health`

### Docker Port Conflicts

If ports 8000 or 5432 are already in use:

```bash
# Stop containers
docker-compose down

# Update docker-compose.yml to use different ports
# Then restart
docker-compose up -d
```

## License

MIT
