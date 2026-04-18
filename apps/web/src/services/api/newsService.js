import { mockHomeFeed } from '../../features/home/data/mockNews';
import { getTheSportsDbHomeFeed } from './providers/theSportsDbProvider';

const DATA_MODE = import.meta.env.VITE_SPORTS_DATA_MODE ?? 'api';
const SPORTS_PROVIDER = import.meta.env.VITE_SPORTS_API_PROVIDER ?? 'backend';
const ALLOW_MOCK_FALLBACK = (import.meta.env.VITE_SPORTS_ALLOW_MOCK_FALLBACK ?? 'true') !== 'false';
const REFRESH_INTERVAL_MS = Number(import.meta.env.VITE_SPORTS_REFRESH_INTERVAL_MS ?? 60000);

function withMockMeta(feed, notice = '') {
  return {
    ...feed,
    meta: {
      isMock: true,
      sourceLabel: 'Mock sports desk',
      refreshLabel: 'Static preview data',
      updatedLabel: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      notice,
    },
  };
}

export function getHomeFeedRefreshInterval() {
  return Number.isFinite(REFRESH_INTERVAL_MS) && REFRESH_INTERVAL_MS > 0 ? REFRESH_INTERVAL_MS : 60000;
}

export async function getHomeFeed() {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => {
      window.setTimeout(() => resolve(withMockMeta(mockHomeFeed)), 500);
    });
  }

  try {
    if (SPORTS_PROVIDER === 'thesportsdb') {
      return await getTheSportsDbHomeFeed();
    }

    const { apiGet } = await import('./client');
    return apiGet('/home');
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) {
      throw error;
    }

    return withMockMeta(
      mockHomeFeed,
      'Live API was unavailable, so the app switched to mock sports data for now.',
    );
  }
}
