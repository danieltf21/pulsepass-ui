import type { Key, ReactNode } from 'react'

export interface ColumnaTabla<T> {
  id: string
  titulo: string
  renderizar: (fila: T) => ReactNode
}

interface TablaProps<T> {
  titulo: string
  columnas: ColumnaTabla<T>[]
  filas: T[]
  claveFila: (fila: T) => Key
}

export default function Tabla<T>({ titulo, columnas, filas, claveFila }: TablaProps<T>) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">{titulo}</caption>
          <thead className="border-b border-slate-200 bg-slate-100 text-slate-900">
            <tr>
              {columnas.map((columna) => <th key={columna.id} scope="col" className="px-4 py-4 font-semibold">{columna.titulo}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filas.map((fila) => (
              <tr key={claveFila(fila)}>
                {columnas.map((columna) => <td key={columna.id} className="px-4 py-4 align-top text-slate-700">{columna.renderizar(fila)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul aria-label={titulo} className="grid gap-4 md:hidden">
        {filas.map((fila) => (
          <li key={claveFila(fila)} className="min-w-0 rounded-xl border border-slate-200 bg-white p-5">
            <dl className="space-y-4">
              {columnas.map((columna) => (
                <div key={columna.id}>
                  <dt className="text-sm font-semibold text-slate-900">{columna.titulo}</dt>
                  <dd className="mt-1 break-words text-slate-700">{columna.renderizar(fila)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  )
}
