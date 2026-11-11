import { z } from 'zod'

export const estadoEventoSchema = z.enum([
  'DRAFT',
  'PUBLISHED',
  'SOLD_OUT',
  'CANCELLED',
  'FINISHED',
])

// Corresponde al DTO EventSummaryResponse del backend.
export const resumenEventoSchema = z.object({
  eventCode: z.string(),
  name: z.string(),
  status: estadoEventoSchema,
  eventDate: z.iso.datetime({ local: true }),
  venueName: z.string(),
})

export const eventosPublicadosSchema = z.array(resumenEventoSchema)

export type EstadoEvento = z.infer<typeof estadoEventoSchema>
export type ResumenEvento = z.infer<typeof resumenEventoSchema>
