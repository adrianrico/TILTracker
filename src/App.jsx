import { useCallback, useState } from 'react'
import { useMoniKey } from './hooks/useMoniKey'
import { useManeuvers } from './hooks/useManeuvers'
import KeyGate from './components/KeyGate'
import TrackerView from './components/TrackerView'

export default function App() {
  const { key, saveKey, clearKey } = useMoniKey()
  const [notice, setNotice] = useState('')

  const handleInvalidKey = useCallback(() => {
    clearKey()
    setNotice('Tu llave ya no es válida, ingresa la nueva.')
  }, [clearKey])

  const { maneuvers, isLoading, isRateLimited, isNetworkError, refetch } = useManeuvers(key, {
    onInvalidKey: handleInvalidKey,
  })

  function handleSubmitKey(newKey) {
    setNotice('')
    saveKey(newKey)
  }

  function handleChangeKey() {
    clearKey()
    setNotice('')
  }

  if (!key) {
    return <KeyGate onSubmit={handleSubmitKey} notice={notice} />
  }

  return (
    <TrackerView
      maneuvers={maneuvers}
      isLoading={isLoading}
      isRateLimited={isRateLimited}
      isNetworkError={isNetworkError}
      onRetry={refetch}
      onChangeKey={handleChangeKey}
    />
  )
}
