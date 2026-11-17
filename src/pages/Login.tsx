import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { z } from 'zod'
import { loginSchema, type Login as DatosLogin } from '../api/auth.tipos'
import { ApiError } from '../api/http'
import { useAuth } from '../hooks/useAuth'
import { RUTAS } from '../lib/rutas'

const destinoSchema = z.string().refine(
  (valor) => valor.startsWith('/') && !valor.startsWith('//')
    && !valor.includes('\\') && !Array.from(valor).some((caracter) => caracter.charCodeAt(0) <= 32),
)
const estadoRutaSchema = z.object({
  desde: destinoSchema.optional(),
  motivo: z.literal('expirada').optional(),
  registroExitoso: z.boolean().optional(),
})

export default function Login() {
  const { sesion, iniciarSesion } = useAuth()
  const ubicacion = useLocation()
  const navegar = useNavigate()
  const estado = estadoRutaSchema.safeParse(ubicacion.state)
  const origen = estado.success ? estado.data.desde : undefined
  const destino = origen?.split(/[?#]/)[0] === RUTAS.login ? RUTAS.inicio : origen ?? RUTAS.inicio
  const expirada = (sesion.estado === 'anonima' && sesion.motivo === 'expirada')
    || (estado.success && estado.data.motivo === 'expirada')
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<DatosLogin>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  })

  async function enviar(credenciales: DatosLogin) {
    try {
      await iniciarSesion(credenciales)
      void navegar(destino, { replace: true })
    } catch (error: unknown) {
      setError('root', {
        message: error instanceof ApiError
          ? error.message
          : 'No se pudo iniciar sesión. Inténtalo de nuevo.',
      })
    }
  }

  if (sesion.estado === 'cargando') {
    return <main className="mx-auto max-w-md px-4 py-10"><p role="status">Comprobando sesión…</p></main>
  }
  if (sesion.estado === 'autenticada') return <Navigate to={destino} replace />

  return (
    <main className="mx-auto max-w-md px-4 py-10 sm:px-6">
      <h1 className="font-titulo text-3xl font-bold">Iniciar sesión</h1>
      <p className="mt-3 text-slate-600">Accede a tu cuenta de PulsePass.</p>
      {estado.success && estado.data.registroExitoso && (
        <p role="status" aria-live="off" className="mt-4 rounded-lg bg-emerald-50 p-4 text-emerald-900">
          Cuenta creada. Inicia sesión.
        </p>
      )}
      {expirada && <p role="status" className="mt-4 rounded-lg bg-amber-50 p-4 text-amber-900">Tu sesión expiró. Inicia sesión de nuevo.</p>}

      <form noValidate onSubmit={handleSubmit(enviar)} aria-busy={isSubmitting} className="mt-6 space-y-5">
        <div>
          <label htmlFor="identifier" className="block text-sm font-medium text-slate-700">Usuario o correo</label>
          <input
            id="identifier"
            autoComplete="username"
            {...register('identifier')}
            aria-invalid={Boolean(errors.identifier)}
            aria-describedby={errors.identifier ? 'error-identifier' : undefined}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
          />
          {errors.identifier && <p id="error-identifier" role="alert" className="mt-2 text-sm text-red-700">{errors.identifier.message}</p>}
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">Contraseña</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'error-password' : undefined}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
          />
          {errors.password && <p id="error-password" role="alert" className="mt-2 text-sm text-red-700">{errors.password.message}</p>}
        </div>
        {errors.root && <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-800">{errors.root.message}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-marca-600 px-4 py-3 font-medium text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:cursor-wait disabled:opacity-60"
        >
          {isSubmitting ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
      <p className="mt-6 text-sm text-slate-600">
        ¿No tienes cuenta?{' '}
        <Link
          to={RUTAS.registro}
          className="rounded text-marca-700 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
        >
          Crear cuenta
        </Link>
      </p>
    </main>
  )
}
