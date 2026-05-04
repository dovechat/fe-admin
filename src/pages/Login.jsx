import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/admin'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await login(username, password)
      localStorage.setItem('admin_token', data.access_token)
      if (data.refresh_token)
        localStorage.setItem('admin_refresh_token', data.refresh_token)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  return (
    /* ── Login shell ── */
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      fontFamily: 'var(--mono)',
    }}>

      {/* ── Login card ── */}
      <div style={{
        width: '100%',
        maxWidth: 360,
        background: 'var(--surface)',
        border: '1px solid var(--border2)',
        borderRadius: 10,
        padding: '36px 32px',
      }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            fontSize: 11,
            letterSpacing: '.12em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            marginBottom: 6,
          }}>
            DoveChat
          </div>
          <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)' }}>
            Admin Panel
          </div>
        </div>
        {/* ── /Header ── */}

        {/* ── Error ── */}
        {error && (
          <div style={{
            background: 'rgba(248,113,113,.1)',
            border: '1px solid rgba(248,113,113,.3)',
            color: 'var(--red)',
            borderRadius: 6,
            padding: '8px 12px',
            fontSize: 13,
            marginBottom: 16,
            fontFamily: 'var(--sans)',
          }}>
            {String(error)}
          </div>
        )}
        {/* ── /Error ── */}

        {/* ── Form ── */}
        <form onSubmit={handleSubmit}>

          <div className="field" style={{ fontFamily: 'var(--sans)' }}>
            <label>Логин</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="field" style={{ fontFamily: 'var(--sans)' }}>
            <label>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '10px' }}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>

        </form>
        {/* ── /Form ── */}

      </div>
      {/* ── /Login card ── */}

    </div>
    /* ── /Login shell ── */
  )
}