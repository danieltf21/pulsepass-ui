import { Navigate, Outlet, useLocation } from 'react-router'
import { z } from 'zod'
import { useAuth } from '../hooks/useAuth'
import { RUTAS } from '../lib/rutas'

const origenSchema = z.object({
  desde: z.string().refine((valor) => valor.startsWith('/') && !valor.startsWith('//')
    && !valor.includes('\\') && !Array.from(valor).some((caracter) => caracter.charCodeAt(0) <= 32)),
})

export default function SoloAnonimo() {
  const { sesion } = useAuth()
  const ubicacion = useLocation()

  if (sesion.estado === 'cargando') {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <p role="status">Comprobando sesión…</p>
      </main>
    )
  }

  if (sesion.estado === 'autenticada') {
    const origen = origenSchema.safeParse(ubicacion.state)
    const destino = origen.success ? origen.data.desde : RUTAS.inicio
    const ruta = destino.split(/[?#]/)[0]
    return <Navigate to={ruta === RUTAS.login || ruta === RUTAS.registro ? RUTAS.inicio : destino} replace />
  }

  return <Outlet />
}
