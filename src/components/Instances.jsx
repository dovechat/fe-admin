import { useEffect, useState } from 'react'
import { getInstances, createInstance, cleanInstance, deleteInstance, reallocateInstance, getLines } from '../api/admin'

/* ── Helpers ── */
function statusBadge(status) {
  if (status === 'idle')        return 'badge-green'
  if (status === 'busy')        return 'badge-gray'
  if (status === 'active')      return 'badge-blue'
  if (status === 'error')       return 'badge-red'
  if (status === 'maintenance') return 'badge-yellow'
  return 'badge-gray'
}
/* ── /Helpers ── */

const PAGE_SIZE = 20

export default function Instances() {
  const [data, setData]         = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  /* ── Create modal ── */
  const [showCreate, setShowCreate]     = useState(false)
  const [createForm, setCreateForm] = useState({ external_id: '', token: '' })
  const [createError, setCreateError]   = useState('')
  /* ── /Create modal ── */

  /* ── Reallocate modal ── */
  const [reallocTarget, setReallocTarget] = useState(null)   // instance object
  const [reallocLineId, setReallocLineId] = useState('')
  const [reallocError, setReallocError]   = useState('')
  /* ── /Reallocate modal ── */

  const [lines, setLines] = useState([])

  const load = (p = page) => {
    getLines({ limit: 200 }).then(r => setLines(r.items))
    getInstances({ skip: (p - 1) * PAGE_SIZE, limit: PAGE_SIZE })
      .then(r => { setData(r.items); setTotal(r.total) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page])

  useEffect(() => {
    getLines({ limit: 200 }).then(r => setLines(r.items))
  }, [])

  /* ── Actions ── */
  const clean = async (id) => {
    await cleanInstance(id)
    load()
  }

  const remove = async (id) => {
    if (!confirm('Удалить инстанс?')) return
    try {
      await deleteInstance(id)
      load()
    } catch (e) {
      alert(e?.response?.data?.detail || 'Ошибка')
    }
  }

  const submitCreate = async () => {
    setCreateError('')
    try {
      await createInstance(createForm)
      setShowCreate(false)
      setCreateForm({ external_id: '' })
      load()
    } catch (e) {
      setCreateError(e.response?.data?.detail || e.message)
    }
  }

  const submitReallocate = async () => {
    if (!reallocLineId) { setReallocError('Выберите линию'); return }
    setReallocError('')
    try {
      await reallocateInstance(reallocTarget.id, reallocLineId)
      setReallocTarget(null)
      setReallocLineId('')
      load()
    } catch (e) {
      setReallocError(e.response?.data?.detail || e.message)
    }
  }
  /* ── /Actions ── */

  const totalPages = Math.ceil(total / PAGE_SIZE)

  if (loading) return <div className="state-empty">Загрузка...</div>
  if (error)   return <div className="state-error">{error}</div>

  return (
    /* ── Instances ── */
    <div>

      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <div className="page-title">Инстансы</div>
          <div className="page-sub">Управление инстансами</div>
        </div>
        <button className="btn" onClick={() => setShowCreate(true)}>+ Создать</button>
      </div>
      {/* ── /Page header ── */}

      {/* ── Table ── */}
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>External ID</th>
                <th>Линия</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 && (
                <tr>
                  <td colSpan={4} className="state-empty">Нет инстансов</td>
                </tr>
              )}
              {data.map(i => (
                <tr key={i.id}>
                  <td className="mono" style={{ fontSize: 11, color: 'var(--text3)' }}>
                    {i.external_id}
                  </td>
                  <td style={{ fontWeight: 500 }}>{i.line_name || '—'}</td>
                  <td>
                    <span className={`badge ${statusBadge(i.status)}`}>{i.status}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn-sm btn-blue" onClick={() => { setReallocTarget(i); setReallocLineId('') }}>
                        Перевыдать
                      </button>
                      <button className="btn-sm btn-yellow" onClick={() => clean(i.id)}>
                        Очистить
                      </button>
                      <button className="btn-sm btn-red" onClick={() => remove(i.id)}>
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="pagination">
            <button className="btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
            <span>{page} / {totalPages}</span>
            <button className="btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
          </div>
        )}
        {/* ── /Pagination ── */}
      </div>
      {/* ── /Table ── */}

      {/* ── Create modal ── */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Создать инстанс</div>

            <label>External ID</label> 
            <input
              value={createForm.external_id}
              onChange={e => setCreateForm(f => ({ ...f, external_id: e.target.value }))}
              placeholder="ID инстанса у провайдера"
            />
            <br />
            <label>Token</label> 
            <input
              value={createForm.token}
              onChange={e => setCreateForm(f => ({ ...f, token: e.target.value }))}
              placeholder="Токен инстанса"
            />

            {createError && <div className="state-error">{createError}</div>}

            <div className="modal-actions">
              <button className="btn" onClick={submitCreate}>Создать</button>
              <button className="btn" onClick={() => setShowCreate(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}
      {/* ── /Create modal ── */}

      {/* ── Reallocate modal ── */}
      {reallocTarget && (
        <div className="modal-overlay" onClick={() => setReallocTarget(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Перевыдать инстанс</div>
            <div style={{ marginBottom: 12, color: 'var(--text2)', fontSize: 13 }}>
              {reallocTarget.external_id}
            </div>

            <label>Линия</label>
            <select
              value={reallocLineId}
              onChange={e => setReallocLineId(e.target.value)}
            >
              <option value="">— выберите линию —</option>
              {lines.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>

            {reallocError && <div className="state-error">{reallocError}</div>}

            <div className="modal-actions">
              <button className="btn" onClick={submitReallocate}>Перевыдать</button>
              <button className="btn" onClick={() => setReallocTarget(null)}>Отмена</button>
            </div>
          </div>
        </div>
      )}
      {/* ── /Reallocate modal ── */}

    </div>
    /* ── /Instances ── */
  )
}