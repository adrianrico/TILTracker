# TIL TRACKER

SPA en React 19 + Vite para seguimiento en tiempo real de maniobras de transporte. Consume el backend [`maylob_backend`](../maylob_backend) (Express + Mongoose) mediante una llave de acceso por cliente.

## Requisitos

- Node.js 18+

## Desarrollo local

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`. Tanto `npm run dev` como `npm run build` apuntan al backend ya desplegado en Render (`https://maylob-backend.onrender.com`) — no se necesita `maylob_backend` corriendo en local.

## Build de producción

```bash
npm run build
npm run preview   # sirve dist/ localmente, igual que quedará en línea
```

`vite build` corre en modo `production` y toma `VITE_API_URL` de `.env.production`. **No hay que tocar código para alternar entre `dev` y `build`** — ambos usan el mismo backend en línea:

| Archivo             | Se usa en      | `VITE_API_URL`                          |
|---------------------|----------------|------------------------------------------|
| `.env.development`  | `npm run dev`  | backend en línea (Render)                 |
| `.env.production`   | `npm run build`| backend en línea (Render)                 |
| `.env.example`      | referencia     | plantilla para nuevas variables           |

## Deploy en Render

1. Sube este repo a GitHub (push a `main`/`master`).
2. En Render: **New → Blueprint**, apunta al repo de GitHub — Render detecta `render.yaml` (sitio estático: build `npm install && npm run build`, publica `dist/`, con rewrite SPA `/* → /index.html`).
3. Confirma que el backend esté desplegado primero y que `.env.production` apunte a su URL real antes de hacer build/push.

## Notas

- `graphify-out/`, `.agents/`, `.claude/` y `skills-lock.json` son artefactos de tooling de Claude Code y están en `.gitignore` — no forman parte de la app.
