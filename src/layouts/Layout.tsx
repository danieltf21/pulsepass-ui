import { Link, NavLink, Outlet } from 'react-router'
import { RUTAS } from '../lib/rutas'

const enlaces = [
  { destino: RUTAS.inicio, texto: 'Inicio' },
  { destino: RUTAS.eventos, texto: 'Eventos' },
  { destino: RUTAS.artistas, texto: 'Artistas' },
]

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-cuerpo text-slate-900">
      <a
        href="#contenido"
        className="sr-only z-10 rounded-lg bg-white p-3 text-marca-700 focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
      >
        Saltar al contenido
      </a>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <Link
            to={RUTAS.inicio}
            className="rounded font-titulo text-2xl font-bold text-marca-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
          >
            PulsePass
          </Link>
          <nav aria-label="Navegación principal" className="flex flex-wrap gap-2">
            {enlaces.map(({ destino, texto }) => (
              <NavLink
                key={destino}
                to={destino}
                end={destino === RUTAS.inicio}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 ${isActive ? 'bg-marca-50 text-marca-700' : 'text-slate-600 hover:bg-slate-100'}`
                }
              >
                {texto}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <div id="contenido" tabIndex={-1} className="flex-1">
        <Outlet />
      </div>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-600 sm:px-6">
          PulsePass · Eventos, artistas y entradas.
        </div>
      </footer>
    </div>
  )
}
