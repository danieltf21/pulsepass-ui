# Trazabilidad de las pruebas del PRD

La sección 21, páginas 56 y 57, enumera 50 casos mínimos. La matriz enlaza las suites que aportan evidencia para cada caso. Las solicitudes HTTP de estas pruebas se simulan con MSW.

| Caso del PRD | Suite | Evidencia |
|---|---|---|
| TEST-FE-LIB-001 | [SesionExpirada](../src/context/SesionExpirada.test.tsx) | Envía Bearer al recurso protegido. |
| TEST-FE-LIB-002 | [http](../src/api/http.test.ts) | Conserva estado y detalles de una respuesta de error válida. |
| TEST-FE-LIB-003 | [http](../src/api/http.test.ts) | Usa un mensaje genérico si el cuerpo no cumple el contrato. |
| TEST-FE-LIB-004 | [SesionExpirada](../src/context/SesionExpirada.test.tsx) | Borra la sesión, limpia la caché y redirige tras un 401. |
| TEST-FE-LIB-005 | [PrecioCOP](../src/components/ui/PrecioCOP.test.tsx) | Muestra 250000 como moneda colombiana. |
| TEST-FE-AUTH-001 | [Login](../src/pages/Login.test.tsx) | Autentica y vuelve a la ruta de origen. |
| TEST-FE-AUTH-002 | [Login](../src/pages/Login.test.tsx) | Muestra «Credenciales inválidas» ante un 401. |
| TEST-FE-AUTH-003 | [Login](../src/pages/Login.test.tsx) | Valida campos vacíos sin llamar a la API. |
| TEST-FE-AUTH-004 | [Registro](../src/pages/Registro.test.tsx) | Bloquea una contraseña corta sin llamar a la API. |
| TEST-FE-AUTH-005 | [Registro](../src/pages/Registro.test.tsx) | Redirige al login tras un 201. |
| TEST-FE-AUTH-006 | [Registro](../src/pages/Registro.test.tsx) | Oculta el detalle interno ante un 409. |
| TEST-FE-AUTH-007 | [Guardas](../src/layouts/Guardas.test.tsx) | Redirige al visitante al login conservando la URL. |
| TEST-FE-AUTH-008 | [Layout](../src/layouts/Layout.test.tsx) | Redirige de administración a 403 para USER. |
| TEST-FE-AUTH-009 | [Layout](../src/layouts/Layout.test.tsx) | Abre el módulo de administración para ADMIN. |
| TEST-FE-AUTH-010 | [Login](../src/pages/Login.test.tsx) | Elimina el token y la caché al salir. |
| TEST-FE-AUTH-011 | [Login](../src/pages/Login.test.tsx) | Descarta la sesión vencida al restaurar. |
| TEST-FE-EVT-001 | [CatalogoEventos](../src/pages/CatalogoEventos.test.tsx) | Muestra la cartelera publicada. |
| TEST-FE-EVT-002 | [CatalogoEventos](../src/pages/CatalogoEventos.test.tsx) | Muestra el estado vacío cuando no hay eventos. |
| TEST-FE-EVT-003 | [CatalogoEventos](../src/pages/CatalogoEventos.test.tsx) | Actualiza la URL con texto y categoría. |
| TEST-FE-EVT-004 | [DetalleEvento](../src/pages/DetalleEvento.test.tsx) | Muestra evento, artistas y sede. |
| TEST-FE-EVT-005 | [DetalleEvento](../src/pages/DetalleEvento.test.tsx) | Muestra «Evento no disponible» ante un 404. |
| TEST-FE-EVT-006 | [DetalleEvento](../src/pages/DetalleEvento.test.tsx) | Deshabilita la compra si el evento está agotado. |
| TEST-FE-ART-001 | [ListaArtistas](../src/pages/ListaArtistas.test.tsx) | Muestra artistas activos. |
| TEST-FE-ART-002 | [DetalleArtista](../src/pages/DetalleArtista.test.tsx) | Muestra el perfil y sus eventos. |
| TEST-FE-ART-003 | [DetalleArtista](../src/pages/DetalleArtista.test.tsx) | Muestra 404 sin consultar la API si el ID no es numérico. |
| TEST-FE-VEN-001 | [ListaSedes](../src/pages/ListaSedes.test.tsx), [DetalleSede](../src/pages/DetalleSede.test.tsx) | Cubre el listado, el detalle y el 404. |
| TEST-FE-TKT-001 | [ModalCompra](../src/components/tickets/ModalCompra.test.tsx) | Compra y navega a la URL de confirmación. |
| TEST-FE-TKT-002 | [DetalleEvento](../src/pages/DetalleEvento.test.tsx) | Envía al visitante al login al intentar comprar. |
| TEST-FE-TKT-003 | [ModalCompra](../src/components/tickets/ModalCompra.test.tsx) | Muestra el conflicto 409 y mantiene abierto el modal. |
| TEST-FE-TKT-004 | [ModalCompra](../src/components/tickets/ModalCompra.test.tsx) | Envía el correo de la sesión. |
| TEST-FE-TKT-005 | [MisTickets](../src/pages/MisTickets.test.tsx) | Lista las entradas y las filtra por estado. |
| TEST-FE-TKT-006 | [MisTickets](../src/pages/MisTickets.test.tsx) | Muestra el estado vacío. |
| TEST-FE-TKT-007 | [MisTickets](../src/pages/MisTickets.test.tsx) | Cancela una entrada pagada y actualiza la lista. |
| TEST-FE-TKT-008 | [DetalleTicket](../src/pages/DetalleTicket.test.tsx) | Muestra el conflicto y mantiene abierto el modal. |
| TEST-FE-TKT-009 | [DetalleTicket](../src/pages/DetalleTicket.test.tsx) | Muestra «Ticket no disponible» ante 403/404. |
| TEST-FE-TKT-010 | [DetalleTicket](../src/pages/DetalleTicket.test.tsx) | Oculta la cancelación para estados distintos de PAID. |
| TEST-FE-STF-001 | [ValidacionIngreso](../src/pages/ValidacionIngreso.test.tsx) | Busca y registra un ingreso como STAFF y ADMIN. |
| TEST-FE-STF-002 | [ValidacionIngreso](../src/pages/ValidacionIngreso.test.tsx) | Registra el primer ingreso y muestra el 409 en el segundo intento del mismo ticket, con una consulta desactualizada simulada. |
| TEST-FE-STF-003 | [ValidacionIngreso](../src/pages/ValidacionIngreso.test.tsx) | Muestra ticket no encontrado ante un 404. |
| TEST-FE-STF-004 | [TicketsPagadosEvento](../src/pages/TicketsPagadosEvento.test.tsx) | Muestra el total y las filas de entradas pagadas. |
| TEST-FE-ADM-001 | [AdminCrearEvento](../src/pages/AdminCrearEvento.test.tsx) | Valida los campos requeridos sin enviar la creación. |
| TEST-FE-ADM-002 | [AdminCrearEvento](../src/pages/AdminCrearEvento.test.tsx) | Crea el evento y navega a gestión. |
| TEST-FE-ADM-003 | [AdminCrearEvento](../src/pages/AdminCrearEvento.test.tsx) | Asigna los detalles del 400 a sus campos. |
| TEST-FE-ADM-004 | [AdminGestionEvento](../src/pages/AdminGestionEvento.test.tsx) | Publica y muestra el estado actualizado. |
| TEST-FE-ADM-005 | [AdminGestionEvento](../src/pages/AdminGestionEvento.test.tsx) | Muestra el conflicto 409 de publicación. |
| TEST-FE-ADM-006 | [AdminGestionEvento](../src/pages/AdminGestionEvento.test.tsx) | Muestra el artista asociado y el conflicto de asociación duplicada. |
| TEST-FE-GEN-001 | [router](../src/router.test.tsx) | Muestra la página 404 al abrir una URL desconocida. |
| TEST-FE-GEN-002 | [ErrorPagina](../src/pages/ErrorPagina.test.tsx) | Muestra un error de ruta sin exponer detalles internos. |
| TEST-FE-GEN-003 | [Layout](../src/layouts/Layout.test.tsx) | Comprueba los enlaces del menú para cada rol. |
| TEST-FE-GEN-004 | [Layout](../src/layouts/Layout.test.tsx) | Abre y cierra el menú con teclado y restaura el foco. |

