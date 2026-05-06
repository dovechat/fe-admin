import { useState } from 'react'
import { createTariff } from '../api/admin'

function CreateTariff({ onCreated, onCancel }) {
  const [values, setValues] = useState({
    name: '',
    channel_type: 'telegram_bot',
    period_days: 30,
    price: '',
    is_active: true,
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setValues({
      ...values,
      [name]: type === 'checkbox' ? checked :
              name === 'period_days' ? parseInt(value) || 0 :
              name === 'price' ? parseFloat(value) || '' : value,
    })
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await createTariff(values)
      onCreated()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-title">Создать тариф</div>

        <form onSubmit={onSubmit} autoComplete="off">
          <div className="filters" style={{ flexDirection: 'column', gap: '12px' }}>
            <input
              name="name"
              value={values.name}
              onChange={handleChange}
              placeholder="Название тарифа"
              required
            />
            <select name="channel_type" value={values.channel_type} onChange={handleChange}>
              <option value="telegram_bot">Telegram Bot</option>
              <option value="telegram_user">Telegram User</option>
              <option value="whatsapp_green">WhatsApp Green API</option>
              <option value="waba">WhatsApp Business</option>
              <option value="vk">VK</option>
            </select>
            <input
              type="number"
              name="period_days"
              value={values.period_days}
              onChange={handleChange}
              placeholder="Период (дней)"
              min="1"
              required
            />
            <input
              type="number"
              name="price"
              value={values.price}
              onChange={handleChange}
              placeholder="Цена (₽)"
              min="0"
              step="0.01"
              required
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                name="is_active"
                checked={values.is_active}
                onChange={handleChange}
              />
              Активный тариф
            </label>
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn btn-sm" disabled={loading}>
              {loading ? 'Создание...' : 'Создать'}
            </button>
            <button type="button" className="btn btn-sm" onClick={onCancel}>Отмена</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateTariff