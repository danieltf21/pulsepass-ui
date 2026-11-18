import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import AuthProvider from '../context/AuthProvider'
import Layout from '../layouts/Layout'
import RutaProtegida from '../layouts/RutaProtegida'
import SoloAnonimo from '../layouts/SoloAnonimo'
import { guardarSesion } from '../lib/sesion'
import { server } from '../test/mocks/server'
import Cuenta from './Cuenta'
import Login from './Login'
import SinPermisos from './SinPermisos'

const token = 'token-ficticio-cuenta'
const usuario = { id: 1, username: 'andrea', email: 'andrea@example.com', roles: ['USER'] }
const perfil = { id: 1, username: 'andrea', email: 'andrea@example.com', firstName: 'Andrea', lastName: 'Pérez', active: true }

function mostrarCuenta(autenticada = true) {
  if (autenticada) guardarSesion({ accessToken: token, expiraEn: Date.now() + 60_000 })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retryDelay: 0, gcTime: 0 } } })
  const router = createMemoryRouter([{
    Component: Layout,
    children: [
      { Component: RutaProtegida, children: [{ path: '/cuenta', Component: Cuenta }] },
      { Component: SoloAnonimo, children: [{ path: '/login', Component: Login }] },
      { path: '/403', Component: SinPermisos },
    ],
  }], { initialEntries: ['/cuenta'] })
  render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider><RouterProvider router={router} /></AuthProvider>
    </QueryClientProvider>,
  )
  return router
}

beforeEach(() => {
  sessionStorage.clear()
  server.use(
    http.get('*/api/auth/me', () => HttpResponse.json(usuario)),
    http.get('*/api/users/by-email', () => HttpResponse.json(perfil)),
  )
})
afterEach(() => sessionStorage.clear())

describe('Mi cuenta', () => {
  it('consulta el correo de la sesión con Bearer y muestra los datos y roles', async () => {
    let correo: string | null = null
    let autorizacion: string | null = null
    server.use(http.get('*/api/users/by-email', ({ request }) => {
      correo = new URL(request.url).searchParams.get('email')
      autorizacion = request.headers.get('Authorization')
      return HttpResponse.json(perfil)
    }))
    mostrarCuenta()

    expect(await screen.findByText('Pérez')).toBeInTheDocument()
    expect(screen.getByText('Andrea')).toBeInTheDocument()
    expect(screen.getByText('andrea@example.com')).toBeInTheDocument()
    expect(screen.getByText('Asistente')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Mi cuenta' })).toHaveAttribute('aria-current', 'page')
    expect(correo).toBe(usuario.email)
    expect(autorizacion).toBe(`Bearer ${token}`)
  })

  it('permite consultar por el nombre de la sesión con Bearer', async () => {
    let solicitud: Request | undefined
    server.use(http.get('*/api/users/by-username', ({ request }) => {
      solicitud = request
      return HttpResponse.json({ ...perfil, lastName: 'Gómez' })
    }))
    mostrarCuenta()
    expect(await screen.findByText('Pérez')).toBeInTheDocument()

    await userEvent.setup().selectOptions(screen.getByRole('combobox', { name: 'Consultar por' }), 'username')

    expect(await screen.findByText('Gómez')).toBeInTheDocument()
    expect(new URL(solicitud!.url).searchParams.get('username')).toBe(usuario.username)
    expect(solicitud?.headers.get('Authorization')).toBe(`Bearer ${token}`)
  })

  it('redirige al anónimo sin consultar sus datos y conserva el destino', async () => {
    let peticiones = 0
    server.use(http.get('*/api/users/by-email', () => { peticiones += 1; return HttpResponse.json(perfil) }))
    const router = mostrarCuenta(false)

    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument()
    expect(router.state.location.state).toMatchObject({ desde: '/cuenta' })
    expect(peticiones).toBe(0)
  })

  it('respeta el 403 del servidor y muestra acceso denegado', async () => {
    server.use(http.get('*/api/users/by-email', () => new HttpResponse(null, { status: 403 })))
    const router = mostrarCuenta()

    expect(await screen.findByRole('heading', { name: 'Acceso denegado' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/403')
  })

  it('presenta el error de carga y permite reintentar', async () => {
    server.use(http.get('*/api/users/by-email', () => new HttpResponse(null, { status: 500 })))
    mostrarCuenta()

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar tus datos')
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeEnabled()
  })
})
