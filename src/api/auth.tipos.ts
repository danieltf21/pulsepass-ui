import { z } from 'zod'

export const rolSchema = z.enum(['USER', 'STAFF', 'ADMIN'])

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Escribe tu usuario o correo.'),
  password: z.string().min(1, 'Escribe tu contraseña.'),
})

export const registroSchema = z.object({
  username: z.string().trim().min(1, 'Escribe un nombre de usuario.'),
  email: z.email('Escribe un correo válido.'),
  password: z.string()
    .min(12, 'La contraseña debe tener al menos 12 caracteres.')
    .refine((password) => new TextEncoder().encode(password).length <= 72,
      'La contraseña debe ocupar como máximo 72 bytes en UTF-8.'),
  firstName: z.string().trim().min(1, 'Escribe tus nombres.'),
  lastName: z.string().trim().min(1, 'Escribe tus apellidos.'),
  phone: z.string().trim().optional(),
  city: z.string().trim().optional(),
  birthDate: z.iso.date('Escribe una fecha de nacimiento válida.'),
})

// UserResponse es la respuesta al registro; no contiene un token.
export const usuarioRegistradoSchema = z.object({
  id: z.number().int().positive(),
  username: z.string(),
  email: z.email(),
  active: z.boolean(),
  firstName: z.string(),
  lastName: z.string(),
})

export type Registro = z.infer<typeof registroSchema>
export type UsuarioRegistrado = z.infer<typeof usuarioRegistradoSchema>

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
