export default function StoryCard({ story }) {
  return (
    <article className="story-card">
      <div className="story-meta">
        <span>{story.category}</span>
        <span>{story.readTime}</span>
      </div>
      <h3>{story.title}</h3>
      <p>{story.summary}</p>
      <div className="story-footer">
        <span>{story.author}</span>
        <span>{story.timestamp}</span>
      </div>
    </article>
  );
}
