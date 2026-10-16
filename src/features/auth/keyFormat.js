/**
 * Validación del formato de la llave de acceso (`man_moni_key`).
 *
 * Es una defensa en el cliente contra payloads raros (p. ej. operadores NoSQL
 * como `{"$ne": ""}`): solo se aceptan caracteres alfanuméricos, guion y
 * guion bajo. El backend vuelve a validar; esto NO sustituye esa validación,
 * solo evita enviar basura y da feedback inmediato.
 */
const KEY_FORMAT = /^[A-Za-z0-9_-]{4,100}$/

/**
 * @param {unknown} key
 * @returns {boolean} `true` si `key` es un string con formato válido de llave.
 */
export function isValidKeyFormat(key) {
  return typeof key === 'string' && KEY_FORMAT.test(key)
}
