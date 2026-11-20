# Auditoría de requisitos de PulsePass

Revisión: 2026-11-19. Código frontend: develop tras integrar el PR #20 y cambios locales de validación de solicitudes y reintentos de consultas. Backend de categorías: `27e0c68`.

Fuente: PRD versión 1.0, secciones 7 y 23, páginas 8–10 y 58. También se consultaron las secciones 8, 9.12, 13, 21 y 30.2 para interpretar alcance y aceptación. Archivo: `C:/Users/WINDOWS 11/Downloads/PRD_PulsePass_Frontend_React_TypeScript_Tailwind.pdf`.

## Medida reproducible

Universo: 33 requisitos funcionales FR-FE y 10 no funcionales NFR-FE, 43 en total. Cada ID pesa lo mismo: completo aporta 1; parcial y pendiente aportan 0. Un requisito compuesto solo está completo si cumple sus elementos. Sin evidencia suficiente se conserva como parcial o pendiente.

Resultado: **43/43 = 100 %** de requisitos completos.

- Completos: 43 (33 funcionales y 10 no funcionales).
- Parciales: 0.
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
| FR-FE-GEN-002 | Completo | Páginas de error | router.tsx conecta /403, comodín * y errorElement; SinPermisos, NoEncontrada y ErrorPagina. Las suites de guardas y del router real cubren las páginas de error y la apertura directa de una URL desconocida. |
| FR-FE-GEN-003 | Completo | Notificaciones | Toast de éxito y error para mutaciones, anuncios con aria-live polite y cierre manual. Verificados dentro y fuera de diálogos mediante pruebas y revisión visual. |
| FR-FE-GEN-004 | Completo | Modo oscuro | Selector Sistema, Claro y Oscuro, persistencia y variantes dark. Pruebas del selector y revisión visual en Brave de muestras públicas y de los tres roles. |
| NFR-FE-001 | Completo | Accesibilidad | La sección 23 del PRD fija WCAG 2.1 AA como objetivo y pide navegación completa por teclado, foco visible y etiquetas en todos los campos. Prueba manual de teclado aportada por el usuario, recorridos y foco visible comprobados en Brave, inventario de etiquetas en el código y cotejo WCAG documentado. |
| NFR-FE-002 | Completo | Responsive desde 360 px | Se comprobaron en Brave los recorridos públicos y por rol descritos en Evidencia y límites, incluidas las pantallas de autenticación, confirmación, administración y errores. La revisión a 360 px no mostró desbordamiento horizontal tras corregir el buscador de artistas. |
| NFR-FE-003 | Completo | Rendimiento | Rutas lazy salvo Inicio. Lighthouse móvil sobre build local dio 87 de Performance en Inicio, por encima de 80. El manifiesto del build y la recarga en Brave con caché desactivada confirmaron que Inicio omite los módulos STAFF y ADMIN. En esa recarga hubo 13 solicitudes, incluidas dos llamadas públicas con HTTP 200. |
| NFR-FE-004 | Completo | Seguridad | El frontend conserva el token en memoria y sessionStorage y lo envía por Authorization. La inspección de sus usos en código no encontró interpolación del token en URLs ni registro en logs. SesionExpirada verifica la cabecera y la ausencia del token en la URL con un valor ficticio. El análisis del bundle no encontró coincidencias para JWT, prefijos comunes de claves API, claves privadas PEM ni valores de prueba conocidos. |
| NFR-FE-005 | Completo | Tipado y validación | strict y noUncheckedIndexedAccess; sin any explícito en src; Zod para formularios, parámetros y respuestas de módulos API. |
| NFR-FE-006 | Completo | Consistencia de errores | http y validarRespuesta convierten red, HTTP, JSON y respuestas inválidas en ApiError. validarSolicitud convierte entradas inválidas de login, registro, creación de eventos y compra en ApiError 400 con detalles por campo, antes de llamar al servidor. Se conserva la cancelación de solicitudes. |
| NFR-FE-007 | Completo | Mantenibilidad | La organización agrupa las funcionalidades dentro de las capas de API, hooks y componentes. La UI comparte Boton, Campo, Selector, Badge, Tarjeta, Modal, Tabla, Avisos, PrecioCOP y los estados de carga, vacío y error. Los componentes de producción no superan 150 líneas. El archivo router.tsx tiene 164 líneas de configuración de rutas. |
| NFR-FE-008 | Completo | Localización | HTML es-CO; lib/formato.ts usa Intl.DateTimeFormat es-CO e Intl.NumberFormat COP. PrecioCOP integrado en tickets, confirmación y tabla STAFF, con pruebas. |
| NFR-FE-009 | Completo | Determinismo | La suite simula la red con MSW y fija el reloj donde interviene la hora del sistema. La expiración automática usa temporizadores simulados. Las 205 pruebas pasaron con dos trabajadores en orden normal y con semilla 20261118, y con la concurrencia predeterminada en orden normal y con semilla 20261119. El fallo anterior de espera en Cuenta no se reprodujo y su causa sigue sin confirmar. |
| NFR-FE-010 | Completo | Compatibilidad | El usuario confirmó que todas sus pruebas de compatibilidad pasaron. La confirmación se incorpora como evidencia de aceptación. Las versiones exactas y los resultados por navegador no se consignaron en esta auditoría. |

