import { Link } from 'react-router'
import { RUTAS } from '../lib/rutas'

export default function NoEncontrada() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
      <p className="text-sm font-bold tracking-wide text-marca-600 dark:text-indigo-400">ERROR 404</p>
      <h1 className="mt-3 font-titulo text-3xl font-bold text-slate-900 dark:text-slate-100">
        Página no encontrada
      </h1>
      <p className="mt-4 text-slate-600 dark:text-slate-400">
        La dirección que buscas no existe. Puedes volver al inicio o explorar los eventos publicados.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to={RUTAS.inicio}
          className="rounded-lg bg-marca-600 px-5 py-3 font-medium text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
        >
          Volver al inicio
        </Link>
        <Link
          to={RUTAS.eventos}
          className="rounded-lg border border-slate-300 dark:border-slate-600 px-5 py-3 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
        >
          Explorar eventos
        </Link>
      </div>
    </main>
  )
}
