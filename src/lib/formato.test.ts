import { describe, expect, it } from 'vitest'
import { formatearFecha, formatearPrecioCOP } from './formato'

describe('formato es-CO', () => {
  it('formatea 250000 como pesos colombianos', () => {
    const precio = formatearPrecioCOP(250000).replace(/\s/g, ' ')

    expect(precio).toMatch(/^\$ 250\.000(?:,00)?$/)
  })

  it('formatea cero como pesos colombianos', () => {
    const precio = formatearPrecioCOP(0).replace(/\s/g, ' ')

    expect(precio).toMatch(/^\$ 0(?:,00)?$/)
  })

  it('presenta en español una fecha local sin depender del día actual', () => {
    expect(formatearFecha('2026-12-12T18:00:00')).toMatch(/12 de diciembre de 2026/)
  })
})
