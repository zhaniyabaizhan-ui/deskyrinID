import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import ApplyPage from '@/pages/ApplyPage'
import DashboardPage from '@/pages/DashboardPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<Navigate to="/apply" replace />} />
        <Route path="apply" element={<ApplyPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/apply" replace />} />
    </Routes>
  )
}
