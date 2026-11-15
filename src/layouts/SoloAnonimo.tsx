import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { RUTAS } from '../lib/rutas'

export default function SoloAnonimo() {
  const { sesion } = useAuth()

  if (sesion.estado === 'cargando') {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <p role="status">Comprobando sesión…</p>
      </main>
    )
  }

  if (sesion.estado === 'autenticada') {
    return <Navigate to={RUTAS.inicio} replace />
  }

  return <Outlet />
}
