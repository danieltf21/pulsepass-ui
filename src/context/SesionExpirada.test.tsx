import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http as mswHttp, HttpResponse } from 'msw'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
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
const ahora = 1_800_000_000_000
const expiraEn = ahora + 60_000
const origen = '/privada?q=musica#tickets'

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

function mostrarPaginaPrivada() {
  guardarSesion({ accessToken: token, expiraEn })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  const router = createMemoryRouter([{
    Component: Layout,
    children: [
      { Component: SoloAnonimo, children: [{ path: '/login', Component: Login }] },
      { Component: RutaProtegida, children: [{ path: '/privada', Component: PaginaPrivada }] },
      { path: '/', element: <h1>Inicio de prueba</h1> },
    ],
  }], { initialEntries: [origen] })
  render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider><RouterProvider router={router} /></AuthProvider>
    </QueryClientProvider>,
  )
  return { queryClient, router }
}

beforeEach(() => {
  vi.setSystemTime(ahora)
  sessionStorage.clear()
  server.use(mswHttp.get('*/api/auth/me', () => HttpResponse.json(usuario)))
})

afterEach(() => {
  sessionStorage.clear()
  vi.useRealTimers()
})

it('cierra la sesión al vencer el temporizador y conserva la ruta de origen', async () => {
  vi.useFakeTimers()
  vi.setSystemTime(ahora)
  const { queryClient, router } = mostrarPaginaPrivada()

  await vi.waitFor(() => expect(screen.getByRole('heading', { name: 'Página privada' })).toBeInTheDocument())
  queryClient.setQueryData(['datos-privados'], { dato: 'de prueba' })

  await act(() => vi.advanceTimersByTimeAsync(expiraEn - Date.now() - 1))
  expect(router.state.location.pathname).toBe('/privada')
  expect(sessionStorage.getItem('pulsepass.sesion')).not.toBeNull()

  await act(() => vi.advanceTimersByTimeAsync(1))
  expect(router.state.location.pathname).toBe('/login')
  expect(router.state.location.state).toMatchObject({ desde: origen, motivo: 'expirada' })
  expect(screen.getByText('Tu sesión expiró. Inicia sesión de nuevo.')).toBeInTheDocument()
  expect(sessionStorage.getItem('pulsepass.sesion')).toBeNull()
  expect(queryClient.getQueryCache().getAll()).toHaveLength(0)
})

it('un 401 autenticado limpia sesión y caché, redirige y permite volver al origen', async () => {
  let solicitudProtegida: Request | undefined
  server.use(
    mswHttp.post('*/api/auth/login', () => HttpResponse.json({ accessToken: token, tokenType: 'Bearer', expiresIn: 900 })),
    mswHttp.get('*/api/protegido', ({ request }) => {
      solicitudProtegida = request
      return new HttpResponse(null, { status: 401 })
    }),
  )
  const { queryClient, router } = mostrarPaginaPrivada()
  const persona = userEvent.setup()
  await screen.findByRole('heading', { name: 'Página privada' })
  queryClient.setQueryData(['datos-privados'], { dato: 'de prueba' })
  await persona.click(screen.getByRole('button', { name: 'Consultar recurso protegido' }))

  expect(await screen.findByText('Tu sesión expiró. Inicia sesión de nuevo.')).toBeInTheDocument()
  expect(solicitudProtegida?.headers.get('Authorization')).toBe(`Bearer ${token}`)
  expect(solicitudProtegida?.url).not.toContain(token)
  expect(router.state.location.pathname).toBe('/login')
  expect(router.state.location.state).toMatchObject({ desde: origen, motivo: 'expirada' })
  expect(sessionStorage.getItem('pulsepass.sesion')).toBeNull()
  expect(queryClient.getQueryCache().getAll()).toHaveLength(0)

  await persona.type(screen.getByRole('textbox', { name: 'Usuario o correo' }), 'andrea')
  await persona.type(screen.getByLabelText('Contraseña'), 'contraseña-de-prueba')
  await persona.click(screen.getByRole('button', { name: 'Ingresar' }))

  expect(await screen.findByRole('heading', { name: 'Página privada' })).toBeInTheDocument()
  expect(router.state.location.pathname + router.state.location.search + router.state.location.hash)
    .toBe(origen)
})
