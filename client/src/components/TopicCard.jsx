import { useNavigate } from 'react-router-dom'
import './TopicCard.css'

function TopicCard({ topic, done = 0, total = 0 }) {
  const navigate = useNavigate()
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const isStarted = done > 0

  return (
    <div
      className={`topic-card ${isStarted ? 'topic-card--started' : ''}`}
      style={{ '--topic-color': topic.color }}
      onClick={() => navigate(`/topic/${topic.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/topic/${topic.id}`)}
      aria-label={`${topic.name} — ${topic.questionsCount} questions`}
    >
      {/* Coloured top accent bar */}
      <div className="topic-card__accent" />

      {/* Icon */}
      <div className="topic-card__icon-wrap">
        <i className={`${topic.devicon} topic-card__icon`} />
      </div>

      {/* Info */}
      <div className="topic-card__info">
        <h3 className="topic-card__name">{topic.name}</h3>
        <p className="topic-card__count">{topic.questionsCount} questions</p>
      </div>

      {/* Progress (shown only if started) */}
      {isStarted && (
        <div className="topic-card__progress">
          <div className="topic-card__progress-track">
            <div
              className="topic-card__progress-fill"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="topic-card__progress-label">
            {done}/{total}
          </span>
        </div>
      )}
    </div>
  )
}

export default TopicCard

