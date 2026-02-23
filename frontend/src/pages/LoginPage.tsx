import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'
import './LoginPage.css'

type Mode = 'login' | 'signup'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, signup, googleLogin } = useAuthStore()
  const googleBtnRef = useRef<HTMLDivElement>(null)
  const [googleReady, setGoogleReady] = useState(false)

  // Initialize Google Sign-In when SDK is loaded and client ID exists
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return

    const initGoogle = () => {
      if (!(window as any).google?.accounts?.id) {
        // SDK not loaded yet, retry
        setTimeout(initGoogle, 200)
        return
      }

      const google = (window as any).google.accounts.id

      google.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
      })

      if (googleBtnRef.current) {
        google.renderButton(googleBtnRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          width: 360,
          text: 'continue_with',
          shape: 'pill',
          logo_alignment: 'left',
        })
      }

      setGoogleReady(true)
    }

    initGoogle()
  }, [])

  const handleGoogleResponse = async (response: any) => {
    if (!response?.credential) return
    setLoading(true)
    try {
      await googleLogin(response.credential)
      toast.success('Welcome! 🎉')
    } catch (err: any) {
      toast.error(err.message || 'Google sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    try {
      if (mode === 'signup') {
        if (!name.trim()) { toast.error('Name is required'); setLoading(false); return }
        if (password.length < 4) { toast.error('Password must be at least 4 characters'); setLoading(false); return }
        await signup(email, password, name)
        toast.success('Welcome to Meridian! 🎉')
      } else {
        await login(email, password)
        toast.success('Welcome back!')
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleFallback = () => {
    toast('To enable Google Sign-In:\n1. Get a Client ID from Google Cloud Console\n2. Set VITE_GOOGLE_CLIENT_ID in .env\n3. Rebuild the app', {
      icon: '🔧',
      duration: 6000,
      style: { maxWidth: 400, lineHeight: 1.5 },
    })
  }

  const quickLogin = async (em: string, pw: string) => {
    setLoading(true)
    try {
      await login(em, pw)
      toast.success('Welcome!')
    } catch { toast.error('Login failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="login-screen">
      <div className="login-orb orb-1" />
      <div className="login-orb orb-2" />
      <div className="login-orb orb-3" />

      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo">
            <span className="logo-diamond">◇</span>
          </div>
          <h1 className="login-brand-text">Meridian</h1>
          <p className="login-sub">Plan beautifully. Live intentionally.</p>
        </div>

        {/* Mode tabs */}
        <div className="auth-tabs">
          <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>
            Sign in
          </button>
          <button className={`auth-tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => setMode('signup')}>
            Create account
          </button>
          <div className="auth-tab-indicator" style={{ transform: mode === 'signup' ? 'translateX(100%)' : 'translateX(0)' }} />
        </div>

        {/* Google Sign-In */}
        {GOOGLE_CLIENT_ID ? (
          // Real Google button rendered by SDK
          <div className="google-container">
            <div ref={googleBtnRef} className="google-btn-native" />
          </div>
        ) : (
          // Fallback button when no Client ID configured
          <button className="google-btn" onClick={handleGoogleFallback} type="button">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        )}

        <div className="auth-divider"><span>or</span></div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <div className="field animate-field">
              <label>Full name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoFocus
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'Min. 4 characters' : 'Your password'}
            />
          </div>
          <button className="btn btn-ink auth-submit" type="submit" disabled={loading}>
            {loading ? (
              <span className="spinner" />
            ) : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <div className="auth-divider"><span>quick demo</span></div>

        <div className="quick-logins">
          <button className="quick-btn" onClick={() => quickLogin('demo', 'demo')}>
            <span className="quick-av">J</span>
            <div>
              <div className="quick-name">Jordan</div>
              <div className="quick-email">demo@meridian.app</div>
            </div>
            <span className="quick-arrow">→</span>
          </button>
          <button className="quick-btn" onClick={() => quickLogin('jose', 'meridian2024')}>
            <span className="quick-av admin">JC</span>
            <div>
              <div className="quick-name">José <span className="admin-tag">Admin</span></div>
              <div className="quick-email">jose@meridian.app</div>
            </div>
            <span className="quick-arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  )
}

