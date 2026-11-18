# Auditoría de requisitos de PulsePass

Revisión: 2026-11-18. Código frontend: `16e6900`, develop tras integrar el PR #20. Backend de categorías: `27e0c68`.

Fuente: PRD versión 1.0, secciones 7 y 23, páginas 8–10 y 58. También se consultaron las secciones 8, 9.12, 13, 21 y 30.2 para interpretar alcance y aceptación. Archivo: `C:/Users/WINDOWS 11/Desktop/PRD_PulsePass_Frontend_React_TypeScript_Tailwind.pdf`.

## Medida reproducible

Universo: 33 requisitos funcionales FR-FE y 10 no funcionales NFR-FE, 43 en total. Cada ID pesa lo mismo: completo aporta 1; parcial y pendiente aportan 0. Un requisito compuesto solo está completo si cumple sus elementos. Sin evidencia suficiente se conserva como parcial o pendiente.

Resultado: **35/43 = 81,40 %** de requisitos completos.

- Completos: 35 (33 funcionales y 2 no funcionales).
- Parciales: 7, todos no funcionales.
- Pendiente: 1 no funcional, compatibilidad.
- Existen las 20 páginas/rutas de la sección 8; esto no acredita su fidelidad visual ni toda la Definition of Done.

Este porcentaje mide requisitos completos bajo esta regla, no horas, esfuerzo ni avance total del proyecto. Otros criterios del PRD no se añaden al denominador porque se solapan con estos IDs. Completo significa respaldado por implementación y evidencia disponible, no certificación de producción.

Desde la auditoría de categorías (33/43), los PR #15 y #16 cierran las notificaciones y el modo oscuro. El PR #17 completa el límite de contraseña y la consulta de cuenta por nombre de usuario. Los PR #18 a #20 ajustan la barra móvil de compra, el enlace de registro en Inicio y el evento inexistente en Tickets pagados.

Respecto de la auditoría integrada en PR #12 (31/43), se cierran EVT-001 y EVT-002 con categorías. **Excepción autorizada:** la sección 3.5 indica que el frontend se diseña sin pedir cambios al backend. Tras revisar esa restricción, el usuario autorizó añadir category a EventSummaryResponse. Esta solución cumple los dos requisitos funcionales, pero se aparta de aquella restricción de alcance; no se presenta como cumplimiento literal de todo el PRD. No cambió base de datos ni reglas de negocio.

## Matriz de los 43 requisitos

Las rutas de archivos son relativas a `src/`, salvo indicación contraria. Las suites corresponden a sus archivos `.test.ts` o `.test.tsx`.

