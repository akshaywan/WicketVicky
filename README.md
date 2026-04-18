# WicketVicky

WicketVicky is a realtime-first sports news platform built to deliver live headlines, fast match context, and breaking updates to fans.

## Project Layout

```text
WicketVicky/
|-- apps/
|   `-- web/                # React + Vite frontend
|-- docs/
|   `-- architecture.md     # Long-term structure and backend options
|-- services/
|   |-- python-api/         # Suggested FastAPI backend home
|   `-- spring-api/         # Suggested Spring Boot backend home
`-- package.json            # Workspace scripts
```

## Frontend Stack

- React 18
- Vite
- Plain CSS with design tokens
- Feature-based folder structure
- TheSportsDB integration with polling-based refresh

## Quick Start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the frontend:

   ```bash
   npm run dev
   ```

3. Build for production:

   ```bash
   npm run build
   ```

## Environment Setup

The frontend now has committed Vite environment files for:

- `apps/web/.env.development`
- `apps/web/.env.qa`
- `apps/web/.env.production`

Build commands:

```bash
npm run build:dev
npm run build:qa
npm run build:prod
```

Notes:

- `npm run dev` uses Vite `development` mode automatically.
- `npm run build` now maps to the production build.
- Replace the placeholder QA and production URLs with your real backend endpoints before deployment.
- Any `VITE_*` value is embedded into the browser bundle, so do not place private secrets in these files.

## Docker

You can now run the frontend in Docker for both development and production.

### Development container

From the project root:

```bash
docker compose up --build web
```

Open:

```text
http://localhost:5173
```

### Production container

Build and run the production image with Nginx:

```bash
docker compose --profile prod up --build web-prod
```

Open:

```text
http://localhost:8080
```

### Stop containers

```bash
docker compose down
```

## Live Sports API

The frontend now supports direct integration with TheSportsDB.

Default setup:

- `VITE_SPORTS_DATA_MODE=api`
- `VITE_SPORTS_API_PROVIDER=thesportsdb`
- `VITE_THESPORTSDB_API_KEY=123`
- `VITE_THESPORTSDB_TIER=free`

You can edit [apps/web/.env.example](</d:/projects/WicketVicky/apps/web/.env.example:1>) into a local `.env` file for the frontend.

Notes:

- Free mode uses TheSportsDB day schedule endpoints and refreshes on an interval.
- Premium mode can use live score endpoints with your API key.
- For production, move premium API calls behind Python or Spring so your private key is not exposed in the browser bundle.

## Jenkins

The root [Jenkinsfile](/d:/projects/WicketVicky/Jenkinsfile:1) now provides a parameterized pipeline with:

- `TARGET_ENV=dev`
- `TARGET_ENV=qa`
- `TARGET_ENV=prod`

Pipeline flow:

- `npm ci`
- `npm run lint`
- `npm run build:<env>`
- archive `apps/web/dist`

## Backend Direction

The frontend is intentionally split from backend concerns. You can connect it to:

- `services/python-api` using FastAPI for quick development and WebSocket/SSE support
- `services/spring-api` using Spring Boot for larger enterprise-style services

Both options can expose the same API contract for headlines, fixtures, standings, and live alerts.
