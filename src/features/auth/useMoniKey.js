import { useCallback, useState } from 'react'
import { isValidKeyFormat } from './keyFormat'

/** Clave de `localStorage` donde se persiste la llave del usuario. */
const STORAGE_KEY = 'til_moni_key'

/**
 * Lee `localStorage` de forma segura: puede lanzar excepción en modo privado
 * o con almacenamiento bloqueado, y la app debe seguir funcionando.
 */
function readStoredKey() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return isValidKeyFormat(stored) ? stored : null
  } catch {
    return null
  }
}

/** Escribe/borra en `localStorage` ignorando fallos de almacenamiento. */
function writeStoredKey(value) {
  try {
    if (value === null) window.localStorage.removeItem(STORAGE_KEY)
    else window.localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // Sin persistencia: la llave vive solo en memoria durante la sesión.
  }
}

/**
 * Gestiona la llave de acceso del usuario y su persistencia en `localStorage`,
 * para no volver a pedirla en cada visita.
 *
 * Una llave guardada con formato inválido (manipulada a mano, por ejemplo) se
 * ignora al arrancar.
 *
 * @returns {{
 *   key: string | null,
 *   saveKey: (newKey: string) => boolean,
 *   clearKey: () => void,
 * }} `saveKey` devuelve `false` (y no guarda) si el formato es inválido.
 */
export function useMoniKey() {
  // Inicializador perezoso: lee localStorage una sola vez, en el primer render.
  const [key, setKeyState] = useState(readStoredKey)

  const saveKey = useCallback((newKey) => {
    if (!isValidKeyFormat(newKey)) return false
    writeStoredKey(newKey)
    setKeyState(newKey)
    return true
  }, [])

  const clearKey = useCallback(() => {
    writeStoredKey(null)
    setKeyState(null)
  }, [])

  return { key, saveKey, clearKey }
}
