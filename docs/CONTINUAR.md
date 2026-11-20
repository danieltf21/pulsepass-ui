# Estado para retomar PulsePass

## Git y acuerdos

- Rama actual: `feature/modo-oscuro`, desde `develop` en `69123b8`.
- PR #15 de avisos toast fusionado en `develop`. Commit de la funcionalidad: `022cf95`.
- Pedir permiso explícito antes de cada commit y de cada push. Pedir autorización para fusionar por separado.
- PR #14 de auditoria posterior a categorias fusionado; commit documental af37593 integrado en 8543f7d.
- PR #13 de categorias fusionado; commit frontend a384175 integrado en 3ecfb63. Develop local actualizado por fast-forward.
- PR #12 de auditoria fusionado; commit documental 44d481d integrado en 362e797.
- PR #11 de navegacion movil fusionado en develop; confirmado contra GitHub al retomar. Develop local actualizado por fast-forward.
- PR #10 de ADMIN fusionado en develop; confirmado contra GitHub el 2026-11-16. Develop local actualizado por fast-forward.
- PR #9 de STAFF fusionado en develop.
- El usuario autorizo commit y push del bloque ADMIN. Verificar git status y git log al retomar; futuros commits requieren permiso nuevo.
- El usuario autorizo tambien commit y push del bloque de navegacion movil tras completar su revision visual. No incluye autorizacion de fusion.
- Avanzar paso a paso y anunciar archivos y finalidad antes de modificar.
- Nuevas ramas desde develop; PR hacia develop. Main al terminar el proyecto.

## Bloque actual: modo oscuro

- `FR-FE-GEN-004`: selector Sistema, Claro y Oscuro, persistencia de la preferencia y variantes `dark:`. Las pruebas del selector cubren cambios del sistema, persistencia y sincronización entre pestañas.
- Brave en escritorio: Inicio y parte superior de la cartelera. Se probaron las tres opciones y la persistencia de Oscuro tras navegar y recargar.
- Brave a 360 × 552 px: catálogo, menú móvil, formulario de acceso y, como USER, Mi cuenta, Mis tickets y detalle de entrada. El detalle también se revisó en escritorio.
- ADMIN: Administración de eventos en escritorio y Nuevo evento en escritorio y a 360 × 552 px. STAFF: formularios iniciales de Validación de ingreso y Tickets pagados en ambos tamaños. La revisión no modificó eventos ni tickets.
- Queda pendiente cotejar las vistas con las referencias del PRD, incluidas las variantes a 390 px, y completar las auditorías de accesibilidad y compatibilidad.
- Verificación del bloque: 196 pruebas aprobadas en 31 archivos con `npm.cmd test -- --maxWorkers=2`. Build, lint y `git diff --check` correctos.

## Bloque de avisos toast (ya integrado)

