import { Navigate, Outlet, useLocation } from 'react-router'
import type { Rol } from '../api/auth.tipos'
import { useAuth } from '../hooks/useAuth'
import { RUTAS } from '../lib/rutas'

interface RutaPorRolProps {
  roles: readonly Rol[]
}

export default function RutaPorRol({ roles }: RutaPorRolProps) {
  const { sesion } = useAuth()
  const ubicacion = useLocation()

  if (sesion.estado === 'cargando') {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <p role="status">Comprobando permisos…</p>
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

  if (!roles.some((rol) => sesion.usuario.roles.includes(rol))) {
    return <Navigate to={RUTAS.sinPermisos} replace />
  }

  return <Outlet />
}
