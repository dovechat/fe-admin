import { useEffect, useState, useCallback } from 'react'
import { getLines, setLineStatus, extendLine } from '../api/admin'

const LINE_STATUSES = ['active', 'disabled', 'expired']
const CHANNEL_TYPES = ['telegram_user', 'telegram_bot', 'whatsapp_green', 'waba']

/* ── Helpers ── */
function statusBadge(status) {
  if (status === 'active')   return 'badge-green'
  if (status === 'disabled') return 'badge-red'
  if (status === 'expired')  return 'badge-yellow'
  return 'badge-gray'
}

function fmtDate(s) {
  if (!s) return '—'
  return new Date(s).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })
}

function maxExpires(channels) {
  if (!channels?.length) return null
  return channels.reduce(
    (max, c) => c.expires_at > max ? c.expires_at : max,
    channels[0].expires_at
  )
}
/* ── /Helpers ── */

const LIMIT = 20


/* ── Extend modal ── */
function ExtendModal({ line, onClose, onDone }) {
  const [days, setDays]       = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]         = useState('')

  const handle = async () => {
    const d = parseInt(days)
    if (!d || d < 1 || d > 3650) { setMsg('От 1 до 3650 дней'); return }
    setLoading(true)
    try {
      await extendLine(line.id, d)
      setMsg('Готово')
      setTimeout(() => { onDone(); onClose() }, 800)
    } catch (e) {
      setMsg(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Продлить линию</div>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16, fontFamily: 'var(--mono)' }}>
          {line.name || line.id.slice(0, 8)}
        </div>
        <div className="field">
          <label>Количество дней</label>
          <input
            type="number"
            value={days}
            onChange={e => setDays(e.target.value)}
            placeholder="например 30"
            min={1}
            max={3650}
            autoFocus
          />
        </div>
        {msg && <div style={{ fontSize: 12, color: 'var(--yellow)', marginBottom: 8 }}>{msg}</div>}
        <div className="modal-actions">
          <button className="btn btn-sm" onClick={onClose}>Отмена</button>
          <button className="btn btn-primary btn-sm" onClick={handle} disabled={loading}>
            {loading ? 'Сохранение...' : 'Продлить'}
          </button>
        </div>
      </div>
    </div>
  )
}
/* ── /Extend modal ── */


export default function Lines() {
  const [items, setItems]     = useState([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [skip, setSkip]         = useState(0)
  const [extendTarget, setExtendTarget] = useState(null)

  const [fStatus,      setFStatus]      = useState('')
  const [fChannelType, setFChannelType] = useState('')
  const [fName,        setFName]        = useState('')

  const load = useCallback(() => {
    setLoading(true)
    const params = { skip, limit: LIMIT }
    if (fStatus)      params.status       = fStatus
    if (fChannelType) params.channel_type = fChannelType
    if (fName)        params.name         = fName
    getLines(params)
      .then(r => { setItems(r.items); setTotal(r.total) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [skip, fStatus, fChannelType, fName])

  useEffect(() => { load() }, [load])

  const toggle = async (id, status) => {
    try {
      await setLineStatus(id, status)
      setItems(prev => prev.map(l => l.id === id ? { ...l, status } : l))
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    /* ── Lines ── */
    <div>

      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <div className="page-title">Lines</div>
          <div className="page-sub">Всего: {total}</div>
        </div>
      </div>
      {/* ── /Page header ── */}

      {/* ── Filters ── */}
      <div className="filters">
        <input
          placeholder="Название линии"
          value={fName}
          onChange={e => { setFName(e.target.value); setSkip(0) }}
        />
        <select value={fStatus} onChange={e => { setFStatus(e.target.value); setSkip(0) }}>
          <option value="">Все статусы</option>
          {LINE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={fChannelType} onChange={e => { setFChannelType(e.target.value); setSkip(0) }}>
          <option value="">Все каналы</option>
          {CHANNEL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <button className="btn btn-sm" onClick={() => {
          setFStatus('')
          setFChannelType('')
          setFName('')
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
                <th>Название</th>
                <th>Статус</th>
                <th>Каналы</th>
                <th>Истекает</th>
                <th>Создана</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="state-empty">Загрузка...</td></tr>
              )}
              {!loading && items.length === 0 && (
                <tr><td colSpan={6} className="state-empty">Нет линий</td></tr>
              )}
              {!loading && items.map(l => (
                <tr key={l.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{l.name || '—'}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                      {l.id.slice(0, 8)}…
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${statusBadge(l.status)}`}>{l.status}</span>
                  </td>
                  <td style={{ color: 'var(--text2)', fontSize: 12 }}>
                    {l.channels?.map(c => c.channel_type).join(', ') || '—'}
                  </td>
                  <td className="mono" style={{ fontSize: 12, color: 'var(--text2)' }}>
                    {fmtDate(maxExpires(l.channels))}
                  </td>
                  <td className="mono" style={{ fontSize: 12, color: 'var(--text2)' }}>
                    {fmtDate(l.created_at)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button
                        className="btn btn-sm"
                        onClick={() => toggle(l.id, l.status === 'active' ? 'disabled' : 'active')}
                      >
                        {l.status === 'active' ? 'Деактивировать' : 'Активировать'}
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() => setExtendTarget(l)}
                      >
                        Продлить
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
        <span>{total === 0 ? '0' : skip + 1}–{Math.min(skip + LIMIT, total)} из {total}</span>
        <button className="btn btn-sm" disabled={skip + LIMIT >= total} onClick={() => setSkip(skip + LIMIT)}>
          Вперёд →
        </button>
      </div>}
      {/* ── /Pagination ── */}

      {/* ── Extend modal ── */}
      {extendTarget && (
        <ExtendModal
          line={extendTarget}
          onClose={() => setExtendTarget(null)}
          onDone={load}
        />
      )}
      {/* ── /Extend modal ── */}

    </div>
    /* ── /Lines ── */
  )
}