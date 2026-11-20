import { z } from 'zod'

// Contrato ArtistResponse del backend.
export const artistaSchema = z.object({
  id: z.number().int().positive(),
  stageName: z.string(),
  country: z.string().nullable(),
  genre: z.string().nullable(),
  active: z.boolean(),
})

export const artistasActivosSchema = z.array(artistaSchema)

export type Artista = z.infer<typeof artistaSchema>
