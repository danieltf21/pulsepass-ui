import { createBrowserRouter } from 'react-router'
import Inicio from './pages/Inicio'
import { RUTAS } from './lib/rutas'
import Layout from './layouts/Layout'
import ErrorPagina from './pages/ErrorPagina'

export const router = createBrowserRouter([
  {
    path: RUTAS.inicio,
    Component: Layout,
    errorElement: <ErrorPagina />,
    children: [
      { index: true, Component: Inicio },
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
        path: RUTAS.noEncontrada,
        lazy: async () => ({
          Component: (await import('./pages/NoEncontrada')).default,
        }),
      },
    ],
  },
])
