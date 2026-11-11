import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { server } from '../test/mocks/server'
import DetalleArtista from './DetalleArtista'

function mostrarPerfil(id: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retryDelay: 0 } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/artistas/${id}`]}>
        <Routes>
          <Route path="/artistas/:id" element={<DetalleArtista />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('DetalleArtista', () => {
  it('muestra el perfil y los eventos asociados al artista', async () => {
    mostrarPerfil('1')

    expect(await screen.findByRole('heading', { level: 1, name: 'Solar Beat' })).toBeInTheDocument()
    expect(screen.getByText('Colombia')).toBeInTheDocument()
    expect(screen.getByText('Electrónica')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver a artistas' })).toHaveAttribute('href', '/artistas')
  })

  it.each(['abc', '0', '-1', '1.5', '9007199254740992'])(
    'muestra 404 sin llamar a la API para el ID inválido %s', async (id) => {
      const peticiones = vi.spyOn(globalThis, 'fetch')
      mostrarPerfil(id)

      expect(await screen.findByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument()
      expect(peticiones).not.toHaveBeenCalled()
    },
  )

  it('muestra 404 cuando el artista no existe', async () => {
    mostrarPerfil('999')

    expect(await screen.findByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument()
  })

  it('muestra un estado vacío cuando el artista no tiene eventos', async () => {
    server.use(http.get('*/api/events/by-artist', () => HttpResponse.json([])))
    mostrarPerfil('1')

    expect(await screen.findByText('No hay eventos disponibles para este artista.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Solar Beat' })).toBeInTheDocument()
  })

  it('conserva el perfil si falla la consulta de sus eventos', async () => {
    server.use(http.get('*/api/events/by-artist', () => new HttpResponse(null, { status: 500 })))
    mostrarPerfil('1')

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar los eventos del artista.')
    expect(screen.getByRole('heading', { name: 'Solar Beat' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeEnabled()
  })
})
