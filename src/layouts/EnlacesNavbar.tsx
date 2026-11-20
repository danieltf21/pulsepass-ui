import clsx from 'clsx'
import { Link, matchPath, NavLink, useLocation } from 'react-router'
import type { Sesion } from '../api/auth.tipos'
import { RUTAS } from '../lib/rutas'

const enlaces = [
  { destino: RUTAS.eventos, texto: 'Eventos' },
  { destino: RUTAS.artistas, texto: 'Artistas' },
  { destino: RUTAS.sedes, texto: 'Sedes' },
]

function claseEnlace(activo: boolean, navegacionPrincipal = false) {
  return clsx(
    'inline-flex min-h-11 items-center rounded-lg px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600',
    activo
      ? 'bg-marca-50 dark:bg-indigo-950 text-marca-700'
      : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800',
    navegacionPrincipal ? 'dark:text-white' : activo ? 'dark:text-indigo-300' : 'dark:text-slate-400',
  )
}

interface EnlacesNavbarProps {
  sesion: Sesion
  salir: () => void
}

export default function EnlacesNavbar({ sesion, salir }: EnlacesNavbarProps) {
  const { key, pathname } = useLocation()
  const enTicketsPagados = pathname === RUTAS.buscarTicketsPagados
    || Boolean(matchPath(RUTAS.ticketsPagados, pathname))

  return (
    <>
      {enlaces.map(({ destino, texto }) => (
        <NavLink
          key={destino}
          to={destino}
          className={({ isActive }) => claseEnlace(isActive, true)}
        >
          {texto}
        </NavLink>
      ))}
      {sesion.estado === 'cargando' ? (
        <span role="status" className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">Comprobando sesión…</span>
      ) : sesion.estado === 'autenticada' ? (
        <>
          {sesion.usuario.roles.some((rol) => rol === 'STAFF' || rol === 'ADMIN') && (
            <>
              <NavLink
                to={RUTAS.validacionIngreso}
                className={({ isActive }) => claseEnlace(isActive, true)}
              >
                Validar ingreso
              </NavLink>
              <Link
                to={RUTAS.buscarTicketsPagados}
                aria-current={enTicketsPagados ? 'page' : undefined}
                className={claseEnlace(enTicketsPagados, true)}
              >
                Tickets pagados
              </Link>
            </>
          )}
          {sesion.usuario.roles.includes('ADMIN') && (
            <NavLink
              to={RUTAS.adminEventos}
              className={({ isActive }) => claseEnlace(isActive, true)}
            >
              Administrar eventos
            </NavLink>
          )}
          <details key={key} className="relative min-w-0 md:ml-auto" onKeyDown={(evento) => {
            if (evento.key !== 'Escape' || !evento.currentTarget.open) return
            evento.stopPropagation()
            evento.currentTarget.open = false
            evento.currentTarget.querySelector('summary')?.focus()
          }}>
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 dark:hover:bg-slate-800">
              <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">
                {Array.from(sesion.usuario.username).slice(0, 2).join('').toLocaleUpperCase('es-CO')}
              </span>
              <span className="max-w-32 wrap-anywhere">{sesion.usuario.username}</span>
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 shrink-0">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </summary>
            <div className="mt-1 grid gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm md:absolute md:right-0 md:z-20 md:w-40 dark:border-slate-700 dark:bg-slate-900"
              onClick={(evento) => {
                if (evento.target instanceof Element && evento.target.closest('a')) {
                  const menu = evento.currentTarget.closest('details')
                  if (menu) menu.open = false
                }
              }}>
              <NavLink to={RUTAS.cuenta} className={({ isActive }) => claseEnlace(isActive)}>
                Mi cuenta
              </NavLink>
              {sesion.usuario.roles.includes('USER') && (
                <NavLink to={RUTAS.misTickets} className={({ isActive }) => claseEnlace(isActive)}>
                  Mis tickets
                </NavLink>
              )}
              <button
                type="button"
                onClick={salir}
                className="min-h-11 rounded-lg bg-red-100 px-3 py-2 text-left text-sm font-medium text-red-800 hover:bg-red-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 dark:bg-red-950 dark:text-red-200 dark:hover:bg-red-900 dark:focus-visible:outline-red-300"
              >
                Salir
              </button>
            </div>
          </details>
        </>
      ) : (
        <div className="flex flex-col gap-2 md:ml-auto md:flex-row md:items-center md:gap-1">
          <NavLink
            to={RUTAS.login}
            className={({ isActive }) => claseEnlace(isActive)}
          >
            Iniciar sesión
          </NavLink>
          <NavLink
            to={RUTAS.registro}
            className="inline-flex min-h-11 items-center rounded-lg border border-marca-600 bg-marca-600 px-3 py-2 text-sm font-medium text-white hover:border-marca-700 hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 aria-[current=page]:border-marca-700 aria-[current=page]:bg-marca-700"
          >
            Registrarse
          </NavLink>
        </div>
      )}
    </>
  )
}
