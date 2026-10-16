# Guía de aprendizaje: construir TIL TRACKER desde cero

Objetivo: que puedas reconstruir un proyecto igual (SPA React que consulta un API con una llave, muestra una lista filtrable, se actualiza sola y es segura) entendiendo **por qué** se hace cada cosa. Cada paso trae un ejemplo mínimo. El código real está en `src/`.

---

## Parte 1. Conceptos clave

### 1.1 SPA (Single Page Application)
Una sola página HTML (`index.html`) cargada una vez; JavaScript pinta y cambia la interfaz sin recargar. Ventaja: fluida y se despliega como archivos estáticos (barato). Consecuencia: **todo el código se descarga al navegador**, así que jamás pongas secretos en él y asume que el usuario puede manipularlo.

### 1.2 React y componentes
UI = función del estado: `UI = f(estado)`. Un componente es una función que recibe `props` y devuelve JSX.

```jsx
function StatusChip({ status }) {
  return <span className="status-chip">{status || 'SIN ESTATUS'}</span>
}
```
- **Props**: datos que entran (solo lectura).
- **Estado** (`useState`): datos que cambian y re-renderizan.
- **Efectos** (`useEffect`): sincronizar con el exterior (red, eventos, timers). Siempre limpia lo que creas: `return () => clearInterval(timer)`.
- **Refs** (`useRef`): valor mutable que NO provoca render, o acceso directo a un nodo del DOM.
- **Memo** (`useMemo`/`useCallback`): reutilizar un cálculo/función entre renders.

### 1.3 Vite
Servidor de desarrollo instantáneo (HMR) y *bundler* de producción. Lee `index.html`, sigue los `import` y genera `dist/`. Variables de entorno: solo las que empiezan con `VITE_` llegan al navegador (`import.meta.env.VITE_API_URL`). **Nunca** guardes secretos en ellas: son públicas.

### 1.4 Modos y archivos `.env`
`npm run dev` → modo `development` → `.env.development`. `vite build` → modo `production` → `.env.production`. Con `--mode production` puedes tener dev server contra el backend real (`dev:online`).

### 1.5 Arquitectura por features
Organiza por **capacidad del producto**, no por tipo de archivo. Mal: `components/`, `hooks/`, `utils/` con 40 archivos mezclados. Bien: `features/auth`, `features/maneuvers`, `features/polling`. Cada feature agrupa su UI, sus hooks, su acceso a red y su lógica. Capas dentro de una feature:

| Capa | Responsabilidad | Depende de |
|---|---|---|
| `components/` | Pintar y capturar eventos | hooks, lib |
| `hooks/` | Estado y datos (React) | api, lib |
| `api/` | Hablar con el servidor | `shared/api` |
| `lib/` | Reglas de negocio **puras** | nada |

Regla de dependencias: flechas hacia abajo. `lib` no conoce React; `shared` no conoce el negocio. Esto hace el código probable y reemplazable.

### 1.6 Funciones puras y tests
Una función pura da siempre el mismo resultado para los mismos argumentos y no toca nada externo. Son triviales de probar:

```js
expect(parseProgress('150')).toBe(100)
```
Pon la lógica difícil (filtros, ordenamiento, parseo) en funciones puras y pruébala; la UI queda delgada.

### 1.7 Datos remotos con React Query
Maneja caché, estados de carga/error, reintentos y refetch. En vez de `useEffect + fetch + 3 useState`, escribes:

```js
const query = useQuery({ queryKey: ['maneuvers', key], queryFn: () => fetchManeuvers(key), enabled: !!key })
```
`queryKey` identifica la caché; `enabled: false` evita la petición; `staleTime` define cuánto se considera fresco.

### 1.8 Capa de servicios (axios)
Un solo cliente configurado (`shared/api/httpClient.js`) y un servicio por recurso (`monitorService`). Los componentes nunca conocen URLs. Truco clave: `validateStatus: s => s < 500` hace que 400/429 **no lancen error**, y conviertes la respuesta a un resultado discriminado:

