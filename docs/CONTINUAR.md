# Estado para retomar PulsePass

## Git y acuerdos

- Rama actual: feature/navegacion-movil, desde develop en 1aa28b2.
- PR #10 de ADMIN fusionado en develop; confirmado contra GitHub el 2026-11-16. Develop local actualizado por fast-forward.
- PR #9 de STAFF fusionado en develop.
- El usuario autorizo commit y push del bloque ADMIN. Verificar git status y git log al retomar; futuros commits requieren permiso nuevo.
- El usuario autorizo tambien commit y push del bloque de navegacion movil tras completar su revision visual. No incluye autorizacion de fusion.
- Avanzar paso a paso y anunciar archivos y finalidad antes de modificar.
- Nuevas ramas desde develop; PR hacia develop. Main al terminar el proyecto.

## Bloque actual: navegacion movil

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
- Commit y push de este bloque autorizados; verificar git status y git log al retomar para confirmar su ejecucion. Futuros bloques requieren permiso nuevo.

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

1. Bloque de navegacion movil listo para revision del usuario: 3 archivos modificados, 179 pruebas pasando, build/lint correctos y menu revisado visualmente en los cuatro perfiles.
2. Ejecutar commit/push ya autorizados y preparar PR hacia develop; verificar primero el estado remoto. No fusionar sin autorizacion.
3. Continuar la revision del PRD: fidelidad visual, responsive completo, menu de usuario, accesibilidad, modo oscuro y otros criterios no cerrados.
4. Actualizar AUDITORIA_PRD.md con evidencia actual antes de comunicar otro porcentaje: su matriz corresponde al estado anterior a autenticacion, tickets, STAFF y ADMIN.
5. Mantener la auditoria honesta: el numero de pruebas no equivale al porcentaje de cumplimiento.

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
