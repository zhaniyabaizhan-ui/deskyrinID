import { NavLink, Outlet } from 'react-router-dom'

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-lime-400/20 text-lime-900 ring-1 ring-lime-300/60'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`

export function AppShell() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400 text-sm font-bold text-lime-950 shadow-sm">
              iU
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-lime-700">
                inVision U
              </p>
              <p className="text-sm font-medium text-slate-600">
                Admissions · decision support
              </p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-1">
            <NavLink to="/apply" className={navClass}>
              Applicant portal
            </NavLink>
            <NavLink to="/dashboard" className={navClass}>
              Committee dashboard
            </NavLink>
          </nav>
        </div>
      </header>
      <p className="mx-auto max-w-6xl px-4 py-2 text-center text-xs text-slate-500">
        Final admission decision remains with the committee. This tool does not
        auto-admit or auto-reject.
      </p>
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-2">
        <Outlet />
      </main>
    </div>
  )
}
