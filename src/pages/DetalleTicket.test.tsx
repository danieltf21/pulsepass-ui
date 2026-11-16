import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { http, HttpResponse } from 'msw'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import type { Ticket } from '../api/tickets.tipos'
import { AuthContext } from '../context/AuthContext'
import { formatearPrecioCOP } from '../lib/formato'
import { RUTAS } from '../lib/rutas'
import { server } from '../test/mocks/server'
import DetalleTicket from './DetalleTicket'

const ticket: Ticket = {
  id: 1, ticketCode: 'TKT-001', type: 'VIP', price: 150000, status: 'PAID',
  purchaseDate: '2026-11-15T12:00:00', userEmail: 'comprador@example.com',
  eventCode: 'CMF-2026', eventName: 'Caribbean Music Fest 2026',
}

function mostrarDetalle() {
  const cliente = new QueryClient({ defaultOptions: { queries: { retryDelay: 0 } } })
  cliente.setQueryData(['auth', 'me'], { id: 1, username: 'comprador', email: ticket.userEmail, roles: ['USER'] })
  render(
    <QueryClientProvider client={cliente}>
      <AuthContext.Provider value={{
        sesion: {
          estado: 'autenticada', accessToken: 'token-prueba', expiraEn: Date.now() + 60000,
          usuario: { id: 1, username: 'comprador', email: ticket.userEmail, roles: ['USER'] },
        },
        iniciarSesion: async () => {}, cerrarSesion: () => {},
      }}>
        <MemoryRouter initialEntries={[RUTAS.ticket(ticket.ticketCode)]}>
          <Routes>
            <Route path={RUTAS.detalleTicket} element={<DetalleTicket />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  )
}

describe('DetalleTicket', () => {
  const prototipo = HTMLDialogElement.prototype
  const showModalOriginal = Object.getOwnPropertyDescriptor(prototipo, 'showModal')
  const closeOriginal = Object.getOwnPropertyDescriptor(prototipo, 'close')
  beforeAll(() => {
    // jsdom no implementa el diálogo modal nativo ni su gestión de foco.
    Object.defineProperty(prototipo, 'showModal', { configurable: true, value: function (this: HTMLDialogElement) {
      this.open = true
    } })
    Object.defineProperty(prototipo, 'close', { configurable: true, value: function (this: HTMLDialogElement) {
      this.open = false
    } })
  })
  afterAll(() => {
    if (showModalOriginal) Object.defineProperty(prototipo, 'showModal', showModalOriginal)
    else Reflect.deleteProperty(prototipo, 'showModal')
    if (closeOriginal) Object.defineProperty(prototipo, 'close', closeOriginal)
    else Reflect.deleteProperty(prototipo, 'close')
  })

  it('solo cancela después de confirmar y actualiza el estado de la entrada', async () => {
    const cancelar = vi.fn()
    server.use(
      http.get('*/api/tickets/TKT-001', () => HttpResponse.json(ticket)),
      http.patch('*/api/tickets/TKT-001/cancel', () => {
        cancelar()
        return HttpResponse.json({ ...ticket, status: 'CANCELLED' })
      }),
    )
    mostrarDetalle()
    fireEvent.click(await screen.findByRole('button', { name: 'Cancelar entrada' }))
    const dialogo = screen.getByRole('dialog', { name: 'Cancelar entrada' })
    expect(cancelar).not.toHaveBeenCalled()
    fireEvent.click(within(dialogo).getByRole('button', { name: 'Confirmar cancelación' }))
    expect(await screen.findByRole('status')).toHaveTextContent('La entrada se canceló correctamente.')
    expect(screen.getByText('Cancelado')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cancelar entrada' })).not.toBeInTheDocument()
    expect(cancelar).toHaveBeenCalledTimes(1)
  })

  it('permite conservar la entrada sin enviar la cancelación', async () => {
    const cancelar = vi.fn()
    server.use(
      http.get('*/api/tickets/TKT-001', () => HttpResponse.json(ticket)),
      http.patch('*/api/tickets/TKT-001/cancel', () => {
        cancelar()
        return HttpResponse.json({ ...ticket, status: 'CANCELLED' })
      }),
    )
    mostrarDetalle()
    fireEvent.click(await screen.findByRole('button', { name: 'Cancelar entrada' }))
    fireEvent.click(screen.getByRole('button', { name: 'Conservar entrada' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText('Pagado')).toBeInTheDocument()
    expect(cancelar).not.toHaveBeenCalled()
  })

  it('mantiene el diálogo y el estado pagado ante un conflicto y permite reintentar', async () => {
    server.use(
      http.get('*/api/tickets/TKT-001', () => HttpResponse.json(ticket)),
      http.patch('*/api/tickets/TKT-001/cancel', () => HttpResponse.json({
        timestamp: '2026-11-15T12:00:00', status: 409, error: 'Conflict',
        message: 'No se puede cancelar después del evento.', details: {},
      }, { status: 409 })),
    )
    mostrarDetalle()
    fireEvent.click(await screen.findByRole('button', { name: 'Cancelar entrada' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar cancelación' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('No se puede cancelar después del evento.')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Pagado')).toBeInTheDocument()
    server.use(http.patch('*/api/tickets/TKT-001/cancel', () => HttpResponse.json({ ...ticket, status: 'CANCELLED' })))
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar cancelación' }))
    expect(await screen.findByText('Cancelado')).toBeInTheDocument()
  })

  it('bloquea solicitudes duplicadas y el cierre mientras cancela', async () => {
    let completar!: () => void
    const pendiente = new Promise<void>((resolve) => { completar = resolve })
    const cancelar = vi.fn()
    server.use(
      http.get('*/api/tickets/TKT-001', () => HttpResponse.json(ticket)),
      http.patch('*/api/tickets/TKT-001/cancel', async () => {
        cancelar()
        await pendiente
        return HttpResponse.json({ ...ticket, status: 'CANCELLED' })
      }),
    )
    mostrarDetalle()
    fireEvent.click(await screen.findByRole('button', { name: 'Cancelar entrada' }))
    const confirmar = screen.getByRole('button', { name: 'Confirmar cancelación' })
    try {
      fireEvent.click(confirmar)
      fireEvent.click(confirmar)
      await waitFor(() => expect(cancelar).toHaveBeenCalledTimes(1))
      expect(screen.getByRole('button', { name: 'Cancelando…' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Conservar entrada' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Cerrar diálogo' })).toBeDisabled()
    } finally {
      completar()
    }
    expect(await screen.findByText('Cancelado')).toBeInTheDocument()
  })

  it.each(['CANCELLED', 'USED', 'RESERVED'] as const)('no ofrece cancelar una entrada %s', async (status) => {
    server.use(http.get('*/api/tickets/TKT-001', () => HttpResponse.json({ ...ticket, status })))
    mostrarDetalle()
    expect(await screen.findByRole('heading', { name: 'Detalle de tu entrada' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cancelar entrada' })).not.toBeInTheDocument()
  })

  it('consulta desde una URL directa sin caché y muestra los datos de la entrada', async () => {
    server.use(http.get('*/api/tickets/TKT-001', () => HttpResponse.json(ticket)))
    mostrarDetalle()
    expect(screen.getByRole('status')).toHaveTextContent('Cargando entrada')
    expect(await screen.findByRole('heading', { name: 'Detalle de tu entrada' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: ticket.eventName })).toBeInTheDocument()
    expect(screen.getByText(ticket.ticketCode)).toBeInTheDocument()
    expect(screen.getByText(ticket.userEmail)).toBeInTheDocument()
    expect(screen.getByText('VIP')).toBeInTheDocument()
    expect(screen.getByText('Pagado')).toBeInTheDocument()
    expect(screen.getByText(formatearPrecioCOP(ticket.price), { normalizer: (texto) => texto })).toBeInTheDocument()
    expect(document.querySelector('time')).toHaveAttribute('dateTime', ticket.purchaseDate)
    expect(screen.getByRole('link', { name: 'Ver evento' })).toHaveAttribute('href', RUTAS.evento(ticket.eventCode))
    expect(screen.getByRole('link', { name: 'Volver a Mis tickets' })).toHaveAttribute('href', RUTAS.misTickets)
  })

  it.each([403, 404])('muestra ticket no disponible sin exponer sus datos ante un %s', async (status) => {
    let consultas = 0
    server.use(http.get('*/api/tickets/TKT-001', () => {
      consultas += 1
      return new HttpResponse(null, { status })
    }))
    mostrarDetalle()
    expect(await screen.findByRole('heading', { name: 'Ticket no disponible' })).toBeInTheDocument()
    expect(screen.queryByText(ticket.userEmail)).not.toBeInTheDocument()
    expect(screen.queryByText(ticket.ticketCode)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument()
    expect(consultas).toBe(1)
  })

  it('permite reintentar después de fallar el servidor', async () => {
    server.use(http.get('*/api/tickets/TKT-001', () => new HttpResponse(null, { status: 500 })))
    mostrarDetalle()
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar la entrada')
    server.use(http.get('*/api/tickets/TKT-001', () => HttpResponse.json(ticket)))
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByText(ticket.ticketCode)).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
