import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import TrainingPage from './pages/TrainingPage'
import DietPage from './pages/DietPage'
import BodyPage from './pages/BodyPage'
import PlanPage from './pages/PlanPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/training" replace />} />
        <Route path="/training" element={<TrainingPage />} />
        <Route path="/diet" element={<DietPage />} />
        <Route path="/body" element={<BodyPage />} />
        <Route path="/plan" element={<PlanPage />} />
      </Route>
    </Routes>
  )
}
