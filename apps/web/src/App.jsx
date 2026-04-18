import { useEffect, useState } from 'react';
import AppShell from './app/AppShell';
import HomePage from './features/home/HomePage';
import { getHomeFeed, getHomeFeedRefreshInterval } from './services/api/newsService';

export default function App() {
  const [feed, setFeed] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadFeed() {
      try {
        setStatus((currentStatus) => (currentStatus === 'ready' ? 'refreshing' : 'loading'));
        const data = await getHomeFeed();

        if (!active) {
          return;
        }

        setFeed(data);
        setStatus('ready');
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : 'Unable to load the sports desk.');
        setStatus('error');
      }
    }

    loadFeed();

    const intervalId = window.setInterval(loadFeed, getHomeFeedRefreshInterval());

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <AppShell>
      <HomePage feed={feed} status={status} error={error} />
    </AppShell>
  );
}
