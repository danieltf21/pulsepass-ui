import { z } from 'zod'
import { artistaSchema } from './artistas.tipos'

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

export const categoriaEventoSchema = z.enum([
  'MUSIC',
  'SPORTS',
  'TECHNOLOGY',
  'EDUCATION',
  'CULTURE',
  'ENTERTAINMENT',
])

// Los artistas del evento usan el mismo contrato ArtistResponse.
export const artistaEventoSchema = artistaSchema

// EventResponse comparte los campos del resumen y añade el detalle.
export const detalleEventoSchema = resumenEventoSchema.extend({
  id: z.number().int().positive(),
  description: z.string().nullable(),
  category: categoriaEventoSchema,
  minimumAge: z.number().int().nonnegative(),
  venueCode: z.string(),
  artists: z.array(artistaEventoSchema),
})

export type EstadoEvento = z.infer<typeof estadoEventoSchema>
export type ResumenEvento = z.infer<typeof resumenEventoSchema>
export type CategoriaEvento = z.infer<typeof categoriaEventoSchema>
export type ArtistaEvento = z.infer<typeof artistaEventoSchema>
export type DetalleEvento = z.infer<typeof detalleEventoSchema>
