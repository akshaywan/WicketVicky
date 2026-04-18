from __future__ import annotations

from datetime import datetime

EDITORIAL_TRACKS = [
    {
        "title": "Breaking Desk",
        "description": "Polling API data every minute for status shifts, score updates, and in-progress windows that need attention.",
    },
    {
        "title": "Competition Streams",
        "description": "The service layer is already shaped so you can split by league, sport, or region without changing the page layout.",
    },
    {
        "title": "Backend Upgrade Path",
        "description": "Provider calls now sit server-side, which keeps premium keys out of the browser and makes future realtime upgrades easier.",
    },
]

LIVE_STATUS_HINTS = [
    "live",
    "in progress",
    "in-progress",
    "1st half",
    "2nd half",
    "half-time",
    "halftime",
    "quarter",
    "q1",
    "q2",
    "q3",
    "q4",
    "inning",
    "innings",
    "over",
    "overs",
    "period",
    "set",
    "overtime",
    "extra time",
    "extra-time",
    "penalties",
    "shootout",
    "stumps",
    "tea",
    "lunch",
]

NON_LIVE_STATUS_HINTS = [
    "scheduled",
    "not started",
    "fixture",
    "postponed",
    "cancelled",
    "canceled",
    "abandoned",
    "delayed",
    "finished",
    "full time",
    "ft",
    "final",
    "after penalties",
    "after extra time",
    "aet",
]


def _to_event_array(payload: object) -> list[dict]:
    if isinstance(payload, list):
        flattened: list[dict] = []
        for entry in payload:
            flattened.extend(_to_event_array(entry))
        return flattened

    if not isinstance(payload, dict):
        return []

    for key in ("events", "event", "lives", "livescores"):
        value = payload.get(key)
        if isinstance(value, list):
            return [item for item in value if isinstance(item, dict)]

    return []


def _normalize_status(status: str | None) -> str:
    return (status or "").strip().lower()


def is_live_status(event: dict) -> bool:
    status = _normalize_status(event.get("strStatus"))

    if not status:
        return False

    if any(hint in status for hint in NON_LIVE_STATUS_HINTS):
        return False

    return any(hint in status for hint in LIVE_STATUS_HINTS)


def _display_score(event: dict) -> tuple[str | int, str | int]:
    return event.get("intHomeScore", "-"), event.get("intAwayScore", "-")


def _event_timestamp(event: dict) -> float:
    timestamp = event.get("strTimestamp")
    if timestamp:
        try:
            return datetime.fromisoformat(timestamp.replace("Z", "+00:00")).timestamp()
        except ValueError:
            pass

    date_event = event.get("dateEvent", "")
    time_event = event.get("strTime", "00:00:00")

    try:
        return datetime.fromisoformat(f"{date_event}T{time_event}").timestamp()
    except ValueError:
        return 0.0


def _match_note(event: dict) -> str:
    venue = f" at {event['strVenue']}" if event.get("strVenue") else ""
    status = event.get("strStatus") or "Scheduled"
    home_score, away_score = _display_score(event)

    if home_score != "-" or away_score != "-":
        return f"{status}{venue}."

    return f"{status}{venue} on {event.get('dateEvent') or 'match day'}."


def _updated_label() -> str:
    return datetime.now().strftime("%I:%M %p").lstrip("0")


def _breaking_ticker(events: list[dict]) -> list[str]:
    items: list[str] = []
    for event in events[:4]:
        home_score, away_score = _display_score(event)
        has_score = home_score != "-" or away_score != "-"
        if has_score:
            items.append(
                f"{event.get('strHomeTeam', 'Home')} {home_score}-{away_score} {event.get('strAwayTeam', 'Away')} in {event.get('strLeague', 'the current competition')}."
            )
        else:
            items.append(
                f"{event.get('strHomeTeam', 'Home')} vs {event.get('strAwayTeam', 'Away')} coming up in {event.get('strLeague', 'the current competition')}."
            )
    return items


def _top_stories(events: list[dict]) -> list[dict]:
    stories: list[dict] = []
    for index, event in enumerate(events[:3], start=1):
        home_score, away_score = _display_score(event)
        has_score = home_score != "-" or away_score != "-"
        stories.append(
            {
                "id": event.get("idEvent") or f"story-{index}",
                "category": event.get("strSport") or "Sports",
                "readTime": "2 min read",
                "title": (
                    f"{event.get('strHomeTeam', 'Home')} and {event.get('strAwayTeam', 'Away')} shape the latest story in {event.get('strLeague', 'the competition')}"
                    if has_score
                    else f"{event.get('strHomeTeam', 'Home')} vs {event.get('strAwayTeam', 'Away')} leads the watchlist in {event.get('strLeague', 'the competition')}"
                ),
                "summary": (
                    f"Current scoreboard sits at {home_score}-{away_score}, with {event.get('strStatus') or 'the contest'} driving the latest talking point."
                    if has_score
                    else f"Status is {event.get('strStatus') or 'Scheduled'}, with kickoff details and team context ready for coverage."
                ),
                "author": "WicketVicky backend via TheSportsDB",
                "timestamp": event.get("dateEvent") or "Today",
            }
        )
    return stories


def _live_matches(events: list[dict]) -> list[dict]:
    matches: list[dict] = []
    for index, event in enumerate([item for item in events if is_live_status(item)][:6], start=1):
        home_score, away_score = _display_score(event)
        matches.append(
            {
                "id": event.get("idEvent") or f"match-{index}",
                "status": event.get("strStatus") or "Scheduled",
                "competition": event.get("strLeague") or event.get("strSport") or "Competition",
                "homeTeam": event.get("strHomeTeam") or "Home",
                "homeScore": home_score,
                "awayTeam": event.get("strAwayTeam") or "Away",
                "awayScore": away_score,
                "note": _match_note(event),
            }
        )
    return matches


