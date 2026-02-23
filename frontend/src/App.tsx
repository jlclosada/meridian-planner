import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import LoginPage from '@/pages/LoginPage'
import AppShell from '@/components/layout/AppShell'

export default function App() {
  const { user, loading, tryAutoLogin } = useAuthStore()

  useEffect(() => {
    tryAutoLogin()
  }, [tryAutoLogin])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-serif)', fontSize: '1.2rem',
        color: 'var(--ink3)',
      }}>
        Loading Meridian…
      </div>
    )
  }

  if (!user) return <LoginPage />

  return <AppShell />
}

