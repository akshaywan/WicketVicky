from __future__ import annotations

import asyncio

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .provider import fetch_sports_payload
from .transformer import build_home_feed

settings = get_settings()

app = FastAPI(title=settings.app_name)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


async def _load_home_feed() -> dict:
    try:
        payload = await fetch_sports_payload(settings)
    except (httpx.HTTPError, asyncio.TimeoutError) as error:
        if not settings.sports_allow_empty_fallback:
            raise HTTPException(status_code=502, detail=f"Sports provider request failed: {error}") from error

        return build_home_feed(
            payload=[],
            api_tier=settings.thesportsdb_tier,
            sports=settings.thesportsdb_sports,
            refresh_interval_ms=settings.sports_refresh_interval_ms,
        )

    return build_home_feed(
        payload=payload,
        api_tier=settings.thesportsdb_tier,
        sports=settings.thesportsdb_sports,
        refresh_interval_ms=settings.sports_refresh_interval_ms,
    )


@app.get("/api/home")
async def get_home_feed() -> dict:
    return await _load_home_feed()


@app.get("/api/matches/live")
async def get_live_matches() -> dict:
    feed = await _load_home_feed()
    return {
        "matches": feed["liveMatches"],
        "meta": feed["meta"],
    }