def _leagues(events: list[dict]) -> list[dict]:
    seen: set[str] = set()
    leagues: list[dict] = []

    for event in events:
        key = event.get("idLeague") or event.get("strLeague") or event.get("strSport")
        if not key or key in seen:
            continue
        seen.add(str(key))
        leagues.append(
            {
                "name": event.get("strLeague") or event.get("strSport") or "Sports Feed",
                "region": event.get("strCountry") or event.get("strSport") or "Global",
                "description": f"Live and scheduled coverage sourced from {event.get('strSport') or 'sports'} fixtures.",
                "tags": [
                    event.get("strSport") or "Sports",
                    event.get("strStatus") or "Status",
                    event.get("dateEvent") or "Today",
                ],
            }
        )

    return leagues[:3]


def _hero(events: list[dict], sports: list[str], live_matches: list[dict], coverage_type: str) -> dict:
    competitions = len({event.get("strLeague") for event in events if event.get("strLeague")})
    is_live_coverage = coverage_type == "livescore"
    return {
        "title": (
            "Live scores are now driving the WicketVicky desk."
            if is_live_coverage
            else "Schedule snapshots are driving the WicketVicky desk right now."
        ),
        "summary": (
            f"Tracking {len(events)} events across {len(sports)} sports and {competitions} competitions with live-score coverage from the backend provider."
            if is_live_coverage
            else f"Tracking {len(events)} events across {len(sports)} sports and {competitions} competitions from a schedule-first backend response."
        ),
        "metrics": [
            {"label": "Events loaded", "value": str(len(events))},
            {"label": "Sports active", "value": str(len(sports))},
            {"label": "In progress", "value": str(len(live_matches))},
        ],
    }


def _spotlight(events: list[dict], live_matches: list[dict], coverage_type: str) -> dict:
    is_live_coverage = coverage_type == "livescore"
    return {
        "title": (
            "The homepage is reading a live scoreboard feed."
            if is_live_coverage
            else "The homepage is reading a schedule-first sports feed."
        ),
        "summary": (
            "The backend is now pushing real in-progress matches and scoreline updates into the homepage contract."
            if is_live_coverage
            else "This response is provider-backed, but it is still mostly a schedule snapshot until premium live coverage is enabled."
        ),
        "stat": f"{len(live_matches)}/{len(events) or 1}",
        "caption": (
            "events currently flagged as in-play"
            if is_live_coverage
            else "events currently flagged as in-play inside the schedule feed"
        ),
    }


def _meta(api_tier: str, refresh_interval_ms: int, notice: str = "") -> dict:
    refresh_seconds = max(1, round(refresh_interval_ms / 1000))
    coverage_type = "livescore" if api_tier == "premium" else "schedule"
    return {
        "isMock": False,
        "coverageType": coverage_type,
        "coverageLabel": "True live scores" if coverage_type == "livescore" else "Daily schedule snapshot",
        "sourceLabel": "WicketVicky backend via TheSportsDB",
        "refreshLabel": f"Every {refresh_seconds}s",
        "updatedLabel": _updated_label(),
        "notice": notice,
    }


def build_home_feed(payload: object, api_tier: str, sports: list[str], refresh_interval_ms: int) -> dict:
    events = [
        item
        for item in sorted(_to_event_array(payload), key=_event_timestamp, reverse=True)
        if item.get("strHomeTeam") and item.get("strAwayTeam")
    ]
    coverage_type = "livescore" if api_tier == "premium" else "schedule"
    live_matches = _live_matches(events)

    if not events:
        return {
            "hero": {
                "title": "The backend is connected, but no events were returned right now.",
                "summary": (
                    "Try a different sport list, wait for the next refresh, or verify the premium live provider response."
                    if coverage_type == "livescore"
                    else "Try a different sport list, wait for the next refresh, or verify the schedule endpoint for today."
                ),
                "metrics": [
                    {"label": "Events loaded", "value": "0"},
                    {"label": "Sports active", "value": str(len(sports))},
                    {"label": "In progress", "value": "0"},
                ],
            },
            "breakingTicker": ["No live or scheduled events were returned by the provider at this moment."],
            "liveMatches": [],
            "topStories": [],
            "editorialTracks": EDITORIAL_TRACKS,
            "spotlight": {
                "title": "Provider connected, feed empty.",
                "summary": "The UI contract is ready, but the selected sports feed returned no events in this refresh window.",
                "stat": "0",
                "caption": "events available this cycle",
            },
            "leagues": [],
            "meta": _meta(
                api_tier,
                refresh_interval_ms,
                "The provider connection succeeded, but there were no events in the current response.",
            ),
        }

    notice = ""
    if coverage_type == "schedule" and not live_matches:
        notice = "This backend response is a schedule snapshot right now, so there are no active in-progress matches to show."

    return {
        "hero": _hero(events, sports, live_matches, coverage_type),
        "breakingTicker": _breaking_ticker(events),
        "liveMatches": live_matches,
        "topStories": _top_stories(events),
        "editorialTracks": EDITORIAL_TRACKS,
        "spotlight": _spotlight(events, live_matches, coverage_type),
        "leagues": _leagues(events),
        "meta": _meta(api_tier, refresh_interval_ms, notice),
    }