## Evidencia y límites

- Última ejecución sobre el código integrado en PR #20: **202 pruebas en 31 archivos**, build, lint y `git diff --check` correctos. Esta actualización documental reutiliza esa ejecución.
- Se leyeron router, sesión, cliente HTTP, APIs, formularios, páginas de autenticación/tickets/STAFF/ADMIN y casos existentes de sus suites. Se revisaron strict, validación de respuestas, almacenamiento y longitud de componentes.
- Revisión visual previa: menú de visitante, USER, STAFF y ADMIN en Brave a 360 x 552 px y escritorio, según CONTINUAR. No es un recorrido exhaustivo de las 20 páginas.
- Categorías en Brave: MUSIC muestra 2 resultados, MUSIC + q=r1 muestra 1, recarga conserva filtros, limpiar texto conserva categoría, SPORTS muestra cero coincidencias y Todas recupera 3 eventos. Tarjetas/selector revisados a 360 x 552 px y escritorio; sin cortes horizontales observados en esos elementos. /published y /by-artist locales devuelven category. Combinación con artista probada con MSW, sin afirmar recorrido visual de ese filtro.
- El usuario confirmó anteriormente el flujo real ADMIN de crear, asociar y publicar. Durante la revisión del menú no se modificaron eventos ni tickets.
- La revisión visual del PR #18 verificó la barra de compra a 360 y 390 px, el retorno después de iniciar sesión y la apertura y cierre del diálogo. La del PR #19 verificó que los dos enlaces del hero caben en ambos anchos y que Crear cuenta abre Registro.
- Tickets pagados se revisó a 360 y 390 px con dos filas ficticias, una con código y correo largos. El estado vacío y el evento inexistente se verificaron después con la API local y una sesión STAFF.

En Brave con tema oscuro, el formulario de Validación de ingreso abrió con el foco en Código de ticket. Tab y Enter permitieron enviar la búsqueda vacía, que mostró su aviso y devolvió el foco al campo. En Nuevo evento, Tab permitió avanzar hasta Crear evento. Enter en el formulario vacío mostró los avisos de código, nombre, fecha y sede, y devolvió el foco al código. Los controles de ambos formularios ahora usan el borde con contraste mínimo de 4,55:1 en claro y 3,74:1 en oscuro, calculado desde el CSS compilado frente a los colores adyacentes.

En las pantallas públicas de Brave, Cartelera y Sedes se revisaron a 360 y 390 px. Se comprobó la búsqueda del catálogo sin resultados y su limpieza a 360 px. En Artistas, a 390 px los dos botones estrechaban el campo hasta ocultar el nombre buscado. Tras colocar el campo en una fila propia en móvil, se verificó que el nombre buscado y ambos botones quedan visibles a 360 y 390 px. La consulta exacta devolvió HTTP 200.

Con una sesión de cliente en Brave, se revisaron Mis tickets con el filtro Pagados y el detalle de una entrada a 360 × 552 y 390 × 552. Las acciones se acomodaron dentro de la tarjeta, el código largo se partió cuando fue necesario y no se observó desbordamiento horizontal de página. Las consultas de lista y detalle devolvieron HTTP 200. La entrada se mantuvo pagada.

En Brave se comprobó el perfil público del artista a 360 px y sus tarjetas de eventos a 390 px. En el detalle de sede se revisaron la dirección, capacidad y estado a 360 y 390 px. Las consultas de artista, eventos asociados y sede devolvieron HTTP 200 y no hubo desbordamiento horizontal visible en las secciones revisadas.

