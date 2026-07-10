# TIL TRACKER

SPA en React 19 + Vite para seguimiento en tiempo real de maniobras de transporte. Consume el backend [`maylob_backend`](../maylob_backend) (Express + Mongoose) mediante una llave de acceso por cliente.

## Requisitos

- Node.js 18+
- El backend `maylob_backend` corriendo (local en `:8080`, o el ya desplegado en Render)

## Desarrollo local

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`. En modo `dev`, Vite carga `.env.development` (`VITE_API_URL=http://localhost:8080`), así que necesitas `maylob_backend` corriendo en ese puerto.

## Build de producción

```bash
npm run build
npm run preview   # sirve dist/ localmente, igual que quedará en línea
```

`vite build` corre en modo `production` y toma `VITE_API_URL` de `.env.production` (backend ya desplegado en Render). **No hay que tocar código para alternar entre local y producción** — Vite elige el archivo de entorno según el modo:

| Archivo             | Se usa en      | `VITE_API_URL`                          |
|---------------------|----------------|------------------------------------------|
| `.env.development`  | `npm run dev`  | `http://localhost:8080`                   |
| `.env.production`   | `npm run build`| URL del backend en Render                 |
| `.env.example`      | referencia     | plantilla para nuevas variables           |

## Deploy en Render

1. Sube este repo a GitHub (push a `main`/`master`).
2. En Render: **New → Blueprint**, apunta al repo de GitHub — Render detecta `render.yaml` (sitio estático: build `npm install && npm run build`, publica `dist/`, con rewrite SPA `/* → /index.html`).
3. Confirma que el backend esté desplegado primero y que `.env.production` apunte a su URL real antes de hacer build/push.

## Notas

- `graphify-out/`, `.agents/`, `.claude/` y `skills-lock.json` son artefactos de tooling de Claude Code y están en `.gitignore` — no forman parte de la app.
