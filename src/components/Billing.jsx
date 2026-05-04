import { useEffect, useState, useCallback } from 'react'
import { getLedger, getTenantBalance, createAdjustment, getAdminTenants } from '../api/admin'

/* ── Helpers ── */
function fmtDate(s) {
  if (!s) return '—'
  return new Date(s).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })
}

function amountColor(amount) {
  if (amount > 0) return 'var(--green)'
  if (amount < 0) return 'var(--red)'
  return 'var(--text2)'
}
/* ── /Helpers ── */

const LIMIT = 50


/* ── Tenant balance modal ── */
function TenantModal({ tenant, onClose, onDone }) {
  const [balance, setBalance]   = useState(null)
  const [amount, setAmount]     = useState('')
  const [btype, setBtype]       = useState('main')
  const [desc, setDesc]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [msg, setMsg]           = useState('')

  useEffect(() => {
    getTenantBalance(tenant.id)
      .then(b => setBalance(b))
      .catch(e => setMsg(e.message))
  }, [tenant.id])

  const handle = async () => {
    if (!amount || isNaN(amount)) { setMsg('Введите сумму'); return }
    if (!desc.trim()) { setMsg('Введите описание'); return }
    setLoading(true)
    try {
      await createAdjustment(tenant.id, {
        amount: parseFloat(amount),
        balance_type: btype,
        description: desc,
      })
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
        <div className="modal-title">{tenant.name}</div>

        {/* ── Balance display ── */}
        {balance && (
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>Main</div>
              <div style={{ fontWeight: 600, fontFamily: 'var(--mono)' }}>
                {Number(balance.main).toFixed(2)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>Bonus</div>
              <div style={{ fontWeight: 600, fontFamily: 'var(--mono)' }}>
                {Number(balance.bonus).toFixed(2)}
              </div>
            </div>
          </div>
        )}
        {/* ── /Balance display ── */}

        {/* ── Adjustment form ── */}
        <div className="field">
          <label>Сумма (+ пополнение, − списание)</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="например 1000 или -500"
            autoFocus
          />
        </div>
        <div className="field">
          <label>Тип баланса</label>
          <select value={btype} onChange={e => setBtype(e.target.value)}>
            <option value="main">main</option>
            <option value="bonus">bonus</option>
          </select>
        </div>
        <div className="field">
          <label>Описание</label>
          <input
            type="text"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="Причина корректировки"
          />
        </div>
        {/* ── /Adjustment form ── */}

        {msg && <div style={{ fontSize: 12, color: 'var(--yellow)', marginBottom: 8 }}>{msg}</div>}
        <div className="modal-actions">
          <button className="btn btn-sm" onClick={onClose}>Отмена</button>
          <button className="btn btn-primary btn-sm" onClick={handle} disabled={loading}>
            {loading ? 'Сохранение...' : 'Применить'}
          </button>
        </div>
      </div>
    </div>
  )
}
/* ── /Tenant balance modal ── */



export default function Billing() {
  const [items, setItems]         = useState([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [skip, setSkip]           = useState(0)
  const [tenants, setTenants]     = useState([])
  const [tLoading, setTLoading]   = useState(true)
  const [selected, setSelected]   = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    getLedger({ skip, limit: LIMIT })
      .then(r => { setItems(r.items); setTotal(r.total) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [skip])

  useEffect(() => { load() }, [load])


/* ── Load tenants ── */
  const loadTenants = useCallback(() => {
    setTLoading(true)
    getAdminTenants()
      .then(r => setTenants(r))
      .catch(() => {})
      .finally(() => setTLoading(false))
  }, [])

  useEffect(() => { loadTenants() }, [loadTenants])

  return (
    /* ── Billing ── */
    <div>



{/* ── Tenants ── */}
      <div className="page-header" style={{ marginBottom: 8 }}>
        <div>
          <div className="page-title">Компании</div>
        </div>
      </div>
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Название</th>
                <th>Действие</th>
              </tr>
            </thead>
            <tbody>
              {tLoading && (
                <tr><td colSpan={2} className="state-empty">Загрузка...</td></tr>
              )}
              {!tLoading && tenants.length === 0 && (
                <tr><td colSpan={2} className="state-empty">Нет компаний</td></tr>
              )}
              {!tLoading && tenants.map(t => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td>
                    <button className="btn btn-sm" onClick={() => setSelected(t)}>
                      Баланс / пополнить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* ── /Tenants ── */}



      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <div className="page-title">Billing</div>
          <div className="page-sub">Ledger — всего записей: {total}</div>
        </div>
      </div>
      {/* ── /Page header ── */}

      {/* ── Table ── */}
      {error && <div className="state-error">{error}</div>}

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Tenant</th>
                <th>Тип баланса</th>
                <th>Операция</th>
                <th style={{ textAlign: 'right' }}>Сумма</th>
                <th>Описание</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="state-empty">Загрузка...</td></tr>
              )}
              {!loading && items.length === 0 && (
                <tr><td colSpan={6} className="state-empty">Нет записей</td></tr>
              )}
              {!loading && items.map(row => (
                <tr key={row.id}>
                  <td className="mono" style={{ fontSize: 12, color: 'var(--text2)' }}>
                    {fmtDate(row.created_at)}
                  </td>
                  <td className="mono" style={{ fontSize: 11, color: 'var(--text3)' }}>
                    {row.tenant_id ? row.tenant_id.toString().slice(0, 8) + '…' : '—'}
                  </td>
                  <td style={{ color: 'var(--text2)' }}>{row.balance_type || '—'}</td>
                  <td style={{ color: 'var(--text2)' }}>{row.operation_type || '—'}</td>
                  <td className="mono" style={{ textAlign: 'right', fontWeight: 600, color: amountColor(row.amount) }}>
                    {row.amount > 0 ? '+' : ''}{Number(row.amount).toFixed(2)}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text3)' }}>
                    {row.description || '—'}
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


      {/* ── Tenant modal ── */}
      {selected && (
        <TenantModal
          tenant={selected}
          onClose={() => setSelected(null)}
          onDone={() => { load(); loadTenants() }}
        />
      )}
      {/* ── /Tenant modal ── */}


    </div>
    /* ── /Billing ── */
  )
}