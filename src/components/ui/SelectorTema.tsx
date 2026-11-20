import { useSyncExternalStore } from 'react'
import { cambiarTema, obtenerTema, suscribirTema } from '../../lib/tema'
import Selector from './Selector'

export default function SelectorTema() {
  const tema = useSyncExternalStore(suscribirTema, obtenerTema)
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
      <span>Tema</span>
      <Selector
        value={tema}
        onChange={(evento) => {
          const valor = evento.target.value
          if (valor === 'sistema' || valor === 'claro' || valor === 'oscuro') cambiarTema(valor)
        }}
        className="min-w-0 py-2 text-slate-900 dark:text-slate-100"
      >
        <option value="sistema">Sistema</option>
        <option value="claro">Claro</option>
        <option value="oscuro">Oscuro</option>
      </Selector>
    </label>
  )
}
