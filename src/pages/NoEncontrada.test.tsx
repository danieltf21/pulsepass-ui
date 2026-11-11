import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import NoEncontrada from './NoEncontrada'

describe('NoEncontrada', () => {
  it('explica que la dirección no existe y ofrece volver al inicio', () => {
    render(
      <MemoryRouter>
        <NoEncontrada />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Página no encontrada' }))
      .toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Explorar eventos' })).toHaveAttribute('href', '/eventos')
  })
})
