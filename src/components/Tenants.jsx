import { useEffect, useState, useCallback, useRef } from 'react'
import { getTenants, setTenantStatus } from '../api/admin'

const STATUS_LABELS = {
  active:    { label: 'Активна',     cls: 'badge-green' },
  blocked:   { label: 'Заблокирована', cls: 'badge-red' },
}

const PAGE_SIZE = 50

export default function Tenants() {
  const [items, setItems]       = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(0)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  // фильтры
  const [nameInput, setNameInput]   = useState('')
  const [nameFilter, setNameFilter] = useState('')
  const [statusFilter, setStatus]   = useState('')
  const debounceRef = useRef(null)

  // модал смены статуса
  const [modal, setModal] = useState(null) // { tenant }
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { skip: page * PAGE_SIZE, limit: PAGE_SIZE }
      if (nameFilter) params.name = nameFilter
      if (statusFilter) params.status = statusFilter
      const data = await getTenants(params)
      setItems(data.items)
      setTotal(data.total)
    } catch (e) {
      setError('Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }, [page, nameFilter, statusFilter])

  useEffect(() => { load() }, [load])

  // debounce name
  const handleNameChange = (v) => {
    setNameInput(v)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(0)
      setNameFilter(v)
    }, 400)
  }

  const handleStatusChange = (v) => {
    setStatus(v)
    setPage(0)
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  // смена статуса
  const handleToggleStatus = async () => {
    if (!modal) return
    const newStatus = modal.tenant.status === 'active' ? 'blocked' : 'active'
    setSaving(true)
    try {
      await setTenantStatus(modal.tenant.id, newStatus)
      setModal(null)
      load()
    } catch (e) {
      alert(e?.response?.data?.detail || 'Ошибка')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Компании</h1>
        <span className="page-sub">{total} всего</span>
      </div>

      {/* Фильтры */}
      <div className="filters">
        <input
          placeholder="Поиск по названию"
          value={nameInput}
          onChange={e => handleNameChange(e.target.value)}
        />
        <select value={statusFilter} onChange={e => handleStatusChange(e.target.value)}>
          <option value="">Все статусы</option>
          <option value="active">Активна</option>
          <option value="blocked">Заблокирована</option>
        </select>
      </div>

      {error && <div className="state-error">{error}</div>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Название</th>
              <th>Статус</th>
              <th>Оплата</th>
              <th>Локаль</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24 }}>Загрузка…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5}><div className="state-empty">Компании не найдены</div></td></tr>
            ) : items.map(t => {
              const s = STATUS_LABELS[t.status] ?? { label: t.status, cls: 'badge-gray' }
              return (
                <tr key={t.id}>
                  <td style={{ fontWeight: 500 }}>{t.name}</td>
                  <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                  <td>{t.payment ?? '—'}</td>
                  <td>{t.locale ?? '—'}</td>
                  <td>
                    <button className="btn btn-sm" onClick={() => setModal({ tenant: t })}>
                      {t.status === 'active' ? 'Заблокировать' : 'Разблокировать'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>←</button>
          <span>{page + 1} / {totalPages}</span>
          <button className="btn btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>→</button>
        </div>
      )}

      {/* Модал подтверждения */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              {modal.tenant.status === 'active' ? 'Заблокировать компанию?' : 'Разблокировать компанию?'}
            </div>
            <p style={{ margin: '12px 0 0', fontSize: 14, color: 'var(--text2)' }}>
              {modal.tenant.name}
            </p>
            <div className="modal-actions">
              <button className="btn btn-sm" onClick={() => setModal(null)} disabled={saving}>Отмена</button>
              <button className="btn btn-sm" onClick={handleToggleStatus} disabled={saving}
                style={{ background: modal.tenant.status === 'active' ? 'var(--red, #e53e3e)' : 'var(--accent)', color: '#fff' }}>
                {saving ? 'Сохранение…' : 'Подтвердить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}