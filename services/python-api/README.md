# Python API

This service now provides a minimal FastAPI backend that keeps TheSportsDB calls on the server side.

Available routes:

- `GET /health`
- `GET /api/home`
- `GET /api/matches/live`

## Local Run

1. Create a virtual environment.
2. Install dependencies:

   ```bash
   pip install -r services/python-api/requirements.txt
   ```

3. Start the API:

   ```bash
   uvicorn app.main:app --app-dir services/python-api --reload --host 0.0.0.0 --port 8000
   ```

4. Copy [services/python-api/.env.example](</d:/projects/WicketVicky/services/python-api/.env.example:1>) into your local environment as needed.

## Notes

- Free tier mode still reads TheSportsDB daily schedule endpoints.
- Premium mode switches to the provider's live-score endpoint when you set a real API key.
- The backend returns the same homepage contract the frontend already expects, so the browser no longer needs to call TheSportsDB directly.
