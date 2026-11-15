import { useMutation } from '@tanstack/react-query'
import { registrarUsuario } from '../api/auth'
import type { Registro } from '../api/auth.tipos'

export function useRegistro() {
  return useMutation({
    mutationFn: (datos: Registro) => registrarUsuario(datos),
    retry: false,
  })
}
