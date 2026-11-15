import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http as mswHttp, HttpResponse } from 'msw'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { afterEach, beforeEach, expect, it } from 'vitest'
import { http } from '../api/http'
import Layout from '../layouts/Layout'
import RutaProtegida from '../layouts/RutaProtegida'
import SoloAnonimo from '../layouts/SoloAnonimo'
import { guardarSesion } from '../lib/sesion'
import Login from '../pages/Login'
import { server } from '../test/mocks/server'
import AuthProvider from './AuthProvider'

const token = 'token-ficticio-expiracion'
const usuario = { id: 1, username: 'andrea', email: 'andrea@example.com', roles: ['USER'] }

function PaginaPrivada() {
  return (
    <>
      <h1>Página privada</h1>
      <button onClick={() => { void http('/protegido').catch(() => undefined) }}>
        Consultar recurso protegido
      </button>
    </>
  )
}

beforeEach(() => sessionStorage.clear())
afterEach(() => sessionStorage.clear())

it('un 401 autenticado limpia sesión y caché, redirige y permite volver al origen', async () => {
  let autorizacion: string | null = null
  server.use(
    mswHttp.get('*/api/auth/me', () => HttpResponse.json(usuario)),
    mswHttp.post('*/api/auth/login', () => HttpResponse.json({ accessToken: token, tokenType: 'Bearer', expiresIn: 900 })),
    mswHttp.get('*/api/protegido', ({ request }) => {
      autorizacion = request.headers.get('Authorization')
      return new HttpResponse(null, { status: 401 })
    }),
  )
  guardarSesion({ accessToken: token, expiraEn: Date.now() + 60_000 })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  const router = createMemoryRouter([{
    Component: Layout,
    children: [
      { Component: SoloAnonimo, children: [{ path: '/login', Component: Login }] },
      { Component: RutaProtegida, children: [{ path: '/privada', Component: PaginaPrivada }] },
      { path: '/', element: <h1>Inicio de prueba</h1> },
    ],
  }], { initialEntries: ['/privada?q=musica#tickets'] })
  render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider><RouterProvider router={router} /></AuthProvider>
    </QueryClientProvider>,
  )
  const persona = userEvent.setup()
  await screen.findByRole('heading', { name: 'Página privada' })
  queryClient.setQueryData(['datos-privados'], { dato: 'de prueba' })
  await persona.click(screen.getByRole('button', { name: 'Consultar recurso protegido' }))

  expect(await screen.findByText('Tu sesión expiró. Inicia sesión de nuevo.')).toBeInTheDocument()
  expect(autorizacion).toBe(`Bearer ${token}`)
  expect(router.state.location.pathname).toBe('/login')
  expect(router.state.location.state).toMatchObject({ desde: '/privada?q=musica#tickets', motivo: 'expirada' })
  expect(sessionStorage.getItem('pulsepass.sesion')).toBeNull()
  expect(queryClient.getQueryCache().getAll()).toHaveLength(0)

  await persona.type(screen.getByRole('textbox', { name: 'Usuario o correo' }), 'andrea')
  await persona.type(screen.getByLabelText('Contraseña'), 'contraseña-de-prueba')
  await persona.click(screen.getByRole('button', { name: 'Ingresar' }))

  expect(await screen.findByRole('heading', { name: 'Página privada' })).toBeInTheDocument()
  expect(router.state.location.pathname + router.state.location.search + router.state.location.hash)
    .toBe('/privada?q=musica#tickets')
})
