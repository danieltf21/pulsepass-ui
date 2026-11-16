# Estado para retomar PulsePass

## Git y acuerdos

- Rama actual: `feature/mis-tickets`, creada desde `develop` en `2c4ba6c`.
- PR #7 de compra de tickets fusionado en `develop`; compra real y recarga de confirmaci?n verificadas por el usuario.
- El usuario autoriz? el commit y push de este bloque. Consultar git status y git log para confirmar su publicaci?n; futuras operaciones requieren autorizaci?n nueva.
- Avanzar paso a paso y anunciar los archivos y el prop?sito antes de editar.
- Las ramas salen de develop y los PR apuntan a develop. Main se integra al finalizar.

## Implementado en esta rama

- API: consulta por correo y cancelaci?n PATCH, respuestas validadas con Zod.
- Hooks: listado con correo de sesi?n y cancelaci?n para USER.
- P?gina Mis tickets, ruta protegida y enlace del men? para USER.
- Filtros en cliente: Todos, Pagados, Usados y Cancelados, con aria-pressed.
- Detalle con c?digo, estado, tipo, precio, fecha, comprador y bot?n Copiar.
- Cancelaci?n desde listado y detalle mediante un modal compartido; solo visible para PAID.
- Conflictos mantienen abierto el modal; bloqueo de env?os duplicados.
- Enlace Ver mis tickets desde la confirmaci?n de compra.

## Correcci?n pendiente de confirmar en navegador

El usuario inform? que al cancelar deb?a recargar para actualizar el listado.
Se corrigi? useCancelarTicket: comprueba la sesi?n activa sin depender de la consulta auth/me en cach?, cancela consultas anteriores y actualiza el listado directamente con el ticket devuelto antes de invalidar consultas.
Hay una prueba de regresi?n con y sin cach? auth/me.
No afirmar que la correcci?n est? verificada en navegador: el usuario todav?a no lo confirm?.

## Comprobaciones y pendientes

- Build y lint correctos tras los cambios de c?digo. ?ltima suite completa: 132 pruebas pasando en 23 archivos.
- Pruebas cubren listado, filtros, vac?o, errores, detalle, cancelaci?n, conflictos, duplicados y actualizaci?n entre vistas.
- Los di?logos usan simulaci?n de showModal/close en jsdom; esto no verifica foco, Escape ni bloqueo del fondo en navegador.
- Verificar con backend: cancelar desde Pagados, desaparici?n inmediata, presencia en Cancelados/Todos y persistencia tras recargar.
- Verificar copiar c?digo y pegarlo, adem?s del manejo de error del portapapeles.
- Revisar fidelidad visual y requisitos pendientes antes de declarar cumplimiento completo del PRD.
- Despu?s de validar: pedir autorizaci?n de commit y push; PR a develop. STAFF es el siguiente m?dulo, no est? implementado.

## Referencias

- PRD: `C:/Users/WINDOWS 11/Desktop/PRD_PulsePass_Frontend_React_TypeScript_Tailwind.pdf`.
- Backend de referencia en lectura: `C:/Users/WINDOWS 11/IdeaProjects/pulsepass`.
- Seguir la estructura acordada api, hooks y components con pages, layouts y lib auxiliares.
- El n?mero de pruebas no representa el porcentaje de cumplimiento del PRD.

## Comandos

```powershell
git status
npm.cmd test
npm.cmd run build
npm.cmd run lint
npm.cmd run dev
```

Antes de levantar otro servidor, comprobar si Vite ya est? ejecut?ndose y usar la URL de la terminal.
