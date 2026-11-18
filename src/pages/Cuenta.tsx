import { useState } from 'react'
import { Navigate } from 'react-router'
import type { Rol } from '../api/auth.tipos'
import { ApiError } from '../api/http'
import { useAuth } from '../hooks/useAuth'
import { useMiCuenta } from '../hooks/useMiCuenta'
import { RUTAS } from '../lib/rutas'

const nombresRol: Record<Rol, string> = {
  USER: 'Asistente',
  STAFF: 'Personal de operación',
  ADMIN: 'Administración',
}

export default function Cuenta() {
  const { sesion } = useAuth()
  const [criterio, setCriterio] = useState<'email' | 'username'>('email')
  const { data: usuario, isPending, isError, error, isFetching, refetch } = useMiCuenta(criterio)

  if (sesion.estado !== 'autenticada') return null
  if (error instanceof ApiError && error.status === 403) {
    return <Navigate to={RUTAS.sinPermisos} replace />
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-titulo text-3xl font-bold">Mi cuenta</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-400">Consulta tus datos de usuario.</p>
      <div className="mt-6">
        <label htmlFor="criterio-cuenta" className="block text-sm font-medium">Consultar por</label>
        <select
          id="criterio-cuenta"
          value={criterio}
          onChange={(event) => setCriterio(event.currentTarget.value === 'username' ? 'username' : 'email')}
          className="mt-2 min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 dark:border-slate-600 dark:bg-slate-900"
        >
          <option value="email">Correo electrónico</option>
          <option value="username">Nombre de usuario</option>
        </select>
      </div>
      <section aria-label="Datos de mi cuenta" aria-busy={isFetching} className="mt-8">
        {isPending ? (
          <p role="status" className="text-slate-600 dark:text-slate-400">Cargando tu cuenta…</p>
        ) : isError ? (
          <div role="alert" className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-6">
            <h2 className="text-lg font-semibold text-red-900 dark:text-red-200">
              {error instanceof ApiError && error.status === 404 ? 'Cuenta no disponible' : 'No se pudieron cargar tus datos'}
            </h2>
            <p className="mt-2 text-red-800 dark:text-red-200">
              {error instanceof ApiError ? error.message : 'Inténtalo de nuevo en unos momentos.'}
            </p>
            <button
              type="button"
              disabled={isFetching}
              onClick={() => void refetch()}
              className="mt-4 rounded-lg bg-marca-600 px-4 py-3 text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:opacity-60"
            >
              {isFetching ? 'Actualizando…' : 'Reintentar'}
            </button>
          </div>
        ) : (
          <dl className="grid gap-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 sm:grid-cols-2 sm:p-8">
            <div>
              <dt className="font-medium text-slate-700 dark:text-slate-300">Nombres</dt>
              <dd className="mt-1 text-slate-600 dark:text-slate-400">{usuario.firstName}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700 dark:text-slate-300">Apellidos</dt>
              <dd className="mt-1 text-slate-600 dark:text-slate-400">{usuario.lastName}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700 dark:text-slate-300">Usuario</dt>
              <dd className="mt-1 break-words text-slate-600 dark:text-slate-400">{usuario.username}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700 dark:text-slate-300">Correo electrónico</dt>
              <dd className="mt-1 break-words text-slate-600 dark:text-slate-400">{usuario.email}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700 dark:text-slate-300">Estado de la cuenta</dt>
              <dd className="mt-1 text-slate-600 dark:text-slate-400">{usuario.active ? 'Activa' : 'Inactiva'}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700 dark:text-slate-300">Roles</dt>
              <dd className="mt-1 text-slate-600 dark:text-slate-400">
                {sesion.usuario.roles.map((rol) => nombresRol[rol]).join(', ') || 'Sin roles asignados'}
              </dd>
            </div>
          </dl>
        )}
      </section>
    </main>
  )
}