```js
if (response.status === 429) return { status: 'rate_limited' }
if (response.status === 400) return { status: 'invalid_key' }
return { status: 'ok', maneuvers }
```
La UI trabaja con estados con nombre, no con códigos HTTP.

### 1.9 Seguridad en una SPA (lo esencial)
1. **Valida entradas con lista blanca** (qué SÍ se permite), no lista negra. Ej.: llave `^[A-Za-z0-9_-]{4,100}$` bloquea `{"$ne":""}` (inyección NoSQL).
2. **El cliente no es una frontera de seguridad.** Valida SIEMPRE también en el backend.
3. **XSS**: React escapa el texto por defecto. Evita `dangerouslySetInnerHTML`, `innerHTML`, `eval`. Si usas URLs externas (GPS), acepta solo `http:`/`https:` (bloquea `javascript:`).
4. **CSP** (Content-Security-Policy): cabecera que dice al navegador qué orígenes puede cargar/contactar. Aunque alguien inyecte un script, no se ejecuta.
5. **Cabeceras**: `X-Content-Type-Options`, `X-Frame-Options` (anti-clickjacking), `Referrer-Policy`, `Permissions-Policy`.
6. **Dependencias**: `npm audit` y `npm ci` (instala exactamente el lockfile).
7. **localStorage** es legible por cualquier script de tu origen: guarda solo lo mínimo, envuélvelo en try/catch.
8. **Secretos**: nada sensible en `VITE_*` ni en el repo (`.gitignore` para `.env.local`).
9. **Privacidad**: `referrerPolicy="no-referrer"` en imágenes externas para no filtrar tu URL.

### 1.10 Rendimiento y accesibilidad
- *Code splitting*: `lazy(() => import(...))` descarga Three.js (~500 kB) aparte.
- Un solo bucle `requestAnimationFrame` compartido; se pausa con la pestaña oculta.
- Respeta `prefers-reduced-motion`; usa `aria-label`, `aria-expanded`, `role="status"`.

### 1.11 CSS: tokens + BEM + utilidades
Variables CSS (`--bg-0`) para el tema; clases BEM (`maneuver-card__field--stacked`) para evitar choques; utilidades reutilizables (`.glass`, `.neumo`).

---

## Parte 2. Paso a paso

### Paso 0. Requisitos
Node 18+, Git, editor. Verifica: `node -v`, `npm -v`.

### Paso 1. Crear el proyecto
```bash
npm create vite@latest til-tracker -- --template react
cd til-tracker
npm install
npm i @tanstack/react-query axios animejs three
npm i -D vitest
```
Verás `index.html`, `src/main.jsx`, `vite.config.js`. Ejecuta `npm run dev` y abre `http://localhost:5173`.

### Paso 2. Alias `@` y estructura de carpetas
`vite.config.js`:
```js
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: { environment: 'node', include: ['src/**/*.test.js'] },
})
```
`jsconfig.json` (para que el editor entienda `@`):
```json
{ "compilerOptions": { "baseUrl": ".", "paths": { "@/*": ["src/*"] }, "jsx": "react-jsx" }, "include": ["src"] }
```
Crea:
```
src/app  src/features/{auth,maneuvers/{api,components,hooks,lib},polling}  src/shared/{api,hooks,lib,effects}  src/styles
```
Beneficio del alias: `import { x } from '@/shared/lib/animations'` funciona igual desde cualquier profundidad.

### Paso 3. Variables de entorno
```
# .env.development
VITE_API_URL=http://localhost:8080
# .env.production
VITE_API_URL=https://tu-backend.onrender.com
```
`package.json` scripts:
```json
"dev": "vite",
"dev:online": "vite --mode production",
"build": "vite build",
"preview": "vite preview",
"test": "vitest run"
```
Crea `.env.example` documentando las variables y asegúrate de que `.gitignore` incluya `node_modules`, `dist`, `.env.local`.

### Paso 4. Cliente HTTP (`shared/api/httpClient.js`)
```js
import axios from 'axios'
const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://tu-backend.onrender.com',
  timeout: 10000,
  validateStatus: (s) => s < 500,
})
export default httpClient
```
`timeout` evita peticiones colgadas. Servicio de la feature:
```js
// features/maneuvers/api/monitorService.js
export const monitorService = {
  getByKey: (key) => httpClient.get('/maneuvers/monitor/', { params: { key } }), // axios codifica la llave
}
```

