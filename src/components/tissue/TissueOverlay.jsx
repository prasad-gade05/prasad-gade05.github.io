import { Suspense, useState, useCallback, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import TissuePaper from './TissuePaper'
import './TissueOverlay.css'

const TOTAL_PINS = 4

const CANVAS_BG_BY_THEME = {
  'dark':         '#d4d4d4',
  'light':        '#0a0a0a',
  'arcade-dark':  '#d4d4d4',
  'arcade-light': '#0a0a0a',
}
const DEFAULT_CANVAS_BG = '#0a0a0a'

function useCurrentTheme() {
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute('data-theme') || 'dark'
  )

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const t = document.documentElement.getAttribute('data-theme') || 'dark'
      setTheme(t)
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  return theme
}

const TissueOverlay = ({ textureUrl, onExit }) => {
  const currentTheme = useCurrentTheme()
  const canvasBg = CANVAS_BG_BY_THEME[currentTheme] || DEFAULT_CANVAS_BG

  const [availablePins, setAvailablePins] = useState(TOTAL_PINS)
  const [isPinMode, setIsPinMode] = useState(false)
  const [resetKey, setResetKey] = useState(0)

  const handlePinUsed = useCallback(() => {
    setAvailablePins(n => n - 1)
    setIsPinMode(false)
  }, [])

  const handlePinReturned = useCallback(() => {
    setAvailablePins(n => n + 1)
  }, [])

  const togglePinMode = useCallback(() => {
    setIsPinMode(prev => !prev)
  }, [])

  const handleReset = useCallback(() => {
    setResetKey(k => k + 1)
    setAvailablePins(TOTAL_PINS)
    setIsPinMode(false)
  }, [])

  return (
    <div className="tissue-overlay">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        style={{ background: canvasBg }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={[canvasBg]} />
        <ambientLight intensity={0.85} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} />
        <directionalLight position={[-3, -2, 4]} intensity={0.2} />
        <Suspense fallback={null}>
          <TissuePaper
            textureUrl={textureUrl}
            isPinMode={isPinMode}
            onPinUsed={handlePinUsed}
            onPinReturned={handlePinReturned}
            resetKey={resetKey}
          />
        </Suspense>
      </Canvas>

      {/* Controls — top-right */}
      <div className="tissue-controls">
        <button className="tissue-exit-btn" onClick={onExit} title="Back to site (Esc)">
          ✕
        </button>
      </div>

      {/* Pin tray — left side */}
      <div className="tissue-pin-tray">
        <button className="tissue-reset-btn" onClick={handleReset} title="Reset doodle">
          ↺ Reset
        </button>

        <span className="pin-tray-label">Pins</span>
        <div className="pin-tray-items">
          {Array.from({ length: availablePins }).map((_, i) => (
            <button
              key={i}
              className={`pin-tray-pin ${isPinMode ? 'active' : ''}`}
              onClick={togglePinMode}
              title="Click to pin a spot on the paper"
            >
              📌
            </button>
          ))}
          {availablePins === 0 && (
            <span className="pin-tray-empty">none left</span>
          )}
        </div>
        {isPinMode && (
          <span className="pin-tray-hint">Click anywhere to place a pin</span>
        )}
      </div>

      {/* Bottom hint */}
      <div className="tissue-hint">
        Drag the paper&ensp;·&ensp;Place 📌 on canvas, bring paper to it&ensp;·&ensp;<kbd>Esc</kbd> to return
      </div>
    </div>
  )
}

export default TissueOverlay
