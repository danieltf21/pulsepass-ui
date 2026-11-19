import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../../context/AuthContext'
import { server } from '../../test/mocks/server'
import type { Ticket } from '../../api/tickets.tipos'
import ModalCompra from './ModalCompra'
import { createMemoryRouter, RouterProvider } from 'react-router'
import DetalleEvento from '../../pages/DetalleEvento'
import ConfirmacionCompra from '../../pages/ConfirmacionCompra'
import RutaPorRol from '../../layouts/RutaPorRol'
import { RUTAS } from '../../lib/rutas'
import { eventoDePrueba } from '../../test/mocks/handlers'

const usuario = { id: 1, username: 'comprador', email: 'comprador@example.com', roles: ['USER' as const] }
const ticket: Ticket = {
  id: 1, ticketCode: 'TKT-001', type: 'VIP', price: 150000, status: 'PAID',
  purchaseDate: '2026-11-15T12:00:00', userEmail: usuario.email,
  eventCode: 'CMF-2026', eventName: 'Caribbean Music Fest 2026',
}

function mostrarCompra() {
  const cliente = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  cliente.setQueryData(['auth', 'me'], usuario)
  const onComprado = vi.fn()
  const onCerrar = vi.fn()
  render(
    <QueryClientProvider client={cliente}>
      <AuthContext.Provider value={{
        sesion: { estado: 'autenticada', usuario, accessToken: 'token-prueba', expiraEn: 1_800_000_060_000 },
        iniciarSesion: async () => {}, cerrarSesion: () => {},
      }}>
        <ModalCompra abierto eventCode={ticket.eventCode} nombreEvento={ticket.eventName}
          onComprado={onComprado} onCerrar={onCerrar} />
      </AuthContext.Provider>
    </QueryClientProvider>,
  )
  return { cliente, onComprado, onCerrar }
}

describe('ModalCompra', () => {
  const prototipo = HTMLDialogElement.prototype
  const showModalOriginal = Object.getOwnPropertyDescriptor(prototipo, 'showModal')
  const closeOriginal = Object.getOwnPropertyDescriptor(prototipo, 'close')
  beforeAll(() => {
    // jsdom no implementa el diálogo modal nativo ni su comportamiento de foco.
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

  it('compra el tipo elegido con la identidad de la sesión y conserva la confirmación', async () => {
    const solicitudes: unknown[] = []
    server.use(http.post('*/api/tickets', async ({ request }) => {
      solicitudes.push(await request.json())
      return HttpResponse.json(ticket, { status: 201 })
    }))
    const { cliente, onComprado } = mostrarCompra()
    fireEvent.change(screen.getByLabelText('Tipo de entrada'), { target: { value: 'VIP' } })
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar compra' }))

    await waitFor(() => expect(onComprado).toHaveBeenCalledWith(ticket))
    expect(solicitudes).toEqual([{ userEmail: usuario.email, eventCode: ticket.eventCode, type: 'VIP' }])
    expect(cliente.getQueryData(['ticket', ticket.ticketCode])).toEqual(ticket)
  })

  it('mantiene el formulario abierto tras un conflicto y permite reintentar', async () => {
    server.use(http.post('*/api/tickets', () => HttpResponse.json({
      timestamp: '2026-11-15T12:00:00', status: 409, error: 'Conflict',
      message: 'No quedan entradas disponibles.', details: {},
    }, { status: 409 })))
    const { onComprado, onCerrar } = mostrarCompra()
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar compra' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('No quedan entradas disponibles.')
    expect(screen.getByRole('dialog', { name: 'Comprar entrada' })).toBeInTheDocument()
    expect(onComprado).not.toHaveBeenCalled()
    expect(onCerrar).not.toHaveBeenCalled()

    server.use(http.post('*/api/tickets', () => HttpResponse.json(ticket, { status: 201 })))
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar compra' }))
    await waitFor(() => expect(onComprado).toHaveBeenCalledWith(ticket))
  })

  it('bloquea nuevos envíos y el cierre mientras procesa la compra', async () => {
    let completar!: () => void
    const pendiente = new Promise<void>((resolve) => { completar = resolve })
    const solicitudes = vi.fn()
    server.use(http.post('*/api/tickets', async () => {
      solicitudes()
      await pendiente
      return HttpResponse.json(ticket, { status: 201 })
    }))
    const { onComprado, onCerrar } = mostrarCompra()
    const confirmar = screen.getByRole('button', { name: 'Confirmar compra' })
    try {
      fireEvent.click(confirmar)
      fireEvent.click(confirmar)
      await waitFor(() => expect(solicitudes).toHaveBeenCalledTimes(1))
      expect(screen.getByRole('button', { name: 'Procesando compra…' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Cerrar diálogo' })).toBeDisabled()
      expect(onCerrar).not.toHaveBeenCalled()
    } finally {
      completar()
    }
    await waitFor(() => expect(onComprado).toHaveBeenCalledTimes(1))
  })

  it('completa el recorrido del detalle a la URL de confirmación y actualiza el evento', async () => {
    let consultasEvento = 0
    server.use(
      http.get('*/api/events/CMF-2026', () => {
        consultasEvento += 1
        return HttpResponse.json(eventoDePrueba)
      }),
      http.post('*/api/tickets', () => HttpResponse.json(ticket, { status: 201 })),
      http.get('*/api/tickets/TKT-001', () => HttpResponse.json(ticket)),
    )
    const cliente = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    cliente.setQueryData(['auth', 'me'], usuario)
    const router = createMemoryRouter([
      { path: RUTAS.detalleEvento, Component: DetalleEvento },
      {
        element: <RutaPorRol roles={['USER']} />,
        children: [{ path: RUTAS.confirmacionCompra, Component: ConfirmacionCompra }],
      },
    ], { initialEntries: [RUTAS.evento(ticket.eventCode)] })
    const vista = render(
      <QueryClientProvider client={cliente}>
        <AuthContext.Provider value={{
          sesion: { estado: 'autenticada', usuario, accessToken: 'token-prueba', expiraEn: 1_800_000_060_000 },
          iniciarSesion: async () => {}, cerrarSesion: () => {},
        }}>
          <RouterProvider router={router} />
        </AuthContext.Provider>
      </QueryClientProvider>,
    )
    try {
      fireEvent.click(await screen.findByRole('button', { name: 'Comprar entrada' }))
      expect(screen.getByRole('dialog', { name: 'Comprar entrada' })).toBeInTheDocument()
      fireEvent.change(screen.getByLabelText('Tipo de entrada'), { target: { value: 'VIP' } })
      fireEvent.click(screen.getByRole('button', { name: 'Confirmar compra' }))

      expect(await screen.findByRole('heading', { name: 'Compra confirmada' })).toBeInTheDocument()
      expect(router.state.location.pathname).toBe(RUTAS.compraConfirmada(ticket.ticketCode))
      expect(screen.getByText(ticket.ticketCode)).toBeInTheDocument()
      expect(screen.getByText('Pagado')).toBeInTheDocument()
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(consultasEvento).toBe(2)
    } finally {
      vista.unmount()
      router.dispose()
    }
  })
})
