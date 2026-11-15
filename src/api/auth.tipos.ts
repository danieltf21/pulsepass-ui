import { z } from 'zod'

export const rolSchema = z.enum(['USER', 'STAFF', 'ADMIN'])

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Escribe tu usuario o correo.'),
  password: z.string().min(1, 'Escribe tu contraseña.'),
})

// AuthResponse: expiresIn es una duración en segundos, no una fecha.
export const respuestaLoginSchema = z.object({
  accessToken: z.string().min(1),
  tokenType: z.literal('Bearer'),
  expiresIn: z.number().int().positive(),
})

// Los permisos proceden de /auth/me, no de decodificar el JWT.
export const usuarioAutenticadoSchema = z.object({
  id: z.number().int().positive(),
  username: z.string(),
  email: z.email(),
  roles: z.array(rolSchema),
})

export type Rol = z.infer<typeof rolSchema>
export type Login = z.infer<typeof loginSchema>
export type RespuestaLogin = z.infer<typeof respuestaLoginSchema>
export type UsuarioAutenticado = z.infer<typeof usuarioAutenticadoSchema>

// expiraEn es un instante en milisegundos, calculado a partir de expiresIn.
export const sesionGuardadaSchema = z.object({
  accessToken: z.string().min(1),
  expiraEn: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
})

export type SesionGuardada = z.infer<typeof sesionGuardadaSchema>

export type Sesion =
  | { estado: 'cargando' }
  | { estado: 'anonima'; motivo?: 'expirada' }
  | {
      estado: 'autenticada'
      usuario: UsuarioAutenticado
      accessToken: string
      expiraEn: number
    }
