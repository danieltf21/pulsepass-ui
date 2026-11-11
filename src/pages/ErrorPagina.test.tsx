import { render, screen } from '@testing-library/react'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { describe, expect, it } from 'vitest'
import ErrorPagina from './ErrorPagina'

describe('ErrorPagina', () => {
  it('muestra un mensaje seguro cuando falla una ruta sin exponer detalles internos', async () => {
    const errorInterno = new Error('Información privada del servidor')
    errorInterno.stack = 'STACK_INTERNO_PRIVADO'
    const router = createMemoryRouter([
      {
        path: '/',
        loader: () => { throw errorInterno },
        element: <p>Contenido de la página</p>,
        hydrateFallbackElement: <p>Cargando página…</p>,
        errorElement: <ErrorPagina />,
      },
    ])

    render(<RouterProvider router={router} />)

    expect(await screen.findByRole('heading', { name: 'No se pudo mostrar la página' }))
      .toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Ocurrió un error inesperado.')
    expect(screen.queryByText('Información privada del servidor')).not.toBeInTheDocument()
    expect(screen.queryByText('STACK_INTERNO_PRIVADO')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Recargar página' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/')
  })
})