| ID | Estado | Requisito | Evidencia y pendiente concreto |
| --- | --- | --- | --- |
| FR-FE-EVT-001 | Completo | Cartelera publicada | TarjetaEvento muestra nombre, fecha, categoría y estado; resumenEventoSchema exige category. Mocks, prueba de tarjeta y rechazo de respuesta inválida cubiertos. API local y etiquetas de tarjetas verificadas en Brave. Depende del contrato backend 27e0c68. |
| FR-FE-EVT-002 | Completo | Filtros en URL | Selector de seis categorías y Todas; combina categoria, q y artista en cliente conservando otros parámetros. Pruebas de combinación, limpieza, restauración y cero coincidencias. Brave confirma persistencia de texto/categoría tras recarga a 360 px y escritorio. |
| FR-FE-EVT-003 | Completo | Detalle de evento | DetalleEvento muestra datos, sede, artistas, compra y recurso no disponible; suite de detalle y recorrido de ModalCompra. |
| FR-FE-EVT-004 | Completo | Eventos por artista | API, hook, perfil y ?artista= conectados; suites CatalogoEventos y DetalleArtista. |
| FR-FE-EVT-005 | Completo | Estado y compra | DetalleEvento muestra estado y deshabilita comprar fuera de PUBLISHED; prueba SOLD_OUT. La condición también cubre DRAFT, CANCELLED y FINISHED. |
| FR-FE-ART-001 | Completo | Artistas activos | API, hook, cuadrícula y estados de carga/vacío/error; suite ListaArtistas. |
| FR-FE-ART-002 | Completo | Detalle de artista | Perfil, eventos, 404 y parámetros inválidos sin petición; suite DetalleArtista. |
| FR-FE-ART-003 | Completo | Búsqueda por nombre artístico | BuscadorArtista, RHF/Zod y endpoint by-stage-name; suite ListaArtistas. |
| FR-FE-VEN-001 | Completo | Sedes activas | Tarjetas con ciudad/capacidad, API y estados; suite ListaSedes. |
| FR-FE-VEN-002 | Completo | Detalle de sede | Consulta por código, datos y 404; suite DetalleSede. |
| FR-FE-AUTH-001 | Completo | Registro | Mínimo de 12 caracteres y máximo de 72 bytes UTF-8. La suite Registro comprueba el envío intacto de 72 bytes y el rechazo de 73 bytes antes del POST. Incluye aviso en login, 400 por campo y 409 genérico. |
| FR-FE-AUTH-002 | Completo | Login | Login y AuthProvider: POST login y GET me con Bearer; suite Login verifica retorno a desde. |
| FR-FE-AUTH-003 | Completo | Credenciales inválidas | api/auth.ts convierte 401 de login en mensaje genérico; suite Login verifica que no expone detalles internos. |
| FR-FE-AUTH-004 | Completo | Persistencia por pestaña | lib/sesion.ts usa sessionStorage; AuthProvider restaura consultando me. Suites sesion y Login. |
| FR-FE-AUTH-005 | Completo | Expiración | HTTP notifica 401 autenticado; limpia sesión/caché y conserva origen. SesionExpirada prueba reingreso y retorno. |
| FR-FE-AUTH-006 | Completo | Cerrar sesión | cerrarSesion borra token, almacenamiento y consultas; guardas impiden acceso posterior. Suites Login, sesion y Guardas. |
| FR-FE-AUTH-007 | Completo | Mi cuenta | Cuenta permite consultar por correo o nombre de usuario, ambos de la sesión. La suite Cuenta verifica identidad y Bearer. La consulta por nombre también se verificó en Brave con la API local. |
| FR-FE-TKT-001 | Completo | Compra | ModalCompra permite cuatro tipos; hook envía email de sesión; POST, confirmación y conflicto visible. Suite ModalCompra. |
| FR-FE-TKT-002 | Completo | Compra requiere sesión | DetalleEvento manda al visitante a login con state.desde; suites de detalle, login y guardas. |
| FR-FE-TKT-003 | Completo | Mis tickets | Consulta email propio y filtra por estado; suite MisTickets cubre listado, vacío y actualización tras cancelar. |
| FR-FE-TKT-004 | Completo | Detalle de ticket | Código, tipo, precio, estado y fecha; URL directa y 403/404 sin datos ajenos probados. Sección 9.12 y TEST-FE-TKT-009 especifican el mensaje común Ticket no disponible. |
| FR-FE-TKT-005 | Completo | Cancelar ticket | Modal, solo PAID, PATCH, actualización de lista/detalle y 409 conservando diálogo. Suites DetalleTicket y MisTickets. |
| FR-FE-STF-001 | Completo | Validar ingreso | ValidacionIngreso: GET ticket y PATCH use, bloqueo de duplicados y conflicto mostrado. Suite con STAFF/ADMIN, éxito, 409 y 403/404. |
| FR-FE-STF-002 | Completo | Tickets pagados por evento | Tabla en escritorio y tarjetas en móvil. Si el endpoint de pagados devuelve una lista vacía, se consulta el evento para distinguir total cero de evento inexistente. La suite y Brave con STAFF verifican ambos estados. |
| FR-FE-ADM-001 | Completo | Crear evento | FormularioEvento y AdminCrearEvento: campos DTO, POST, 400 por campo, 409 y 403; suite AdminCrearEvento. |
| FR-FE-ADM-002 | Completo | Seleccionar sede | Formulario usa useSedesActivas; selector y bloqueo sin sedes probados. |
| FR-FE-ADM-003 | Completo | Gestionar evento | AdminEventos busca código; AdminGestionEvento muestra borrador y acciones. Pruebas de recorrido y guardas ADMIN. La lista de sesión no es un listado global. |
| FR-FE-ADM-004 | Completo | Publicar evento | Modal de confirmación, PATCH, actualización de caché y conflicto conservando diálogo; suite AdminGestionEvento. |
| FR-FE-ADM-005 | Completo | Asociar artista | Selector de activos, POST, actualización y 409; asociados deshabilitados. Suite AdminGestionEvento. |
| FR-FE-GEN-001 | Completo | Layout y navegación | Footer, enlaces por rol/activos, menú móvil, Escape y cierre al navegar. Suite Layout y revisión visual en Brave a 360 px/escritorio con los cuatro perfiles. |
| FR-FE-GEN-002 | Completo | Páginas de error | router.tsx conecta /403, comodín * y errorElement; SinPermisos, NoEncontrada y ErrorPagina. Suites de guardas/error. Falta ampliar la prueba de URL desconocida al router real completo. |
| FR-FE-GEN-003 | Completo | Notificaciones | Toast de éxito y error para mutaciones, anuncios con aria-live polite y cierre manual. Verificados dentro y fuera de diálogos mediante pruebas y revisión visual. |
| FR-FE-GEN-004 | Completo | Modo oscuro | Selector Sistema, Claro y Oscuro, persistencia y variantes dark. Pruebas del selector y revisión visual en Brave de muestras públicas y de los tres roles. |
| NFR-FE-001 | Parcial | Accesibilidad | Lighthouse en 12 pantallas y tres estados adicionales. Se verificaron secuencias de teclado, foco, salto al contenido y cierre del modal. Faltan el recorrido completo, revisión manual de contraste y evidencia para WCAG 2.1 AA. |
| NFR-FE-002 | Parcial | Responsive desde 360 px | Menú de cuatro perfiles y muestras públicas y privadas en Brave. Inicio, compra móvil y tarjetas STAFF revisados a 360 y 390 px, estas últimas con datos ficticios largos. Quedan páginas y estados por revisar. |
| NFR-FE-003 | Parcial | Rendimiento | Rutas lazy salvo Inicio. Lighthouse móvil sobre build local dio 87 de Performance en Inicio, por encima de 80. Falta verificar en red que la carga inicial omita módulos STAFF y ADMIN. |
| NFR-FE-004 | Parcial | Seguridad | Token en memoria/sessionStorage y Authorization. localStorage guarda la preferencia de tema. Falta comprobar el bundle para secretos y completar la revisión de exposición en URL y logs. |
| NFR-FE-005 | Completo | Tipado y validación | strict y noUncheckedIndexedAccess; sin any explícito en src; Zod para formularios, parámetros y respuestas de módulos API. |
| NFR-FE-006 | Parcial | Consistencia de errores | http y validarRespuesta convierten red, HTTP, JSON y respuestas inválidas en ApiError. Entradas de auth/eventos/tickets usan .parse(datos) que puede lanzar ZodError: clasificación conservadora hasta unificar el límite API. Cancelaciones se preservan deliberadamente. |
| NFR-FE-007 | Parcial | Mantenibilidad | Capas acordadas y UI Modal, Tabla y PrecioCOP. Faltan componentes base. Layout tiene 202 líneas, AdminGestionEvento 201 y DetalleEvento 175. Se repite la política de reintentos. |
| NFR-FE-008 | Completo | Localización | HTML es-CO; lib/formato.ts usa Intl.DateTimeFormat es-CO e Intl.NumberFormat COP. PrecioCOP integrado en tickets, confirmación y tabla STAFF, con pruebas. |
| NFR-FE-009 | Parcial | Determinismo | MSW usa onUnhandledFrame: error. Varias suites siguen usando Date.now o temporizadores reales. |
| NFR-FE-010 | Pendiente | Compatibilidad | Sin matriz de las últimas dos versiones de Chrome, Edge, Firefox y Safari. Brave no sustituye esa matriz. |

