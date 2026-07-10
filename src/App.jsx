import { useCallback, useState } from 'react'
import { useMoniKey } from './hooks/useMoniKey'
import { useManeuvers } from './hooks/useManeuvers'
import { usePollingCheck } from './hooks/usePollingCheck'
import KeyGate from './components/KeyGate'
import TrackerView from './components/TrackerView'
import ThreeBackground from './components/ThreeBackground'
import ParallaxLayer from './components/ParallaxLayer'
import PollingModal from './components/PollingModal'

export default function App() {
  const { key, saveKey, clearKey } = useMoniKey()
  const [notice, setNotice] = useState('')

  const handleInvalidKey = useCallback(() => {
    clearKey()
    setNotice('Tu llave ya no es válida, solicita una nueva o ingresa la nueva para continuar.')
  }, [clearKey])

  const { maneuvers, isLoading, isFetching, isRateLimited, isNetworkError, refetch } = useManeuvers(key, {
    onInvalidKey: handleInvalidKey,
  })

  const [pollingEnabled, setPollingEnabled] = useState(true)
  const { isChecking } = usePollingCheck(refetch, { enabled: !!key && pollingEnabled })

  function handleTogglePolling() {
    setPollingEnabled((prev) => !prev)
  }

  function handleSubmitKey(newKey) {
    setNotice('')
    saveKey(newKey)
  }

  function handleChangeKey() {
    clearKey()
    setNotice('')
  }

  return (
    <>
      <ThreeBackground />
      <ParallaxLayer speed={0.12} className="parallax-layer--a" />
      <ParallaxLayer speed={-0.08} className="parallax-layer--b" />
      <PollingModal open={isChecking} />

      {!key ? (
        <KeyGate onSubmit={handleSubmitKey} notice={notice} />
      ) : (
        <TrackerView
          maneuvers={maneuvers}
          isLoading={isLoading}
          isFetching={isFetching}
          isRateLimited={isRateLimited}
          isNetworkError={isNetworkError}
          onRetry={refetch}
          onRefresh={refetch}
          onChangeKey={handleChangeKey}
          pollingEnabled={pollingEnabled}
          onTogglePolling={handleTogglePolling}
        />
      )}
    </>
  )
}
