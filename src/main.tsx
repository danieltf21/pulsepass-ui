import { StrictMode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import './index.css'
import { router } from './router'
import AuthProvider from './context/AuthProvider'
import Avisos from './components/ui/Avisos'
import { iniciarTema } from './lib/tema'

const detenerTema = iniciarTema()
if (import.meta.hot) import.meta.hot.dispose(detenerTema)

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Avisos />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
