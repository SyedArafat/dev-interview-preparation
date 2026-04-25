import { useNavigate } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import './TopicCard.css'

function TopicCard({ topic, done = 0, total = 0 }) {
  const navigate  = useNavigate()
  const pct       = total > 0 ? Math.round((done / total) * 100) : 0
  const isStarted = done > 0

  return (
    <div
      className={`tc ${isStarted ? 'tc--started' : ''}`}
      style={{ '--tc': topic.color }}
      onClick={() => navigate(`/topic/${topic.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/topic/${topic.id}`)}
      aria-label={`${topic.name} — explore interview questions`}
    >
      {/* Coloured top edge */}
      <div className="tc__bar" />

      {/* Background glow on hover */}
      <div className="tc__glow" aria-hidden="true" />

      {/* Icon */}
      <div className="tc__icon">
        <i className={`${topic.devicon} tc__devicon`} />
      </div>

      {/* Name */}
      <span className="tc__name">{topic.name}</span>

      {/* Arrow — shows on hover */}
      <span className="tc__arrow" aria-hidden="true">
        <ArrowUpRight size={13} strokeWidth={2.4} />
      </span>

      {/* Progress (when started) */}
      {isStarted && (
        <div className="tc__progress">
          <div className="tc__progress-track">
            <div className="tc__progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
    </div>
  )
}

export default TopicCard
