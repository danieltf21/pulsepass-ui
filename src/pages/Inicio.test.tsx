import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import Inicio from './Inicio'

function mostrarInicio() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Inicio />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('Inicio', () => {
  it('presenta la cartelera y enlaza a todos los eventos', async () => {
    mostrarInicio()

    expect(screen.getByRole('heading', { level: 1, name: 'Descubre los mejores eventos' }))
      .toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver cartelera' })).toHaveAttribute('href', '/eventos')
    expect(screen.getByRole('link', { name: 'Ver todos los eventos' })).toHaveAttribute('href', '/eventos')
    expect(await screen.findByRole('heading', {
      level: 2,
      name: 'Próximos eventos',
    })).toBeInTheDocument()
    expect(await screen.findByRole('heading', {
      level: 2,
      name: 'Caribbean Music Fest 2026',
    })).toBeInTheDocument()
  })

  it('muestra el estado de carga mientras espera la cartelera', () => {
    mostrarInicio()

    expect(screen.getByRole('status')).toHaveTextContent('Cargando eventos')
  })
})
