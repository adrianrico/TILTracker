import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { monitorService } from '../services/monitorService'

const REFETCH_INTERVAL = 60 * 1000

// Normalizes the /monitor/ response into one of:
//   { status: 'ok', maneuvers }
//   { status: 'invalid_key' }   -> caller should clear the stored key
//   { status: 'rate_limited' }  -> temporary, keep the key, let the user retry
async function fetchManeuvers(key) {
  const response = await monitorService.getByKey(key)

  if (response.status === 429) return { status: 'rate_limited' }
  if (response.status === 400) return { status: 'invalid_key' }

  const { code, maneuvers_data } = response.data
  if (code === '1') return { status: 'ok', maneuvers: maneuvers_data }
  return { status: 'invalid_key' }
}

export function useManeuvers(key, { onInvalidKey } = {}) {
  const query = useQuery({
    queryKey: ['maneuvers', key],
    queryFn: () => fetchManeuvers(key),
    enabled: !!key,
    refetchInterval: REFETCH_INTERVAL,
    retry: 1,
  })

  const result = query.data
  const isInvalidKey = result?.status === 'invalid_key'

  useEffect(() => {
    if (isInvalidKey) onInvalidKey?.()
  }, [isInvalidKey, onInvalidKey])

  return {
    maneuvers: result?.status === 'ok' ? result.maneuvers : [],
    isLoading: query.isLoading,
    isRateLimited: result?.status === 'rate_limited',
    isNetworkError: query.isError,
    refetch: query.refetch,
  }
}
