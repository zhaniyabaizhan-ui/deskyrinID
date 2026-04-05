import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import ApplyPage from '@/pages/ApplyPage'
import DashboardLayout from '@/pages/DashboardLayout'
import DashboardPage from '@/pages/DashboardPage'
import CandidateReviewPage from '@/pages/CandidateReviewPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<Navigate to="/apply" replace />} />
        <Route path="apply" element={<ApplyPage />} />
        <Route path="dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="candidate/:candidateId" element={<CandidateReviewPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/apply" replace />} />
    </Routes>
  )
}
