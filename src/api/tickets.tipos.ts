import { z } from 'zod'

export const tipoTicketSchema = z.enum(['GENERAL', 'VIP', 'BACKSTAGE', 'STUDENT'])
export const estadoTicketSchema = z.enum(['RESERVED', 'PAID', 'CANCELLED', 'USED'])

// El formulario solo elige el tipo; la identidad se toma de la sesión.
export const formularioCompraSchema = z.object({
  type: tipoTicketSchema,
})

// PurchaseTicketRequest no admite un precio: lo determina el backend.
export const compraTicketSchema = z.object({
  userEmail: z.email(),
  eventCode: z.string().trim().min(1),
  type: tipoTicketSchema,
})

export const ticketSchema = z.object({
  id: z.number().int().positive(),
  ticketCode: z.string(),
  type: tipoTicketSchema,
  price: z.number(),
  status: estadoTicketSchema,
  purchaseDate: z.iso.datetime({ local: true }),
  userEmail: z.email(),
  eventCode: z.string(),
  eventName: z.string(),
})

export type TipoTicket = z.infer<typeof tipoTicketSchema>
export type EstadoTicket = z.infer<typeof estadoTicketSchema>
export type FormularioCompra = z.infer<typeof formularioCompraSchema>
export type CompraTicket = z.infer<typeof compraTicketSchema>
export type Ticket = z.infer<typeof ticketSchema>