### Paso 5. Seguridad de la llave (feature `auth`)
`keyFormat.js`:
```js
const KEY_FORMAT = /^[A-Za-z0-9_-]{4,100}$/
export const isValidKeyFormat = (k) => typeof k === 'string' && KEY_FORMAT.test(k)
```
`useMoniKey.js` guarda en `localStorage` con try/catch y expone `{ key, saveKey, clearKey }`. Detalle importante: `useState(readStoredKey)` pasa una **función** (inicializador perezoso) para leer el almacenamiento solo una vez.

`KeyGate.jsx`: formulario controlado.
```jsx
const [value, setValue] = useState('')
function handleSubmit(e) {
  e.preventDefault()
  const trimmed = value.trim()
  if (!isValidKeyFormat(trimmed)) return setError(FORMAT_ERROR)
  onSubmit(trimmed)
}
```
Ejercicio: escribe `{"$ne":""}` y comprueba que se rechaza.

### Paso 6. Lógica de dominio pura (`features/maneuvers/lib/maneuver.js`)
Empieza por aquí, **con tests primero**. Ejemplo: el backend manda eventos como array plano de 4 en 4.
```js
export function parseEvents(arr) {
  if (!arr?.length) return []
  const groups = []
  for (let i = 0; i + 3 < arr.length; i += 4) {
    groups.push({ time: arr[i], location: arr[i+1], status: arr[i+2], percentage: arr[i+3] })
  }
  return groups.reverse() // el más reciente primero
}
```
Test (`maneuver.test.js`):
```js
it('agrupa de 4 en 4', () => {
  expect(parseEvents(['t1','A','X','10','t2','B','Y','60'])[0].location).toBe('B')
})
```
Corre `npm test`. Agrega después `filterManeuvers`, `sortByDispatchDate` (fechas ISO se ordenan como texto; las inválidas al final), `summarizeManeuvers`. Observa que ninguna importa React.

### Paso 7. Hook de datos (`useManeuvers`)
```js
const query = useQuery({
  queryKey: ['maneuvers', key],
  queryFn: () => fetchManeuvers(key),
  enabled: !!key,
})
```
Si el resultado es `invalid_key`: borra la caché de esa consulta (`removeQueries`) y llama `onInvalidKey` para que `App` limpie la llave. Si no purgas la caché, reintroducir la misma llave reutilizaría el rechazo guardado.

Proveedor en `main.jsx`:
```jsx
<QueryClientProvider client={new QueryClient()}><App /></QueryClientProvider>
```

### Paso 8. Composición en `App.jsx`
`App` une features: lee la llave, pide datos, decide pantalla.
```jsx
{!key ? <KeyGate onSubmit={saveKey} /> : <TrackerView maneuvers={maneuvers} ... />}
```
Principio: el estado vive en el ancestro común más bajo que lo necesita (*lifting state up*).

### Paso 9. Componentes de UI
Orden recomendado (de hojas a raíz): `StatusChip` → `ProgressRing` → `EventsTimeline` → `ContainerList` → `GPSCanvas` → `ManeuverDetail` → `ManeuverCard` → `ManeuverStats` → `ManeuverFilters` → `TrackerView`.

Patrones a notar:
- **Componente controlado** (`ManeuverFilters`): no guarda el estado, lo recibe por props y avisa con callbacks. `TrackerView` es el dueño de los filtros.
- **Listas con `key` estable**: `key={m.man_id}`, no el índice (si la lista se reordena).
- **Renderizado condicional**: `{expanded && <ManeuverDetail />}` monta el detalle (y carga GPS) solo al abrir.
- **`useMemo`** para filtrar/ordenar solo cuando cambian datos o filtros.

