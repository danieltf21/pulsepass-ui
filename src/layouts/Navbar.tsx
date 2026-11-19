import clsx from 'clsx'
import { useId, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { RUTAS } from '../lib/rutas'
import { useAuth } from '../hooks/useAuth'
import EnlacesNavbar from './EnlacesNavbar'

export default function Navbar() {
  const { sesion, cerrarSesion } = useAuth()
  const navegar = useNavigate()
  const ubicacion = useLocation()
  const [menuEnUbicacion, setMenuEnUbicacion] = useState<string | null>(null)
  const menuAbierto = menuEnUbicacion === ubicacion.key
  const menuId = useId()
  const botonMenu = useRef<HTMLButtonElement>(null)

  // Descarta la apertura anterior para que Atrás no vuelva a mostrar el menú.
  if (menuEnUbicacion !== null && menuEnUbicacion !== ubicacion.key) {
    setMenuEnUbicacion(null)
  }

  function salir() {
    setMenuEnUbicacion(null)
    cerrarSesion()
    void navegar(RUTAS.inicio, { replace: true })
  }

  return (
    <header
      className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
      onKeyDown={(evento) => {
        if (evento.key === 'Escape' && menuAbierto) {
          setMenuEnUbicacion(null)
          botonMenu.current?.focus()
        }
      }}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-2.5">
        <Link
          to={RUTAS.inicio}
          className="inline-flex min-h-11 items-center gap-2 rounded font-titulo text-lg font-bold text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 dark:text-slate-100"
        >
          <span aria-hidden="true" className="grid size-7 place-items-center rounded-md bg-marca-600 text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" className="size-4">
              <path d="M9 18V5l12-2v13M9 18a3 2 0 1 1-6 0 3 2 0 0 1 6 0Zm12-2a3 2 0 1 1-6 0 3 2 0 0 1 6 0Z" />
            </svg>
          </span>
          PulsePass
        </Link>
        <button
          ref={botonMenu}
          type="button"
          aria-expanded={menuAbierto}
          aria-controls={menuId}
          onClick={() => setMenuEnUbicacion(menuAbierto ? null : ubicacion.key)}
          className="ml-auto grid min-h-11 min-w-11 place-items-center rounded-lg text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 md:hidden dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" className="size-5">
            <path d={menuAbierto ? 'm6 6 12 12M18 6 6 18' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
          <span className="sr-only">{menuAbierto ? 'Cerrar menú' : 'Abrir menú'}</span>
        </button>
        <nav
          id={menuId}
          aria-label="Navegación principal"
          className={clsx('w-full min-w-0 flex-col gap-2 md:flex md:w-auto md:flex-1 md:flex-row md:flex-wrap md:items-center md:gap-1', menuAbierto ? 'flex' : 'hidden')}
          onClick={(evento) => {
            if (evento.target instanceof Element && evento.target.closest('a')) {
              setMenuEnUbicacion(null)
            }
          }}
        >
          <EnlacesNavbar sesion={sesion} salir={salir} />
        </nav>
      </div>
    </header>
  )
}
