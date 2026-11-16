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
      { index: true, Component: Inicio },
      {
        Component: RutaProtegida,
        children: [
          {
            element: <RutaPorRol roles={['ADMIN']} />,
            children: [
              {
                path: RUTAS.adminEventos,
                lazy: async () => ({
                  Component: (await import('./pages/AdminEventos')).default,
                }),
              },
              {
                path: RUTAS.adminCrearEvento,
                lazy: async () => ({
                  Component: (await import('./pages/AdminCrearEvento')).default,
                }),
              },
              {
                path: RUTAS.adminGestionEvento,
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
                lazy: async () => ({
                  Component: (await import('./pages/ValidacionIngreso')).default,
                }),
              },
              {
                path: RUTAS.buscarTicketsPagados,
                lazy: async () => ({
                  Component: (await import('./pages/TicketsPagadosEvento')).default,
                }),
              },
              {
                path: RUTAS.ticketsPagados,
                lazy: async () => ({
                  Component: (await import('./pages/TicketsPagadosEvento')).default,
                }),
              },
            ],
          },
          {
            path: RUTAS.cuenta,
            lazy: async () => ({
              Component: (await import('./pages/Cuenta')).default,
            }),
          },
          {
            element: <RutaPorRol roles={['USER']} />,
            children: [
              {
                path: RUTAS.misTickets,
                lazy: async () => ({
                  Component: (await import('./pages/MisTickets')).default,
                }),
              },
              {
                path: RUTAS.detalleTicket,
                lazy: async () => ({
                  Component: (await import('./pages/DetalleTicket')).default,
                }),
              },
              {
                path: RUTAS.confirmacionCompra,
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
            lazy: async () => ({
              Component: (await import('./pages/Login')).default,
            }),
          },
          {
            path: RUTAS.registro,
            lazy: async () => ({
              Component: (await import('./pages/Registro')).default,
            }),
          },
        ],
      },
      {
        path: RUTAS.eventos,
        lazy: async () => ({
          Component: (await import('./pages/CatalogoEventos')).default,
        }),
      },
      {
        path: RUTAS.detalleEvento,
        lazy: async () => ({
          Component: (await import('./pages/DetalleEvento')).default,
        }),
      },
      {
        path: RUTAS.artistas,
        lazy: async () => ({
          Component: (await import('./pages/ListaArtistas')).default,
        }),
      },
      {
        path: RUTAS.detalleArtista,
        lazy: async () => ({
          Component: (await import('./pages/DetalleArtista')).default,
        }),
      },
      {
        path: RUTAS.sedes,
        lazy: async () => ({
          Component: (await import('./pages/ListaSedes')).default,
        }),
      },
      {
        path: RUTAS.detalleSede,
        lazy: async () => ({
          Component: (await import('./pages/DetalleSede')).default,
        }),
      },
      {
        path: RUTAS.noEncontrada,
        lazy: async () => ({
          Component: (await import('./pages/NoEncontrada')).default,
        }),
      },
      {
        path: RUTAS.sinPermisos,
        lazy: async () => ({
          Component: (await import('./pages/SinPermisos')).default,
        }),
      },
    ],
  },
])
