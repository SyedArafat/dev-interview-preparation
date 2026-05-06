import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './LoginPage.css'

export default function LoginPage() {
  const { signIn, user, role, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [pendingRedirect, setPendingRedirect] = useState(false)

  // Once auth+role is resolved after sign-in, redirect
  useEffect(() => {
    if (pendingRedirect && !authLoading) {
      if (role === 'admin') {
        navigate('/admin', { replace: true })
      } else if (role !== null) {
        setError('This account does not have admin access.')
        setLoading(false)
        setPendingRedirect(false)
      }
    }
  }, [role, authLoading, pendingRedirect, navigate])

  // Already logged in as admin — redirect immediately
  useEffect(() => {
    if (!authLoading && user && role === 'admin') {
      navigate('/admin', { replace: true })
    }
  }, [user, role, authLoading, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      // Don't navigate yet — wait for AuthContext to fetch role from Firestore
      setPendingRedirect(true)
    } catch (err) {
      const messages = {
        'auth/user-not-found':      'No account found with this email.',
        'auth/wrong-password':      'Incorrect password. Please try again.',
        'auth/invalid-email':       'Please enter a valid email address.',
        'auth/too-many-requests':   'Too many attempts. Please try again later.',
        'auth/invalid-credential':  'Invalid email or password.',
      }
      setError(messages[err.code] || 'Sign in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Background decoration */}
      <div className="login-page__glow-1" aria-hidden="true" />
      <div className="login-page__glow-2" aria-hidden="true" />

      <div className="login-card">
        {/* Logo */}
        <Link to="/" className="login-card__logo">
          <span className="login-card__logo-icon">&lt;/&gt;</span>
          <span className="login-card__logo-text">Dev Interview Prep</span>
        </Link>

        <div className="login-card__header">
          <h1 className="login-card__title">Admin Sign In</h1>
          <p className="login-card__sub">Access the content management panel</p>
        </div>

        {error && (
          <div className="login-error" role="alert">
            <span className="login-error__icon">⚠</span>
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="login-form__group">
            <label className="login-form__label" htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              className="login-form__input"
              placeholder="admin@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="login-form__group">
            <label className="login-form__label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="login-form__input"
              placeholder="••••••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="login-form__submit"
            disabled={loading || !email || !password}
          >
            {loading ? (
              <><span className="login-form__spinner" /> Signing in…</>
            ) : (
              'Sign In to Admin Panel'
            )}
          </button>
        </form>

        <p className="login-card__back">
          <Link to="/">← Back to site</Link>
        </p>
      </div>
    </div>
  )
}