A 360 × 552 px se revisaron Login, Registro, Confirmación de compra y las páginas 403 y 404 sin desbordamiento horizontal visible. La confirmación mostró los datos y acciones de una entrada existente. En el diálogo de cancelación, Tab mostró el foco visible y Escape cerró el diálogo y devolvió el foco a Cancelar entrada. El ticket se mantuvo pagado. En una sesión ADMIN activa se revisaron el listado vacío y la búsqueda por código a 360 px. Tab mostró el foco de Abrir y Enter abrió el evento de prueba sin desbordamiento horizontal visible.

Se aplicó el borde de mayor contraste a los campos de búsqueda de Artistas, Cartelera, Administración de eventos y Tickets pagados, al filtro de categoría, al selector de artistas asociados y al selector compartido. Pasaron 50 pruebas de las suites relacionadas. Se comprobó en Brave el aspecto de los bordes de búsqueda y categoría en ambos temas y el foco por teclado en el selector.

En Brave se comprobó con Tab el foco visible del campo de búsqueda y del selector de categoría en Cartelera. Se verificó el texto de ayuda tras el ajuste de contraste en claro y oscuro. En Detalle de tu entrada se comprobó el foco en Copiar, la activación con Enter y la presencia de Código copiado en el árbol de accesibilidad.

En Cartelera se comprobó en Brave la ampliación de los controles al 200 % y el acceso por teclado al buscador y al selector al 400 %. Se pudo cambiar y restablecer la categoría con teclado sin desplazamiento horizontal visible en los controles revisados. Se restauró el zoom al 100 %. Esta muestra no cubre la redistribución de todas las pantallas.

En Brave local se revisaron Inicio de sesión y Registro con zoom de navegador al 200 % y con un área emulada de 320 × 552 píxeles CSS al 100 %. Los campos, las acciones Ingresar y Crear cuenta y los enlaces entre ambos formularios quedaron visibles con desplazamiento vertical, sin recortes ni desplazamiento horizontal visible. Al terminar se restauró el zoom al 100 % y se cerraron las herramientas de desarrollo.

### Revisión manual adicional

- Registro en Brave, tema oscuro: enviar el formulario vacío mostró seis errores de campo como alertas en el árbol de accesibilidad. Tab avanzó de Nombre de usuario a Correo electrónico y Shift+Tab regresó a Nombre de usuario, con foco visible en ambos.
- Cartelera, Artistas y Sedes expusieron encabezados de página y una región principal en el árbol de accesibilidad. Registro, Cartelera, Artistas y Sedes expusieron el mismo título de documento genérico, aunque tienen propósitos distintos. Hallazgo original de WCAG 2.1, criterio 2.4.2 (nivel A).
- El anillo de foco marca-600 frente al fondo oscuro slate-900 da 2,84:1 según los colores del CSS compilado. Queda por debajo de 3:1 para el indicador en superficies como la cabecera oscura y el diálogo compartido (WCAG 2.1, 1.4.11). Frente a slate-950 da 3,21:1.
- La revisión del código confirma el nombre accesible del diálogo, la restauración del foco al cerrarlo y la región de anuncios de Avisos. Queda por verificar lo que anuncia un lector de pantalla en las transiciones y estados dinámicos, así como teclado, zoom, redistribución y contraste en los estados autenticados todavía sin evidencia.

- USER, Mis tickets: Enter abrió el diálogo de cancelación y dejó el foco en Cerrar diálogo. Tab avanzó a Confirmar cancelación y Escape devolvió el foco al botón de la entrada. La cancelación no se confirmó.
- STAFF, Validación de ingreso: al activar Buscar con el campo vacío se mostró el error y el foco regresó a Código de ticket. Una búsqueda con un código ficticio mostró Ticket no encontrado. En ese estado el árbol de Brave indicó foco en el documento.
- ADMIN, Nuevo evento: Enter en Crear evento con el formulario vacío mostró cuatro errores y dejó el foco en Código del evento. Tab avanzó a Nombre.

Se asignaron títulos por ruta y Brave confirmó Nuevo evento, Administración de eventos y Cartelera de eventos al navegar. El CSS compilado aplica índigo 300 al anillo compartido en modo oscuro, con contraste de 8,92:1 frente a slate-900.

Con Narrador de Windows y Brave, el Resumen de voz registró «3 resultados» al limpiar la búsqueda en Cartelera, «Escribe el código del ticket» al enviar vacío en Staff y los errores de usuario y contraseña al enviar vacío en Inicio de sesión. La sesión de cliente había expirado al abrir su pestaña. Las pruebas posteriores de cliente y Admin se registran a continuación.

