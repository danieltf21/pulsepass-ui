import { useEffect } from 'react'
import { Navigate, Outlet, useLocation, useMatches } from 'react-router'
import { RUTAS } from '../lib/rutas'
import { useAuth } from '../hooks/useAuth'
import Navbar from './Navbar'

export default function Layout() {
  const { sesion } = useAuth()
  const ubicacion = useLocation()
  const coincidencia = useMatches().at(-1)
  const titulo = (coincidencia?.handle as { titulo?: string } | undefined)?.titulo

  useEffect(() => {
    if (titulo) document.title = `${titulo} | PulsePass`
  }, [titulo])

  if (sesion.estado === 'anonima' && sesion.motivo === 'expirada'
    && ubicacion.pathname !== RUTAS.login) {
    return (
      <Navigate
        to={RUTAS.login}
        replace
        state={{
          desde: ubicacion.pathname + ubicacion.search + ubicacion.hash,
          motivo: 'expirada',
        }}
      />
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 font-cuerpo text-slate-900 dark:text-slate-100">
      <a
        href="#contenido"
        className="sr-only z-10 rounded-lg bg-white dark:bg-slate-900 p-3 text-marca-700 dark:text-indigo-300 focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
      >
        Saltar al contenido
      </a>
      <Navbar />

      <div id="contenido" tabIndex={-1} className="flex-1">
        <Outlet />
      </div>

      <footer className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-600 dark:text-slate-400 sm:px-6">
          PulsePass · Eventos, artistas y entradas.
        </div>
      </footer>
    </div>
  )
}
