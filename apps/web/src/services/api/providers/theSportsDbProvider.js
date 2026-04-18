import { buildHomeFeedFromSportsDb } from '../transformers/theSportsDbAdapter';

const BASE_URL = import.meta.env.VITE_THESPORTSDB_BASE_URL ?? 'https://www.thesportsdb.com';
const API_KEY = import.meta.env.VITE_THESPORTSDB_API_KEY ?? '123';
const API_TIER = (import.meta.env.VITE_THESPORTSDB_TIER ?? 'free').toLowerCase();
const SPORTS = (import.meta.env.VITE_THESPORTSDB_SPORTS ?? 'Soccer,Cricket,Tennis')
  .split(',')
  .map((sport) => sport.trim())
  .filter(Boolean);
const REFRESH_INTERVAL_MS = Number(import.meta.env.VITE_SPORTS_REFRESH_INTERVAL_MS ?? 60000);

function formatDateForApi(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Sports API request failed with status ${response.status}`);
  }

  return response.json();
}

async function fetchFreeDaySchedule() {
  const today = formatDateForApi(new Date());
  const requests = SPORTS.map((sport) =>
    fetchJson(
      `${BASE_URL}/api/v1/json/${API_KEY}/eventsday.php?d=${today}&s=${encodeURIComponent(sport)}`,
    ),
  );

  return Promise.all(requests);
}

async function fetchPremiumLivescores() {
  return fetchJson(`${BASE_URL}/api/v2/json/livescore/all`, {
    headers: {
      'X-API-KEY': API_KEY,
    },
  });
}

export async function getTheSportsDbHomeFeed() {
  const payload =
    API_TIER === 'premium' && API_KEY !== '123'
      ? await fetchPremiumLivescores()
      : await fetchFreeDaySchedule();

  return buildHomeFeedFromSportsDb({
    payload,
    apiTier: API_TIER,
    sports: SPORTS,
    refreshIntervalMs:
      Number.isFinite(REFRESH_INTERVAL_MS) && REFRESH_INTERVAL_MS > 0 ? REFRESH_INTERVAL_MS : 60000,
  });
}
