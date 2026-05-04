import { useEffect, useState } from 'react'
import { getStats, getAudit } from '../api/admin'

/* ── Stat card ── */
function StatCard({ label, value, sub, color }) {
  return (
    <div className="card" style={{ padding: '18px 20px', minWidth: 140 }}>
      <div style={{
        fontFamily: 'var(--mono)',
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: '.07em',
        color: 'var(--text3)',
        marginBottom: 8,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'var(--mono)',
        fontSize: 28,
        fontWeight: 600,
        color: color || 'var(--text)',
        lineHeight: 1,
      }}>
        {value ?? '—'}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>
          {sub}
        </div>
      )}
    </div>
  )
}
/* ── /Stat card ── */

/* ── Audit row ── */
function auditBadge(action) {
  if (action.includes('block') || action.includes('delete') || action.includes('clean'))
    return 'badge-red'
  if (action.includes('create') || action.includes('add'))
    return 'badge-green'
  if (action.includes('extend') || action.includes('adjust'))
    return 'badge-yellow'
  return 'badge-gray'
}

function fmtDate(s) {
  if (!s) return '—'
  return new Date(s).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })
}
/* ── /Audit row ── */

export default function Dashboard() {
  const [stats, setStats]   = useState(null)
  const [audit, setAudit]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    Promise.all([getStats(), getAudit({ limit: 20 })])
      .then(([s, a]) => { setStats(s); setAudit(a.items) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="state-empty">Загрузка...</div>
  if (error)   return <div className="state-error">{error}</div>

  return (
    /* ── Dashboard ── */
    <div>

      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-sub">Сводная статистика системы</div>
        </div>
      </div>
      {/* ── /Page header ── */}

      {/* ── Stats grid ── */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
        <StatCard label="Users total"    value={stats.total_users} />
        <StatCard label="Active"         value={stats.active_users}    color="var(--green)" />
        <StatCard label="Blocked"        value={stats.blocked_users}   color="var(--red)" />
        <StatCard label="Lines total"    value={stats.total_lines} />
        <StatCard label="Lines active"   value={stats.active_lines}    color="var(--green)" />
        <StatCard label="Lines expired"  value={stats.expired_lines}   color="var(--orange)" />
        <StatCard label="Instances"      value={stats.total_instances} />
        <StatCard label="Idle"           value={stats.idle_instances}  color="var(--green)" />
        <StatCard label="Allocated"      value={stats.allocated_instances} color="var(--accent)" />
        <StatCard label="Error"          value={stats.error_instances} color="var(--red)" />
      </div>
      {/* ── /Stats grid ── */}

      {/* ── Recent audit ── */}
      <div className="page-title" style={{ marginBottom: 14, fontSize: 13 }}>
        Последние действия
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Время</th>
                <th>Действие</th>
                <th>Тип</th>
                <th>Entity ID</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {audit.length === 0 && (
                <tr>
                  <td colSpan={5} className="state-empty">Нет записей</td>
                </tr>
              )}
              {audit.map(row => (
                <tr key={row.id}>
                  <td className="mono" style={{ color: 'var(--text2)', fontSize: 12 }}>
                    {fmtDate(row.created_at)}
                  </td>
                  <td>
                    <span className={`badge ${auditBadge(row.action)}`}>{row.action}</span>
                  </td>
                  <td style={{ color: 'var(--text2)' }}>{row.entity_type || '—'}</td>
                  <td className="mono" style={{ fontSize: 11, color: 'var(--text3)' }}>
                    {row.entity_id ? row.entity_id.slice(0, 8) + '…' : '—'}
                  </td>
                  <td className="mono" style={{ fontSize: 11, color: 'var(--text3)' }}>
                    {row.ip_address || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* ── /Recent audit ── */}

    </div>
    /* ── /Dashboard ── */
  )
}