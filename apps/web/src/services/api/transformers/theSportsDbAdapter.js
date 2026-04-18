const editorialTracks = [
  {
    title: 'Breaking Desk',
    description:
      'Polling API data every minute for status shifts, score updates, and in-progress windows that need attention.',
  },
  {
    title: 'Competition Streams',
    description:
      'The service layer is already shaped so you can split by league, sport, or region without changing the page layout.',
  },
  {
    title: 'Backend Upgrade Path',
    description:
      'This same adapter can move into FastAPI or Spring later so your API key and premium feeds stay server-side.',
  },
];

const LIVE_STATUS_HINTS = [
  'live',
  'in progress',
  'in-progress',
  '1st half',
  '2nd half',
  'half-time',
  'halftime',
  'quarter',
  'q1',
  'q2',
  'q3',
  'q4',
  'inning',
  'innings',
  'over',
  'overs',
  'period',
  'set',
  'overtime',
  'extra time',
  'extra-time',
  'penalties',
  'shootout',
  'stumps',
  'tea',
  'lunch',
];

const NON_LIVE_STATUS_HINTS = [
  'scheduled',
  'not started',
  'fixture',
  'postponed',
  'cancelled',
  'canceled',
  'abandoned',
  'delayed',
  'finished',
  'full time',
  'ft',
  'final',
  'after penalties',
  'after extra time',
  'aet',
];

function toArray(value, fallbackKeys = []) {
  if (Array.isArray(value)) {
    return value;
  }

  for (const key of fallbackKeys) {
    if (Array.isArray(value?.[key])) {
      return value[key];
    }
  }

  return [];
}

function flattenSportsDbPayload(payload) {
  if (Array.isArray(payload)) {
    return payload.flatMap((entry) => toArray(entry, ['events', 'event', 'lives', 'livescores']));
  }

  return toArray(payload, ['events', 'event', 'lives', 'livescores']);
}

function sortByTimestamp(events) {
  return [...events].sort((left, right) => {
    const leftTime = new Date(left.strTimestamp ?? `${left.dateEvent ?? ''}T${left.strTime ?? '00:00:00'}`).getTime();
    const rightTime = new Date(
      right.strTimestamp ?? `${right.dateEvent ?? ''}T${right.strTime ?? '00:00:00'}`,
    ).getTime();
    return rightTime - leftTime;
  });
}

function normalizeStatus(status) {
  return (status ?? '').trim().toLowerCase();
}

function isLiveStatus(event) {
  const status = normalizeStatus(event.strStatus);

  if (!status) {
    return false;
  }

  if (NON_LIVE_STATUS_HINTS.some((hint) => status.includes(hint))) {
    return false;
  }

  return LIVE_STATUS_HINTS.some((hint) => status.includes(hint));
}

function getDisplayScore(event) {
  const home = event.intHomeScore ?? '-';
  const away = event.intAwayScore ?? '-';
  return { home, away };
}

function buildMatchNote(event) {
  const venue = event.strVenue ? ` at ${event.strVenue}` : '';
  const status = event.strStatus ?? 'Scheduled';

  if ((event.intHomeScore ?? event.intAwayScore) != null) {
    return `${status}${venue}.`;
  }

  return `${status}${venue} on ${event.dateEvent ?? 'match day'}.`;
}

