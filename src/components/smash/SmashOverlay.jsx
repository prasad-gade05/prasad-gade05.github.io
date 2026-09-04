import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { CircleDot, Crosshair, RotateCcw } from 'lucide-react'
import SmashScene from './SmashScene'
import './SmashOverlay.css'

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

const SmashOverlay = ({ scene, onExit }) => {
  const currentTheme = useCurrentTheme()
  const canvasBg = CANVAS_BG_BY_THEME[currentTheme] || DEFAULT_CANVAS_BG
  const [weapon, setWeapon] = useState('gun')
  const [progress, setProgress] = useState({ integrity: 100, hits: 0, shots: 0, left: 0, total: 0 })
  const [resetKey, setResetKey] = useState(0)
  const crossRef = useRef(null)

  const handleProgress = useCallback((next) => {
    setProgress(next)
  }, [])

  const handleReset = useCallback(() => {
    setResetKey((k) => k + 1)
  }, [])

  const handlePointerMove = useCallback((e) => {
    const cross = crossRef.current
    if (!cross) return
    cross.style.opacity = '1'
    cross.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
  }, [])

  const handlePointerLeave = useCallback(() => {
    if (crossRef.current) crossRef.current.style.opacity = '0'
  }, [])

  const { left, total } = progress
  const demolished = total > 0 && left === 0
  const isGun = weapon === 'gun'

  return (
    <div
      className="smash-overlay"
      data-testid="smash-overlay"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        style={{ background: canvasBg, touchAction: 'none', cursor: isGun ? 'none' : 'crosshair' }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={[canvasBg]} />
        <ambientLight intensity={0.85} />
        <directionalLight position={[5, 5, 5]} intensity={0.7} />
        <directionalLight position={[-4, -3, 4]} intensity={0.3} />
        <pointLight position={[0, -4, 6]} intensity={12} distance={20} decay={2} color="#ffe9c4" />
        <Suspense fallback={null}>
          <SmashScene
            scene={scene}
            weapon={weapon}
            resetKey={resetKey}
            onProgress={handleProgress}
          />
        </Suspense>
      </Canvas>

      {/* Crosshair — gun mode, fine pointers */}
      {isGun && (
        <div ref={crossRef} className="smash-crosshair" aria-hidden="true">
          <span className="smash-cross-dot" />
          <span className="smash-cross-ring" />
        </div>
      )}

      {/* Controls — top-left: gun, balls, rebuild. Nothing else. */}
      <div className="smash-panel" role="group" aria-label="Smash controls">
        <button
          type="button"
          className={`smash-icon-btn ${isGun ? 'active' : ''}`}
          onClick={() => setWeapon('gun')}
          aria-pressed={isGun}
          aria-label="Gun"
          title="Gun"
        >
          <Crosshair size={20} />
        </button>
        <button
          type="button"
          className={`smash-icon-btn ${!isGun ? 'active' : ''}`}
          onClick={() => setWeapon('ball')}
          aria-pressed={!isGun}
          aria-label="Balls"
          title="Balls"
        >
          <CircleDot size={20} />
        </button>
        <button
          type="button"
          className="smash-icon-btn"
          onClick={handleReset}
          aria-label="Rebuild"
          title="Rebuild (restore all panels)"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      {/* Controls — top-right */}
      <div className="smash-controls">
        <button className="smash-exit-btn" onClick={onExit} title="Back to site (Esc)">
          ✕
        </button>
      </div>

      {demolished && (
        <div className="smash-demolished" data-testid="smash-demolished">
          DEMOLISHED — every panel down! Hit <strong>Rebuild</strong> to go again.
        </div>
      )}

      {/* Bottom hint */}
      <div className="smash-hint">
        Click a panel to {isGun ? 'shoot it' : 'bowl at it'}&ensp;·&ensp;Switch weapons top-left&ensp;·&ensp;Every card breaks on its own&ensp;·&ensp;<kbd>Esc</kbd> to return
      </div>
    </div>
  )
}

export default SmashOverlay
