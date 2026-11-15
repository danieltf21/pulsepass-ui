import { createContext } from 'react'
import type { Login, Sesion } from '../api/auth.tipos'

export interface AuthContextValue {
  sesion: Sesion
  iniciarSesion: (credenciales: Login) => Promise<void>
  cerrarSesion: (motivo?: 'expirada') => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
