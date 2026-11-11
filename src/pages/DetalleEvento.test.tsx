import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../test/mocks/server'
import { eventoDePrueba } from '../test/mocks/handlers'
import DetalleEvento from './DetalleEvento'

function mostrarDetalle(codigo: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 0 } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/eventos/${codigo}`]}>
        <Routes>
          <Route path="/eventos/:eventCode" element={<DetalleEvento />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('DetalleEvento', () => {
  it('muestra el estado de carga mientras espera los datos', () => {
    mostrarDetalle('CMF-2026')

    expect(screen.getByRole('status')).toHaveTextContent('Cargando evento')
  })

  it('muestra un error con opción de reintento cuando falla el servidor', async () => {
    server.use(http.get('*/api/events/CMF-2026', () => new HttpResponse(null, { status: 500 })))
    mostrarDetalle('CMF-2026')

    expect(await screen.findByRole('heading', { name: 'No se pudo cargar el evento' }))
      .toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeEnabled()
  })

  it('informa que aún no hay artistas anunciados cuando la lista está vacía', async () => {
    server.use(http.get('*/api/events/CMF-2026', () => HttpResponse.json({
      ...eventoDePrueba,
      artists: [],
    })))
    mostrarDetalle('CMF-2026')

    expect(await screen.findByText('Aún no hay artistas anunciados.')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument()
  })
  it('muestra información del evento y sus artistas', async () => {
    mostrarDetalle('CMF-2026')

    expect(await screen.findByRole('heading', {
      level: 1,
      name: 'Caribbean Music Fest 2026',
    })).toBeInTheDocument()
    expect(screen.getByText('Marina Convention Center (VEN-SMR-01)')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Solar Beat' })).toBeInTheDocument()
    expect(screen.getByText('Electrónica')).toBeInTheDocument()
  })

  it('muestra un estado no disponible cuando el backend devuelve 404', async () => {
    mostrarDetalle('EVENTO-INEXISTENTE')

    expect(await screen.findByRole('heading', {
      level: 1,
      name: 'Evento no disponible',
    })).toBeInTheDocument()
    expect(screen.getByText('El evento no existe o no está disponible para consultar.'))
      .toBeInTheDocument()
  })
})
