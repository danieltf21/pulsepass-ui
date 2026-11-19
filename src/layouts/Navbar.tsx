import { useId, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { RUTAS } from '../lib/rutas'
import { useAuth } from '../hooks/useAuth'
import SelectorTema from '../components/ui/SelectorTema'
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
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <Link
          to={RUTAS.inicio}
          className="rounded font-titulo text-2xl font-bold text-marca-600 dark:text-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
        >
          PulsePass
        </Link>
        <SelectorTema />
        <button
          ref={botonMenu}
          type="button"
          aria-expanded={menuAbierto}
          aria-controls={menuId}
          onClick={() => setMenuEnUbicacion(menuAbierto ? null : ubicacion.key)}
          className="rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 lg:hidden"
        >
          {menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
        </button>
        <nav
          id={menuId}
          aria-label="Navegación principal"
          className={`${menuAbierto ? 'flex' : 'hidden'} w-full min-w-0 flex-col gap-2 lg:flex lg:flex-row lg:flex-wrap`}
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
