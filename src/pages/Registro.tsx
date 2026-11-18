import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { registroSchema, type Registro as DatosRegistro } from '../api/auth.tipos'
import { ApiError } from '../api/http'
import { useRegistro } from '../hooks/useRegistro'
import { RUTAS } from '../lib/rutas'

const campos = [
  { nombre: 'username', etiqueta: 'Nombre de usuario', tipo: 'text', completar: 'username' },
  { nombre: 'email', etiqueta: 'Correo electrónico', tipo: 'email', completar: 'email' },
  { nombre: 'firstName', etiqueta: 'Nombres', tipo: 'text', completar: 'given-name' },
  { nombre: 'lastName', etiqueta: 'Apellidos', tipo: 'text', completar: 'family-name' },
  { nombre: 'birthDate', etiqueta: 'Fecha de nacimiento', tipo: 'date', completar: 'bday' },
  { nombre: 'password', etiqueta: 'Contraseña', tipo: 'password', completar: 'new-password' },
  { nombre: 'phone', etiqueta: 'Teléfono (opcional)', tipo: 'tel', completar: 'tel' },
  { nombre: 'city', etiqueta: 'Ciudad (opcional)', tipo: 'text', completar: 'address-level2' },
] as const

export default function Registro() {
  const navegar = useNavigate()
  const registro = useRegistro()
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<DatosRegistro>({
    resolver: zodResolver(registroSchema),
    defaultValues: {
      username: '', email: '', password: '', firstName: '', lastName: '', birthDate: '', phone: '', city: '',
    },
  })

  async function enviar(datos: DatosRegistro) {
    try {
      await registro.mutateAsync(datos)
      void navegar(RUTAS.login, { replace: true, state: { registroExitoso: true } })
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 400) {
        for (const campo of campos) {
          const mensaje = error.details[campo.nombre]
          if (mensaje) setError(campo.nombre, { type: 'server', message: mensaje })
        }
      }
      setError('root', {
        message: error instanceof ApiError ? error.message : 'No se pudo crear la cuenta. Inténtalo de nuevo.',
      })
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-titulo text-3xl font-bold">Crear cuenta</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-400">Regístrate en PulsePass para gestionar tus entradas.</p>
      <form noValidate onSubmit={handleSubmit(enviar)} aria-busy={isSubmitting} className="mt-6 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          {campos.map((campo) => (
            <div key={campo.nombre}>
              <label htmlFor={`registro-${campo.nombre}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {campo.etiqueta}
              </label>
              <input
                id={`registro-${campo.nombre}`}
                type={campo.tipo}
                autoComplete={campo.completar}
                {...register(campo.nombre)}
                aria-invalid={Boolean(errors[campo.nombre])}
                aria-describedby={errors[campo.nombre] ? `error-${campo.nombre}` : campo.nombre === 'password' ? 'ayuda-password' : undefined}
                className="mt-2 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
              />
              {campo.nombre === 'password' && <p id="ayuda-password" className="mt-2 text-sm text-slate-600 dark:text-slate-400">Entre 12 y 72 caracteres.</p>}
              {errors[campo.nombre] && (
                <p id={`error-${campo.nombre}`} role="alert" className="mt-2 text-sm text-red-700 dark:text-red-200">
                  {errors[campo.nombre]?.message}
                </p>
              )}
            </div>
          ))}
        </div>
        {errors.root && <p role="alert" aria-live="off" className="rounded-lg bg-red-50 dark:bg-red-950 p-4 text-red-800 dark:text-red-200">{errors.root.message}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-marca-600 px-4 py-3 font-medium text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:cursor-wait disabled:opacity-60"
        >
          {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>
      <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
        ¿Ya tienes cuenta?{' '}
        <Link to={RUTAS.login} className="rounded text-marca-700 dark:text-indigo-300 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600">Iniciar sesión</Link>
      </p>
    </main>
  )
}
