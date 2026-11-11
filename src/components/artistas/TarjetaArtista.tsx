import { Link } from 'react-router'
import type { Artista } from '../../api/artistas.tipos'
import { RUTAS } from '../../lib/rutas'

interface TarjetaArtistaProps {
  artista: Artista
}

export default function TarjetaArtista({ artista }: TarjetaArtistaProps) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div
        aria-hidden="true"
        className="flex h-16 w-16 items-center justify-center rounded-full bg-marca-50 text-2xl font-bold text-marca-700"
      >
        {Array.from(artista.stageName.trim())[0]?.toLocaleUpperCase('es-CO') ?? '♪'}
      </div>
      <h2 className="mt-4 font-titulo text-xl font-bold text-slate-900">{artista.stageName}</h2>
      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="font-medium text-slate-700">Género</dt>
          <dd className="mt-1 text-slate-600">{artista.genre || 'No informado'}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-700">País</dt>
          <dd className="mt-1 text-slate-600">{artista.country || 'No informado'}</dd>
        </div>
      </dl>
      <div className="mt-auto pt-6">
        <Link
          to={RUTAS.artista(artista.id)}
          aria-label={`Ver perfil de ${artista.stageName}`}
          className="inline-flex rounded-lg bg-marca-600 px-4 py-3 font-medium text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
        >
          Ver perfil
        </Link>
      </div>
    </article>
  )
}
