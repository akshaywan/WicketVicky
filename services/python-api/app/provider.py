from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from urllib.parse import quote

import httpx

from .config import Settings


def _format_date_for_api(date_value: datetime) -> str:
    return date_value.strftime("%Y-%m-%d")


async def _fetch_json(client: httpx.AsyncClient, url: str, headers: dict[str, str] | None = None) -> object:
    response = await client.get(url, headers=headers)
    response.raise_for_status()
    return response.json()


async def fetch_sports_payload(settings: Settings) -> object:
    async with httpx.AsyncClient(timeout=20.0) as client:
        if settings.thesportsdb_tier == "premium" and settings.thesportsdb_api_key != "123":
            return await _fetch_json(
                client,
                f"{settings.thesportsdb_base_url}/api/v2/json/livescore/all",
                headers={"X-API-KEY": settings.thesportsdb_api_key},
            )

        today = _format_date_for_api(datetime.now(timezone.utc))
        tasks = [
            _fetch_json(
                client,
                f"{settings.thesportsdb_base_url}/api/v1/json/{settings.thesportsdb_api_key}/eventsday.php?d={today}&s={quote(sport)}",
            )
            for sport in settings.thesportsdb_sports
        ]
        return await asyncio.gather(*tasks)
