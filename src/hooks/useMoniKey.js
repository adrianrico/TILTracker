import { useCallback, useState } from 'react'
import { isValidKeyFormat } from '../utils/security'

const STORAGE_KEY = 'til_moni_key'

export function useMoniKey() {
  const [key, setKeyState] = useState(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return isValidKeyFormat(stored) ? stored : null
  })

  const saveKey = useCallback((newKey) => {
    if (!isValidKeyFormat(newKey)) return false
    window.localStorage.setItem(STORAGE_KEY, newKey)
    setKeyState(newKey)
    return true
  }, [])

  const clearKey = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY)
    setKeyState(null)
  }, [])

  return { key, saveKey, clearKey }
}