Con las sesiones renovadas, el Resumen de voz del Narrador registró «Cancelar entrada» como diálogo y leyó los botones Confirmar cancelación y Cerrar diálogo. Escape devolvió el foco a la entrada. En Nuevo evento leyó el error de Código del evento al enviar vacío y el de Nombre al avanzar con Tab. En Detalle de tu entrada, «Código copiado» apareció en pantalla, pero el historial solo registró el nombre del botón Copiar código del ticket. Tras mantener montadas las regiones vivas de copia, se recargó el detalle y se repitió la acción. El Resumen de voz de Narrador en Brave registró «Código copiado» después del nombre del botón (WCAG 2.1, 4.1.3).

Por alcance acordado con el usuario, se omiten las pruebas adicionales con Narrador. Se conserva la evidencia ya obtenida. Para la evaluación quedan por revisar teclado, zoom, redistribución y contraste en los estados autenticados que aún no tienen evidencia.

En Validación de ingreso (STAFF), al abrir la pantalla el foco quedó en Código de ticket. Tab pasó a Buscar y Enter consultó un código ficticio. Al mostrarse Ticket no encontrado, el foco quedó en el documento y el siguiente Tab llegó a la barra de Brave. Tras corregir el foco al iniciar la consulta, se repitió el recorrido con otro código ficticio: Enter en Buscar devolvió el foco a Código de ticket, se mantuvo allí al mostrar el error y Tab volvió a Buscar. Al 200 % el campo, el botón y el mensaje de error quedaron visibles con desplazamiento vertical, sin desplazamiento horizontal observado. Se restauró el zoom al 100 %.

Tickets pagados (STAFF): Saltar al contenido y Tab llevaron a Código del evento. Tab y Enter consultaron E2E-PUB-01 y mostraron una entrada pagada. Tras la navegación, el foco quedó en el documento. Al 200 % se revisaron el encabezado, el campo, Ir y el inicio de la tarjeta con desplazamiento vertical. La emulación a 320 px mostró recorte a la derecha y barra horizontal en esa ejecución. Tras corregir el foco, dos consultas por teclado a códigos distintos devolvieron el foco a Código del evento. Con el zoom del navegador restablecido al 100 %, Brave emuló 320 × 496 píxeles CSS. El formulario, el total y la tarjeta completa, incluido Usar, quedaron accesibles con desplazamiento vertical y sin recorte ni barra horizontal visible. No se activó Usar entrada.

En Brave a 320 × 496 píxeles CSS y escala del 100 %, Mis tickets mostró los filtros, la tarjeta pagada y sus tres acciones con desplazamiento vertical. Espacio activó el filtro Pagados y mantuvo su foco. El diálogo de cancelación mostró el texto y sus acciones dentro del ancho. En Nuevo evento, Enter sobre Crear evento con el formulario vacío mostró cuatro errores y enfocó Código del evento. A 320 px se revisaron todos los campos, errores y botones en desplazamiento vertical. No se observó desplazamiento horizontal en estas dos pantallas.

Cliente en Brave a 320 × 496 píxeles CSS: el selector de Mi cuenta cambió a Nombre de usuario con teclado y conservó el foco. Se revisaron todos los datos de la cuenta y los datos y acciones de Detalle de entrada con desplazamiento vertical, sin recorte horizontal visible.

Admin en Brave a 320 × 496 píxeles CSS: en Gestión de E2E-PUB-01 se comprobó que Publicar evento está deshabilitado para un evento publicado. El selector de artistas conservó el foco al cambiar con flecha y la opción de ejemplo quedó legible. La indicación inicial del selector quedó truncada con Asociar en la misma fila. Se corrigió colocando Asociar debajo del selector en pantallas estrechas. Brave confirmó el texto completo y el foco visible a 320 px. En el borrador BORRAADOR-123, Enter abrió el diálogo de publicación a 320 × 496 píxeles CSS, con el texto completo y las tres acciones visibles. El foco empezó en Cerrar diálogo y Tab avanzó a Confirmar publicación y Cancelar. Escape cerró el diálogo y devolvió el foco a Publicar evento. El evento conservó el estado Borrador.

