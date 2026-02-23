import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'
import './LoginPage.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    try {
      await login(email, password)
      toast.success(`Welcome to Meridian!`)
    } catch (err: any) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = async (em: string, pw: string) => {
    setLoading(true)
    try {
      await login(em, pw)
      toast.success('Welcome!')
    } catch {
      toast.error('Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-brand">
          <span className="login-brand-icon">◇</span>
          <h1 className="login-brand-text">Meridian</h1>
        </div>
        <p className="login-sub">Your personal life planner</p>

        <form onSubmit={handleSubmit}>
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
              placeholder="optional for demo"
            />
          </div>
          <button className="btn btn-ink" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Logging in…' : 'Sign in'}
          </button>
        </form>

        <div className="login-divider">
          <span>or try a demo account</span>
        </div>

        <div className="quick-logins">
          <button className="quick-btn" onClick={() => quickLogin('demo', 'demo')}>
            <span className="quick-av">J</span>
            <div>
              <div className="quick-name">Jordan</div>
              <div className="quick-email">demo@meridian.app</div>
            </div>
          </button>
          <button className="quick-btn" onClick={() => quickLogin('jose', 'meridian2024')}>
            <span className="quick-av admin">JC</span>
            <div>
              <div className="quick-name">José <span className="admin-tag">Admin</span></div>
              <div className="quick-email">jose@meridian.app</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

