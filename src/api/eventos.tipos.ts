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

export const categoriaEventoSchema = z.enum([
  'MUSIC',
  'SPORTS',
  'TECHNOLOGY',
  'EDUCATION',
  'CULTURE',
  'ENTERTAINMENT',
])

// ArtistResponse: país y género pueden ser null en el backend.
export const artistaEventoSchema = z.object({
  id: z.number().int().positive(),
  stageName: z.string(),
  country: z.string().nullable(),
  genre: z.string().nullable(),
  active: z.boolean(),
})

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