### Paso 10. Auto-actualización respetuosa (`usePollingCheck`)
Problema: refrescar cada minuto no debe interrumpir al usuario. Solución: cada segundo un reloj comprueba (a) pasó ≥ 60 s desde el último sondeo y (b) el usuario lleva ≥ 10 s inactivo. La actividad se marca con eventos (`mousemove`, `keydown`, `scroll`…) escribiendo en un `ref` (no en estado, para no re-renderizar en cada movimiento). Patrón *latest ref*:
```js
const onPollRef = useRef(onPoll)
onPollRef.current = onPoll   // el intervalo llama siempre la versión más nueva
```
Interruptor: `enabled=false` cancela el intervalo en el cleanup del efecto.

### Paso 11. Canvas e imágenes seguras (`GPSCanvas`)
Tres estados: sin enlace válido → "MAPA NO DISPONIBLE"; cargando → radar animado; imagen lista → se dibuja en modo *cover*. Seguridad: `isSafeGpsLink` (solo http/https) y `img.referrerPolicy = 'no-referrer'`. Para pantallas retina escala el canvas con `devicePixelRatio`. Cancela `requestAnimationFrame` y desconecta `ResizeObserver` en el cleanup.

### Paso 12. Animación y efectos
- `shared/lib/animations.js`: un solo ticker `requestAnimationFrame` con suscriptores; se pausa con `document.hidden`.
- `ParallaxLayer`: escribe `style.transform` directo en el nodo.
- `ThreeBackground`: escena de partículas; en el cleanup `dispose()` de geometría/material/renderer (evita fugas de GPU). Se importa con `lazy` + `Suspense` para code splitting.
- Todo respeta `prefersReducedMotion()`.

### Paso 13. Estilos
Orden de carga en `main.jsx`: `tokens.css` (variables) → `glass.css` → `neumo.css` → `layout.css` (componentes, BEM). Para cambiar el tema solo editas `tokens.css`.

### Paso 14. Seguridad de despliegue (`render.yaml`)
Sitio estático + cabeceras:
```yaml
headers:
  - path: /*
    name: Content-Security-Policy
    value: "default-src 'self'; script-src 'self'; connect-src 'self' https://tu-backend.onrender.com; img-src 'self' https: data:; object-src 'none'; frame-ancestors 'none'"
  - { path: /*, name: X-Content-Type-Options, value: nosniff }
  - { path: /*, name: Referrer-Policy, value: no-referrer }
```
Si cambias de backend, actualiza `connect-src` o el navegador bloqueará las peticiones (síntoma típico: error CSP en consola). `buildCommand: npm ci && npm test && npm run build` hace que un test roto impida el deploy.

### Paso 15. Entorno sin backend (mock)
Ver Ejemplo A: `npm run dev:mock` y llave `demo1234`. Útil para desarrollar y para pruebas manuales repetibles.

### Paso 16. Verificación final (checklist)
- [ ] `npm test` en verde.
- [ ] `npm run build` sin errores; revisa que haya un chunk separado de Three.js.
- [ ] `npm audit --omit=dev` → 0 vulnerabilidades.
- [ ] `npm run preview` y probar: llave inválida, llave válida, filtros, auto-actualización, cambiar llave.
- [ ] Con red cortada (DevTools → Offline): aparece "Sin conexión" y la llave se conserva.
- [ ] Sin secretos en el repo (`git grep -i "password\|secret\|token"`).

---

## Parte 3. Errores comunes y cómo evitarlos

| Síntoma | Causa | Solución |
|---|---|---|
| Efecto se ejecuta en bucle | Dependencia que cambia cada render (función/objeto nuevo) | `useCallback`/`useMemo` o *latest ref* |
| Fuga de memoria / doble listener | Falta cleanup en `useEffect` | Devolver función de limpieza |
| Reingresar la misma llave inválida no hace nada | Caché de React Query | `removeQueries` al detectar `invalid_key` |
| Variable de entorno `undefined` | No empieza con `VITE_` o no reiniciaste Vite | Renombrar y reiniciar |
| Peticiones bloqueadas solo en producción | CSP `connect-src` sin la URL del backend | Añadirla en `render.yaml` |
| Refresco interrumpe al usuario | Polling sin detectar actividad | Patrón de inactividad (Paso 10) |

## Parte 4. Ejemplos resueltos (ya implementados en el proyecto)

