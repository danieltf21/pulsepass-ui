# PulsePass UI

Frontend de PulsePass para consultar eventos, artistas y sedes, comprar entradas y operar los módulos de staff y administración. Usa React, TypeScript, Vite y Tailwind CSS.

## Requisitos

- Node.js 22.22.2 o posterior en la serie 22, o Node.js 24.15.0 o posterior en la serie 24. Las pruebas usan jsdom.
- npm y el archivo `package-lock.json` del repositorio.
- Para usar la aplicación con datos reales, la API de PulsePass debe estar disponible en `http://localhost:8080`. Para probar funciones privadas, usa cuentas de prueba de los roles correspondientes.

## Desarrollo local

Desde la raíz del repositorio, instala las dependencias e inicia Vite.

```sh
npm ci
npm run dev
```

Abre `http://localhost:5173` o la URL que indique Vite. La base de API predeterminada es `/api` y el proxy de Vite reenvía esas solicitudes a `http://localhost:8080`.

Para comprobar que el backend está listo, abre `http://localhost:8080/api/events/published`. Debe responder con JSON. Si necesitas otra base pública de API, copia `.env.example` a `.env.local` y ajusta `VITE_API_BASE_URL`. Las variables `VITE_` se incluyen en el código del navegador y deben contener únicamente valores públicos.

## Recorridos por perfil

| Perfil | Desde la aplicación |
| --- | --- |
| Visitante | Consulta Inicio, Eventos, Artistas y Sedes. Puedes iniciar sesión o crear una cuenta. |
| Cliente (`USER`) | Abre un evento publicado para comprar una entrada y consulta el resultado en Mis tickets. |
| Staff (`STAFF`) | Abre Validar ingreso o Tickets pagados desde el menú. |
| Administración (`ADMIN`) | Abre Administrar eventos para crear, publicar o asociar artistas a un evento. También dispone de las pantallas de staff. |

## Pruebas y compilación

```sh
npm test
npm run lint
npm run build
npm run preview
```

Las pruebas usan Vitest, Testing Library y MSW, por lo que pueden ejecutarse con el backend apagado. Para una ejecución con dos trabajadores, usa `npm test -- --maxWorkers=2`.

`npm run build` verifica TypeScript y genera `dist/`. `npm run preview` sirve esa compilación en local, normalmente en `http://localhost:4173`. Para consultar datos durante la vista previa, mantén disponible la API.

Si PowerShell bloquea `npm.ps1`, usa `npm.cmd` en los comandos anteriores.

## Auditoría

- [Auditoría del PRD](docs/AUDITORIA_PRD.md)
- [Matriz de trazabilidad de pruebas](docs/TRAZABILIDAD_PRUEBAS.md)
