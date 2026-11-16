import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import type { Ticket } from '../api/tickets.tipos'
import { AuthContext } from '../context/AuthContext'
import { formatearPrecioCOP } from '../lib/formato'
import { server } from '../test/mocks/server'
import ConfirmacionCompra from './ConfirmacionCompra'

const ticket: Ticket = {
  id: 1, ticketCode: 'TKT-001', type: 'VIP', price: 150000, status: 'PAID',
  purchaseDate: '2026-11-15T12:00:00', userEmail: 'comprador@example.com',
  eventCode: 'CMF-2026', eventName: 'Caribbean Music Fest 2026',
}

function mostrarConfirmacion() {
  // Caché vacía: simula acceder directamente o recargar la confirmación.
  const cliente = new QueryClient({ defaultOptions: { queries: { retryDelay: 0 } } })
  render(
    <QueryClientProvider client={cliente}>
      <AuthContext.Provider value={{
        sesion: {
          estado: 'autenticada', accessToken: 'token-prueba', expiraEn: Date.now() + 60000,
          usuario: { id: 1, username: 'comprador', email: ticket.userEmail, roles: ['USER'] },
        },
        iniciarSesion: async () => {}, cerrarSesion: () => {},
      }}>
        <MemoryRouter initialEntries={['/compra/confirmacion/TKT-001']}>
          <Routes>
            <Route path="/compra/confirmacion/:ticketCode" element={<ConfirmacionCompra />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  )
}

describe('ConfirmacionCompra', () => {
  it('consulta el ticket sin caché y muestra sus datos y el enlace al evento', async () => {
    server.use(http.get('*/api/tickets/TKT-001', () => HttpResponse.json(ticket)))
    mostrarConfirmacion()

    expect(screen.getByRole('status')).toHaveTextContent('Cargando confirmación')
    expect(await screen.findByRole('heading', { name: 'Compra confirmada' })).toBeInTheDocument()
    expect(screen.getByText(ticket.ticketCode)).toBeInTheDocument()
    expect(screen.getByText(ticket.eventName)).toBeInTheDocument()
    expect(screen.getByText('VIP')).toBeInTheDocument()
    expect(screen.getByText('Pagado')).toBeInTheDocument()
    expect(screen.getByText(formatearPrecioCOP(ticket.price), { normalizer: (texto) => texto })).toBeInTheDocument()
    expect(document.querySelector('time')).toHaveAttribute('dateTime', ticket.purchaseDate)
    expect(screen.getByRole('link', { name: 'Volver al evento' })).toHaveAttribute('href', '/eventos/CMF-2026')
    expect(screen.getByRole('link', { name: 'Ver mis tickets' })).toHaveAttribute('href', '/mis-tickets')
  })

  it.each([403, 404])('no muestra datos del ticket cuando el servidor devuelve %s', async (status) => {
    let solicitudes = 0
    server.use(http.get('*/api/tickets/TKT-001', () => {
      solicitudes += 1
      return new HttpResponse(null, { status })
    }))
    mostrarConfirmacion()

    expect(await screen.findByRole('heading', { name: 'Ticket no disponible' })).toBeInTheDocument()
    expect(screen.queryByText(ticket.ticketCode)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver a eventos' })).toHaveAttribute('href', '/eventos')
    expect(solicitudes).toBe(1)
  })

  it('permite reintentar cuando falla la consulta', async () => {
    server.use(http.get('*/api/tickets/TKT-001', () => new HttpResponse(null, { status: 500 })))
    mostrarConfirmacion()
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar la confirmación')

    server.use(http.get('*/api/tickets/TKT-001', () => HttpResponse.json(ticket)))
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByRole('heading', { name: 'Compra confirmada' })).toBeInTheDocument()
  })

  it('muestra el estado reservado sin anunciar una compra pagada', async () => {
    server.use(http.get('*/api/tickets/TKT-001', () => HttpResponse.json({ ...ticket, status: 'RESERVED' })))
    mostrarConfirmacion()
    expect(await screen.findByRole('heading', { name: 'Detalle de tu compra' })).toBeInTheDocument()
    expect(screen.getByText('Reservado')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Compra confirmada' })).not.toBeInTheDocument()
  })
})
