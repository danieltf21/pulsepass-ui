# Estado para retomar PulsePass

## Git y acuerdos

- Rama actual: feature/admin-eventos, desde develop en 2ecd6b5.
- PR #9 de STAFF fusionado en develop.
- El usuario autorizo commit y push del bloque ADMIN. Verificar git status y git log al retomar; futuros commits requieren permiso nuevo.
- Avanzar paso a paso y anunciar archivos y finalidad antes de modificar.
- Nuevas ramas desde develop; PR hacia develop. Main al terminar el proyecto.

## Implementado en esta rama

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

## Validacion

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

1. Revisar/abrir PR de feature/admin-eventos hacia develop; no fusionar sin autorizacion.
2. Confirmar fusion y actualizar develop antes de preparar otra rama.
3. Revisar los pendientes del PRD contra el codigo: fidelidad visual, responsive, menu movil, accesibilidad, modo oscuro y otros criterios no cerrados.
4. Mantener la auditoria honesta: el numero de pruebas no equivale al porcentaje de cumplimiento.

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
