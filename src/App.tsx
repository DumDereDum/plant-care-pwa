import { useState } from 'react'
import AddPlantForm from './AddPlantForm'
import PlantList from './PlantList'

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <main>
      <h1>Plant Care</h1>
      <h2>My Plants</h2>
      <PlantList refreshKey={refreshKey} />
      <h2>Add Plant</h2>
      <AddPlantForm onAdded={() => setRefreshKey((k) => k + 1)} />
    </main>
  )
}
