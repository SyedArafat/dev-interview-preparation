import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Sun, Moon, LogOut, ChevronDown } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../contexts/AuthContext'
import './Header.css'

// Simple GitHub mark SVG (no external dependency)
function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

/* ── User Avatar Dropdown ─────────────────────────────── */
function UserMenu({ user, signOut }) {
  const [open, setOpen] = useState(false)
  const ref             = useRef(null)

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initials = (user.displayName || user.email || '?')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="user-menu" ref={ref}>
      <button
        className="user-menu__trigger"
        onClick={() => setOpen(p => !p)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="user-menu__avatar"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="user-menu__initials">{initials}</span>
        )}
        <ChevronDown size={13} className={`user-menu__chevron ${open ? 'user-menu__chevron--open' : ''}`} />
      </button>

      {open && (
        <div className="user-menu__dropdown" role="menu">
          <div className="user-menu__profile">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="user-menu__profile-avatar"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="user-menu__profile-initials">{initials}</span>
            )}
            <div className="user-menu__profile-info">
              <span className="user-menu__name">{user.displayName || 'User'}</span>
              <span className="user-menu__email">{user.email}</span>
            </div>
          </div>

          <div className="user-menu__divider" />

          <button
            className="user-menu__item user-menu__item--danger"
            role="menuitem"
            onClick={() => { setOpen(false); signOut() }}
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Header ───────────────────────────────────────────── */
function Header() {
  const { theme, toggleTheme }          = useTheme()
  const { user, loading, signInWithGoogle, signOut } = useAuth()

  return (
    <header className="header">
      <div className="header__inner container">
        <Link to="/" className="header__logo">
          <span className="header__logo-icon" aria-hidden="true">&lt;/&gt;</span>
          <span className="header__logo-text">
            Dev Interview <span>Prep</span>
          </span>
        </Link>

        <nav className="header__nav">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="header__nav-link"
          >
            <GitHubIcon />
            <span>GitHub</span>
          </a>

          {/* Theme Toggle */}
          <button
            className="header__theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Auth area */}
          {!loading && (
            user ? (
              <UserMenu user={user} signOut={signOut} />
            ) : (
              <button className="header__btn-signin" onClick={signInWithGoogle}>
                <GoogleIcon />
                <span>Sign In</span>
              </button>
            )
          )}

          {/* Get Pro — Coming Soon */}
          <div className="header__pro-wrap" title="Coming soon">
            <button className="header__btn-pro" disabled>
              Get Pro
            </button>
            <span className="header__pro-badge">Soon</span>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Header
