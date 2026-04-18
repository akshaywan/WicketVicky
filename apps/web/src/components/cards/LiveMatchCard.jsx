export default function LiveMatchCard({ match }) {
  return (
    <article className="live-match-card">
      <div className="live-match-topline">
        <span className="status-pill">{match.status}</span>
        <span>{match.competition}</span>
      </div>

      <div className="live-match-score">
        <div>
          <p>{match.homeTeam}</p>
          <strong>{match.homeScore}</strong>
        </div>
        <span>vs</span>
        <div>
          <p>{match.awayTeam}</p>
          <strong>{match.awayScore}</strong>
        </div>
      </div>

      <p className="live-match-note">{match.note}</p>
    </article>
  );
}
