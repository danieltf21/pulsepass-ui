import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { cerrarAviso, mostrarAviso, obtenerAvisos } from '../../lib/avisos'
import Avisos from './Avisos'

describe('Avisos', () => {
  it('anuncia el resultado con polite, permite cerrarlo y no mueve el foco', () => {
    render(<><button>Continuar</button><Avisos /></>)
    const boton = screen.getByRole('button', { name: 'Continuar' })
    boton.focus()
    act(() => mostrarAviso('exito', 'Evento publicado.'))
    const region = screen.getByRole('region', { name: 'Notificaciones' })
    expect(region.querySelector('[aria-live="polite"]')).toHaveTextContent('Evento publicado.')
    expect(boton).toHaveFocus()
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar aviso: Evento publicado.' }))
    expect(within(region).queryByText('Evento publicado.')).not.toBeInTheDocument()
  })

  it('limita la cola, elimina duplicados y renderiza los mensajes como texto', () => {
    render(<Avisos />)
    act(() => {
      mostrarAviso('info', 'Uno')
      mostrarAviso('info', 'Dos')
      mostrarAviso('info', 'Tres')
      mostrarAviso('error', '<img src=x onerror=alert(1)>')
      mostrarAviso('info', 'Dos')
    })
    expect(obtenerAvisos()).toHaveLength(3)
    expect(screen.queryByText('Uno')).not.toBeInTheDocument()
    expect(screen.getAllByText('Dos')).toHaveLength(1)
    expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('mueve la única región al diálogo abierto y regresa al documento al cerrarlo', async () => {
    render(<><dialog aria-label="Compra" /><Avisos /></>)
    const dialogo = screen.getByRole('dialog', { hidden: true })
    act(() => {
      dialogo.setAttribute('open', '')
      mostrarAviso('error', 'No se pudo comprar.')
    })
    await waitFor(() => expect(within(dialogo).getByRole('region', { name: 'Notificaciones' })).toBeInTheDocument())
    expect(screen.getAllByRole('region', { name: 'Notificaciones' })).toHaveLength(1)
    act(() => dialogo.removeAttribute('open'))
    await waitFor(() => expect(dialogo).not.toContainElement(screen.getByRole('region', { name: 'Notificaciones' })))
  })

  it('cerrar un aviso antiguo no retira los siguientes', () => {
    act(() => mostrarAviso('info', 'Anterior'))
    const anterior = obtenerAvisos()[0]!
    act(() => mostrarAviso('info', 'Siguiente'))
    act(() => cerrarAviso(anterior.id))
    expect(obtenerAvisos().map((aviso) => aviso.mensaje)).toEqual(['Siguiente'])
  })
})
