import { useEffect, useState } from 'react'
import { getInstances, cleanInstance, deleteInstance } from '../api/admin'

/* ── Helpers ── */
function statusBadge(status) {
  if (status === 'idle')        return 'badge-green'
  if (status === 'busy')        return 'badge-gray'
  if (status === 'error')       return 'badge-red'
  if (status === 'maintenance') return 'badge-yellow'
  return 'badge-gray'
}
/* ── /Helpers ── */

export default function Instances() {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const load = () =>
    getInstances()
      .then(r => setData(r.items))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const clean = async (id) => {
    await cleanInstance(id)
    const r = await getInstances()
    setData(r.items)
  }

  const remove = async (id) => {
    await deleteInstance(id)
    const r = await getInstances()
    setData(r.items)
  }

  if (loading) return <div className="state-empty">Загрузка...</div>
  if (error)   return <div className="state-error">{error}</div>

  return (
    /* ── Instances ── */
    <div>

      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <div className="page-title">Instances</div>
          <div className="page-sub">Управление инстансами</div>
        </div>
      </div>
      {/* ── /Page header ── */}

      {/* ── Table ── */}
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Линия</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 && (
                <tr>
                  <td colSpan={5} className="state-empty">Нет инстансов</td>
                </tr>
              )}
              {data.map(i => (
                <tr key={i.external_id}>
                  <td className="mono" style={{ fontSize: 11, color: 'var(--text3)' }}>
                    {i.external_id}…
                  </td>
                  <td style={{ fontWeight: 500 }}>{i.line_name || '—'}</td>
                  <td>
                    <span className={`badge ${statusBadge(i.status)}`}>{i.status}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn-sm btn-yellow"
                        onClick={() => clean(i.id)}
                      >
                        Очистить
                      </button>
                      <button
                        className="btn-sm btn-red"
                        onClick={() => remove(i.id)}
                      >
                        Удалить
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

    </div>
    /* ── /Instances ── */
  )
}