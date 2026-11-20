import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import { RouterProvider } from 'react-router/dom'
import { expect, it } from 'vitest'
import AuthProvider from './context/AuthProvider'

it('muestra la página 404 al abrir una URL desconocida', async () => {
  const urlAnterior = window.location.href
  const estadoAnterior = window.history.state
  const tituloAnterior = document.title
  const rutaDesconocida = '/ruta-inexistente/subpagina?origen=prueba#detalle'
  window.history.replaceState(null, '', rutaDesconocida)

  const { router } = await import('./router')
  const cliente = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const vista = render(
    <QueryClientProvider client={cliente}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>,
  )

  try {
    expect(await screen.findByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument()
    expect(screen.getByText('ERROR 404')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Explorar eventos' })).toHaveAttribute('href', '/eventos')
    const { pathname, search, hash } = router.state.location
    expect(pathname + search + hash).toBe(rutaDesconocida)
    await waitFor(() => expect(document.title).toBe('Página no encontrada | PulsePass'))

    await act(() => router.navigate('/403'))
    await waitFor(() => expect(document.title).toBe('Acceso denegado | PulsePass'))
  } finally {
    vista.unmount()
    router.dispose()
    cliente.clear()
    window.history.replaceState(estadoAnterior, '', urlAnterior)
    document.title = tituloAnterior
  }
})
