import { createBrowserRouter } from 'react-router'
import Inicio from './pages/Inicio'
import { RUTAS } from './lib/rutas'
import Layout from './layouts/Layout'
import ErrorPagina from './pages/ErrorPagina'
import SoloAnonimo from './layouts/SoloAnonimo'
import RutaProtegida from './layouts/RutaProtegida'
import RutaPorRol from './layouts/RutaPorRol'

export const router = createBrowserRouter([
  {
    path: RUTAS.inicio,
    Component: Layout,
    errorElement: <ErrorPagina />,
    children: [
      { index: true, Component: Inicio, handle: { titulo: 'Inicio' } },
      {
        Component: RutaProtegida,
        children: [
          {
            element: <RutaPorRol roles={['ADMIN']} />,
            children: [
              {
                path: RUTAS.adminEventos,
                handle: { titulo: 'Administración de eventos' },
                lazy: async () => ({
                  Component: (await import('./pages/AdminEventos')).default,
                }),
              },
              {
                path: RUTAS.adminCrearEvento,
                handle: { titulo: 'Nuevo evento' },
                lazy: async () => ({
                  Component: (await import('./pages/AdminCrearEvento')).default,
                }),
              },
              {
                path: RUTAS.adminGestionEvento,
                handle: { titulo: 'Gestión de evento' },
                lazy: async () => ({
                  Component: (await import('./pages/AdminGestionEvento')).default,
                }),
              },
            ],
          },
          {
            element: <RutaPorRol roles={['STAFF', 'ADMIN']} />,
            children: [
              {
                path: RUTAS.validacionIngreso,
                handle: { titulo: 'Validación de ingreso' },
                lazy: async () => ({
                  Component: (await import('./pages/ValidacionIngreso')).default,
                }),
              },
              {
                path: RUTAS.buscarTicketsPagados,
                handle: { titulo: 'Buscar tickets pagados' },
                lazy: async () => ({
                  Component: (await import('./pages/TicketsPagadosEvento')).default,
                }),
              },
              {
                path: RUTAS.ticketsPagados,
                handle: { titulo: 'Tickets pagados' },
                lazy: async () => ({
                  Component: (await import('./pages/TicketsPagadosEvento')).default,
                }),
              },
            ],
          },
          {
            path: RUTAS.cuenta,
            handle: { titulo: 'Mi cuenta' },
            lazy: async () => ({
              Component: (await import('./pages/Cuenta')).default,
            }),
          },
          {
            element: <RutaPorRol roles={['USER']} />,
            children: [
              {
                path: RUTAS.misTickets,
                handle: { titulo: 'Mis tickets' },
                lazy: async () => ({
                  Component: (await import('./pages/MisTickets')).default,
                }),
              },
              {
                path: RUTAS.detalleTicket,
                handle: { titulo: 'Detalle de entrada' },
                lazy: async () => ({
                  Component: (await import('./pages/DetalleTicket')).default,
                }),
              },
              {
                path: RUTAS.confirmacionCompra,
                handle: { titulo: 'Compra confirmada' },
                lazy: async () => ({
                  Component: (await import('./pages/ConfirmacionCompra')).default,
                }),
              },
            ],
          },
        ],
      },
      {
        Component: SoloAnonimo,
        children: [
          {
            path: RUTAS.login,
            handle: { titulo: 'Iniciar sesión' },
            lazy: async () => ({
              Component: (await import('./pages/Login')).default,
            }),
          },
          {
            path: RUTAS.registro,
            handle: { titulo: 'Crear cuenta' },
            lazy: async () => ({
              Component: (await import('./pages/Registro')).default,
            }),
          },
        ],
      },
      {
        path: RUTAS.eventos,
        handle: { titulo: 'Cartelera de eventos' },
        lazy: async () => ({
          Component: (await import('./pages/CatalogoEventos')).default,
        }),
      },
      {
        path: RUTAS.detalleEvento,
        handle: { titulo: 'Detalle de evento' },
        lazy: async () => ({
          Component: (await import('./pages/DetalleEvento')).default,
        }),
      },
      {
        path: RUTAS.artistas,
        handle: { titulo: 'Artistas' },
        lazy: async () => ({
          Component: (await import('./pages/ListaArtistas')).default,
        }),
      },
      {
        path: RUTAS.detalleArtista,
        handle: { titulo: 'Perfil de artista' },
        lazy: async () => ({
          Component: (await import('./pages/DetalleArtista')).default,
        }),
      },
      {
        path: RUTAS.sedes,
        handle: { titulo: 'Sedes' },
        lazy: async () => ({
          Component: (await import('./pages/ListaSedes')).default,
        }),
      },
      {
        path: RUTAS.detalleSede,
        handle: { titulo: 'Detalle de sede' },
        lazy: async () => ({
          Component: (await import('./pages/DetalleSede')).default,
        }),
      },
      {
        path: RUTAS.noEncontrada,
        handle: { titulo: 'Página no encontrada' },
        lazy: async () => ({
          Component: (await import('./pages/NoEncontrada')).default,
        }),
      },
      {
        path: RUTAS.sinPermisos,
        handle: { titulo: 'Acceso denegado' },
        lazy: async () => ({
          Component: (await import('./pages/SinPermisos')).default,
        }),
      },
    ],
  },
])
