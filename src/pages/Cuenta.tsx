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
  const { data: usuario, isPending, isError, error, isFetching, refetch } = useMiCuenta()

  if (sesion.estado !== 'autenticada') return null
  if (error instanceof ApiError && error.status === 403) {
    return <Navigate to={RUTAS.sinPermisos} replace />
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-titulo text-3xl font-bold">Mi cuenta</h1>
      <p className="mt-3 text-slate-600">Consulta tus datos de usuario.</p>
      <section aria-label="Datos de mi cuenta" aria-busy={isFetching} className="mt-8">
        {isPending ? (
          <p role="status" className="text-slate-600">Cargando tu cuenta…</p>
        ) : isError ? (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-lg font-semibold text-red-900">
              {error instanceof ApiError && error.status === 404 ? 'Cuenta no disponible' : 'No se pudieron cargar tus datos'}
            </h2>
            <p className="mt-2 text-red-800">
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
          <dl className="grid gap-6 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-2 sm:p-8">
            <div>
              <dt className="font-medium text-slate-700">Nombres</dt>
              <dd className="mt-1 text-slate-600">{usuario.firstName}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700">Apellidos</dt>
              <dd className="mt-1 text-slate-600">{usuario.lastName}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700">Usuario</dt>
              <dd className="mt-1 break-words text-slate-600">{usuario.username}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700">Correo electrónico</dt>
              <dd className="mt-1 break-words text-slate-600">{usuario.email}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700">Estado de la cuenta</dt>
              <dd className="mt-1 text-slate-600">{usuario.active ? 'Activa' : 'Inactiva'}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700">Roles</dt>
              <dd className="mt-1 text-slate-600">
                {sesion.usuario.roles.map((rol) => nombresRol[rol]).join(', ') || 'Sin roles asignados'}
              </dd>
            </div>
          </dl>
        )}
      </section>
    </main>
  )
}
