import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ApplicationsProvider } from '@/context/ApplicationsContext'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ApplicationsProvider>
        <App />
      </ApplicationsProvider>
    </BrowserRouter>
  </StrictMode>
)
