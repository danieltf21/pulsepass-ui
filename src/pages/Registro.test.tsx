import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import AuthProvider from '../context/AuthProvider'
import SoloAnonimo from '../layouts/SoloAnonimo'
import { server } from '../test/mocks/server'
import Login from './Login'
import Registro from './Registro'

const usuarioCreado = {
  id: 1, username: 'andrea', email: 'andrea@example.com', active: true, firstName: 'Andrea', lastName: 'Pérez',
}

function mostrarRegistro() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  const router = createMemoryRouter([{
    Component: SoloAnonimo,
    children: [
      { path: '/registro', Component: Registro },
      { path: '/login', Component: Login },
    ],
  }], { initialEntries: ['/registro'] })
  render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider><RouterProvider router={router} /></AuthProvider>
    </QueryClientProvider>,
  )
  return router
}

async function completarFormulario(password = 'contraseña-de-prueba') {
  const persona = userEvent.setup()
  await persona.type(await screen.findByRole('textbox', { name: 'Nombre de usuario' }), 'andrea')
  await persona.type(screen.getByRole('textbox', { name: 'Correo electrónico' }), 'andrea@example.com')
  await persona.type(screen.getByRole('textbox', { name: 'Nombres' }), 'Andrea')
  await persona.type(screen.getByRole('textbox', { name: 'Apellidos' }), 'Pérez')
  fireEvent.change(screen.getByLabelText('Fecha de nacimiento'), { target: { value: '2000-01-01' } })
  await persona.type(screen.getByLabelText('Contraseña'), password)
  return persona
}

beforeEach(() => {
  sessionStorage.clear()
  server.use(http.post('*/api/users', () => HttpResponse.json(usuarioCreado, { status: 201 })))
})
afterEach(() => sessionStorage.clear())

describe('Registro', () => {
  it('ante 201 navega al login con aviso y no inicia sesión automáticamente', async () => {
    let consultasAuth = 0
    server.use(
      http.post('*/api/auth/login', () => { consultasAuth += 1; return HttpResponse.error() }),
      http.get('*/api/auth/me', () => { consultasAuth += 1; return HttpResponse.error() }),
    )
    const router = mostrarRegistro()
    const persona = await completarFormulario()
    await persona.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByText('Cuenta creada. Inicia sesión.')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
    expect(consultasAuth).toBe(0)
    expect(sessionStorage.getItem('pulsepass.sesion')).toBeNull()
  })

  it('una contraseña de 11 caracteres no dispara la petición de registro', async () => {
    let peticiones = 0
    server.use(http.post('*/api/users', () => { peticiones += 1; return HttpResponse.json(usuarioCreado, { status: 201 }) }))
    mostrarRegistro()
    const persona = await completarFormulario('12345678901')
    await persona.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByText('La contraseña debe tener al menos 12 caracteres.')).toBeInTheDocument()
    expect(peticiones).toBe(0)
  })

  it('envía una contraseña multibyte de exactamente 72 bytes sin modificarla', async () => {
    const password = 'á'.repeat(36)
    let cuerpo: unknown
    server.use(http.post('*/api/users', async ({ request }) => {
      cuerpo = await request.json()
      return HttpResponse.json(usuarioCreado, { status: 201 })
    }))
    const router = mostrarRegistro()
    const persona = await completarFormulario(password)
    await persona.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByText('Cuenta creada. Inicia sesión.')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
    expect(cuerpo).toMatchObject({ password })
  })

  it('rechaza una contraseña multibyte de 73 bytes antes de llamar a la API', async () => {
    let peticiones = 0
    server.use(http.post('*/api/users', () => {
      peticiones += 1
      return HttpResponse.json(usuarioCreado, { status: 201 })
    }))
    mostrarRegistro()
    const persona = await completarFormulario('á'.repeat(36) + 'a')
    await persona.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByText('La contraseña debe ocupar como máximo 72 bytes en UTF-8.')).toBeInTheDocument()
    expect(peticiones).toBe(0)
  })

  it('muestra un mensaje genérico ante 409 sin exponer el detalle interno', async () => {
    server.use(http.post('*/api/users', () => HttpResponse.json({
      timestamp: '2026-11-15T10:00:00', status: 409, error: 'Conflict',
      message: 'DETALLE_INTERNO_PRIVADO', details: {},
    }, { status: 409 })))
    mostrarRegistro()
    const persona = await completarFormulario()
    await persona.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('El usuario o correo ya está registrado.')
    expect(screen.queryByText('DETALLE_INTERNO_PRIVADO')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Crear cuenta' })).toBeInTheDocument()
  })

  it('asocia los errores 400 a sus campos', async () => {
    server.use(http.post('*/api/users', () => HttpResponse.json({
      timestamp: '2026-11-15T10:00:00', status: 400, error: 'Bad Request',
      message: 'Revisa los campos.', details: { username: 'Nombre de usuario no permitido.' },
    }, { status: 400 })))
    mostrarRegistro()
    const persona = await completarFormulario()
    await persona.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByText('Nombre de usuario no permitido.')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Nombre de usuario' })).toHaveAttribute('aria-invalid', 'true')
  })
})
