import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { server } from '../test/mocks/server'
import DetalleSede from './DetalleSede'

function mostrarSede(code: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retryDelay: 0 } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/sedes/${encodeURIComponent(code)}`]}>
        <Routes>
          <Route path="/sedes/:code" element={<DetalleSede />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('DetalleSede', () => {
  it('muestra los datos y permite volver al listado', async () => {
    mostrarSede('VEN-SMR-01')

    expect(await screen.findByRole('heading', { name: 'Marina Convention Center' })).toBeInTheDocument()
    expect(screen.getByText('Santa Marta')).toBeInTheDocument()
    expect(screen.getByText('Avenida del Puerto 10')).toBeInTheDocument()
    expect(screen.getByText('3 personas')).toBeInTheDocument()
    expect(screen.getByText('Activa')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver a sedes' })).toHaveAttribute('href', '/sedes')
  })

  it('muestra la carga mientras espera la respuesta', () => {
    mostrarSede('VEN-SMR-01')

    expect(screen.getByRole('status')).toHaveTextContent('Cargando sede')
  })

  it('muestra 404 para una sede inexistente', async () => {
    mostrarSede('NO-EXISTE')

    expect(await screen.findByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument()
  })

  it('rechaza un código demasiado largo sin consultar la API', async () => {
    const peticiones = vi.spyOn(globalThis, 'fetch')
    mostrarSede('X'.repeat(51))

    expect(await screen.findByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument()
    expect(peticiones).not.toHaveBeenCalled()
  })

  it('ofrece reintentar cuando falla el servidor', async () => {
    server.use(http.get('*/api/venues/VEN-SMR-01', () => new HttpResponse(null, { status: 500 })))
    mostrarSede('VEN-SMR-01')

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar la sede')
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeEnabled()
  })
})
