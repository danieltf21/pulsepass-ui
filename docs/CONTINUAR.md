# Estado para retomar PulsePass

Fecha de pausa: 11 de noviembre de 2026.

## Git

- Rama actual: `feature/artistas`, creada desde `develop` actualizado.
- Último commit publicado: `9a4e10e` — perfil y artistas destacados con pruebas.
- El catálogo ya se integró en `develop` mediante PR.
- El módulo de artistas sigue en su rama; aún no se debe fusionar como terminado.
- Pedir permiso al usuario antes de cada commit y push.

## Implementado

- Catálogo, búsqueda por texto en URL, filtro por artista y detalle de evento.
- Cliente HTTP con ApiError, validación Zod y reintentos con TanStack Query.
- Router separado, layout, páginas 404 y error seguro.
- Artistas: esquemas, tres consultas API y hooks, listado y perfil con eventos.
- Inicio con hasta tres eventos y seis artistas destacados.
- MSW y pruebas del catálogo, errores HTTP, Inicio, listado y perfil de artistas.

## Cambio local pendiente

`src/components/artistas/BuscadorArtista.tsx` está guardado, sin commit.
Usa React Hook Form y Zod para validar el nombre artístico exacto.
Todavía no está conectado al listado ni tiene pruebas específicas.
El último build y ESLint, ejecutados tras crearlo, pasaron.
Esta nota también es un archivo local pendiente de commit.

## Próximo paso

1. Explicar los archivos que se modificarán antes de implementar.
2. Conectar BuscadorArtista en `src/pages/ListaArtistas.tsx` con `useArtistaPorNombre`.
3. Mostrar carga, resultado, artista no encontrado, error y restaurar el listado al limpiar.
4. Añadir pruebas del formulario y de la búsqueda con MSW; una entrada inválida no debe disparar peticiones.
5. Ejecutar `npm.cmd test`, `npm.cmd run build` y `npm.cmd run lint`.
6. Solicitar permiso para commit y push del bloque.
7. Revisar requisitos pendientes de artistas antes del PR hacia `develop`.

## Acuerdos de trabajo

- Seguir el PRD; avanzar archivo por archivo y anunciar cambios y propósito primero.
- Mantener las capas `src/api`, `src/hooks` y `src/components`, con páginas y utilidades auxiliares.
- Avisar antes de necesitar una nueva rama. Las ramas salen de `develop`; PR hacia `develop`.
- Integrar `develop` en `main` cuando se termine el proyecto.
- Backend de referencia (lectura): `C:\Users\WINDOWS 11\IdeaProjects\pulsepass`.
- PRD: `C:\Users\WINDOWS 11\Desktop\PRD_PulsePass_Frontend_React_TypeScript_Tailwind.pdf`.
- El número de pruebas ejecutables no equivale al número de criterios del PRD cubiertos.
- Siguen pendientes otros módulos del PRD: sedes, autenticación, cuenta, tickets, STAFF y ADMIN, además de diseño final, modo oscuro y accesibilidad.

## Comandos al retomar

```powershell
git status
git branch --show-current
npm.cmd run dev
```

Leer esta nota y revisar los archivos actuales antes de continuar.
