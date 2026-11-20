import { useMutation } from '@tanstack/react-query'
import { registrarUsuario } from '../api/auth'
import type { Registro } from '../api/auth.tipos'
import { useAvisosMutacion } from './useAvisosMutacion'

export function useRegistro() {
  const avisos = useAvisosMutacion('Cuenta creada. Inicia sesión.')
  return useMutation({
    mutationFn: (datos: Registro) => registrarUsuario(datos),
    retry: false,
    onSuccess: avisos.exito,
    onError: avisos.error,
  })
}
