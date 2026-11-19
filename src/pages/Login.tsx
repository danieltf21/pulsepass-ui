import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { z } from 'zod'
import { loginSchema, type Login as DatosLogin } from '../api/auth.tipos'
import { ApiError } from '../api/http'
import Boton from '../components/ui/Boton'
import Campo from '../components/ui/Campo'
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
    return <div className="mx-auto max-w-3xl px-4 py-10"><p role="status">Comprobando sesión…</p></div>
  }
  if (sesion.estado === 'autenticada') return <Navigate to={destino} replace />

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <section aria-labelledby="titulo-autenticacion" className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8 dark:border-slate-700 dark:bg-slate-900">
        <h1 id="titulo-autenticacion" className="font-titulo text-3xl font-bold">Iniciar sesión</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">Accede a tu cuenta de PulsePass.</p>
        {estado.success && estado.data.registroExitoso && (
          <p role="status" aria-live="off" className="mt-4 rounded-lg bg-emerald-50 dark:bg-emerald-950 p-4 text-emerald-900 dark:text-emerald-200">
            Cuenta creada. Inicia sesión.
          </p>
        )}
        {expirada && <p role="status" className="mt-4 rounded-lg bg-amber-50 dark:bg-amber-950 p-4 text-amber-900 dark:text-amber-200">Tu sesión expiró. Inicia sesión de nuevo.</p>}

        <form noValidate onSubmit={handleSubmit(enviar)} aria-busy={isSubmitting} className="mt-6 space-y-5">
          <Campo
            id="identifier"
            etiqueta="Usuario o correo"
            autoComplete="username"
            error={errors.identifier}
            {...register('identifier')}
          />
          <Campo
            id="password"
            etiqueta="Contraseña"
            type="password"
            permiteVerContrasena
            autoComplete="current-password"
            error={errors.password}
            {...register('password')}
          />
          {errors.root && <p role="alert" className="rounded-lg bg-red-50 dark:bg-red-950 p-4 text-red-800 dark:text-red-200">{errors.root.message}</p>}
          <Boton
            type="submit"
            disabled={isSubmitting}
            className="w-full font-medium disabled:cursor-wait"
          >
            {isSubmitting ? 'Ingresando…' : 'Ingresar'}
          </Boton>
        </form>
        <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
          ¿No tienes cuenta?{' '}
          <Link
            to={RUTAS.registro}
            className="rounded text-marca-700 dark:text-indigo-300 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
          >
            Crear cuenta
          </Link>
        </p>
      </section>
    </div>
  )
}
