import httpClient from '@/shared/api/httpClient'

/**
 * Capa de acceso al endpoint de monitoreo del backend.
 *
 * Los componentes nunca llaman a axios directamente: pasan por este servicio,
 * así si cambia la ruta o el transporte solo se toca este archivo.
 */
export const monitorService = {
  /**
   * Obtiene las maniobras asociadas a una llave.
   * `params` hace que axios codifique la llave (`encodeURIComponent`), evitando
   * inyección de parámetros en la URL.
   *
   * @param {string} key Llave ya validada con `isValidKeyFormat`.
   * @returns {Promise<import('axios').AxiosResponse>} Status 400 = llave rechazada, 429 = rate limit.
   */
  getByKey: (key) => httpClient.get('/maneuvers/monitor/', { params: { key } }),
}
