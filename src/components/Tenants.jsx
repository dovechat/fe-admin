import { useEffect, useState, useCallback, useRef } from 'react'
import { getTenants, setTenantStatus, updateTenant } from '../api/admin'

const STATUS_LABELS = {
  active:  { label: 'Активна',       cls: 'badge-green' },
  blocked: { label: 'Заблокирована', cls: 'badge-red' },
}

const PAYMENT_OPTIONS = ['acquiring', 'wire']
const LOCALE_OPTIONS  = ['ru_RU', 'en_US', 'ka_GE']

const PAGE_SIZE = 50

export default function Tenants() {
  const [items, setItems]     = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const [nameInput, setNameInput]   = useState('')
  const [nameFilter, setNameFilter] = useState('')
  const [statusFilter, setStatus]   = useState('')
  const debounceRef = useRef(null)

  const [modal, setModal]   = useState(null) // { tenant }
  const [form, setForm]     = useState({})
  const [saving, setSaving] = useState(false)

  const [paymentFilter, setPaymentFilter] = useState('')
  const [localeFilter, setLocaleFilter]   = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const params = { skip: page * PAGE_SIZE, limit: PAGE_SIZE }
      if (nameFilter)   params.name   = nameFilter
      if (statusFilter) params.status = statusFilter
      if (paymentFilter) params.payment = paymentFilter
      if (localeFilter)  params.locale  = localeFilter
      const data = await getTenants(params)
      setItems(data.items); setTotal(data.total)
    } catch { setError('Ошибка загрузки') }
    finally { setLoading(false) }
  }, [page, nameFilter, statusFilter, paymentFilter, localeFilter])

  useEffect(() => { load() }, [load])

  const handleNameChange = (v) => {
    setNameInput(v)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { setPage(0); setNameFilter(v) }, 400)
  }

  const openModal = (tenant) => {
    setModal({ tenant })
    setForm({
      name:    tenant.name,
      locale:  tenant.locale  ?? 'ru_RU',
      payment: tenant.payment ?? 'acquiring',
      status:  tenant.status,
    })
  }

  const handleSave = async () => {
    if (!modal) return
    setSaving(true)
    try {
      await updateTenant(modal.tenant.id, form)
      setModal(null)
      load()
    } catch (e) {
      alert(e?.response?.data?.detail || 'Ошибка')
    } finally { setSaving(false) }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Компании</h1>
        <span className="page-sub">{total} всего</span>
      </div>

      <div className="filters">
        <input
          placeholder="Поиск по названию"
          value={nameInput}
          onChange={e => handleNameChange(e.target.value)}
        />
        <select value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(0) }}>
          <option value="">Все статусы</option>
          <option value="active">Активна</option>
          <option value="blocked">Заблокирована</option>
        </select>

        <select value={form.payment ?? ''} onChange={e => { setPaymentFilter(e.target.value); setPage(0) }}>
          <option value="">Все типы оплаты</option>
          <option value="acquiring">acquiring</option>
          <option value="wire">wire</option>
        </select>
        <select value={localeFilter} onChange={e => { setLocaleFilter(e.target.value); setPage(0) }}>
          <option value="">Все локали</option>
          <option value="ru_RU">ru_RU</option>
          <option value="en_US">en_US</option>
          <option value="ka_GE">ka_GE</option>
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
                    <button className="btn btn-sm" onClick={() => openModal(t)}>Редактировать</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>←</button>
          <span>{page + 1} / {totalPages}</span>
          <button className="btn btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>→</button>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Редактировать компанию</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
              <label style={{ fontSize: 13, color: 'var(--text2)' }}>Название
                <input
                  style={{ display: 'block', width: '100%', marginTop: 4 }}
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </label>

              <label style={{ fontSize: 13, color: 'var(--text2)' }}>Локаль
                <select
                  style={{ display: 'block', width: '100%', marginTop: 4 }}
                  value={form.locale}
                  onChange={e => setForm(f => ({ ...f, locale: e.target.value }))}
                >
                  {LOCALE_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </label>

              <label style={{ fontSize: 13, color: 'var(--text2)' }}>Оплата
                <select
                  style={{ display: 'block', width: '100%', marginTop: 4 }}
                  value={form.payment}
                  onChange={e => setForm(f => ({ ...f, payment: e.target.value }))}
                >
                  {PAYMENT_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </label>

              <label style={{ fontSize: 13, color: 'var(--text2)' }}>Статус
                <select
                  style={{ display: 'block', width: '100%', marginTop: 4 }}
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                >
                  <option value="active">Активна</option>
                  <option value="blocked">Заблокирована</option>
                </select>
              </label>
            </div>

            <div className="modal-actions">
              <button className="btn btn-sm" onClick={() => setModal(null)} disabled={saving}>Отмена</button>
              <button className="btn btn-sm" onClick={handleSave} disabled={saving}
                style={{ background: 'var(--accent)', color: '#fff' }}>
                {saving ? 'Сохранение…' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}