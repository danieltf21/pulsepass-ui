import { z } from 'zod'
import { artistaSchema } from './artistas.tipos'

export const estadoEventoSchema = z.enum([
  'DRAFT',
  'PUBLISHED',
  'SOLD_OUT',
  'CANCELLED',
  'FINISHED',
])

export const categoriaEventoSchema = z.enum([
  'MUSIC',
  'SPORTS',
  'TECHNOLOGY',
  'EDUCATION',
  'CULTURE',
  'ENTERTAINMENT',
])

// EventSummaryResponse incluye category desde el cambio backend 27e0c68.
export const resumenEventoSchema = z.object({
  eventCode: z.string(),
  name: z.string(),
  category: categoriaEventoSchema,
  status: estadoEventoSchema,
  eventDate: z.iso.datetime({ local: true }),
  venueName: z.string(),
})

export const eventosPublicadosSchema = z.array(resumenEventoSchema)

// Los artistas del evento usan el mismo contrato ArtistResponse.
export const artistaEventoSchema = artistaSchema

// EventResponse comparte los campos del resumen y añade el detalle.
export const detalleEventoSchema = resumenEventoSchema.extend({
  id: z.number().int().positive(),
  description: z.string().nullable(),
  minimumAge: z.number().int().nonnegative(),
  venueCode: z.string(),
  artists: z.array(artistaEventoSchema),
})

// CreateEventRequest: el estado inicial lo determina el backend.
export const crearEventoSchema = z.object({
  eventCode: z.string().trim().min(1, 'Escribe el código del evento.'),
  name: z.string().trim().min(1, 'Escribe el nombre del evento.'),
  description: z.string().max(1000, 'La descripción admite como máximo 1000 caracteres.').optional(),
  category: categoriaEventoSchema,
  eventDate: z.iso.datetime({ local: true, message: 'Escribe una fecha y hora válidas.' }),
  minimumAge: z.number({ message: 'Escribe una edad mínima válida.' })
    .int('La edad mínima debe ser un número entero.')
    .nonnegative('La edad mínima no puede ser negativa.'),
  venueCode: z.string().trim().min(1, 'Selecciona una sede.'),
})

export type EstadoEvento = z.infer<typeof estadoEventoSchema>
export type ResumenEvento = z.infer<typeof resumenEventoSchema>
export type CategoriaEvento = z.infer<typeof categoriaEventoSchema>
export type ArtistaEvento = z.infer<typeof artistaEventoSchema>
export type DetalleEvento = z.infer<typeof detalleEventoSchema>
export type CrearEvento = z.infer<typeof crearEventoSchema>
