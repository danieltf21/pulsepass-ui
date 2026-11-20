import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import type { Ticket } from '../api/tickets.tipos'
import { AuthContext } from '../context/AuthContext'
import { RUTAS } from '../lib/rutas'
import { eventoDePrueba } from '../test/mocks/handlers'
import { server } from '../test/mocks/server'
import TicketsPagadosEvento from './TicketsPagadosEvento'

const ticket: Ticket = {
  id: 1, ticketCode: 'TKT-001', type: 'VIP', price: 150000, status: 'PAID',
  purchaseDate: '2026-11-15T12:00:00', userEmail: 'asistente@example.com',
  eventCode: 'CMF-2026', eventName: 'Caribbean Music Fest 2026',
}

function Ubicacion() {
  return <output aria-label="URL actual">{useLocation().pathname}</output>
}

function mostrarPagina(ruta = RUTAS.ticketsPagadosEvento(ticket.eventCode)) {
  const cliente = new QueryClient({ defaultOptions: { queries: { retryDelay: 0 } } })
  render(
    <QueryClientProvider client={cliente}>
      <AuthContext.Provider value={{
        sesion: {
          estado: 'autenticada', accessToken: 'token-prueba', expiraEn: 1_800_000_060_000,
          usuario: { id: 2, username: 'operador', email: 'operador@example.com', roles: ['STAFF'] },
        },
        iniciarSesion: async () => {}, cerrarSesion: () => {},
      }}>
        <MemoryRouter initialEntries={[ruta]}>
          <Ubicacion />
          <Routes>
            <Route path={RUTAS.buscarTicketsPagados} element={<TicketsPagadosEvento />} />
            <Route path={RUTAS.ticketsPagados} element={<TicketsPagadosEvento />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  )
}

describe('TicketsPagadosEvento', () => {
  it('consulta el evento de la URL y muestra el total y sus entradas', async () => {
    server.use(http.get('*/api/events/CMF-2026/tickets/paid', () => HttpResponse.json([ticket])))
    mostrarPagina()
    expect(screen.getByText('Cargando entradas pagadas…')).toBeInTheDocument()
    expect(await screen.findByText('Total: 1')).toBeInTheDocument()
    const tabla = within(screen.getByRole('table', { name: 'Entradas pagadas del evento' }))
    expect(tabla.getByText(ticket.ticketCode)).toBeInTheDocument()
    expect(tabla.getByText(ticket.userEmail)).toBeInTheDocument()
    expect(tabla.getByText('VIP')).toBeInTheDocument()
    expect(tabla.getByText('Pagado')).toBeInTheDocument()
  })

  it('valida el código vacío sin consultar y conserva la búsqueda válida en la URL', async () => {
    let consultas = 0
    server.use(http.get('*/api/events/CMF-2026/tickets/paid', () => {
      consultas += 1
      return HttpResponse.json([ticket])
    }))
    mostrarPagina(RUTAS.buscarTicketsPagados)
    fireEvent.click(screen.getByRole('button', { name: 'Ir' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Escribe el código del evento.')
    expect(consultas).toBe(0)
    fireEvent.change(screen.getByLabelText('Código del evento'), { target: { value: '  CMF-2026  ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Ir' }))
    expect(await screen.findByText('Total: 1')).toBeInTheDocument()
    expect(screen.getByLabelText('URL actual')).toHaveTextContent('/staff/eventos/CMF-2026/tickets')
    expect(consultas).toBe(1)
  })

  it('retira la entrada usada y actualiza el total sin recargar', async () => {
    let entradas = [ticket]
    server.use(
      http.get('*/api/events/CMF-2026/tickets/paid', () => HttpResponse.json(entradas)),
      http.get('*/api/events/CMF-2026', () => HttpResponse.json({ ...eventoDePrueba, eventCode: 'CMF-2026' })),
      http.patch('*/api/tickets/TKT-001/use', () => {
        entradas = []
        return HttpResponse.json({ ...ticket, status: 'USED' })
      }),
    )
    mostrarPagina()
    const tabla = await screen.findByRole('table')
    fireEvent.click(within(tabla).getByRole('button', { name: `Usar entrada ${ticket.ticketCode}` }))
    expect(await screen.findByText('Total: 0')).toBeInTheDocument()
    expect(screen.getByText('Este evento no tiene entradas pagadas.')).toBeInTheDocument()
    expect(await screen.findByText(/Ingreso registrado para/)).toHaveTextContent(ticket.ticketCode)
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('conserva la entrada y muestra el conflicto de uso', async () => {
    server.use(
      http.get('*/api/events/CMF-2026/tickets/paid', () => HttpResponse.json([ticket])),
      http.patch('*/api/tickets/TKT-001/use', () => HttpResponse.json({
        timestamp: '2026-11-15T12:00:00', status: 409, error: 'Conflict',
        message: 'El ticket ya fue utilizado.', details: {},
      }, { status: 409 })),
    )
    mostrarPagina()
    const tabla = await screen.findByRole('table')
    fireEvent.click(within(tabla).getByRole('button', { name: `Usar entrada ${ticket.ticketCode}` }))
    expect(await within(tabla).findByRole('alert')).toHaveTextContent('El ticket ya fue utilizado.')
    expect(screen.getByText('Total: 1')).toBeInTheDocument()
    expect(screen.queryByText(/Ingreso registrado para/)).not.toBeInTheDocument()
  })

  it('muestra el estado vacío cuando el evento existe', async () => {
    server.use(
      http.get('*/api/events/CMF-2026/tickets/paid', () => HttpResponse.json([])),
      http.get('*/api/events/CMF-2026', () => HttpResponse.json({ ...eventoDePrueba, eventCode: 'CMF-2026' })),
    )
    mostrarPagina()
    expect(await screen.findByText('Este evento no tiene entradas pagadas.')).toBeInTheDocument()
    expect(screen.getByText('Total: 0')).toBeInTheDocument()
  })

  it('distingue un evento inexistente cuando tickets pagados devuelve una lista vacía', async () => {
    server.use(
      http.get('*/api/events/CMF-2026/tickets/paid', () => HttpResponse.json([])),
      http.get('*/api/events/CMF-2026', () => new HttpResponse(null, { status: 404 })),
    )
    mostrarPagina()

    expect(await screen.findByRole('alert')).toHaveTextContent('Evento no encontrado')
    expect(screen.queryByText('Total: 0')).not.toBeInTheDocument()
  })

  it.each([[403, 'Sin permisos'], [404, 'Evento no encontrado']] as const)('maneja el error %s', async (status, mensaje) => {
    server.use(http.get('*/api/events/CMF-2026/tickets/paid', () => new HttpResponse(null, { status })))
    mostrarPagina()
    expect(await screen.findByRole('alert')).toHaveTextContent(mensaje)
  })
})
