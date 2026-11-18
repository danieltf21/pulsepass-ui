import { useSyncExternalStore } from 'react'
import { cambiarTema, obtenerTema, suscribirTema } from '../../lib/tema'

export default function SelectorTema() {
  const tema = useSyncExternalStore(suscribirTema, obtenerTema)
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
      Tema
      <select
        value={tema}
        onChange={(evento) => {
          const valor = evento.target.value
          if (valor === 'sistema' || valor === 'claro' || valor === 'oscuro') cambiarTema(valor)
        }}
        className="min-h-11 min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
      >
        <option value="sistema">Sistema</option>
        <option value="claro">Claro</option>
        <option value="oscuro">Oscuro</option>
      </select>
    </label>
  )
}
