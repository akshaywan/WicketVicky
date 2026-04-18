export default function LeagueCard({ league }) {
  return (
    <article className="league-card">
      <p className="league-region">{league.region}</p>
      <h3>{league.name}</h3>
      <p>{league.description}</p>
      <div className="league-tags">
        {league.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </article>
  );
}
