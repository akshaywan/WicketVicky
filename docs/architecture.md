# WicketVicky Architecture

## Goal

Build a sports news platform that can start as a fast frontend prototype and grow into a realtime production system.

## Current Shape

- `apps/web`
  - React client
  - UI components grouped by responsibility
  - `services/api` for backend communication
  - `services/realtime` for WebSocket-ready transport
  - `features/home` for homepage content and composition

## Recommended Backend Paths

### Python path

Use FastAPI when you want:

- rapid iteration
- async-friendly live feeds
- SSE or WebSocket support
- lightweight deployment

Suggested modules:

- `app/api/routes/news.py`
- `app/api/routes/live.py`
- `app/services/providers/`
- `app/schemas/`
- `app/core/config.py`

### Spring path

Use Spring Boot when you want:

- stronger enterprise structure
- richer security and role management
- deeper integration with larger systems
- clearer domain module boundaries

Suggested modules:

- `src/main/java/.../news`
- `src/main/java/.../live`
- `src/main/java/.../alerts`
- `src/main/java/.../providers`
- `src/main/java/.../config`

## API Contract Direction

Keep the frontend stable by designing shared endpoints such as:

- `GET /api/home`
- `GET /api/stories`
- `GET /api/matches/live`
- `GET /api/competitions`
- `WS /ws/live`

## Scaling Notes

- cache provider responses where possible
- normalize sports provider payloads behind a service layer
- use one event model for alerts across sports
- store user notification preferences separately from editorial data