## Operaciones de la API

La numeración corresponde a la tabla 10.3 del PRD, páginas 47 y 48. Sus 23 filas representan 22 operaciones HTTP distintas porque las fases 3 y 4 comparten el registro. Las suites enlazadas comprueban los recorridos con la API simulada.

| Fila | Operación | Cómo se activa en PulsePass | Suite |
|---|---|---|---|
| 1 | `GET /api/venues/{code}` | Sedes → Ver detalle. | [DetalleSede](../src/pages/DetalleSede.test.tsx) |
| 2 | `GET /api/venues/active` | Abre Sedes. | [ListaSedes](../src/pages/ListaSedes.test.tsx) |
| 3 | `POST /api/events` | Administrar eventos → Nuevo evento → Crear evento. | [AdminCrearEvento](../src/pages/AdminCrearEvento.test.tsx) |
| 4 | `GET /api/events/{eventCode}` | Eventos → Ver detalle, o abre la gestión del evento. | [DetalleEvento](../src/pages/DetalleEvento.test.tsx), [AdminGestionEvento](../src/pages/AdminGestionEvento.test.tsx) |
| 5 | `GET /api/events/published` | Abre Inicio o Eventos sin filtro por artista. | [Inicio](../src/pages/Inicio.test.tsx), [CatalogoEventos](../src/pages/CatalogoEventos.test.tsx) |
| 6 | `PATCH /api/events/{eventCode}/publish` | En la gestión de un borrador, confirma la publicación. | [AdminGestionEvento](../src/pages/AdminGestionEvento.test.tsx) |
| 7 | `POST /api/events/{eventCode}/artists/{artistId}` | En la gestión del evento, selecciona y asocia un artista. | [AdminGestionEvento](../src/pages/AdminGestionEvento.test.tsx) |
| 8 | `GET /api/events/by-artist?stageName=…` | Filtra Eventos por artista o abre un perfil de artista. | [CatalogoEventos](../src/pages/CatalogoEventos.test.tsx), [DetalleArtista](../src/pages/DetalleArtista.test.tsx) |
| 9 | `GET /api/artists/{id}` | Artistas → Ver perfil. | [DetalleArtista](../src/pages/DetalleArtista.test.tsx) |
| 10 | `GET /api/artists/by-stage-name?stageName=…` | En Artistas, busca por nombre artístico exacto. | [ListaArtistas](../src/pages/ListaArtistas.test.tsx) |
| 11 | `GET /api/artists/active` | Abre Artistas sin una búsqueda activa. | [ListaArtistas](../src/pages/ListaArtistas.test.tsx) |
| 12 | `POST /api/users` | Abre Crear cuenta y envía el formulario de registro. | [Registro](../src/pages/Registro.test.tsx) |
| 13 | `GET /api/users/by-email?email=…` | Mi cuenta → Consultar por correo electrónico. | [Cuenta](../src/pages/Cuenta.test.tsx) |
| 14 | `GET /api/users/by-username?username=…` | Mi cuenta → Consultar por nombre de usuario. | [Cuenta](../src/pages/Cuenta.test.tsx) |
| 15 | `POST /api/tickets` | En un evento publicado, abre Comprar entrada y confirma con una sesión de cliente. | [ModalCompra](../src/components/tickets/ModalCompra.test.tsx) |
| 16 | `GET /api/tickets/{ticketCode}` | Abre el detalle de un ticket o búscalo desde Validar ingreso. | [DetalleTicket](../src/pages/DetalleTicket.test.tsx), [ValidacionIngreso](../src/pages/ValidacionIngreso.test.tsx) |
| 17 | `GET /api/tickets/by-user?email=…` | Abre Mis tickets con la sesión de cliente. | [MisTickets](../src/pages/MisTickets.test.tsx) |
| 18 | `GET /api/events/{eventCode}/tickets/paid` | En Tickets pagados, busca por código de evento. | [TicketsPagadosEvento](../src/pages/TicketsPagadosEvento.test.tsx) |
| 19 | `PATCH /api/tickets/{ticketCode}/cancel` | Abre un ticket pagado en Mis tickets y confirma la cancelación. | [MisTickets](../src/pages/MisTickets.test.tsx), [DetalleTicket](../src/pages/DetalleTicket.test.tsx) |
| 20 | `PATCH /api/tickets/{ticketCode}/use` | Busca un ticket pagado en Validar ingreso y pulsa Marcar como usado. | [ValidacionIngreso](../src/pages/ValidacionIngreso.test.tsx) |
| A1 | `POST /api/auth/login` | Envía el formulario de Iniciar sesión. | [Login](../src/pages/Login.test.tsx) |
| A2 | `GET /api/auth/me` | Se ejecuta al iniciar sesión y al restaurar una sesión guardada. | [Login](../src/pages/Login.test.tsx) |
| A3 | `POST /api/users` | Envía el formulario de Crear cuenta con contraseña. Es la misma operación de la fila 12. | [Registro](../src/pages/Registro.test.tsx) |
