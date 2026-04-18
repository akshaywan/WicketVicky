export const mockHomeFeed = {
  hero: {
    title: 'Catch the score, the swing, and the story before everyone else.',
    summary:
      'WicketVicky is designed as a fast-moving sports desk that blends breaking headlines, live match snapshots, and editorial context in one sharp interface.',
    metrics: [
      { label: 'Live events tracked', value: '27' },
      { label: 'Alerts sent today', value: '1.8K' },
      { label: 'Average story read', value: '2.6 min' },
    ],
  },
  breakingTicker: [
    'India take early wickets in a momentum-shifting powerplay.',
    'Late equalizer sends the semifinal tie into extra time.',
    'Two seeded players exit after a dramatic comeback on center court.',
    'Weather watch pushes the toss window by fifteen minutes.',
  ],
  liveMatches: [
    {
      id: 'cricket-1',
      status: 'Live',
      competition: 'Asia Cup',
      homeTeam: 'India',
      homeScore: '182/4',
      awayTeam: 'Pakistan',
      awayScore: '16.2 ov',
      note: 'Partnership building after an aggressive opening burst.',
    },
    {
      id: 'football-1',
      status: '78 min',
      competition: 'Champions League',
      homeTeam: 'Madrid',
      homeScore: '2',
      awayTeam: 'Milan',
      awayScore: '1',
      note: 'Milan are pushing hard down the left after a tactical switch.',
    },
    {
      id: 'tennis-1',
      status: 'Set 3',
      competition: 'Masters 1000',
      homeTeam: 'Swiatek',
      homeScore: '6-4',
      awayTeam: 'Sabalenka',
      awayScore: '4-6',
      note: 'Third set level at 3-3 with momentum changing each game.',
    },
  ],
  topStories: [
    {
      id: 'story-1',
      category: 'Cricket',
      readTime: '4 min read',
      title: 'India reshape the middle order after a blistering start',
      summary:
        'A flexible batting plan and quick strike rotation gave the innings control after the powerplay rush cooled.',
      author: 'Desk Analysis',
      timestamp: '8 minutes ago',
    },
    {
      id: 'story-2',
      category: 'Football',
      readTime: '3 min read',
      title: 'Tactical bravery turns the semifinal into a transition battle',
      summary:
        'Both coaches traded control for chance creation, producing one of the fastest matches of the week.',
      author: 'Match Center',
      timestamp: '14 minutes ago',
    },
    {
      id: 'story-3',
      category: 'Tennis',
      readTime: '5 min read',
      title: 'Serve patterns decide a heavyweight duel under pressure',
      summary:
        'Margins stayed tiny as both players relied on second-serve aggression instead of passive recovery.',
      author: 'Court Report',
      timestamp: '22 minutes ago',
    },
  ],
  editorialTracks: [
    {
      title: 'Breaking Desk',
      description:
        'Short, urgent updates for wickets, goals, injuries, weather delays, and lineup news.',
    },
    {
      title: 'Deep Reads',
      description:
        'Longer tactical explainers, player arcs, and post-match analysis for fans who want more than scorecards.',
    },
    {
      title: 'Personal Alerts',
      description:
        'Future-ready space for favorite teams, fantasy signals, and competition-specific notifications.',
    },
  ],
  spotlight: {
    title: 'Fans are spending more time on quick live explainers than on plain scoreboards.',
    summary:
      'That is a strong fit for WicketVicky: mix numbers with compact context and let the interface do the sorting.',
    stat: '62%',
    caption: 'of session taps are heading to live cards first',
  },
  leagues: [
    {
      name: 'Cricket Central',
      region: 'Global',
      description: 'International tours, franchise leagues, match centers, and form trackers.',
      tags: ['Scorecards', 'Playing XI', 'Highlights'],
    },
    {
      name: 'Football Wire',
      region: 'Europe',
      description: 'Live match flow, transfer noise, tactical snapshots, and competition hubs.',
      tags: ['Goals', 'Tables', 'Lineups'],
    },
    {
      name: 'Court Watch',
      region: 'ATP / WTA',
      description: 'Fast point-by-point context for major tournaments and standout player journeys.',
      tags: ['Sets', 'Momentum', 'Draws'],
    },
  ],
};
