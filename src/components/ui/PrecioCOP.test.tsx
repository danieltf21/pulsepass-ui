import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PrecioCOP from './PrecioCOP'

describe('PrecioCOP', () => {
  it('muestra 250000 como moneda colombiana', () => {
    render(<PrecioCOP valor={250000} />)

    expect(screen.getByText(/^\$\s250\.000(?:,00)?$/)).toBeInTheDocument()
  })
})
