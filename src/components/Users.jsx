import { useEffect, useState, useCallback } from 'react'
import { getUsers, setUserStatus, resetPassword } from '../api/admin'

const USER_STATUSES = ['trial', 'active', 'inactive', 'suspended']
const USER_ROLES    = ['admin', 'user', 'support', 'owner']

function statusBadge(s) {
  return s === 'active'    ? 'badge-green'
       : s === 'suspended' ? 'badge-red'
       : s === 'inactive'  ? 'badge-orange'
       : 'badge-gray'
}

function fmtDate(s) {
  if (!s) return '—'
  return new Date(s).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })
}

/* ── Reset password modal ── */
function ResetModal({ user, onClose }) {
  const [pwd, setPwd]       = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]       = useState('')

  const handle = async () => {
    if (pwd.length < 8) { setMsg('Минимум 8 символов'); return }
    setLoading(true)
    try {
      await resetPassword(user.id, pwd)
      setMsg('Пароль сброшен')
      setTimeout(onClose, 1000)
    } catch (e) {
      setMsg(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Сброс пароля</div>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16, fontFamily: 'var(--mono)' }}>
          {user.email}
        </div>
        <div className="field">
          <label>Новый пароль</label>
          <input
            type="password"
            value={pwd}
            onChange={e => setPwd(e.target.value)}
            placeholder="Минимум 8 символов"
            autoFocus
          />
        </div>
        {msg && <div style={{ fontSize: 12, color: 'var(--yellow)', marginBottom: 8 }}>{msg}</div>}
        <div className="modal-actions">
          <button className="btn btn-sm" onClick={onClose}>Отмена</button>
          <button className="btn btn-primary btn-sm" onClick={handle} disabled={loading}>
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  )
}
/* ── /Reset password modal ── */

export default function Users() {
  const [items, setItems]     = useState([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [skip, setSkip]       = useState(0)
  const [resetTarget, setResetTarget] = useState(null)

  const [emailInput, setEmailInput] = useState('')
  const [fEmail,  setFEmail]  = useState('')
  const [fStatus, setFStatus] = useState('')
  const [fRole,   setFRole]   = useState('')

  const LIMIT = 50

  const load = useCallback(() => {
    setLoading(true)
    const params = { skip, limit: LIMIT }
    if (fEmail)  params.email  = fEmail
    if (fStatus) params.status = fStatus
    if (fRole)   params.role   = fRole
    getUsers(params)
      .then(d => { setItems(d.items); setTotal(d.total) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [skip, fEmail, fStatus, fRole])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const t = setTimeout(() => { setFEmail(emailInput); setSkip(0) }, 400)
    return () => clearTimeout(t)
  }, [emailInput])

  const changeStatus = async (user, status) => {
    try {
      await setUserStatus(user.id, status)
      setItems(prev => prev.map(u => u.id === user.id ? { ...u, status } : u))
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    /* ── Users ── */
    <div>

      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <div className="page-title">Users</div>
          <div className="page-sub">Всего: {total}</div>
        </div>
      </div>
      {/* ── /Page header ── */}

      {/* ── Filters ── */}
      <div className="filters">
        <input
          placeholder="Email"
          value={emailInput}
          onChange={e => setEmailInput(e.target.value)}
        />
        <select value={fStatus} onChange={e => { setFStatus(e.target.value); setSkip(0) }}>
          <option value="">Все статусы</option>
          {USER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={fRole} onChange={e => { setFRole(e.target.value); setSkip(0) }}>
          <option value="">Все роли</option>
          {USER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <button className="btn btn-sm" onClick={load}>Обновить</button>
      </div>
      {/* ── /Filters ── */}

      {/* ── Table ── */}
      {error && <div className="state-error">{error}</div>}

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Роль</th>
                <th>Статус</th>
                <th>Создан</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="state-empty">Загрузка...</td></tr>
              )}
              {!loading && items.length === 0 && (
                <tr><td colSpan={5} className="state-empty">Нет записей</td></tr>
              )}
              {!loading && items.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{u.email}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                      {u.id.slice(0, 8)}…
                    </div>
                  </td>
                  <td><span className="badge badge-blue">{u.role}</span></td>
                  <td><span className={`badge ${statusBadge(u.status)}`}>{u.status}</span></td>
                  <td style={{ color: 'var(--text2)', fontSize: 12 }}>{fmtDate(u.created_at)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {USER_STATUSES.filter(s => s !== u.status).map(s => (
                        <button
                          key={s}
                          className="btn btn-sm"
                          onClick={() => changeStatus(u, s)}
                        >
                          → {s}
                        </button>
                      ))}
                      <button
                        className="btn btn-sm"
                        onClick={() => setResetTarget(u)}
                      >
                        Reset pwd
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* ── /Table ── */}

      {/* ── Pagination ── */}
      {total > LIMIT && <div className="pagination">
        <button className="btn btn-sm" disabled={skip === 0} onClick={() => setSkip(Math.max(0, skip - LIMIT))}>
          ← Назад
        </button>
        <span>{skip + 1}–{Math.min(skip + LIMIT, total)} из {total}</span>
        <button className="btn btn-sm" disabled={skip + LIMIT >= total} onClick={() => setSkip(skip + LIMIT)}>
          Вперёд →
        </button>
      </div>}
      {/* ── /Pagination ── */}

      {/* ── Reset modal ── */}
      {resetTarget && (
        <ResetModal user={resetTarget} onClose={() => setResetTarget(null)} />
      )}
      {/* ── /Reset modal ── */}

    </div>
    /* ── /Users ── */
  )
}