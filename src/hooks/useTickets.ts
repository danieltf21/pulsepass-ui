import { useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UsuarioAutenticado } from '../api/auth.tipos'
import { ApiError } from '../api/http'
import { cancelarTicket, comprarTicket, obtenerTicket, obtenerTicketsPorUsuario } from '../api/tickets'
import type { FormularioCompra, Ticket } from '../api/tickets.tipos'
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

export function useMisTickets() {
  const { sesion } = useAuth()
  const email = sesion.estado === 'autenticada' ? sesion.usuario.email : ''

  return useQuery({
    queryKey: ['tickets', 'usuario', email],
    queryFn: ({ signal }) => {
      // También protege una llamada manual a refetch cuando la consulta está deshabilitada.
      if (sesion.estado !== 'autenticada') {
        throw new ApiError(401, 'Debes iniciar sesión para consultar tus entradas.')
      }
      if (!sesion.usuario.roles.includes('USER')) {
        throw new ApiError(403, 'Tu cuenta no tiene permisos para consultar Mis tickets.')
      }
      return obtenerTicketsPorUsuario(email, signal)
    },
    enabled: sesion.estado === 'autenticada' && sesion.usuario.roles.includes('USER'),
    retry: (intentosFallidos, error) => error instanceof ApiError && intentosFallidos < 1
      && (error.status === 0 || (error.status >= 500 && error.status < 600)),
  })
}

export function useCancelarTicket(ticketCode: string) {
  const { sesion } = useAuth()
  const queryClient = useQueryClient()
  const sesionActual = useRef(sesion)
  useEffect(() => { sesionActual.current = sesion }, [sesion])

  return useMutation({
    mutationFn: () => {
      if (sesion.estado !== 'autenticada') {
        throw new ApiError(401, 'Debes iniciar sesión para cancelar una entrada.')
      }
      if (!sesion.usuario.roles.includes('USER')) {
        throw new ApiError(403, 'Tu cuenta no tiene permisos para cancelar entradas.')
      }
      if (!ticketCode.trim()) {
        throw new ApiError(400, 'El código de la entrada no es válido.')
      }
      return cancelarTicket(ticketCode)
    },
    retry: false,
    onSuccess: async (ticket) => {
      const actual = sesionActual.current
      if (sesion.estado !== 'autenticada' || actual.estado !== 'autenticada'
        || actual.accessToken !== sesion.accessToken || actual.usuario.id !== sesion.usuario.id) return

      // Evita que una consulta anterior sobrescriba el estado recién cancelado.
      const claveListado = ['tickets', 'usuario', sesion.usuario.email]
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['ticket', ticketCode], exact: true }),
        queryClient.cancelQueries({ queryKey: claveListado, exact: true }),
      ])
      const trasCancelar = sesionActual.current
      if (trasCancelar.estado !== 'autenticada' || trasCancelar.accessToken !== sesion.accessToken
        || trasCancelar.usuario.id !== sesion.usuario.id) return

      queryClient.setQueryData(['ticket', ticketCode], ticket)
      queryClient.setQueryData<Ticket[]>(claveListado, (entradas) =>
        entradas?.map((entrada) => entrada.ticketCode === ticketCode ? ticket : entrada),
      )
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tickets', 'usuario', sesion.usuario.email] }),
        queryClient.invalidateQueries({ queryKey: ['evento', ticket.eventCode] }),
        queryClient.invalidateQueries({ queryKey: ['eventos', 'publicados'] }),
      ])
    },
  })
}
