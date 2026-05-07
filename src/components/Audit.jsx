import { useEffect, useState, useCallback } from 'react'
import { getAudit } from '../api/admin'

/* ── Helpers ── */
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
/* ── /Helpers ── */

const LIMIT = 50

export default function Audit() {
  const [items, setItems]     = useState([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [skip, setSkip]       = useState(0)

  const [fAction,     setFAction]     = useState('')
  const [fEntityType, setFEntityType] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    const params = { skip, limit: LIMIT }
    if (fAction)     params.action      = fAction
    if (fEntityType) params.entity_type = fEntityType
    getAudit(params)
      .then(r => { setItems(r.items); setTotal(r.total) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [skip, fAction, fEntityType])

  useEffect(() => { load() }, [load])

  return (
    /* ── Audit ── */
    <div>

      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <div className="page-title">Audit</div>
          <div className="page-sub">Всего записей: {total}</div>
        </div>
      </div>
      {/* ── /Page header ── */}

      {/* ── Filters ── */}
      <div className="filters">
        <div style={{ minWidth: 190 }} />
        <input
          placeholder="Действие"
          value={fAction}
          onChange={e => { setFAction(e.target.value); setSkip(0) }}
        />
        <input
          placeholder="Тип объекта"
          value={fEntityType}
          onChange={e => { setFEntityType(e.target.value); setSkip(0) }}
        />
        <button className="btn btn-sm" onClick={() => {
          setFAction('')
          setFEntityType('')
          setSkip(0)
        }}>Сбросить</button>
      </div>
      {/* ── /Filters ── */}

      {/* ── Table ── */}
      {error && <div className="state-error">{error}</div>}

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Время</th>
                <th>Действие</th>
                <th>Тип объекта</th>
                <th>Сущность</th>
                <th>Админ</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="state-empty">Загрузка...</td></tr>
              )}
              {!loading && items.length === 0 && (
                <tr><td colSpan={5} className="state-empty">Нет записей</td></tr>
              )}
              {!loading && items.map(row => (
                <tr key={row.id}>
                  <td className="mono" style={{ fontSize: 12, color: 'var(--text2)' }}>
                    {fmtDate(row.created_at)}
                  </td>
                  <td>
                    <span className={`badge ${auditBadge(row.action)}`}>{row.action}</span>
                  </td>
                  <td style={{ color: 'var(--text2)' }}>{row.entity_type || '—'}</td>
                  <td style={{ color: 'var(--text2)' }}>{row.entity_name || '—'}</td>
                  <td style={{ color: 'var(--text2)' }}>{row.user || '—'}</td>
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
        <span>{total === 0 ? '0' : skip + 1}–{Math.min(skip + LIMIT, total)} из {total}</span>
        <button className="btn btn-sm" disabled={skip + LIMIT >= total} onClick={() => setSkip(skip + LIMIT)}>
          Вперёд →
        </button>
      </div>}
      {/* ── /Pagination ── */}

    </div>
    /* ── /Audit ── */
  )
}