### Ejemplo A. Probar sin backend: servidor simulado (mock)
**Problema:** necesitas desarrollar aunque el backend esté apagado o en Render "dormido".
**Idea:** un plugin de Vite que responde el mismo contrato, solo en modo `mock`.

1. Plugin (`mock/mockApi.js`): registra un *middleware* en el dev server.
```js
configureServer(server) {
  server.middlewares.use('/maneuvers/monitor', (req, res) => {
    const key = new URL(req.url, 'http://localhost').searchParams.get('key') ?? ''
    if (!KEY_FORMAT.test(key)) return send(400, { code: '0' })
    if (key === 'limite') return send(429, { code: '0' })
    if (key !== 'demo1234') return send(400, { code: '0' })
    return send(200, { code: '1', maneuvers_data: MANEUVERS })
  })
}
```
2. Actívalo solo en modo mock (`vite.config.js`):
```js
export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === 'mock' ? [mockApi()] : [])],
}))
```
3. `.env.mock` con `VITE_API_URL=/` (la app llama a su propio origen) y el script `"dev:mock": "vite --mode mock"`.
4. Pruébalo: `npm run dev:mock`, abre la app e ingresa:

| Llave | Resultado esperado |
|---|---|
| `demo1234` | 3 maniobras (iniciada, sin iniciar, cancelada) |
| `limite` | Mensaje "Demasiadas solicitudes" (429) |
| cualquier otra (`zzzz9999`) | Llave rechazada, vuelve al formulario con aviso |
| `{x}` | Rechazada en el cliente, ni siquiera se envía |

**Por qué importa:** `apply: 'serve'` garantiza que el mock nunca entra al build de producción, y puedes reproducir errores (429, 400) a voluntad.

### Ejemplo B. Añadir un filtro por estatus (función pura primero, UI después)
Flujo recomendado: **test → lógica → estado → UI**.

1. **Test que falla** (`maneuver.test.js`):
```js
it('filtra por cubeta de estatus', () => {
  const data = [
    { man_id: 1, man_current_status: 'EN PROCESO' },
    { man_id: 2, man_current_status: 'CANCELADO' },
  ]
  const ids = (status) => filterManeuvers(data, { status }).map((m) => m.man_id)
  expect(ids('cancelled')).toEqual([2])
  expect(ids('')).toEqual([1, 2])
})
```
2. **Lógica** (`maneuver.js`): un parámetro nuevo con valor por defecto que no rompe a los llamadores existentes.
```js
export function filterManeuvers(maneuvers, { dispatchDate, containerIds, containerQuery, status = '' }) {
  return maneuvers.filter((m) => {
    if (status && maneuverStatusBucket(m.man_current_status) !== status) return false
    ...
```
3. **Estado** (`TrackerView.jsx`, dueño de los filtros): `const [status, setStatus] = useState('')`, pásalo a `filterManeuvers` y agrégalo a las dependencias del `useMemo`. En "Limpiar filtros" llama `setStatus('')`.
4. **UI** (`ManeuverFilters.jsx`, componente controlado): un `<select value={status} onChange={e => onStatusChange(e.target.value)}>` con opciones `''`, `started`, `pending`, `cancelled`. Suma `status` a `hasActiveFilters` y al contador de la insignia.
5. **Verifica:** `npm test` en verde; en la app con `demo1234`, elegir "Canceladas" deja 1 tarjeta y el texto "Mostrando 1 de 3 maniobras".

Lección: el valor por defecto (`status = ''`) permite extender una función sin tocar el resto del código.

