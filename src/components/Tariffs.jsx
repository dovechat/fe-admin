import { useState } from 'react'
import TariffList from './TariffList'
import CreateTariff from './CreateTariff'
import EditTariff from './EditTariff'

export default function Tariffs() {
  const [view, setView] = useState('list')
  const [selected, setSelected] = useState(null)

  if (view === 'create') {
    return (
      <CreateTariff
        onCreated={() => setView('list')}
        onCancel={() => setView('list')}
      />
    )
  }

  if (view === 'edit' && selected) {
    return (
      <EditTariff
        tariff={selected}
        onSaved={() => { setSelected(null); setView('list') }}
        onCancel={() => { setSelected(null); setView('list') }}
      />
    )
  }

  return (
    <TariffList
      onCreateClick={() => setView('create')}
      onEditClick={(tariff) => { setSelected(tariff); setView('edit') }}
    />
  )
}