import { Outlet } from 'react-router-dom'

/** Nested routes: `/dashboard`, `/dashboard/candidate/:id` */
export default function DashboardLayout() {
  return <Outlet />
}