### Ejemplo C. ErrorBoundary: que un fallo no deje la pantalla en blanco
Sin protección, un error al renderizar desmonta toda la app. Se resuelve con una clase (no existe versión con hooks):
```jsx
export default class ErrorBoundary extends Component {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error) { console.error('Error de interfaz:', error) }
  render() {
    if (!this.state.hasError) return this.props.children
    return <div role="alert"><p>Algo salió mal.</p><button onClick={() => location.reload()}>Recargar</button></div>
  }
}
```
Se coloca como el envoltorio más externo en `main.jsx`:
```jsx
<ErrorBoundary><QueryClientProvider ...><App /></QueryClientProvider></ErrorBoundary>
```
**Cómo probarlo:** agrega temporalmente `throw new Error('prueba')` al inicio de `StatusChip`, entra con `demo1234` y verás el mensaje en vez de pantalla en blanco. Quita el `throw` después. Limitación: no atrapa errores en manejadores de eventos ni en promesas; para eso usa `try/catch` (como hace `useMoniKey` con `localStorage`).
Seguridad: se registra el detalle en consola, **nunca** se muestra al usuario (los mensajes técnicos revelan estructura interna).

### Ejemplo D. Tema claro/oscuro: cambiar solo `tokens.css`
El proyecto ya define dos paletas con las mismas variables:
```css
:root { --bg-0: #0a0f1a; --text-0: #e6ecf5; ... }              /* oscuro por defecto */
:root[data-theme='light'] { --bg-0: #eef2f8; --text-0: #0f172a; ... }
@media (prefers-color-scheme: light) {
  :root:not([data-theme='dark']) { --bg-0: #eef2f8; ... }       /* sigue al sistema */
}
```
Para forzar un tema, prueba en la consola del navegador: `document.documentElement.dataset.theme = 'light'` (o `'dark'`). Para un botón permanente:
```jsx
function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'
  document.documentElement.dataset.theme = next
  try { localStorage.setItem('til_theme', next) } catch { /* sin persistencia */ }
}
```
y al arrancar (`main.jsx`) restaura el valor guardado. Ningún componente cambia porque todos usan `var(--...)`.

### Ejemplo E. `localStorage` vs `sessionStorage` (decisión de seguridad)
| | `localStorage` | `sessionStorage` |
|---|---|---|
| Duración | Hasta que se borre | Solo la pestaña abierta |
| Alcance | Todas las pestañas del origen | Una pestaña |
| Riesgo si hay XSS | El script lee la llave | Igual, pero la ventana de exposición es menor |
| Experiencia | No vuelve a pedir la llave | La pide cada vez que cierras la pestaña |

La app usa `localStorage` porque el requisito es **no volver a pedir la llave**. Para cambiarlo basta modificar las 3 llamadas en `useMoniKey.js` (`getItem`, `setItem`, `removeItem`) de `window.localStorage` a `window.sessionStorage`. Mitigaciones reales del riesgo XSS: CSP estricta (ya en `render.yaml`), no usar `innerHTML`, validar enlaces externos y mantener dependencias auditadas.

### Ejemplo F. Llave en header en vez de query string (requiere backend)
La llave en `?key=` queda en historiales y logs de servidores. Alternativa:
```js
// monitorService.js
getByKey: (key) => httpClient.get('/maneuvers/monitor/', { headers: { 'X-Moni-Key': key } })
```
Tradeoff: un header personalizado dispara *preflight* CORS (petición `OPTIONS`), así que el backend debe responder `Access-Control-Allow-Headers: X-Moni-Key`. Si el backend no lo soporta, la app se rompe: por eso este cambio se coordina en ambos proyectos y se actualiza `mock/mockApi.js` para leer `req.headers['x-moni-key']`.

## Parte 5. Mapa rápido de archivos
| Archivo | Para qué sirve |
|---|---|
| `src/main.jsx` | Arranque y proveedores |
| `src/app/App.jsx` | Composición de features |
| `features/auth/*` | Llave: formato, persistencia, formulario |
| `features/maneuvers/api` | Llamadas HTTP |
| `features/maneuvers/hooks/useManeuvers.js` | Datos con React Query |
| `features/maneuvers/lib/*` | Reglas puras + tests |
| `features/maneuvers/components/*` | Interfaz |
| `features/polling/*` | Auto-actualización |
| `shared/*` | Cliente HTTP, hooks, animaciones, efectos |
| `render.yaml` | Deploy + cabeceras de seguridad |
| `mock/mockApi.js` + `.env.mock` | Backend simulado para `npm run dev:mock` |
| `shared/ui/ErrorBoundary.jsx` | Red de seguridad ante errores de render |
