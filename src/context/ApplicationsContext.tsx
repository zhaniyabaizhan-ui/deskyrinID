import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { SubmittedApplication } from '@/types/application'
const STORAGE_KEY = 'invision-u-applications-v3'

type ApplicationsContextValue = {
  applications: SubmittedApplication[]
  addApplication: (app: SubmittedApplication) => void
  updateApplication: (
    id: string,
    patch: Partial<
      Pick<SubmittedApplication, 'committeeShortlisted' | 'committeeNote'>
    >
  ) => void
}

const ApplicationsContext = createContext<ApplicationsContextValue | null>(null)

function loadFromStorage(): SubmittedApplication[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SubmittedApplication[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function ApplicationsProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<SubmittedApplication[]>([])

  useEffect(() => {
    setApplications(loadFromStorage())
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications))
  }, [applications])

  const addApplication = useCallback((app: SubmittedApplication) => {
    setApplications((prev) => [app, ...prev])
  }, [])

  const updateApplication = useCallback(
    (
      id: string,
      patch: Partial<
        Pick<SubmittedApplication, 'committeeShortlisted' | 'committeeNote'>
      >
    ) => {
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...patch } : a))
      )
    },
    []
  )

  const value = useMemo(
    () => ({
      applications,
      addApplication,
      updateApplication,
    }),
    [applications, addApplication, updateApplication]
  )

  return (
    <ApplicationsContext.Provider value={value}>
      {children}
    </ApplicationsContext.Provider>
  )
}

export function useApplications(): ApplicationsContextValue {
  const ctx = useContext(ApplicationsContext)
  if (!ctx) {
    throw new Error('useApplications must be used within ApplicationsProvider')
  }
  return ctx
}
