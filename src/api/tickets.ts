import { compraTicketSchema, ticketSchema, type CompraTicket, type Ticket } from './tickets.tipos'
import { http, validarRespuesta } from './http'

export async function comprarTicket(datos: CompraTicket): Promise<Ticket> {
  const compra = compraTicketSchema.parse(datos)
  const respuesta = await http('/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(compra),
  })

  return validarRespuesta(ticketSchema, respuesta, 201)
}

export async function obtenerTicket(ticketCode: string, signal?: AbortSignal): Promise<Ticket> {
  const respuesta = await http(`/tickets/${encodeURIComponent(ticketCode)}`, { signal })

  return validarRespuesta(ticketSchema, respuesta)
}

export async function obtenerTicketsPorUsuario(email: string, signal?: AbortSignal): Promise<Ticket[]> {
  const parametros = new URLSearchParams({ email })
  const respuesta = await http(`/tickets/by-user?${parametros}`, { signal })

  return validarRespuesta(ticketSchema.array(), respuesta)
}

export async function cancelarTicket(ticketCode: string): Promise<Ticket> {
  const respuesta = await http(`/tickets/${encodeURIComponent(ticketCode)}/cancel`, {
    method: 'PATCH',
  })

  return validarRespuesta(ticketSchema, respuesta)
}

export async function marcarTicketUsado(ticketCode: string): Promise<Ticket> {
  const respuesta = await http(`/tickets/${encodeURIComponent(ticketCode)}/use`, {
    method: 'PATCH',
  })

  return validarRespuesta(ticketSchema, respuesta)
}

export async function obtenerTicketsPagadosPorEvento(eventCode: string, signal?: AbortSignal): Promise<Ticket[]> {
  const respuesta = await http(`/events/${encodeURIComponent(eventCode)}/tickets/paid`, { signal })

  return validarRespuesta(ticketSchema.array(), respuesta)
}
