import { useState, useEffect } from 'react'
import { getTariffs, deleteTariff } from '../api/admin'

function TariffList({ onCreateClick, onEditClick }) {
  const [tariffs, setTariffs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { loadTariffs() }, [])

  const loadTariffs = async () => {
    try {
      setLoading(true)
      const data = await getTariffs()
      setTariffs(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Удалить тариф?')) return
    await deleteTariff(id)
    loadTariffs()
  }

  if (loading) return <div className="dashboard">Загрузка тарифов...</div>
  if (error) return <div className="dashboard state-error">{error}</div>

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <div className="page-title">Тарифы</div>
          <div className="page-sub">Список всех тарифов</div>
        </div>
        <button className="btn btn-sm" onClick={onCreateClick}>+ Создать тариф</button>
      </div>

      {tariffs.length === 0 ? (
        <div className="state-empty">Тарифы не найдены</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Название</th>
                <th>Канал</th>
                <th>Период (дней)</th>
                <th>Цена (₽)</th>
                <th>Статус</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tariffs.map(tariff => (
                <tr key={tariff.id}>
                  <td>{tariff.name}</td>
                  <td>{tariff.channel_type}</td>
                  <td>{tariff.period_days}</td>
                  <td>{tariff.price}</td>
                  <td>
                    <span className={`badge ${tariff.is_active ? 'badge-green' : 'badge-gray'}`}>
                      {tariff.is_active ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm" onClick={() => onEditClick(tariff)}>
                      Редактировать
                    </button>
                    <button className="btn btn-sm" onClick={() => handleDelete(tariff.id)}>
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default TariffList