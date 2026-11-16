import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { AuthContext } from '../context/AuthContext'
import { RUTAS } from '../lib/rutas'
import { server } from '../test/mocks/server'
import { eventoDePrueba, sedeDePrueba } from '../test/mocks/handlers'
import AdminCrearEvento from './AdminCrearEvento'

function mostrarFormulario() {
  const cliente = new QueryClient({ defaultOptions: { queries: { retryDelay: 0 } } })
  const router = createMemoryRouter([
    { path: RUTAS.adminCrearEvento, Component: AdminCrearEvento },
    { path: RUTAS.adminGestionEvento, element: <h1>Gestión del evento</h1> },
    { path: RUTAS.adminEventos, element: <h1>Administración de eventos</h1> },
    { path: RUTAS.sinPermisos, element: <h1>Sin permisos</h1> },
  ], { initialEntries: [RUTAS.adminCrearEvento] })
  render(
    <QueryClientProvider client={cliente}>
      <AuthContext.Provider value={{
        sesion: {
          estado: 'autenticada', accessToken: 'token-prueba', expiraEn: Date.now() + 60000,
          usuario: { id: 3, username: 'admin', email: 'admin@example.com', roles: ['ADMIN'] },
        },
        iniciarSesion: async () => {}, cerrarSesion: () => {},
      }}>
        <RouterProvider router={router} />
      </AuthContext.Provider>
    </QueryClientProvider>,
  )
  return { cliente, router }
}

async function completarFormulario() {
  await screen.findByRole('option', { name: `${sedeDePrueba.name} (${sedeDePrueba.code})` })
  fireEvent.change(screen.getByLabelText('Código del evento'), { target: { value: eventoDePrueba.eventCode } })
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: eventoDePrueba.name } })
  fireEvent.change(screen.getByLabelText('Fecha y hora'), { target: { value: '2030-12-12T18:00' } })
  fireEvent.change(screen.getByLabelText('Edad mínima'), { target: { value: '18' } })
  fireEvent.change(screen.getByLabelText('Sede'), { target: { value: sedeDePrueba.code } })
}

describe('AdminCrearEvento', () => {
  it('rechaza campos requeridos vacíos sin enviar la creación', async () => {
    let creaciones = 0
    server.use(http.post('*/api/events', () => { creaciones += 1; return HttpResponse.json(eventoDePrueba, { status: 201 }) }))
    mostrarFormulario()
    await screen.findByRole('option', { name: `${sedeDePrueba.name} (${sedeDePrueba.code})` })
    fireEvent.click(screen.getByRole('button', { name: 'Crear evento' }))
    expect(await screen.findByText('Escribe el código del evento.')).toBeInTheDocument()
    expect(screen.getByText('Escribe el nombre del evento.')).toBeInTheDocument()
    expect(creaciones).toBe(0)
  })

  it('crea el evento y navega a gestión con aviso y caché actualizada', async () => {
    const creado = { ...eventoDePrueba, status: 'DRAFT', eventDate: '2030-12-12T18:00:00', artists: [] }
    const solicitudes: unknown[] = []
    server.use(http.post('*/api/events', async ({ request }) => {
      solicitudes.push(await request.json())
      return HttpResponse.json(creado, { status: 201 })
    }))
    const { cliente, router } = mostrarFormulario()
    await completarFormulario()
    fireEvent.click(screen.getByRole('button', { name: 'Crear evento' }))
    expect(await screen.findByRole('heading', { name: 'Gestión del evento' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe(RUTAS.administrarEvento(eventoDePrueba.eventCode))
    expect(router.state.location.state).toEqual({ eventoCreado: eventoDePrueba.eventCode })
    expect(solicitudes).toEqual([{
      eventCode: eventoDePrueba.eventCode, name: eventoDePrueba.name, description: '',
      category: 'MUSIC', eventDate: '2030-12-12T18:00', minimumAge: 18, venueCode: sedeDePrueba.code,
    }])
    expect(cliente.getQueryData(['evento', eventoDePrueba.eventCode])).toEqual(creado)
    expect(cliente.getQueryData(['eventos', 'creados', 3])).toEqual([creado])
  })

  it('asigna los errores 400 a los campos del formulario', async () => {
    server.use(http.post('*/api/events', () => HttpResponse.json({
      timestamp: '2026-11-16T10:00:00', status: 400, error: 'Bad Request', message: 'Datos inválidos.',
      details: { name: 'Nombre rechazado por el servidor.' },
    }, { status: 400 })))
    mostrarFormulario()
    await completarFormulario()
    fireEvent.click(screen.getByRole('button', { name: 'Crear evento' }))
    expect(await screen.findByText('Nombre rechazado por el servidor.')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('heading', { name: 'Nuevo evento' })).toBeInTheDocument()
  })

  it('conserva los datos y muestra el conflicto 409 sin navegar', async () => {
    server.use(http.post('*/api/events', () => HttpResponse.json({
      timestamp: '2026-11-16T10:00:00', status: 409, error: 'Conflict', message: 'El código del evento ya existe.', details: {},
    }, { status: 409 })))
    const { router } = mostrarFormulario()
    await completarFormulario()
    fireEvent.click(screen.getByRole('button', { name: 'Crear evento' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('El código del evento ya existe.')
    expect(screen.getByLabelText('Nombre')).toHaveValue(eventoDePrueba.name)
    expect(router.state.location.pathname).toBe(RUTAS.adminCrearEvento)
  })

  it('redirige a 403 si el servidor rechaza el permiso', async () => {
    server.use(http.post('*/api/events', () => new HttpResponse(null, { status: 403 })))
    mostrarFormulario()
    await completarFormulario()
    fireEvent.click(screen.getByRole('button', { name: 'Crear evento' }))
    expect(await screen.findByRole('heading', { name: 'Sin permisos' })).toBeInTheDocument()
  })

  it('bloquea la creación cuando no hay sedes activas', async () => {
    server.use(http.get('*/api/venues/active', () => HttpResponse.json([])))
    mostrarFormulario()
    expect(await screen.findByText('No hay sedes activas para crear un evento.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Crear evento' })).toBeDisabled()
  })
})
