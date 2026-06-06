import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, MessageSquarePlus, ArrowRight, Library, HelpCircle } from 'lucide-react'
import { collection, getCountFromServer } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../contexts/AuthContext'
import './AdminDashboard.css'

export default function AdminDashboard() {
  const { userDoc, user } = useAuth()
  const navigate          = useNavigate()
  const displayName       = userDoc?.displayName || user?.email?.split('@')[0] || 'Admin'

  const [counts, setCounts] = useState({ topics: '—', questions: '—' })

  useEffect(() => {
    async function load() {
      try {
        const [tSnap, qSnap] = await Promise.all([
          getCountFromServer(collection(db, 'topics')),
          getCountFromServer(collection(db, 'questions')),
        ])
        setCounts({ topics: tSnap.data().count, questions: qSnap.data().count })
      } catch {
        // ignore
      }
    }
    load()
  }, [])

  const actions = [
    {
      icon: Library,
      label: 'Manage Topics',
      description: 'View, edit, or delete existing topics. Search and filter through all your content.',
      to: '/admin/topics',
      accent: '#8b5cf6',
    },
    {
      icon: BookOpen,
      label: 'Add New Topic',
      description: 'Create a new technology topic card visible on the home page. Set the title, category, brand colour and Devicon icon.',
      to: '/admin/topics/new',
      accent: '#6366f1',
    },
    {
      icon: HelpCircle,
      label: 'Manage Questions',
      description: 'View questions by topic. Click any topic card to filter questions. Edit or delete questions.',
      to: '/admin/questions',
      accent: '#06b6d4',
    },
    {
      icon: MessageSquarePlus,
      label: 'Add New Question',
      description: 'Write a new interview question with a full Markdown answer. Supports code blocks, tables, and rich formatting.',
      to: '/admin/questions/new',
      accent: '#10b981',
    },
  ]

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard__header">
        <div>
          <p className="dashboard__eyebrow">Welcome back</p>
          <h1 className="dashboard__title">Hey, {displayName} 👋</h1>
          <p className="dashboard__sub">You're managing the Dev Interview Prep content.</p>
        </div>
        <div className="dashboard__stats">
          <div className="dashboard__stat">
            <Library size={18} />
            <div>
              <span className="dashboard__stat-num">{counts.topics}</span>
              <span className="dashboard__stat-label">Topics</span>
            </div>
          </div>
          <div className="dashboard__stat">
            <HelpCircle size={18} />
            <div>
              <span className="dashboard__stat-num">{counts.questions}</span>
              <span className="dashboard__stat-label">Questions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action tiles */}
      <div className="dashboard__grid">
        {actions.map(({ icon: Icon, label, description, to, accent }) => (
          <button
            key={to}
            className="dash-tile"
            style={{ '--tile-accent': accent }}
            onClick={() => navigate(to)}
          >
            <div className="dash-tile__icon-wrap">
              <Icon size={26} />
            </div>
            <div className="dash-tile__body">
              <h2 className="dash-tile__title">{label}</h2>
              <p className="dash-tile__desc">{description}</p>
            </div>
            <div className="dash-tile__cta">
              Get started <ArrowRight size={15} />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