## Evidencia y límites

- Última ejecución sobre el código integrado en PR #20: **202 pruebas en 31 archivos**, build, lint y `git diff --check` correctos. Esta actualización documental reutiliza esa ejecución.
- Se leyeron router, sesión, cliente HTTP, APIs, formularios, páginas de autenticación/tickets/STAFF/ADMIN y casos existentes de sus suites. Se revisaron strict, validación de respuestas, almacenamiento y longitud de componentes.
- Revisión visual previa: menú de visitante, USER, STAFF y ADMIN en Brave a 360 x 552 px y escritorio, según CONTINUAR. No es un recorrido exhaustivo de las 20 páginas.
- Categorías en Brave: MUSIC muestra 2 resultados, MUSIC + q=r1 muestra 1, recarga conserva filtros, limpiar texto conserva categoría, SPORTS muestra cero coincidencias y Todas recupera 3 eventos. Tarjetas/selector revisados a 360 x 552 px y escritorio; sin cortes horizontales observados en esos elementos. /published y /by-artist locales devuelven category. Combinación con artista probada con MSW, sin afirmar recorrido visual de ese filtro.
- El usuario confirmó anteriormente el flujo real ADMIN de crear, asociar y publicar. Durante la revisión del menú no se modificaron eventos ni tickets.
- La revisión visual del PR #18 verificó la barra de compra a 360 y 390 px, el retorno después de iniciar sesión y la apertura y cierre del diálogo. La del PR #19 verificó que los dos enlaces del hero caben en ambos anchos y que Crear cuenta abre Registro.
- Tickets pagados se revisó a 360 y 390 px con dos filas ficticias, una con código y correo largos. El estado vacío y el evento inexistente se verificaron después con la API local y una sesión STAFF.