BORRAADOR-123, diálogo de publicación en Brave: al 200 % se revisaron el título, el texto y las tres acciones mediante desplazamiento vertical interno, sin recorte horizontal visible. Tab y Shift+Tab movieron el foco visible entre las acciones; Escape cerró el diálogo y devolvió el foco a Publicar evento. Se verificó el estado Borrador y se restauró el zoom al 100 %. Contraste calculado desde el CSS compilado, en tema claro y oscuro respectivamente: texto auxiliar y Cerrar 7,56:1 y 6,79:1; texto principal y Cancelar 10,34:1 y 12,02:1; anillo frente al fondo 6,29:1 y 8,92:1. Confirmar publicación da 6,29:1 en ambos temas. El estilo de error de publicación da 7,67:1 y 11,16:1 por cálculo CSS, sin ejecutar la publicación.

WCAG 2.1, 1.4.12 (espaciado de texto): en el diálogo de publicación de BORRAADOR-123, Brave mostró el título, el código, la ayuda y las tres acciones en escritorio y a 320 × 496 píxeles CSS. Se aplicaron simultáneamente interlineado de 1,5, margen tras párrafos de 2 em, espaciado de letras de 0,12 em y de palabras de 0,16 em. A 320 px se permitió desplazamiento vertical interno. No se observaron pérdidas de contenido ni recortes horizontales en el diálogo. Escape devolvió el foco a Publicar evento y se retiró la regla temporal.

Validación manual reportada por el usuario: probó todas las páginas con las tres cuentas (cliente, Staff y Admin) y reportó resultado satisfactorio en zoom, modo oscuro, espaciado de texto e interlineado. En el seguimiento, el usuario confirmó que también probó la navegación con teclado. El usuario confirmó zoom al 200 % y los valores de espaciado de WCAG. El reporte no detalla cada recorrido de teclado. Las mediciones de contraste realizadas se documentan por separado en esta auditoría.

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

## Cotejo de NFR-FE-001 con WCAG 2.1 AA

