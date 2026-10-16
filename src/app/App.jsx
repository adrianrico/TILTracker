import { lazy, Suspense, useCallback, useState } from 'react'
import { useMoniKey } from '@/features/auth/useMoniKey'
import KeyGate from '@/features/auth/KeyGate'
import { useManeuvers } from '@/features/maneuvers/hooks/useManeuvers'
import TrackerView from '@/features/maneuvers/components/TrackerView'
import { usePollingCheck } from '@/features/polling/usePollingCheck'
import PollingModal from '@/features/polling/PollingModal'
import ParallaxLayer from '@/shared/effects/ParallaxLayer'

// Code splitting: Three.js pesa ~500 kB y es solo decorativo, así que se
// descarga en un chunk aparte sin retrasar la pantalla de llave.
const ThreeBackground = lazy(() => import('@/shared/effects/ThreeBackground'))

/**
 * Raíz de la aplicación: "compone" las features y decide qué pantalla ver.
 *
 *   sin llave  -> KeyGate (pedir llave)
 *   con llave  -> TrackerView (maniobras)
 *
 * Aquí vive el estado que cruza features (llave, aviso, polling activado).
 * La lógica de cada feature está en `src/features/*`.
 */
export default function App() {
  const { key, saveKey, clearKey } = useMoniKey()
  const [notice, setNotice] = useState('')

  // useCallback: el hook de datos usa este callback en un efecto; con
  // identidad estable no se vuelve a disparar en cada render.
  const handleInvalidKey = useCallback(() => {
    clearKey()
    setNotice('Tu llave ya no es válida, solicita una nueva o ingresa la nueva para continuar.')
  }, [clearKey])

  const { maneuvers, isLoading, isFetching, isRateLimited, isNetworkError, refetch } = useManeuvers(key, {
    onInvalidKey: handleInvalidKey,
  })

  const [pollingEnabled, setPollingEnabled] = useState(true)
  const { isChecking } = usePollingCheck(refetch, { enabled: !!key && pollingEnabled })

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
      <Suspense fallback={null}>
        <ThreeBackground />
      </Suspense>
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
          onTogglePolling={() => setPollingEnabled((prev) => !prev)}
        />
      )}
    </>
  )
}
