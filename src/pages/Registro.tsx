import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { registroSchema, type Registro as DatosRegistro } from '../api/auth.tipos'
import { ApiError } from '../api/http'
import Boton from '../components/ui/Boton'
import Campo from '../components/ui/Campo'
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
            <Campo
              key={campo.nombre}
              id={`registro-${campo.nombre}`}
              etiqueta={campo.etiqueta}
              type={campo.tipo}
              autoComplete={campo.completar}
              error={errors[campo.nombre]}
              ayuda={campo.nombre === 'password' ? 'Mínimo 12 caracteres y máximo 72 bytes en UTF-8.' : undefined}
              {...register(campo.nombre)}
            />
          ))}
        </div>
        {errors.root && <p role="alert" aria-live="off" className="rounded-lg bg-red-50 dark:bg-red-950 p-4 text-red-800 dark:text-red-200">{errors.root.message}</p>}
        <Boton
          type="submit"
          disabled={isSubmitting}
          className="w-full font-medium disabled:cursor-wait"
        >
          {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </Boton>
      </form>
      <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
        ¿Ya tienes cuenta?{' '}
        <Link to={RUTAS.login} className="rounded text-marca-700 dark:text-indigo-300 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600">Iniciar sesión</Link>
      </p>
    </main>
  )
}
