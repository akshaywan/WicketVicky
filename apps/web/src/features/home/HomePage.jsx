import SectionHeading from '../../components/common/SectionHeading';
import StoryCard from '../../components/cards/StoryCard';
import LiveMatchCard from '../../components/cards/LiveMatchCard';
import LeagueCard from '../../components/cards/LeagueCard';
import useLiveFeed from '../../hooks/useLiveFeed';

function LoadingState() {
  return (
    <section className="status-panel">
      <p className="section-eyebrow">Loading Desk</p>
      <h1>Preparing your sports feed.</h1>
      <p>Pulling top stories, live snapshots, and trend signals.</p>
    </section>
  );
}

function ErrorState({ error }) {
  return (
    <section className="status-panel error-panel">
      <p className="section-eyebrow">Desk Offline</p>
      <h1>We could not load WicketVicky.</h1>
      <p>{error}</p>
    </section>
  );
}

function FeedStatus({ meta, status }) {
  if (!meta) {
    return null;
  }

  return (
    <section className="feed-status-bar" aria-live="polite">
      <div>
        <span className="feed-status-label">Data Source</span>
        <strong>{meta.sourceLabel}</strong>
      </div>
      <div>
        <span className="feed-status-label">Coverage</span>
        <strong>{meta.coverageLabel}</strong>
      </div>
      <div>
        <span className="feed-status-label">Updated</span>
        <strong>{meta.updatedLabel}</strong>
      </div>
      <div>
        <span className="feed-status-label">Refresh</span>
        <strong>{meta.refreshLabel}</strong>
      </div>
      <div>
        <span className="feed-status-label">State</span>
        <strong>{status === 'refreshing' ? 'Refreshing' : 'Ready'}</strong>
      </div>
      {meta.notice ? <p className="feed-status-notice">{meta.notice}</p> : null}
    </section>
  );
}

function HeroSection({ hero, breakingTicker }) {
  return (
    <section className="hero-section">
      <div className="hero-copy">
        <p className="section-eyebrow">Realtime Sports Newsroom</p>
        <h1>{hero.title}</h1>
        <p className="hero-summary">{hero.summary}</p>

        <div className="hero-actions">
          <button type="button">Watch Live Desk</button>
          <button className="ghost-button" type="button">
            Explore Competitions
          </button>
        </div>

        <div className="hero-kpis">
          {hero.metrics.map((metric) => (
            <div key={metric.label}>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </div>
          ))}
        </div>
      </div>

      <aside className="breaking-panel">
        <p className="breaking-label">Breaking stream</p>
        <ul>
          {breakingTicker.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </aside>
    </section>
  );
}

function LiveSectionEmptyState({ meta }) {
  const isLiveCoverage = meta?.coverageType === 'livescore';

  return (
    <div className="empty-state-card">
      <p className="section-eyebrow">{isLiveCoverage ? 'No Live Matches' : 'Schedule Snapshot'}</p>
      <h3>{isLiveCoverage ? 'No in-progress matches were returned this refresh.' : 'No active matches are in progress right now.'}</h3>
      <p>
        {isLiveCoverage
          ? 'The feed is connected, but the provider did not return any active events in this polling window.'
          : 'The current response is mostly fixture data, so this section stays empty until a match status moves into an in-progress state.'}
      </p>
    </div>
  );
}

export default function HomePage({ feed, status, error }) {
  const liveUpdates = useLiveFeed(feed?.liveMatches ?? [], { simulate: feed?.meta?.isMock ?? false });
  const isLiveCoverage = feed?.meta?.coverageType === 'livescore';

  if (status === 'loading') {
    return <LoadingState />;
  }

  if (status === 'error' || !feed) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="home-page">
      <FeedStatus meta={feed.meta} status={status} />
      <HeroSection hero={feed.hero} breakingTicker={feed.breakingTicker} />

      <section id="live-now" className="content-section">
        <SectionHeading
          eyebrow={isLiveCoverage ? 'Live Now' : 'In Progress'}
          title={isLiveCoverage ? 'Matches that need your attention' : 'Only active matches appear in this strip'}
          description={
            isLiveCoverage
              ? 'This row is reserved for genuinely in-progress matches from the active live-score feed.'
              : 'Schedule data can still power the homepage, but this strip now stays strict and only renders matches whose statuses are actively in progress.'
          }
        />

        {liveUpdates.length ? (
          <div className="live-grid">
            {liveUpdates.map((match) => (
              <LiveMatchCard key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <LiveSectionEmptyState meta={feed.meta} />
        )}
      </section>

      <section id="top-stories" className="content-section">
        <SectionHeading
          eyebrow="Top Stories"
          title="News cards built for quick scanning"
          description="These blocks are ready for category feeds, editorial picks, and personalized recommendation services."
        />

        <div className="story-grid">
          {feed.topStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </section>

      <section id="editorial-stack" className="content-section split-panel">
        <div className="editorial-panel">
          <SectionHeading
            eyebrow="Editorial Stack"
            title="A homepage that can grow with your newsroom"
            description="We have clear room for match centers, player pages, notification preferences, betting-safe insights, and fan communities later."
          />

          <div className="editorial-list">
            {feed.editorialTracks.map((track) => (
              <article key={track.title}>
                <h3>{track.title}</h3>
                <p>{track.description}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="spotlight-panel">
          <p className="spotlight-label">Fan Pulse</p>
          <h3>{feed.spotlight.title}</h3>
          <p>{feed.spotlight.summary}</p>
          <div className="spotlight-stat">
            <strong>{feed.spotlight.stat}</strong>
            <span>{feed.spotlight.caption}</span>
          </div>
        </div>
      </section>

      <section id="competitions" className="content-section">
        <SectionHeading
          eyebrow="Competitions"
          title="Coverage zones for your major sports"
          description="Cards can later map to dedicated verticals with standings, fixtures, squads, and localized alerts."
        />

        <div className="league-grid">
          {feed.leagues.map((league) => (
            <LeagueCard key={league.name} league={league} />
          ))}
        </div>
      </section>

      <section id="backend-ready" className="content-section backend-banner">
        <p className="section-eyebrow">Backend Ready</p>
        <h2>Prepared for Python or Spring services</h2>
        <p>
          The frontend reads through a small API layer, so your next step can be a FastAPI
          realtime gateway or a Spring Boot service mesh without rewriting the UI.
        </p>
        <div className="backend-options">
          <div>
            <strong>Python</strong>
            <span>Fast startup, async feeds, SSE/WebSockets</span>
          </div>
          <div>
            <strong>Spring</strong>
            <span>Structured modules, enterprise auth, scalable integrations</span>
          </div>
        </div>
      </section>
    </div>
  );
}
