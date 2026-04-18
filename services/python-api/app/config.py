from __future__ import annotations

import os
from dataclasses import dataclass


def _split_csv(value: str | None, default: list[str]) -> list[str]:
    if not value:
        return default
    return [item.strip() for item in value.split(",") if item.strip()]


def _to_bool(value: str | None, default: bool) -> bool:
    if value is None:
        return default
    return value.strip().lower() not in {"0", "false", "no"}


def _to_int(value: str | None, default: int) -> int:
    try:
        return int(value) if value is not None else default
    except ValueError:
        return default


@dataclass(frozen=True)
class Settings:
    app_name: str
    sports_data_mode: str
    sports_refresh_interval_ms: int
    sports_allow_empty_fallback: bool
    thesportsdb_base_url: str
    thesportsdb_api_key: str
    thesportsdb_tier: str
    thesportsdb_sports: list[str]
    cors_allow_origins: list[str]


def get_settings() -> Settings:
    return Settings(
        app_name="WicketVicky Python API",
        sports_data_mode=os.getenv("SPORTS_DATA_MODE", "api").strip().lower(),
        sports_refresh_interval_ms=_to_int(os.getenv("SPORTS_REFRESH_INTERVAL_MS"), 60000),
        sports_allow_empty_fallback=_to_bool(os.getenv("SPORTS_ALLOW_EMPTY_FALLBACK"), True),
        thesportsdb_base_url=os.getenv("THESPORTSDB_BASE_URL", "https://www.thesportsdb.com").rstrip("/"),
        thesportsdb_api_key=os.getenv("THESPORTSDB_API_KEY", "123").strip(),
        thesportsdb_tier=os.getenv("THESPORTSDB_TIER", "free").strip().lower(),
        thesportsdb_sports=_split_csv(
            os.getenv("THESPORTSDB_SPORTS"),
            ["Soccer", "Cricket", "Tennis"],
        ),
        cors_allow_origins=_split_csv(
            os.getenv("CORS_ALLOW_ORIGINS"),
            ["http://localhost:5173", "http://127.0.0.1:5173"],
        ),
    )
