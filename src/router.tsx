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
            path: RUTAS.cuenta,
            lazy: async () => ({
              Component: (await import('./pages/Cuenta')).default,
            }),
          },
          {
            element: <RutaPorRol roles={['USER']} />,
            children: [
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