- Store en memoria en lib/avisos.ts: exito/error/info, maximo 3 avisos, deduplicacion por tipo/mensaje y cierre manual sin temporizador.
- Avisos.tsx montado junto al router: region aria-live polite, texto escapado y botones de cierre accesibles. No roba foco al aparecer. Portal se traslada al ultimo dialog abierto para evitar la inercia del documento modal; MutationObserver limpia su suscripcion al desmontar.
- useAvisosMutacion integrado en registro, comprar/cancelar/usar ticket y crear/publicar/asociar evento. Descarta callbacks de sesiones anteriores o componentes desmontados; 403 anuncia el error y 401 autenticado se deja al flujo de expiracion.
- AuthProvider limpia avisos al cerrar sesion. Los mensajes locales de estas mutaciones siguen visibles con aria-live off para evitar duplicar el anuncio; errores por campo conservan sus alertas.
- Nuevas pruebas de cierre, cola/deduplicacion, texto no ejecutable, portal dentro/fuera de dialog, permisos, errores internos y callbacks tardios. AdminCrearEvento verifica avisos de exito/conflicto junto al recorrido existente.
- Revision visual fuera del dialog: exito/error y cierre visible en Brave, escritorio y 360 x 552 px, mediante vista temporal sin operaciones de backend.
- Revision DENTRO del dialog completada en Chrome: escritorio y 360 x 490 px. Aviso visible sobre el fondo modal, texto completo y cierre accesible; Tab + Enter cierra solo el aviso y mantiene abierto el dialog. Sin cortes horizontales observados en lo revisado. No equivale a prueba con lector de pantalla ni auditoria WCAG completa.
- Los fallos previos de CUA (pipe, lectura de URL y cuota de revision automatica) ya no impidieron esta comprobacion. Vista temporal retirada del repositorio despues de completar la prueba.
- Vite levantado en http://127.0.0.1:5173 (sesion de comando 45437); comprobar antes de iniciar otro. Chrome quedo en la URL temporal retirada con emulacion movil; abrir / para volver a la app. La API/backend no fue reiniciada ni se modificaron datos.
- Comprobaciones finales: 192 pruebas pasando en 30 archivos con npm.cmd test -- --maxWorkers=2; build, lint y git diff --check correctos. El primer intento tras reinicio tuvo dos timeouts y se edito el caso 403 durante ejecucion; la repeticion focalizada (18 casos) y la suite completa posterior pasaron. La revision visual posterior no cambio codigo de la app, solo uso y retiro una vista temporal.
- El bloque `FR-FE-GEN-003` quedó integrado en el PR #15.

## Auditoria posterior a categorias (ya integrada)

- AUDITORIA_PRD.md cierra EVT-001 y EVT-002 con evidencia de codigo, pruebas y revision visual ya ejecutadas.
- Recuento: 33 completos, 8 parciales, 2 pendientes sobre 43 (76,74 %); 31/33 funcionales. Es recuento de IDs completos, no porcentaje de esfuerzo ni cumplimiento total del PRD.
- Registrada expresamente la excepcion autorizada a seccion 3.5 por el cambio de DTO backend. No ocultar esa desviacion del alcance original.
- Solo documentacion; sin nuevas ejecuciones de tests porque no cambia codigo. Ultima suite relevante: 185 casos, build/lint correctos.
- El usuario autorizo commit/push de esta actualizacion documental posterior a categorias; verificar git status y git log al retomar para confirmar ejecucion. No incluye fusion ni futuros bloques.

## Bloque categorias de eventos (frontend integrado)

- El usuario autorizo expresamente ampliar el backend tras revisar que seccion 3.5 del PRD pide no solicitar cambios. Registrar esta excepcion; no presentarla como cumplimiento literal de esa restriccion.
- Backend: rama feature/categoria-resumen-eventos, commit 27e0c68 creado y subido con autorizacion. EventSummaryResponse incorpora category; MapStruct lo copia del dominio. 22 pruebas pasan (controlador, seguridad, mapper y aceptacion). No se cambio base de datos ni reglas de negocio. Fusion remota no verificada.
- Frontend: resumenEventoSchema exige category; TarjetaEvento muestra etiqueta en espanol. Etiquetas compartidas en lib/categoriasEvento.ts.
- Catalogo incluye selector de las seis categorias y Todas; combina categoria con q y artista en cliente, conserva parametros ajenos y restaura el filtro desde URL. Valor de categoria desconocido en URL se ignora; respuesta API sin categoria o invalida se rechaza.
- Se actualizaron mocks y pruebas: combinacion de filtros, limpieza, restauracion al remontar, cero coincidencias y contrato de respuesta.
- Validacion actual: 185 pruebas pasando en 28 archivos, build y lint correctos; git diff --check correcto.
- Comprobacion HTTP local posterior: /api/events/published ya devuelve category (CULTURE y MUSIC en los tres eventos actuales).
- Revision real en Brave completada en escritorio y emulacion de 360 x 552 px: etiquetas de tarjeta, selector, MUSIC con 2 resultados, MUSIC + q=r1 con 1 resultado, recarga conserva ambos filtros, limpiar texto conserva categoria, SPORTS muestra cero coincidencias y Todas recupera los 3 eventos y elimina categoria de URL. Sin cortes horizontales observados en los elementos revisados.
- Brave quedo en /eventos con Todas las categorias y emulacion de 360 px activa; no se modificaron eventos ni tickets. Combinacion con artista cubierta en MSW; no afirmar que se recorrio visualmente ese filtro.
- El frontend necesita el backend actualizado antes de usarlo: el esquema estricto rechaza el contrato antiguo. No ocultar el desfase con una categoria inventada.
- Frontend categorias: commit a384175 creado/subido con autorizacion e integrado mediante PR #13. La autorizacion no cubre futuros bloques. No se modificaron datos de negocio.

