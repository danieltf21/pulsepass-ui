import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { RUTAS } from '../lib/rutas'

export default function RutaProtegida() {
  const { sesion } = useAuth()
  const ubicacion = useLocation()

  if (sesion.estado === 'cargando') {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <p role="status">Comprobando sesión…</p>
      </main>
    )
  }

  if (sesion.estado === 'anonima') {
    return (
      <Navigate
        to={RUTAS.login}
        replace
        state={{
          desde: ubicacion.pathname + ubicacion.search + ubicacion.hash,
          motivo: sesion.motivo,
        }}
      />
    )
  }

  return <Outlet />
}
