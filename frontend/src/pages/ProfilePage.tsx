import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'
import { User, Mail, Globe, Clock, Palette, Camera, Save, ChevronLeft } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import './ProfilePage.css'

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuthStore()
  const { navigate } = useAppStore()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || '',
    avatar: user?.avatar || '',
    timezone: (user as any)?.timezone || 'UTC',
    week_start: (user as any)?.week_start || 'monday',
    theme: (user as any)?.theme || 'light',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfile(form)
      toast.success('Profile updated!')
      setEditing(false)
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = () => {
    const initials = prompt('Enter your initials (1-2 characters):', form.avatar)
    if (initials && initials.trim().length <= 3) {
      setForm({ ...form, avatar: initials.trim().toUpperCase() })
      setEditing(true)
    }
  }

  if (!user) return null

  const memberSince = (user as any).created_at
    ? new Date((user as any).created_at + 'T00:00:00').toLocaleDateString('en', { month: 'long', year: 'numeric' })
    : 'Unknown'

  return (
    <div className="profile-page">
      <button className="btn btn-ghost btn-sm mb-2" onClick={() => navigate('dashboard')} style={{ gap: 4 }}>
        <ChevronLeft size={14} /> Back to Dashboard
      </button>

      {/* Hero card */}
      <div className="profile-hero">
        <div className="profile-hero-bg" />
        <div className="profile-avatar-section">
          <div className="profile-avatar" onClick={handleAvatarChange}>
            <span className="profile-avatar-text">{form.avatar || user.avatar || '?'}</span>
            <div className="profile-avatar-overlay">
              <Camera size={16} />
            </div>
          </div>
          <div className="profile-hero-info">
            <h2 className="profile-name">{user.name}</h2>
            <p className="profile-email">{user.email}</p>
            <div className="profile-badges">
              <span className="profile-badge">{user.role === 'admin' ? '⚡ Admin' : '👤 Member'}</span>
              <span className="profile-badge">📅 Since {memberSince}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-grid">
        {/* Personal info */}
        <div className="card profile-card">
          <div className="card-header">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <User size={13} /> Personal Information
            </div>
            {!editing ? (
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Edit</button>
            ) : (
              <button className="btn btn-ink btn-sm" onClick={handleSave} disabled={saving} style={{ gap: 4 }}>
                <Save size={12} /> {saving ? 'Saving…' : 'Save'}
              </button>
            )}
          </div>

          <div className="profile-fields">
            <ProfileField
              icon={<User size={14} />}
              label="Display Name"
              value={form.name}
              editing={editing}
              onChange={v => setForm({ ...form, name: v })}
            />
            <ProfileField
              icon={<Mail size={14} />}
              label="Email"
              value={user.email}
              editing={false}
              readOnly
            />
            <ProfileField
              icon={<Camera size={14} />}
              label="Avatar Initials"
              value={form.avatar}
              editing={editing}
              onChange={v => setForm({ ...form, avatar: v.toUpperCase().slice(0, 3) })}
            />
          </div>
        </div>

        {/* Preferences */}
        <div className="card profile-card">
          <div className="card-header">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Palette size={13} /> Preferences
            </div>
            {editing && (
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
            )}
          </div>

          <div className="profile-fields">
            <div className="profile-field">
              <div className="profile-field-label">
                <Globe size={14} />
                <span>Timezone</span>
              </div>
              <div className="profile-field-value">
                {editing ? (
                  <select className="tdm-select" value={form.timezone} onChange={e => setForm({ ...form, timezone: e.target.value })}>
                    <option value="UTC">UTC</option>
                    <option value="Europe/Madrid">Europe/Madrid</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="America/New_York">America/New York</option>
                    <option value="America/Chicago">America/Chicago</option>
                    <option value="America/Denver">America/Denver</option>
                    <option value="America/Los_Angeles">America/Los Angeles</option>
                    <option value="Asia/Tokyo">Asia/Tokyo</option>
                    <option value="Asia/Shanghai">Asia/Shanghai</option>
                    <option value="Australia/Sydney">Australia/Sydney</option>
                  </select>
                ) : (
                  <span>{form.timezone}</span>
                )}
              </div>
            </div>
            <div className="profile-field">
              <div className="profile-field-label">
                <Clock size={14} />
                <span>Week starts on</span>
              </div>
              <div className="profile-field-value">
                {editing ? (
                  <select className="tdm-select" value={form.week_start} onChange={e => setForm({ ...form, week_start: e.target.value })}>
                    <option value="monday">Monday</option>
                    <option value="sunday">Sunday</option>
                    <option value="saturday">Saturday</option>
                  </select>
                ) : (
                  <span style={{ textTransform: 'capitalize' }}>{form.week_start}</span>
                )}
              </div>
            </div>
            <div className="profile-field">
              <div className="profile-field-label">
                <Palette size={14} />
                <span>Theme</span>
              </div>
              <div className="profile-field-value">
                {editing ? (
                  <select className="tdm-select" value={form.theme} onChange={e => setForm({ ...form, theme: e.target.value })}>
                    <option value="light">Light</option>
                    <option value="dark">Dark (coming soon)</option>
                  </select>
                ) : (
                  <span style={{ textTransform: 'capitalize' }}>{form.theme}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="card profile-card profile-danger">
        <div className="card-header">
          <div className="card-title" style={{ color: 'var(--rust)' }}>Danger Zone</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>Sign out</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--ink3)' }}>You'll need to sign in again next time</div>
          </div>
          <button className="btn btn-danger btn-sm" onClick={logout}>Logout</button>
        </div>
      </div>
    </div>
  )
}

function ProfileField({ icon, label, value, editing, onChange, readOnly }: {
  icon: React.ReactNode; label: string; value: string;
  editing: boolean; onChange?: (v: string) => void; readOnly?: boolean
}) {
  return (
    <div className="profile-field">
      <div className="profile-field-label">
        {icon}
        <span>{label}</span>
      </div>
      <div className="profile-field-value">
        {editing && !readOnly ? (
          <input
            type="text"
            value={value}
            onChange={e => onChange?.(e.target.value)}
            className="profile-input"
          />
        ) : (
          <span className={readOnly ? 'profile-readonly' : ''}>{value}</span>
        )}
      </div>
    </div>
  )
}