## Auditoria actualizada (ya integrada)

- AUDITORIA_PRD.md revisado contra las secciones 7 y 23 del PDF, con consultas de rutas, politica de tickets, errores y DoD.
- Recuento conservador: 31 completos, 10 parciales y 2 pendientes de 43 IDs (72,09 %); funcionales completos: 29/33. No equivale a porcentaje de esfuerzo ni a cumplimiento total del PRD.
- Existen las 20 paginas de la seccion 8. Siguen abiertos categoria en tarjetas/filtros, toast, modo oscuro y controles de calidad/documentacion.
- Ticket no disponible para 403/404 SI coincide con seccion 9.12 y TEST-FE-TKT-009: no cambiarlo por una lectura aislada de la tabla general.
- Cambios exclusivamente documentales; el usuario autorizo commit/push de este bloque. Verificar git status y git log al retomar para confirmar su ejecucion. No se repitieron pruebas: se referencia la ultima ejecucion de 179 casos sobre el mismo codigo integrado.

## Bloque navegacion movil (ya integrado)

- Layout incorpora boton Abrir/Cerrar menu por debajo de lg; navegacion visible en escritorio.
- Conserva enlaces por rol y estados activos. Nombre de usuario con ajuste de palabras largas.
- aria-expanded y aria-controls; Escape cierra y devuelve el foco al boton.
- Seleccionar un enlace cierra incluso en la ruta actual; cambios de ubicacion y salir cierran el menu.
- Cuatro pruebas nuevas de teclado, foco, alternancia, navegacion y regreso con Atras en Layout.test.tsx.
- Corregido un fallo confirmado por prueba: abrir el menu, navegar fuera de sus enlaces y volver con Atras lo reabria. Ahora se descarta la apertura al cambiar de ubicacion.
- Suite completa: 179 pruebas pasando en 28 archivos. Build y lint correctos.
- Revision visual realizada en Brave con sesion USER: escritorio y emulacion responsive de 360 x 552 px a escala normal. Menu abierto con enlaces legibles dentro del ancho; Escape cierra con indicador de foco en el boton; seleccionar Eventos navega y cierra. Inicio y parte superior del catalogo inspeccionados, sin afirmar revision completa de todas las paginas.
- Visitante revisado en Brave en escritorio y a 360 x 552 px: enlaces publicos, Iniciar sesion y Registrarse legibles; enlaces privados ausentes. Salir desde USER cerro el menu y llevo al inicio.
- STAFF revisado en Brave en escritorio y a 360 x 552 px con staff_ui_prueba_1116: enlaces Validar ingreso y Tickets pagados legibles; ambos navegan y cierran el menu; estado activo comprobado en ambos. Formularios iniciales visibles dentro del ancho. Sin ejecutar validaciones de tickets ni modificar datos de negocio.
- ADMIN revisado en Brave con admin_ui_prueba_1116 a 360 x 552 px y en escritorio: Administrar eventos navega y cierra el menu; estado activo visible; Escape cierra con foco visible en el boton. Opciones inferiores, incluida Salir, accesibles con desplazamiento vertical. En escritorio los enlaces se ajustan en filas, sin cortes visibles.
- Revision visual del menu completada para visitante, USER, STAFF y ADMIN en Brave; no equivale a auditoria responsive de toda la aplicacion ni de todos los navegadores. Las pruebas jsdom no verifican CSS responsive. Brave quedo en /admin/eventos con sesion ADMIN y DevTools cerrado; no se crearon ni modificaron eventos.
- Los problemas anteriores de geometria/interaccion se resolvieron al dejar Brave libre y maximizarlo por su control de ventana. Mantener Brave al frente sin interaccion durante la revision.
- Commit 85bbdbe creado y subido; integrado mediante PR #11 en df48af9. Futuros bloques requieren permiso nuevo para commit/push.

