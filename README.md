# TIL TRACKER

SPA en React 19 + Vite para seguimiento en tiempo real de maniobras de transporte. Consume el backend [`TIL_Backend`](../TIL_Backend) (Express + Mongoose) mediante una llave de acceso por cliente.

> ¿Quieres aprender a construir un proyecto igual desde cero? Lee **[`GUIA_APRENDIZAJE.md`](GUIA_APRENDIZAJE.md)**.

## Arquitectura (por features)

```
src/
├── main.jsx                  Punto de entrada: monta React + proveedores + estilos
├── app/App.jsx               Composición: decide qué pantalla ver y une las features
├── features/                 Cada carpeta = una capacidad completa del producto
│   ├── auth/                 Llave de acceso: formulario, validación, persistencia
│   ├── maneuvers/            Dominio: api/ (red) · hooks/ (datos) · lib/ (lógica pura) · components/ (UI)
│   └── polling/              Auto-actualización respetuosa con la actividad del usuario
├── shared/                   Código reutilizable sin conocimiento del negocio
│   ├── api/httpClient.js     Única instancia de axios
│   ├── hooks/ · lib/         useIsDesktop, animaciones
│   └── effects/              Fondo Three.js y parallax
└── styles/                   tokens → glass → neumo → layout
```

Reglas: `features/*` pueden importar de `shared/`, **nunca** de otra feature salvo en `app/` (composición). La lógica de negocio vive en funciones puras (`lib/`) con tests. Alias de imports: `@` = `src/`.

## Requisitos

- Node.js 18+
- Para `npm run dev`: `TIL_Backend` en local (`:4000`, API en `/api/v1`).

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Dev server contra backend local (`.env.development`) |
| `npm run dev:mock` | Dev server con backend simulado (`mock/mockApi.js`); llaves: `demo1234` (válida), `limite` (429), otra cualquiera (rechazada). No necesita backend ni red |
| `npm run dev:online` | Dev server contra el backend en Render (`.env.production`) |
| `npm run build` / `npm run preview` | Build de producción y vista previa local |
| `npm test` | Tests unitarios (Vitest) de la lógica de dominio y validaciones |
| `npm run audit:prod` | Auditoría de vulnerabilidades de dependencias de producción |

## Seguridad

- La llave se valida con lista blanca (`^[A-Za-z0-9_-]{4,100}$`) antes de enviarse o guardarse (evita inyección NoSQL desde el cliente; el backend vuelve a validar).
- Enlaces GPS: solo `http(s)`; se cargan con `referrerPolicy="no-referrer"`.
- React escapa todo el contenido del backend; no se usa `dangerouslySetInnerHTML`.
- `localStorage` protegido con try/catch (modo privado / bloqueado).
- Cabeceras en `render.yaml`: CSP (scripts propios, XHR solo al backend), `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`.
- Dependencias auditadas (`npm audit` = 0 vulnerabilidades).
- Limitación conocida: la llave viaja como query string (`?key=`) porque así lo define el backend; cambiarlo a header/POST requiere modificar `TIL_Backend`.
- Si cambias la URL del backend, actualiza también `connect-src` en `render.yaml`.

## Deploy en Render

1. Sube el repo a GitHub.
2. En Render: **New → Blueprint** y apunta al repo (`render.yaml`: `npm ci && npm test && npm run build`, publica `dist/`, rewrite SPA y cabeceras).
3. El backend debe estar desplegado y `.env.production` apuntar a su URL real.
