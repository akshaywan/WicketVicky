const editorialTracks = [
  {
    title: 'Breaking Desk',
    description:
      'Polling API data every minute for score changes, status shifts, and match windows that need attention.',
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
  return events.slice(0, 6).map((event, index) => {
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

function buildSpotlight(events) {
  const liveCount = events.filter((event) => {
    const status = (event.strStatus ?? '').toLowerCase();
    return status.includes('live') || status.includes('progress') || status.includes('quarter') || status.includes('inning');
  }).length;

  return {
    title: 'The homepage is now reading from a real sports data provider.',
    summary:
      'This is no longer a static prototype. The cards and story rails are being generated from live schedule or livescore data.',
    stat: `${liveCount}/${events.length || 1}`,
    caption: 'events currently flagged as in-play or active',
  };
}

function buildHero(events, sports) {
  const liveCount = events.filter((event) => (event.strStatus ?? '').toLowerCase() !== 'not started').length;
  const competitions = new Set(events.map((event) => event.strLeague).filter(Boolean)).size;

  return {
    title: 'Real sports data is now driving the WicketVicky desk.',
    summary: `Tracking ${events.length} events across ${sports.length} sports and ${competitions} competitions through the frontend service layer.`,
    metrics: [
      { label: 'Events loaded', value: `${events.length}` },
      { label: 'Sports active', value: `${sports.length}` },
      { label: 'Live or updated', value: `${liveCount}` },
    ],
  };
}

function buildMeta({ apiTier, refreshIntervalMs, isMock = false, notice = '' }) {
  const refreshSeconds = Math.max(1, Math.round(refreshIntervalMs / 1000));

  return {
    isMock,
    sourceLabel: apiTier === 'premium' ? 'TheSportsDB premium livescores' : 'TheSportsDB daily schedule',
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

  if (!events.length) {
    return {
      hero: {
        title: 'The sports API is connected, but no events were returned right now.',
        summary: 'Try a different sport list, wait for the next refresh, or switch to premium livescores.',
        metrics: [
          { label: 'Events loaded', value: '0' },
          { label: 'Sports active', value: `${sports.length}` },
          { label: 'Live or updated', value: '0' },
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
        notice: 'The API connection succeeded, but there were no events in the current response.',
      }),
    };
  }

  return {
    hero: buildHero(events, sports),
    breakingTicker: buildBreakingTicker(events),
    liveMatches: buildLiveMatches(events),
    topStories: buildTopStories(events),
    editorialTracks,
    spotlight: buildSpotlight(events),
    leagues: buildLeagues(events),
    meta: buildMeta({ apiTier, refreshIntervalMs }),
  };
}
