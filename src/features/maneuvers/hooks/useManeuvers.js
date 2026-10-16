import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { monitorService } from '../api/monitorService'

/**
 * Normaliza la respuesta de `/maneuvers/monitor/` a un resultado discriminado
 * por `status`, para que la UI no tenga que conocer códigos HTTP:
 *
 *   { status: 'ok', maneuvers }  datos válidos
 *   { status: 'invalid_key' }    la llave ya no existe -> el llamador debe borrarla
 *   { status: 'rate_limited' }   temporal -> conservar la llave y permitir reintentar
 *
 * @param {string} key
 */
async function fetchManeuvers(key) {
  const response = await monitorService.getByKey(key)

  if (response.status === 429) return { status: 'rate_limited' }
  if (response.status === 400) return { status: 'invalid_key' }

  const { code, maneuvers_data } = response.data
  if (code === '1') return { status: 'ok', maneuvers: maneuvers_data }
  return { status: 'invalid_key' }
}

/**
 * Hook de datos: consulta las maniobras de una llave con React Query
 * (caché, reintentos, estados de carga). No hay polling automático aquí;
 * eso lo orquesta `usePollingCheck` llamando a `refetch`.
 *
 * @param {string | null} key Sin llave la consulta queda deshabilitada.
 * @param {object} [options]
 * @param {() => void} [options.onInvalidKey] Se invoca cuando el backend rechaza la llave.
 */
export function useManeuvers(key, { onInvalidKey } = {}) {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: ['maneuvers', key],
    queryFn: () => fetchManeuvers(key),
    enabled: !!key,
    refetchInterval: false,
    retry: 1,
  })

  const result = query.data
  const isInvalidKey = result?.status === 'invalid_key'

  useEffect(() => {
    // Se purga la respuesta `invalid_key` de la caché: si el usuario reintroduce
    // exactamente la misma cadena tras "cambiar llave", debe hacerse una petición
    // nueva y no reutilizar el rechazo cacheado (hasta `staleTime`, 30 s).
    if (isInvalidKey) {
      queryClient.removeQueries({ queryKey: ['maneuvers', key], exact: true })
      onInvalidKey?.()
    }
  }, [isInvalidKey, onInvalidKey, queryClient, key])

  return {
    maneuvers: result?.status === 'ok' ? result.maneuvers : [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isRateLimited: result?.status === 'rate_limited',
    isNetworkError: query.isError,
    refetch: query.refetch,
  }
}
