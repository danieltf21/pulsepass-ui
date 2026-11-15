import { z } from 'zod'

// Contrato VenueResponse del backend.
export const sedeSchema = z.object({
  id: z.number().int().positive(),
  code: z.string(),
  name: z.string(),
  city: z.string(),
  address: z.string(),
  capacity: z.number().int(),
  active: z.boolean(),
})

export const sedesActivasSchema = z.array(sedeSchema)

export type Sede = z.infer<typeof sedeSchema>
