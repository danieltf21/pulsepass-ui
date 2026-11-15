import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UsuarioAutenticado } from '../api/auth.tipos'
import { ApiError } from '../api/http'
import { comprarTicket, obtenerTicket } from '../api/tickets'
import type { FormularioCompra } from '../api/tickets.tipos'
import { useAuth } from './useAuth'

export function useComprarTicket(eventCode: string) {
  const { sesion } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ type }: FormularioCompra) => {
      if (sesion.estado !== 'autenticada') {
        throw new ApiError(401, 'Debes iniciar sesión para comprar una entrada.')
      }
      if (!sesion.usuario.roles.includes('USER')) {
        throw new ApiError(403, 'Tu cuenta no tiene permisos para comprar entradas.')
      }

      return comprarTicket({ userEmail: sesion.usuario.email, eventCode, type })
    },
    retry: false,
    onSuccess: async (ticket) => {
      // Una compra iniciada antes de salir no debe repoblar la caché de otra sesión.
      const usuarioActual = queryClient.getQueryData<UsuarioAutenticado>(['auth', 'me'])
      if (sesion.estado !== 'autenticada' || usuarioActual?.id !== sesion.usuario.id) return

      queryClient.setQueryData(['ticket', ticket.ticketCode], ticket)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tickets', 'usuario', sesion.usuario.email] }),
        queryClient.invalidateQueries({ queryKey: ['evento', eventCode] }),
        queryClient.invalidateQueries({ queryKey: ['eventos', 'publicados'] }),
      ])
    },
  })
}

export function useTicket(ticketCode: string) {
  const { sesion } = useAuth()

  return useQuery({
    queryKey: ['ticket', ticketCode],
    queryFn: ({ signal }) => obtenerTicket(ticketCode, signal),
    enabled: sesion.estado === 'autenticada' && ticketCode.trim().length > 0,
    retry: (intentosFallidos, error) => error instanceof ApiError && intentosFallidos < 1
      && (error.status === 0 || (error.status >= 500 && error.status < 600)),
  })
}
