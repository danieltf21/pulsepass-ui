import { useQuery } from '@tanstack/react-query'
import { ApiError } from '../api/http'
import { obtenerUsuarioPorCorreo, obtenerUsuarioPorNombre } from '../api/usuarios'
import { reintentarConsulta } from './reintentarConsulta'
import { useAuth } from './useAuth'

export function useMiCuenta(criterio: 'email' | 'username' = 'email') {
  const { sesion } = useAuth()
  const usuario = sesion.estado === 'autenticada' ? sesion.usuario : null

  return useQuery({
    queryKey: ['usuario', 'cuenta', usuario?.id ?? null, criterio],
    enabled: usuario !== null,
    queryFn: ({ signal }) => {
      if (usuario === null) throw new ApiError(401, 'Debes iniciar sesión para continuar.')

      return criterio === 'email'
        ? obtenerUsuarioPorCorreo(usuario.email, signal)
        : obtenerUsuarioPorNombre(usuario.username, signal)
    },
    retry: reintentarConsulta,
  })
}