## Implementado en el bloque ADMIN (ya integrado)

- Esquema CrearEvento segun DTO: descripcion opcional de hasta 1000 caracteres; sin reglas de negocio de fechas en cliente.
- API y hooks ADMIN para crear, publicar y asociar artistas.
- Formulario con React Hook Form y Zod, sedes activas, errores 400 por campo, conflictos 409 y redireccion 403.
- AdminEventos: buscar por codigo, Nuevo evento y Creados en esta sesion.
- La lista de creados se guarda en memoria por usuario y se limpia al salir; no representa todos los eventos del backend.
- AdminCrearEvento: creacion y redireccion a gestion con aviso.
- AdminGestionEvento: datos, artistas, tickets pagados, publicacion confirmada y asociacion de artistas activos.
- Publicar deshabilitado fuera de DRAFT. Artistas ya asociados bloqueados en el selector.
- Cache del detalle, lista de sesion y consultas publicas actualizada tras las mutaciones.
- Tres rutas protegidas ADMIN y enlace Administrar eventos en el menu.

## Validacion del bloque ADMIN previo

- Ultima suite completa: 175 pruebas pasando en 28 archivos. Build y lint correctos.
- Pruebas de creacion, errores 400/403/409, publicacion, asociacion, permisos y recorrido completo con MSW.
- El usuario confirmo que todo funciono en la prueba real ADMIN: crear, asociar y publicar.
- El usuario observo el error de edad minima en ingles. Se confirmo que procede del backend.
- El usuario pidio expresamente NO modificar ese mensaje en el backend. No se modifico.
- No confundir pruebas jsdom con verificacion visual completa ni con cumplimiento total del PRD.

## Estado previo

- Compras y Mis tickets implementados; STAFF incluye validacion de ingreso y tickets pagados.
- Backend: commit 0baa968 permite consulta individual de tickets a STAFF; 13 pruebas de seguridad pasaron.
- Cuentas locales de prueba: admin_ui_prueba_1116 y staff_ui_prueba_1116. No guardar claves ni tokens en archivos.
- Base local Docker: pulsepass-db, base pulsepass_e2e. No modificar cuentas ni entradas sin autorizacion.

## Siguiente paso

1. Cerrar el bloque de modo oscuro con autorización para commit y, por separado, para push. El PR va hacia `develop`.
2. Desde `develop` con el modo oscuro integrado, abrir una rama para validar el máximo de 72 bytes UTF-8 en Registro y permitir acceder a la consulta por nombre de usuario desde Mi cuenta con la identidad de sesión. Verificar ambos cambios con pruebas.
3. Cotejar las referencias visuales del PRD y completar responsive, accesibilidad, Lighthouse, compatibilidad, trazabilidad de los 50 casos mínimos, cobertura de operaciones y README del producto.

## Referencias

- PRD: C:/Users/WINDOWS 11/Desktop/PRD_PulsePass_Frontend_React_TypeScript_Tailwind.pdf
- Backend: C:/Users/WINDOWS 11/IdeaProjects/pulsepass
- Mantener api, hooks y components con pages, layouts y lib auxiliares.

## Comandos

```powershell
git status
npm.cmd test
npm.cmd run build
npm.cmd run lint
npm.cmd run dev
```

Comprobar si Vite ya esta ejecutandose antes de levantar otro servidor.
