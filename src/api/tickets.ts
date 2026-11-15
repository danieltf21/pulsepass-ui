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
