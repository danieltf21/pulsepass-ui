import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import type { Rol } from '../api/auth.tipos'
import type { Ticket } from '../api/tickets.tipos'
import { AuthContext } from '../context/AuthContext'
import { server } from '../test/mocks/server'
import ValidacionIngreso from './ValidacionIngreso'

const ticket: Ticket = {
  id: 1, ticketCode: 'TKT-001', type: 'VIP', price: 150000, status: 'PAID',
  purchaseDate: '2026-11-15T12:00:00', userEmail: 'asistente@example.com',
  eventCode: 'CMF-2026', eventName: 'Caribbean Music Fest 2026',
}

function mostrarValidacion(rol: Rol = 'STAFF') {
  const cliente = new QueryClient({ defaultOptions: { queries: { retryDelay: 0 } } })
  render(
    <QueryClientProvider client={cliente}>
      <AuthContext.Provider value={{
        sesion: {
          estado: 'autenticada', accessToken: 'token-prueba', expiraEn: Date.now() + 60000,
          usuario: { id: 2, username: 'operador', email: 'operador@example.com', roles: [rol] },
        },
        iniciarSesion: async () => {}, cerrarSesion: () => {},
      }}>
        <ValidacionIngreso />
      </AuthContext.Provider>
    </QueryClientProvider>,
  )
}

function buscar() {
  fireEvent.change(screen.getByLabelText('Código de ticket'), { target: { value: '  TKT-001  ' } })
  fireEvent.click(screen.getByRole('button', { name: 'Buscar' }))
}

describe('ValidacionIngreso', () => {
  it('enfoca el campo y rechaza un código vacío sin consultar la API', async () => {
    let peticiones = 0
    server.use(http.get('*/api/tickets/:codigo', () => {
      peticiones += 1
      return HttpResponse.json(ticket)
    }))
    mostrarValidacion()
    expect(screen.getByLabelText('Código de ticket')).toHaveFocus()
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Escribe el código del ticket.')
    expect(peticiones).toBe(0)
  })

  it.each(['STAFF', 'ADMIN'] as const)('registra el ingreso como %s y limpia el campo', async (rol) => {
    let registros = 0
    server.use(
      http.get('*/api/tickets/TKT-001', () => HttpResponse.json(ticket)),
      http.patch('*/api/tickets/TKT-001/use', () => {
        registros += 1
        return HttpResponse.json({ ...ticket, status: 'USED' })
      }),
    )
    mostrarValidacion(rol)
    buscar()
    expect(await screen.findByRole('heading', { name: ticket.eventName })).toBeInTheDocument()
    expect(screen.getByText(`Titular: ${ticket.userEmail}`)).toBeInTheDocument()
    expect(screen.getByText('Pagado')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Marcar como usado' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Ingreso registrado.')
    expect(screen.getByText('Usado')).toBeInTheDocument()
    expect(screen.getByLabelText('Código de ticket')).toHaveValue('')
    expect(screen.getByLabelText('Código de ticket')).toHaveFocus()
    expect(screen.queryByRole('button', { name: 'Marcar como usado' })).not.toBeInTheDocument()
    expect(registros).toBe(1)
  })

  it('muestra el mensaje del backend ante un 409 y no anuncia ingreso correcto', async () => {
    server.use(
      http.get('*/api/tickets/TKT-001', () => HttpResponse.json(ticket)),
      http.patch('*/api/tickets/TKT-001/use', () => HttpResponse.json({
        timestamp: '2026-11-15T12:00:00', status: 409, error: 'Conflict',
        message: 'El ticket ya fue utilizado.', details: {},
      }, { status: 409 })),
    )
    mostrarValidacion()
    buscar()
    fireEvent.click(await screen.findByRole('button', { name: 'Marcar como usado' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('El ticket ya fue utilizado.')
    expect(screen.queryByText('Ingreso registrado.')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Código de ticket')).not.toHaveValue('')
  })

  it.each([[403, 'Sin permisos'], [404, 'Ticket no encontrado']] as const)('muestra el error %s en la búsqueda', async (status, mensaje) => {
    server.use(http.get('*/api/tickets/TKT-001', () => new HttpResponse(null, { status })))
    mostrarValidacion()
    buscar()
    expect(await screen.findByRole('alert')).toHaveTextContent(mensaje)
    expect(screen.queryByText(ticket.eventName)).not.toBeInTheDocument()
  })

  it('bloquea registros duplicados y búsquedas durante el envío', async () => {
    let completar!: () => void
    const pendiente = new Promise<void>((resolve) => { completar = resolve })
    let registros = 0
    server.use(
      http.get('*/api/tickets/TKT-001', () => HttpResponse.json(ticket)),
      http.patch('*/api/tickets/TKT-001/use', async () => {
        registros += 1
        await pendiente
        return HttpResponse.json({ ...ticket, status: 'USED' })
      }),
    )
    mostrarValidacion()
    buscar()
    const registrar = await screen.findByRole('button', { name: 'Marcar como usado' })
    try {
      fireEvent.click(registrar)
      fireEvent.click(registrar)
      await waitFor(() => expect(registros).toBe(1))
      expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled()
      expect(screen.getByLabelText('Código de ticket')).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Registrando ingreso…' })).toBeDisabled()
    } finally {
      completar()
    }
    expect(await screen.findByRole('status')).toHaveTextContent('Ingreso registrado.')
  })
})
