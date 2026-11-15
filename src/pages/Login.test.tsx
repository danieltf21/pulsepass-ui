import { StrictMode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { createMemoryRouter, Outlet } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import AuthProvider from '../context/AuthProvider'
import { useAuth } from '../hooks/useAuth'
import { guardarSesion } from '../lib/sesion'
import { server } from '../test/mocks/server'
import Login from './Login'

const usuario = { id: 1, username: 'andrea', email: 'andrea@example.com', roles: ['USER'] }
const token = 'token-ficticio-solo-para-tests'

function EstadoSesion() {
  const { sesion, cerrarSesion } = useAuth()
  return (
    <>
      <output aria-label="Estado de sesión">{sesion.estado}</output>
      {sesion.estado === 'autenticada' && (
        <>
          <p>{sesion.usuario.username}</p>
          <button onClick={() => cerrarSesion()}>Cerrar sesión de prueba</button>
        </>
      )}
      <Outlet />
    </>
  )
}

function mostrarLogin() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  const router = createMemoryRouter([{
    element: <EstadoSesion />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/privada', element: <h1>Destino original</h1> },
      { path: '/', element: <h1>Inicio de prueba</h1> },
    ],
  }], { initialEntries: [{ pathname: '/login', state: { desde: '/privada' } }] })
  render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider><RouterProvider router={router} /></AuthProvider>
      </QueryClientProvider>
    </StrictMode>,
  )
  return { queryClient, router }
}

beforeEach(() => {
  sessionStorage.clear()
  server.use(
    http.post('*/api/auth/login', () => HttpResponse.json({ accessToken: token, tokenType: 'Bearer', expiresIn: 900 })),
    http.get('*/api/auth/me', ({ request }) =>
      request.headers.get('Authorization') === `Bearer ${token}`
        ? HttpResponse.json(usuario)
        : new HttpResponse(null, { status: 401 }),
    ),
  )
})
afterEach(() => sessionStorage.clear())

async function enviarLogin() {
  const persona = userEvent.setup()
  await persona.type(await screen.findByRole('textbox', { name: 'Usuario o correo' }), 'andrea')
  await persona.type(screen.getByLabelText('Contraseña'), 'contraseña-de-prueba')
  await persona.click(screen.getByRole('button', { name: 'Ingresar' }))
}

describe('Login y sesión', () => {
  it('autentica con Bearer en me y vuelve a la ruta de origen', async () => {
    mostrarLogin()
    await enviarLogin()

    expect(await screen.findByRole('heading', { name: 'Destino original' })).toBeInTheDocument()
    expect(screen.getByText('andrea')).toBeInTheDocument()
    expect(screen.getByRole('status', { name: 'Estado de sesión' })).toHaveTextContent('autenticada')
  })

  it('muestra credenciales inválidas ante 401 sin revelar información interna', async () => {
    server.use(http.post('*/api/auth/login', () => new HttpResponse(null, { status: 401 })))
    mostrarLogin()
    await enviarLogin()

    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciales inválidas')
    expect(sessionStorage.getItem('pulsepass.sesion')).toBeNull()
  })

  it('no envía login si los campos están vacíos', async () => {
    let solicitudes = 0
    server.use(http.post('*/api/auth/login', () => { solicitudes += 1; return new HttpResponse(null, { status: 500 }) }))
    const persona = userEvent.setup()
    mostrarLogin()
    await persona.click(await screen.findByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByText('Escribe tu usuario o correo.')).toBeInTheDocument()
    expect(screen.getByText('Escribe tu contraseña.')).toBeInTheDocument()
    expect(solicitudes).toBe(0)
  })

  it('restaura una sesión guardada consultando me', async () => {
    guardarSesion({ accessToken: token, expiraEn: Date.now() + 60_000 })
    mostrarLogin()

    expect(await screen.findByRole('heading', { name: 'Destino original' })).toBeInTheDocument()
    expect(screen.getByRole('status', { name: 'Estado de sesión' })).toHaveTextContent('autenticada')
  })

  it('descarta una sesión vencida sin consultar me', async () => {
    let solicitudes = 0
    server.use(http.get('*/api/auth/me', () => { solicitudes += 1; return HttpResponse.json(usuario) }))
    guardarSesion({ accessToken: token, expiraEn: 1 })
    mostrarLogin()

    expect(await screen.findByText('Tu sesión expiró. Inicia sesión de nuevo.')).toBeInTheDocument()
    expect(sessionStorage.getItem('pulsepass.sesion')).toBeNull()
    expect(solicitudes).toBe(0)
  })

  it('elimina token y caché al cerrar sesión', async () => {
    const persona = userEvent.setup()
    const { queryClient } = mostrarLogin()
    await enviarLogin()
    await screen.findByRole('heading', { name: 'Destino original' })
    queryClient.setQueryData(['datos-privados'], { dato: 'de prueba' })
    await persona.click(screen.getByRole('button', { name: 'Cerrar sesión de prueba' }))

    await waitFor(() => expect(screen.getByRole('status', { name: 'Estado de sesión' })).toHaveTextContent('anonima'))
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0)
    expect(sessionStorage.getItem('pulsepass.sesion')).toBeNull()
  })
})
