import { useEffect, useState } from 'react';

const liveNotes = [
  'Momentum swings after a tactical timeout.',
  'Crowd energy spikes as the pace of play increases.',
  'Late pressure is changing the shape of the contest.',
  'Analysts flag this phase as the match-defining window.',
];

export default function useLiveFeed(initialMatches, options = {}) {
  const { simulate = false } = options;
  const [matches, setMatches] = useState(initialMatches);

  useEffect(() => {
    setMatches(initialMatches);
  }, [initialMatches]);

  useEffect(() => {
    if (!simulate || !initialMatches.length) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setMatches((currentMatches) =>
        currentMatches.map((match, index) => ({
          ...match,
          note: liveNotes[(index + Date.now()) % liveNotes.length],
        })),
      );
    }, 4500);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [initialMatches, simulate]);

  return matches;
}
