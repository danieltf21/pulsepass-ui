import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { server } from '../test/mocks/server'
import ListaSedes from './ListaSedes'

function mostrarSedes() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retryDelay: 0 } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter><ListaSedes /></MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ListaSedes', () => {
  it('muestra las sedes activas y el enlace a su detalle', async () => {
    mostrarSedes()

    expect(await screen.findByRole('heading', { level: 2, name: 'Marina Convention Center' }))
      .toBeInTheDocument()
    expect(screen.getByText('Santa Marta')).toBeInTheDocument()
    expect(screen.getByText('3 personas')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver sede Marina Convention Center' }))
      .toHaveAttribute('href', '/sedes/VEN-SMR-01')
  })

  it('indica que está cargando las sedes', () => {
    mostrarSedes()

    expect(screen.getByRole('status')).toHaveTextContent('Cargando sedes')
  })

  it('muestra el estado vacío si no hay sedes activas', async () => {
    server.use(http.get('*/api/venues/active', () => HttpResponse.json([])))
    mostrarSedes()

    expect(await screen.findByText('Aún no hay sedes activas.')).toBeInTheDocument()
  })

  it('permite recuperar el listado después de un error', async () => {
    server.use(http.get('*/api/venues/active', () => new HttpResponse(null, { status: 500 })))
    const usuario = userEvent.setup()
    mostrarSedes()

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar las sedes')
    server.resetHandlers()
    await usuario.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(await screen.findByRole('heading', { name: 'Marina Convention Center' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
