export type PreferenciaTema = 'sistema' | 'claro' | 'oscuro'
const CLAVE_TEMA = 'pulsepass.tema'
let preferencia: PreferenciaTema = 'sistema'
let sistemaOscuro = false
const suscriptores = new Set<() => void>()

function validar(valor: string | null): PreferenciaTema {
  return valor === 'claro' || valor === 'oscuro' ? valor : 'sistema'
}

function aplicar() {
  document.documentElement.classList.toggle('dark', preferencia === 'oscuro' || (preferencia === 'sistema' && sistemaOscuro))
  suscriptores.forEach((suscriptor) => suscriptor())
}

export function iniciarTema() {
  try { preferencia = validar(localStorage.getItem(CLAVE_TEMA)) } catch { preferencia = 'sistema' }
  const consulta = window.matchMedia?.('(prefers-color-scheme: dark)')
  sistemaOscuro = consulta?.matches ?? false
  aplicar()
  function cambiarSistema(evento: MediaQueryListEvent) {
    sistemaOscuro = evento.matches
    aplicar()
  }
  function cambiarOtraPestana(evento: StorageEvent) {
    if (evento.key !== CLAVE_TEMA && evento.key !== null) return
    preferencia = validar(evento.newValue)
    aplicar()
  }
  consulta?.addEventListener('change', cambiarSistema)
  window.addEventListener('storage', cambiarOtraPestana)
  return () => {
    consulta?.removeEventListener('change', cambiarSistema)
    window.removeEventListener('storage', cambiarOtraPestana)
  }
}

export function cambiarTema(valor: PreferenciaTema) {
  preferencia = validar(valor)
  try { localStorage.setItem(CLAVE_TEMA, preferencia) } catch { /* La elección sigue funcionando en memoria. */ }
  aplicar()
}

export function obtenerTema() { return preferencia }
export function suscribirTema(suscriptor: () => void) {
  suscriptores.add(suscriptor)
  return () => { suscriptores.delete(suscriptor) }
}
