import clsx from 'clsx'
import { Link, matchPath, NavLink, useLocation } from 'react-router'
import type { Sesion } from '../api/auth.tipos'
import { RUTAS } from '../lib/rutas'

const enlaces = [
  { destino: RUTAS.inicio, texto: 'Inicio' },
  { destino: RUTAS.eventos, texto: 'Eventos' },
  { destino: RUTAS.artistas, texto: 'Artistas' },
  { destino: RUTAS.sedes, texto: 'Sedes' },
]

function claseEnlace(activo: boolean) {
  return clsx(
    'rounded-lg px-4 py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600',
    activo
      ? 'bg-marca-50 dark:bg-indigo-950 text-marca-700 dark:text-indigo-300'
      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
  )
}

interface EnlacesNavbarProps {
  sesion: Sesion
  salir: () => void
}

export default function EnlacesNavbar({ sesion, salir }: EnlacesNavbarProps) {
  const { pathname } = useLocation()
  const enTicketsPagados = pathname === RUTAS.buscarTicketsPagados
    || Boolean(matchPath(RUTAS.ticketsPagados, pathname))

  return (
    <>
      {enlaces.map(({ destino, texto }) => (
        <NavLink
          key={destino}
          to={destino}
          end={destino === RUTAS.inicio}
          className={({ isActive }) => claseEnlace(isActive)}
        >
          {texto}
        </NavLink>
      ))}
      {sesion.estado === 'cargando' ? (
        <span role="status" className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">Comprobando sesión…</span>
      ) : sesion.estado === 'autenticada' ? (
        <>
          <span className="min-w-0 break-words px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{sesion.usuario.username}</span>
          <NavLink
            to={RUTAS.cuenta}
            className={({ isActive }) => claseEnlace(isActive)}
          >
            Mi cuenta
          </NavLink>
          {sesion.usuario.roles.includes('USER') && (
            <NavLink
              to={RUTAS.misTickets}
              className={({ isActive }) => claseEnlace(isActive)}
            >
              Mis tickets
            </NavLink>
          )}
          {sesion.usuario.roles.some((rol) => rol === 'STAFF' || rol === 'ADMIN') && (
            <>
              <NavLink
                to={RUTAS.validacionIngreso}
                className={({ isActive }) => claseEnlace(isActive)}
              >
                Validar ingreso
              </NavLink>
              <Link
                to={RUTAS.buscarTicketsPagados}
                aria-current={enTicketsPagados ? 'page' : undefined}
                className={claseEnlace(enTicketsPagados)}
              >
                Tickets pagados
              </Link>
            </>
          )}
          {sesion.usuario.roles.includes('ADMIN') && (
            <NavLink
              to={RUTAS.adminEventos}
              className={({ isActive }) => claseEnlace(isActive)}
            >
              Administrar eventos
            </NavLink>
          )}
          <button
            type="button"
            onClick={salir}
            className="rounded-lg px-4 py-3 text-sm font-medium text-marca-700 dark:text-indigo-300 hover:bg-marca-50 dark:hover:bg-indigo-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
          >
            Salir
          </button>
        </>
      ) : (
        <>
          <NavLink
            to={RUTAS.login}
            className={({ isActive }) => claseEnlace(isActive)}
          >
            Iniciar sesión
          </NavLink>
          <NavLink
            to={RUTAS.registro}
            className={({ isActive }) => claseEnlace(isActive)}
          >
            Registrarse
          </NavLink>
        </>
      )}
    </>
  )
}
