import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { iniciarTema } from '../../lib/tema'
import SelectorTema from './SelectorTema'

let sistema: EventTarget
let detener: () => void

beforeEach(() => {
  localStorage.clear()
  sistema = new EventTarget()
  vi.stubGlobal('matchMedia', () => ({
    matches: true,
    addEventListener: sistema.addEventListener.bind(sistema),
    removeEventListener: sistema.removeEventListener.bind(sistema),
  }))
})
afterEach(() => {
  detener?.()
  localStorage.clear()
  document.documentElement.classList.remove('dark')
  vi.unstubAllGlobals()
})

function preparar() {
  detener = iniciarTema()
  return render(<SelectorTema />)
}
function cambiarSistema(oscuro: boolean) {
  const evento = new Event('change')
  Object.defineProperty(evento, 'matches', { value: oscuro })
  act(() => { sistema.dispatchEvent(evento) })
}

describe('Selector de tema', () => {
  it('sigue el sistema por defecto y reacciona a sus cambios', () => {
    preparar()
    expect(screen.getByRole('combobox', { name: 'Tema' })).toHaveValue('sistema')
    expect(document.documentElement).toHaveClass('dark')
    cambiarSistema(false)
    expect(document.documentElement).not.toHaveClass('dark')
    cambiarSistema(true)
    expect(document.documentElement).toHaveClass('dark')
  })

  it('conserva la elección manual tras reiniciar y permite volver al sistema', async () => {
    const usuario = userEvent.setup()
    const vista = preparar()
    await usuario.selectOptions(screen.getByRole('combobox', { name: 'Tema' }), 'claro')
    cambiarSistema(true)
    expect(document.documentElement).not.toHaveClass('dark')
    expect(localStorage.getItem('pulsepass.tema')).toBe('claro')
    vista.unmount()
    detener()
    preparar()
    expect(screen.getByRole('combobox', { name: 'Tema' })).toHaveValue('claro')
    await usuario.selectOptions(screen.getByRole('combobox', { name: 'Tema' }), 'oscuro')
    expect(document.documentElement).toHaveClass('dark')
    await usuario.selectOptions(screen.getByRole('combobox', { name: 'Tema' }), 'sistema')
    cambiarSistema(false)
    expect(document.documentElement).not.toHaveClass('dark')
  })

  it('sincroniza la preferencia de otra pestaña e ignora otras claves', () => {
    preparar()
    act(() => window.dispatchEvent(new StorageEvent('storage', { key: 'pulsepass.tema', newValue: 'claro' })))
    expect(screen.getByRole('combobox', { name: 'Tema' })).toHaveValue('claro')
    act(() => window.dispatchEvent(new StorageEvent('storage', { key: 'otra', newValue: 'oscuro' })))
    expect(document.documentElement).not.toHaveClass('dark')
  })

  it('tolera almacenamiento bloqueado y una preferencia desconocida', async () => {
    localStorage.setItem('pulsepass.tema', 'desconocida')
    preparar()
    expect(screen.getByRole('combobox', { name: 'Tema' })).toHaveValue('sistema')
    const bloqueo = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Bloqueado') })
    await userEvent.setup().selectOptions(screen.getByRole('combobox', { name: 'Tema' }), 'claro')
    expect(document.documentElement).not.toHaveClass('dark')
    bloqueo.mockRestore()
  })
})
