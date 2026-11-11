import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import type { ResumenEvento } from '../../api/eventos.tipos'
import TarjetaEvento from './TarjetaEvento'

const evento: ResumenEvento = {
  eventCode: 'CMF-2026',
  name: 'Caribbean Music Fest 2026',
  status: 'PUBLISHED',
  eventDate: '2026-12-12T18:00:00',
  venueName: 'Marina Convention Center',
}

function mostrarTarjeta(datos: ResumenEvento = evento) {
  return render(
    <MemoryRouter>
      <TarjetaEvento evento={datos} />
    </MemoryRouter>,
  )
}

describe('TarjetaEvento', () => {
  it('muestra el nombre, código, sede y estado del evento', () => {
    mostrarTarjeta()

    expect(screen.getByRole('heading', { level: 2, name: evento.name })).toBeInTheDocument()
    expect(screen.getByText(evento.eventCode)).toBeInTheDocument()
    expect(screen.getByText(evento.venueName)).toBeInTheDocument()
    expect(screen.getByText('Publicado')).toBeInTheDocument()
  })

  it('presenta la fecha con un valor legible por máquinas', () => {
    mostrarTarjeta()

    const fecha = screen.getByRole('time')
    expect(fecha).toHaveAttribute('datetime', evento.eventDate)
    expect(fecha).toHaveTextContent(/12.*diciembre.*2026/)
  })

  it('ofrece un enlace accesible al detalle del evento', () => {
    mostrarTarjeta()

    expect(screen.getByRole('link', { name: `Ver detalle de ${evento.name}` }))
      .toHaveAttribute('href', '/eventos/CMF-2026')
  })

  it('codifica caracteres especiales del código en el enlace', () => {
    mostrarTarjeta({ ...evento, eventCode: 'MUSICA & CULTURA' })

    expect(screen.getByRole('link', { name: `Ver detalle de ${evento.name}` }))
      .toHaveAttribute('href', '/eventos/MUSICA%20%26%20CULTURA')
  })
})