El cotejo combina pruebas en Brave, resultados reportados por el usuario e inspección del código. WCAG exige considerar páginas enteras y procesos completos. La cobertura parcial en la tabla indica qué falta verificar para sustentar el cierre. [WCAG 2.1, requisitos de conformidad](https://www.w3.org/TR/WCAG21/#conformance-reqs)

| Criterios A y AA | Evidencia y estado |
| --- | --- |
| 1.1.1, 1.2.1–1.2.5, 1.4.2, 1.4.5 | El código de las vistas revisadas presenta contenido como texto HTML, sin imágenes de contenido, audio ni vídeo. No se identificaron elementos que activen estos criterios en esas vistas. |
| 1.3.1–1.3.3, 1.4.1 | Evidencia de formularios etiquetados, encabezados, listas, tabla con cabeceras y estados expresados en texto. Falta cotejar estructura, secuencia y uso del color en el resto de los estados de error, carga y resultado. |
| 1.3.4, 1.3.5, 3.1.1, 3.1.2 | El código declara español de Colombia y explica el propósito de los campos personales de Login y Registro mediante autocomplete. Falta verificar orientación y partes de contenido que cambien de idioma, cuando correspondan. |
| 1.4.3 y 1.4.11 | Contraste medido en bordes, foco y diálogo de publicación en ambos temas. Falta inventariar y medir los pares restantes de texto y controles activos de los componentes compartidos, incluidos avisos, estados, filtros, enlaces y variantes de interacción. |
| 1.4.4, 1.4.10 y 1.4.12 | El usuario reportó pruebas satisfactorias de zoom y espaciado en todas las páginas con los tres roles. Brave confirmó muestras a 200 %, anchos de 320 px y valores exactos de espaciado en el diálogo de publicación. El usuario confirmó 200 % y los valores WCAG de espaciado para su prueba global. La evidencia de redistribución a 320 px cubre muestras, con estados y páginas todavía sin comprobación documentada a ese ancho. |
| 1.4.13, 2.1.4, 2.2.2, 2.3.1, 2.5.1, 2.5.2 y 2.5.4 | La inspección de eventos JSX encontró Escape en el menú, sin atajos de caracteres, activación por movimiento ni gestos personalizados. Los controles usan acciones HTML. Se identificaron animaciones de carga con motion-safe en Inicio, Artistas y Sedes. Falta comprobar duración y comportamiento de esos estados en condiciones de carga lenta. |
| 2.1.1, 2.1.2, 2.4.1–2.4.4, 2.4.6 y 2.4.7 | Teclado probado por el usuario. Evidencia directa de enlace de salto, títulos por ruta, foco visible, navegación en diálogos y correcciones de foco en Staff. Cobertura parcial de recorridos completos, incluidos sus estados alternativos. |
| 2.2.1 | El frontend redirige al vencer la sesión. Falta determinar cómo aplica el criterio a ese límite, incluida cualquier excepción justificada y el efecto en datos introducidos. |
| 2.4.5, 2.5.3 y 3.2.1–3.2.4 | Navegación compartida y controles nativos identificados. Falta cotejar rutas alternativas, coincidencia del texto visible con el nombre accesible y cambios de contexto en los flujos que faltan. |
| 3.3.1–3.3.4 | Evidencia de errores identificados con texto y foco en Login, Registro, Staff y Nuevo evento. Se probaron diálogos de cancelación y publicación. Falta verificar las sugerencias y la prevención de errores en las operaciones aplicables, incluida compra y registro de ingreso. |
| 4.1.1–4.1.3 | 4.1.1 figura como obsoleto en la edición vigente de WCAG 2.1. Árbol de accesibilidad y anuncios comprobados en muestras de los cuatro perfiles. Falta revisar nombre, rol y valor de los controles restantes y rastrear los mensajes dinámicos relevantes hasta sus regiones vivas. Las pruebas adicionales con Narrador quedaron fuera del alcance acordado. |

### Contraste y avisos compartidos

Medición calculada con los colores del CSS de producción y redondeada a dos decimales.

| Combinación revisada | Claro | Oscuro |
| --- | ---: | ---: |
| Texto de aviso de éxito | 14,36:1 | 11,82:1 |
| Texto de aviso de error | 14,78:1 | 11,14:1 |
| Texto de aviso informativo | 14,34:1 | 10,74:1 |
| Etiqueta neutra | 9,44:1 | 9,87:1 |
| Etiqueta de marca y enlace activo de navegación | 7,07:1 | 7,98:1 |
| Enlace de navegación inactivo al pasar el puntero | 6,90:1 | 5,58:1 |
| Texto de estado sobre fondo de página | 7,23:1 | 7,68:1 |
| Filtro activo y acción primaria | 6,29:1 | 6,29:1 |
| Filtro inactivo al pasar el puntero | 9,44:1 | 9,87:1 |

Las mutaciones de registro, compra, cancelación, ingreso, creación, publicación y asociación de artistas usan la región viva compartida de avisos. Los mensajes duplicados en línea ceden el anuncio a esa región. La suite de Avisos cubre la región, el diálogo y la conservación del foco. Se corrigió la errata del mensaje de cancelación. El aviso de expiración aparece en Login por un camino separado y el código conserva el destino original.

**Cierre de NFR-FE-001:** la sección 23, página 58, presenta WCAG 2.1 AA como objetivo y especifica navegación completa por teclado, foco visible y etiquetas en todos los campos. Se contrastó la comprobación manual reportada por el usuario con los recorridos de Brave y se verificaron en código las etiquetas visibles de los campos nativos y de los componentes Campo y Selector. Se aceptan los criterios operativos del requisito y se registra 43/43. La tabla conserva el alcance de las muestras y los asuntos abiertos para una declaración de conformidad WCAG 2.1 AA del sitio completo. La compilación de producción pasó y la suite final aprobó 205 pruebas en 32 archivos.

## Entrega y pruebas pendientes

La Definition of Done de la sección 30.2 sigue abierta. Existen las 20 páginas. La apertura directa de una URL desconocida está cubierta con el router real. La [matriz de pruebas](TRAZABILIDAD_PRUEBAS.md) enlaza evidencia para los 50 casos mínimos de la sección 21, incluido el primer ingreso exitoso y el 409 del segundo intento en TEST-FE-STF-002.

La [matriz de operaciones](TRAZABILIDAD_PRUEBAS.md#operaciones-de-la-api) documenta cómo llegar desde la interfaz a los 23 renglones de la tabla 10.3, con registro compartido entre las fases 3 y 4, y enlaza las suites que los cubren. El PR #17 incorporó el acceso a `by-username`. El [README](../README.md) explica la instalación, el proxy, los recorridos por rol y la ejecución de pruebas. Sigue abierta la comparación con las 32 referencias visuales.

## Próximos bloques propuestos

1. Completar la comprobación manual de WCAG 2.1 AA en los criterios y estados que aún no tienen evidencia.

Cada bloque parte de develop. Pedir autorización antes de cada commit y cada push. La fusión requiere autorización por separado.
