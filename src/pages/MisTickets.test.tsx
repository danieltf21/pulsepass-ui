import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { http, HttpResponse } from 'msw'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Ticket } from '../api/tickets.tipos'
import { AuthContext } from '../context/AuthContext'
import { formatearPrecioCOP } from '../lib/formato'
import { server } from '../test/mocks/server'
import MisTickets from './MisTickets'
import DetalleTicket from './DetalleTicket'
import { RUTAS } from '../lib/rutas'

const email = 'comprador+entradas@example.com'
const ticket: Ticket = {
  id: 1, ticketCode: 'TKT-001', type: 'VIP', price: 150000, status: 'PAID',
  purchaseDate: '2026-11-15T12:00:00', userEmail: email,
  eventCode: 'CMF-2026', eventName: 'Caribbean Music Fest 2026',
}

function mostrarMisTickets(conCacheSesion = true) {
  const cliente = new QueryClient({ defaultOptions: { queries: { retryDelay: 0 } } })
  if (conCacheSesion) cliente.setQueryData(['auth', 'me'], { id: 1, username: 'comprador', email, roles: ['USER'] })
  return render(
    <QueryClientProvider client={cliente}>
      <AuthContext.Provider value={{
        sesion: {
          estado: 'autenticada', accessToken: 'token-prueba', expiraEn: 1_800_000_060_000,
          usuario: { id: 1, username: 'comprador', email, roles: ['USER'] },
        },
        iniciarSesion: async () => {}, cerrarSesion: () => {},
      }}>
        <MemoryRouter initialEntries={[RUTAS.misTickets]}>
          <Routes>
            <Route path={RUTAS.misTickets} element={<MisTickets />} />
            <Route path={RUTAS.detalleTicket} element={<DetalleTicket />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  )
}

describe('MisTickets', () => {
  it('actualiza una entrada usada desde otra sesión sin recargar', async () => {
    let entrada = { ...ticket }
    server.use(http.get('*/api/tickets/by-user', () => HttpResponse.json([entrada])))
    mostrarMisTickets()
    expect(await screen.findByText('Pagado')).toBeInTheDocument()
    // El operador modifica el servidor sin ejecutar una mutación en esta sesión.
    entrada = { ...entrada, status: 'USED' }
    expect(await screen.findByText('Usado', {}, { timeout: 8000 })).toBeInTheDocument()
    expect(screen.queryByText('Pagado')).not.toBeInTheDocument()
  }, 10000)

  const prototipo = HTMLDialogElement.prototype
  const metodos = ['showModal', 'close'] as const
  const originales = metodos.map((nombre) => Object.getOwnPropertyDescriptor(prototipo, nombre))
  beforeAll(() => {
    // jsdom simula apertura/cierre; el foco nativo se comprueba en navegador.
    Object.defineProperty(prototipo, 'showModal', { configurable: true, value: function (this: HTMLDialogElement) { this.open = true } })
    Object.defineProperty(prototipo, 'close', { configurable: true, value: function (this: HTMLDialogElement) { this.open = false } })
  })
  afterAll(() => {
    metodos.forEach((nombre, indice) => {
      const original = originales[indice]
      if (original) Object.defineProperty(prototipo, nombre, original)
      else Reflect.deleteProperty(prototipo, nombre)
    })
  })

  it.each([true, false])('cancela sin recargar con caché de sesión: %s', async (conCacheSesion) => {
    let entrada = { ...ticket }
    let cancelaciones = 0
    server.use(
      http.get('*/api/tickets/by-user', () => HttpResponse.json([entrada])),
      http.patch('*/api/tickets/TKT-001/cancel', () => {
        cancelaciones += 1
        entrada = { ...entrada, status: 'CANCELLED' }
        return HttpResponse.json(entrada)
      }),
    )
    mostrarMisTickets(conCacheSesion)
    expect(await screen.findByText(ticket.ticketCode)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Pagados' }))
    fireEvent.click(screen.getByRole('button', { name: `Cancelar entrada ${ticket.ticketCode}` }))
    expect(screen.getByRole('dialog', { name: 'Cancelar entrada' })).toBeInTheDocument()
    expect(cancelaciones).toBe(0)
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar cancelación' }))
    expect(await screen.findByText('La entrada se canceló correctamente.')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByText(ticket.ticketCode)).not.toBeInTheDocument()
    expect(screen.getByText('No tienes entradas con el estado seleccionado.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pagados' })).toHaveAttribute('aria-pressed', 'true')
    for (const filtro of ['Cancelados', 'Todos']) {
      fireEvent.click(screen.getByRole('button', { name: filtro }))
      expect(screen.getByText(ticket.ticketCode)).toBeInTheDocument()
      expect(screen.getByText('Cancelado')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: `Cancelar entrada ${ticket.ticketCode}` })).not.toBeInTheDocument()
    }
    expect(cancelaciones).toBe(1)
  })

  it('filtra por estado sin volver a consultar y conserva todos los estados en Todos', async () => {
    let consultas = 0
    const entradas = [
      ticket,
      { ...ticket, id: 2, ticketCode: 'TKT-USADO', status: 'USED' },
      { ...ticket, id: 3, ticketCode: 'TKT-CANCELADO', status: 'CANCELLED' },
      { ...ticket, id: 4, ticketCode: 'TKT-RESERVADO', status: 'RESERVED' },
    ]
    server.use(http.get('*/api/tickets/by-user', () => {
      consultas += 1
      return HttpResponse.json(entradas)
    }))
    mostrarMisTickets()
    expect(await screen.findByText(ticket.ticketCode)).toBeInTheDocument()
    const filtros = within(screen.getByRole('group', { name: 'Filtrar entradas por estado' }))
    expect(filtros.getByRole('button', { name: 'Todos' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getAllByRole('listitem')).toHaveLength(4)

    for (const [etiqueta, codigo] of [
      ['Pagados', ticket.ticketCode], ['Usados', 'TKT-USADO'], ['Cancelados', 'TKT-CANCELADO'],
    ] as const) {
      fireEvent.click(filtros.getByRole('button', { name: etiqueta }))
      expect(filtros.getByRole('button', { name: etiqueta })).toHaveAttribute('aria-pressed', 'true')
      expect(filtros.getByRole('button', { name: 'Todos' })).toHaveAttribute('aria-pressed', 'false')
      expect(screen.getAllByRole('listitem')).toHaveLength(1)
      expect(screen.getByText(codigo)).toBeInTheDocument()
    }

    fireEvent.click(filtros.getByRole('button', { name: 'Todos' }))
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
    expect(screen.getByText('TKT-RESERVADO')).toBeInTheDocument()
    expect(consultas).toBe(1)
  })

  it('distingue un filtro sin resultados de una cuenta sin entradas', async () => {
    server.use(http.get('*/api/tickets/by-user', () => HttpResponse.json([ticket])))
    mostrarMisTickets()
    expect(await screen.findByText(ticket.ticketCode)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Cancelados' }))
    expect(screen.getByRole('status')).toHaveTextContent('No tienes entradas con el estado seleccionado.')
    expect(screen.queryByText('Aún no tienes entradas.')).not.toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Todos' }))
    expect(screen.getByText(ticket.ticketCode)).toBeInTheDocument()
  })

  it('actualiza el listado al volver después de cancelar desde el detalle', async () => {
    let entrada = { ...ticket }
    let consultasListado = 0
    server.use(
      http.get('*/api/tickets/by-user', () => {
        consultasListado += 1
        return HttpResponse.json([entrada])
      }),
      http.get('*/api/tickets/TKT-001', () => HttpResponse.json(entrada)),
      http.patch('*/api/tickets/TKT-001/cancel', () => {
        entrada = { ...entrada, status: 'CANCELLED' }
        return HttpResponse.json(entrada)
      }),
    )
    const vista = mostrarMisTickets()
    try {
      expect(await screen.findByText('Pagado')).toBeInTheDocument()
      fireEvent.click(screen.getByRole('link', { name: `Ver entrada ${ticket.ticketCode}` }))
      fireEvent.click(await screen.findByRole('button', { name: 'Cancelar entrada' }))
      fireEvent.click(screen.getByRole('button', { name: 'Confirmar cancelación' }))
      expect(await screen.findByText('La entrada se canceló correctamente.')).toBeInTheDocument()
      fireEvent.click(screen.getByRole('link', { name: 'Volver a Mis tickets' }))
      expect(await screen.findByText('Cancelado')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Mis tickets' })).toBeInTheDocument()
      expect(screen.queryByText('Pagado')).not.toBeInTheDocument()
      expect(consultasListado).toBe(2)
    } finally {
      vista.unmount()
    }
  })

  it('consulta con el correo de la sesión y muestra los datos de las entradas', async () => {
    const correosConsultados: (string | null)[] = []
    server.use(http.get('*/api/tickets/by-user', ({ request }) => {
      correosConsultados.push(new URL(request.url).searchParams.get('email'))
      return HttpResponse.json([ticket])
    }))
    mostrarMisTickets()
    expect(screen.getByRole('status')).toHaveTextContent('Cargando tus entradas')

    expect(await screen.findByRole('heading', { name: ticket.eventName })).toBeInTheDocument()
    expect(correosConsultados).toEqual([email])
    expect(screen.getByText(ticket.ticketCode)).toBeInTheDocument()
    expect(screen.getByText('VIP')).toBeInTheDocument()
    expect(screen.getByText('Pagado')).toBeInTheDocument()
    expect(screen.getByText(formatearPrecioCOP(ticket.price), { normalizer: (texto) => texto })).toBeInTheDocument()
    expect(document.querySelector('time')).toHaveAttribute('dateTime', ticket.purchaseDate)
    expect(screen.getByRole('link', { name: `Ver evento ${ticket.eventName}` })).toHaveAttribute('href', '/eventos/CMF-2026')
  })

  it('invita a explorar eventos cuando la cuenta no tiene entradas', async () => {
    server.use(http.get('*/api/tickets/by-user', () => HttpResponse.json([])))
    mostrarMisTickets()
    expect(await screen.findByText('Aún no tienes entradas.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Explorar eventos' })).toHaveAttribute('href', '/eventos')
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('permite reintentar después de un error del servidor', async () => {
    server.use(http.get('*/api/tickets/by-user', () => new HttpResponse(null, { status: 500 })))
    mostrarMisTickets()
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar tus entradas')
    server.use(http.get('*/api/tickets/by-user', () => HttpResponse.json([ticket])))
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByText(ticket.ticketCode)).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('rechaza una respuesta que no cumple el contrato de tickets', async () => {
    server.use(http.get('*/api/tickets/by-user', () => HttpResponse.json([{ ticketCode: 'INCOMPLETO' }])))
    mostrarMisTickets()
    expect(await screen.findByRole('alert')).toHaveTextContent('La información recibida no tiene el formato esperado.')
    expect(screen.queryByText('INCOMPLETO')).not.toBeInTheDocument()
  })
})
