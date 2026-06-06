import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, BookOpen, MessageSquarePlus, LogOut, ChevronRight, Library, HelpCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../hooks/useTheme'
import './AdminLayout.css'

const NAV = [
  { to: '/admin',               label: 'Dashboard',           icon: LayoutDashboard, end: true },
  { to: '/admin/topics',        label: 'Manage Topics',       icon: Library },
  { to: '/admin/topics/new',    label: 'Add Topic',           icon: BookOpen },
  { to: '/admin/questions',     label: 'Manage Questions',    icon: HelpCircle },
  { to: '/admin/questions/new', label: 'Add Question',        icon: MessageSquarePlus },
]

export default function AdminLayout() {
  const { user, userDoc, signOut } = useAuth()
  const { theme, toggleTheme }     = useTheme()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  const displayName = userDoc?.displayName || user?.email?.split('@')[0] || 'Admin'
  const email       = user?.email || ''

  return (
    <div className="admin-shell">
      {/* ── Sidebar ─────────────────────────────────── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__top">
          <div className="admin-sidebar__brand">
            <span className="admin-sidebar__brand-icon">&lt;/&gt;</span>
            <div>
              <p className="admin-sidebar__brand-name">Dev Interview</p>
              <p className="admin-sidebar__brand-badge">Admin Panel</p>
            </div>
          </div>

          <nav className="admin-sidebar__nav">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `admin-nav-item ${isActive ? 'admin-nav-item--active' : ''}`
                }
              >
                <Icon size={17} />
                <span>{label}</span>
                <ChevronRight size={14} className="admin-nav-item__arrow" />
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="admin-sidebar__bottom">
          <button className="admin-theme-btn" onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          <div className="admin-user">
            <div className="admin-user__avatar">
              {displayName[0].toUpperCase()}
            </div>
            <div className="admin-user__info">
              <p className="admin-user__name">{displayName}</p>
              <p className="admin-user__email">{email}</p>
            </div>
          </div>
          <button className="admin-signout-btn" onClick={handleSignOut} title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────── */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}