function formatUpdatedLabel() {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function buildBreakingTicker(events) {
  return events.slice(0, 4).map((event) => {
    const { home, away } = getDisplayScore(event);
    const hasScore = home !== '-' || away !== '-';

    if (hasScore) {
      return `${event.strHomeTeam} ${home}-${away} ${event.strAwayTeam} in ${event.strLeague}.`;
    }

    return `${event.strHomeTeam} vs ${event.strAwayTeam} coming up in ${event.strLeague}.`;
  });
}

function buildTopStories(events) {
  return events.slice(0, 3).map((event, index) => {
    const { home, away } = getDisplayScore(event);
    const hasScore = home !== '-' || away !== '-';

    return {
      id: event.idEvent ?? `story-${index + 1}`,
      category: event.strSport ?? 'Sports',
      readTime: '2 min read',
      title: hasScore
        ? `${event.strHomeTeam} and ${event.strAwayTeam} shape the latest story in ${event.strLeague}`
        : `${event.strHomeTeam} vs ${event.strAwayTeam} leads the watchlist in ${event.strLeague}`,
      summary: hasScore
        ? `Current scoreboard sits at ${home}-${away}, with ${event.strStatus ?? 'the contest'} driving the latest talking point.`
        : `Status is ${event.strStatus ?? 'Scheduled'}, with kickoff details and team context ready for live coverage.`,
      author: 'TheSportsDB feed',
      timestamp: event.dateEvent ?? 'Today',
    };
  });
}

function buildLiveMatches(events) {
  return events.filter(isLiveStatus).slice(0, 6).map((event, index) => {
    const { home, away } = getDisplayScore(event);

    return {
      id: event.idEvent ?? `match-${index + 1}`,
      status: event.strStatus ?? 'Scheduled',
      competition: event.strLeague ?? event.strSport ?? 'Competition',
      homeTeam: event.strHomeTeam ?? 'Home',
      homeScore: home,
      awayTeam: event.strAwayTeam ?? 'Away',
      awayScore: away,
      note: buildMatchNote(event),
    };
  });
}

function buildLeagues(events) {
  const leagueMap = new Map();

  events.forEach((event) => {
    const key = event.idLeague ?? event.strLeague ?? event.strSport;

    if (!key || leagueMap.has(key)) {
      return;
    }

    leagueMap.set(key, {
      name: event.strLeague ?? event.strSport ?? 'Sports Feed',
      region: event.strCountry ?? event.strSport ?? 'Global',
      description: `Live and scheduled coverage sourced from ${event.strSport ?? 'sports'} fixtures.`,
      tags: [event.strSport ?? 'Sports', event.strStatus ?? 'Status', event.dateEvent ?? 'Today'],
    });
  });

  return Array.from(leagueMap.values()).slice(0, 3);
}

function buildSpotlight(events, liveMatches, coverageType) {
  const liveCount = liveMatches.length;
  const isLiveCoverage = coverageType === 'livescore';

  return {
    title: isLiveCoverage
      ? 'The homepage is reading a live scoreboard feed.'
      : 'The homepage is reading a schedule-first sports feed.',
    summary:
      isLiveCoverage
        ? 'The backend is now pushing real in-progress matches and scoreline updates into the homepage contract.'
        : 'This response is provider-backed, but it is still mostly a schedule snapshot until premium live coverage is enabled.',
    stat: `${liveCount}/${events.length || 1}`,
    caption: isLiveCoverage
      ? 'events currently flagged as in-play'
      : 'events currently flagged as in-play inside the schedule feed',
  };
}

function buildHero(events, sports, liveMatches, coverageType) {
  const liveCount = liveMatches.length;
  const competitions = new Set(events.map((event) => event.strLeague).filter(Boolean)).size;
  const isLiveCoverage = coverageType === 'livescore';

  return {
    title: isLiveCoverage
      ? 'Live scores are now driving the WicketVicky desk.'
      : 'Schedule snapshots are driving the WicketVicky desk right now.',
    summary: isLiveCoverage
      ? `Tracking ${events.length} events across ${sports.length} sports and ${competitions} competitions with live-score coverage from the active provider.`
      : `Tracking ${events.length} events across ${sports.length} sports and ${competitions} competitions from a schedule-first provider response.`,
    metrics: [
      { label: 'Events loaded', value: `${events.length}` },
      { label: 'Sports active', value: `${sports.length}` },
      { label: 'In progress', value: `${liveCount}` },
    ],
  };
}

function buildMeta({ apiTier, refreshIntervalMs, isMock = false, notice = '', providerLabel = 'TheSportsDB' }) {
  const refreshSeconds = Math.max(1, Math.round(refreshIntervalMs / 1000));
  const coverageType = apiTier === 'premium' ? 'livescore' : 'schedule';

  return {
    isMock,
    coverageType,
    coverageLabel: apiTier === 'premium' ? 'True live scores' : 'Daily schedule snapshot',
    sourceLabel: apiTier === 'premium' ? `${providerLabel} premium livescores` : `${providerLabel} daily schedule`,
    refreshLabel: `Every ${refreshSeconds}s`,
    updatedLabel: formatUpdatedLabel(),
    notice,
  };
}

export function buildHomeFeedFromSportsDb({ payload, apiTier, sports, refreshIntervalMs }) {
  const rawEvents = flattenSportsDbPayload(payload).filter(
    (event) => event?.strHomeTeam && event?.strAwayTeam,
  );
  const events = sortByTimestamp(rawEvents);
  const coverageType = apiTier === 'premium' ? 'livescore' : 'schedule';
  const liveMatches = buildLiveMatches(events);

  if (!events.length) {
    return {
      hero: {
        title: 'The sports API is connected, but no events were returned right now.',
        summary:
          coverageType === 'livescore'
            ? 'Try a different sport list, wait for the next refresh, or verify the premium live provider response.'
            : 'Try a different sport list, wait for the next refresh, or verify the schedule endpoint for today.',
        metrics: [
          { label: 'Events loaded', value: '0' },
          { label: 'Sports active', value: `${sports.length}` },
          { label: 'In progress', value: '0' },
        ],
      },
      breakingTicker: ['No live or scheduled events were returned by the provider at this moment.'],
      liveMatches: [],
      topStories: [],
      editorialTracks,
      spotlight: {
        title: 'Provider connected, feed empty.',
        summary: 'The UI is ready, but the selected sports feed returned no events for this refresh window.',
        stat: '0',
        caption: 'events available this cycle',
      },
      leagues: [],
      meta: buildMeta({
        apiTier,
        refreshIntervalMs,
        notice:
          'The API connection succeeded, but there were no events in the current provider response.',
      }),
    };
  }

  const notice =
    coverageType === 'schedule' && !liveMatches.length
      ? 'This provider response is a schedule snapshot right now, so there are no active in-progress matches to show.'
      : '';

  return {
    hero: buildHero(events, sports, liveMatches, coverageType),
    breakingTicker: buildBreakingTicker(events),
    liveMatches,
    topStories: buildTopStories(events),
    editorialTracks,
    spotlight: buildSpotlight(events, liveMatches, coverageType),
    leagues: buildLeagues(events),
    meta: buildMeta({ apiTier, refreshIntervalMs, notice }),
  };
}
