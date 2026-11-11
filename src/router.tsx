import { createBrowserRouter } from 'react-router'
import App from './App'
import { RUTAS } from './lib/rutas'
import Layout from './layouts/Layout'

export const router = createBrowserRouter([
  {
    path: RUTAS.inicio,
    Component: Layout,
    children: [
      { index: true, Component: App },
      { path: RUTAS.eventos, Component: App },
      {
        path: RUTAS.detalleEvento,
        lazy: async () => ({
          Component: (await import('./pages/DetalleEvento')).default,
        }),
      },
    ],
  },
])
