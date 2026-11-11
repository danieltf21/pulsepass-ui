import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const busquedaSchema = z.object({
  stageName: z.string().trim().min(1, 'Escribe el nombre artístico.').max(150, 'Usa como máximo 150 caracteres.'),
})

type Busqueda = z.infer<typeof busquedaSchema>

interface BuscadorArtistaProps {
  onBuscar: (stageName: string) => void
  onLimpiar: () => void
}

export default function BuscadorArtista({ onBuscar, onLimpiar }: BuscadorArtistaProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Busqueda>({
    resolver: zodResolver(busquedaSchema),
    defaultValues: { stageName: '' },
  })

  return (
    <form
      role="search"
      aria-label="Buscar artista por nombre"
      noValidate
      onSubmit={handleSubmit(({ stageName }) => onBuscar(stageName))}
      className="mt-6"
    >
      <label htmlFor="nombre-artista" className="block text-sm font-medium text-slate-700">
        Nombre artístico exacto
      </label>
      <div className="mt-2 flex flex-wrap gap-3">
        <input
          id="nombre-artista"
          type="search"
          {...register('stageName')}
          aria-invalid={Boolean(errors.stageName)}
          aria-describedby={errors.stageName ? 'error-nombre-artista' : undefined}
          className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
        />
        <button type="submit" className="rounded-lg bg-marca-600 px-4 py-3 text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600">
          Buscar artista
        </button>
        <button
          type="button"
          onClick={() => { reset(); onLimpiar() }}
          className="rounded-lg border border-slate-300 px-4 py-3 text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
        >
          Limpiar búsqueda
        </button>
      </div>
      {errors.stageName && (
        <p id="error-nombre-artista" role="alert" className="mt-2 text-sm text-red-700">
          {errors.stageName.message}
        </p>
      )}
    </form>
  )
}