### Lighthouse móvil en Brave

Modo Navigation sobre la compilación local de producción, después de integrar el PR #19.

| Pantalla | Rendimiento | Accesibilidad |
| --- | ---: | ---: |
| Inicio | 87 | 100 |
| Cartelera | 93 | 100 |
| Registro | 94 | 100 |
| Iniciar sesión | 68 | 100 |

El umbral de 80 aplica a Inicio. En esa ejecución FCP y LCP fueron 2,2 s y TBT fue 370 ms.

Modo Snapshot con las pantallas cargadas. USER se revisó en la compilación local de producción. STAFF y ADMIN se revisaron en desarrollo con la API local.

| Rol | Estado | Comprobaciones de accesibilidad aprobadas |
| --- | --- | ---: |
| USER | Mi cuenta | 20/20 |
| USER | Mis tickets con entradas | 25/25 |
| USER | Detalle de entrada usada | 20/20 |
| USER | Diálogo de compra abierto | 12/12 |
| STAFF | Validación de ingreso | 20/20 |
| STAFF | Validación de ingreso, ticket no encontrado | 23/23 |
| STAFF | Tickets pagados, lista vacía | 22/22 |
| ADMIN | Administración de eventos | 22/22 |
| ADMIN | Nuevo evento | 19/19 |
| ADMIN | Nuevo evento, errores por campos vacíos | 22/22 |
| ADMIN | Gestión de evento publicado | 22/22 |

Se verificó foco visible con Tab, activación con Enter y cierre con Escape en secuencias concretas. El enlace Saltar al contenido permitió llegar al primer campo del login. Escape cerró el diálogo de compra y devolvió el foco al botón que lo abrió. Las comprobaciones automáticas cubren los estados listados. La verificación completa de teclado, contraste y WCAG 2.1 AA sigue abierta.

## Entrega y pruebas pendientes

La Definition of Done de la sección 30.2 sigue abierta. Existen las 20 páginas y pasan 202 pruebas. Falta trazar los 50 identificadores mínimos de la sección 21 uno a uno y completar la prueba de URL desconocida con el router real.

La inspección del código identifica un acceso desde la interfaz para las 20 operaciones de Fase 3 y los 3 puntos de Fase 4, con registro compartido entre ambas. El PR #17 incorporó el acceso faltante a `by-username`. Queda pendiente documentar cada operación y su evidencia de prueba. El README sigue siendo la plantilla Vite. La fidelidad a las 32 referencias visuales y la biblioteca de componentes base siguen abiertas.

## Próximos bloques propuestos

1. Verificar las solicitudes de la carga inicial de Inicio y comprobar el bundle en el apartado de seguridad.
2. Completar la revisión de teclado, contraste, responsive, referencias visuales y compatibilidad.
3. Unificar errores de entrada de la capa API y reducir la repetición de políticas de reintento.
4. Actualizar el README y documentar la trazabilidad de casos de prueba y operaciones.

Cada bloque parte de develop. Pedir autorización antes de cada commit y cada push. La fusión requiere autorización por separado.
