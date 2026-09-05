import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { CircleDot, Crosshair, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import SmashScene from './SmashScene'
import { setMuted } from './smashSound'
import { isEditableShortcutTarget } from '../../utils/keyboardShortcuts'
import './SmashOverlay.css'

const CANVAS_BG_BY_THEME = {
  'dark':         '#d4d4d4',
  'light':        '#0a0a0a',
  'arcade-dark':  '#d4d4d4',
  'arcade-light': '#0a0a0a',
}
const DEFAULT_CANVAS_BG = '#0a0a0a'
const MUTE_STORAGE_KEY = 'smash-muted'

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
  const isDarkBackdrop = currentTheme.includes('dark')
  const [weapon, setWeapon] = useState('gun')
  const [progress, setProgress] = useState({ integrity: 100, hits: 0, shots: 0, left: 0, total: 0 })
  const [resetKey, setResetKey] = useState(0)
  const [muted, setMutedState] = useState(() => {
    try {
      return localStorage.getItem(MUTE_STORAGE_KEY) === '1'
    } catch {
      return false
    }
  })
  const crossRef = useRef(null)

  useEffect(() => {
    setMuted(muted)
    try {
      localStorage.setItem(MUTE_STORAGE_KEY, muted ? '1' : '0')
    } catch {
      // storage unavailable (private mode) — mute still applies to the session
    }
  }, [muted])

  const toggleMute = useCallback(() => {
    setMutedState((m) => !m)
  }, [])

  const handleProgress = useCallback((next) => {
    setProgress(next)
  }, [])

  const handleReset = useCallback(() => {
    setResetKey((k) => k + 1)
  }, [])

  // 1/2 weapons · R rebuild · M mute. Skipped in editable fields and
  // with modifiers so typing and OS shortcuts keep working.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (isEditableShortcutTarget(e.target)) return
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      if (key === '1') setWeapon('gun')
      else if (key === '2') setWeapon('ball')
      else if (key === 'r') setResetKey((k) => k + 1)
      else if (key === 'm') toggleMute()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleMute])

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
            isDarkBackdrop={isDarkBackdrop}
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

      {/* Controls — top-left: gun, balls, mute, rebuild. Nothing else. */}
      <div className="smash-panel" role="group" aria-label="Smash controls">
        <button
          type="button"
          className={`smash-icon-btn ${isGun ? 'active' : ''}`}
          onClick={() => setWeapon('gun')}
          aria-pressed={isGun}
          aria-label="Gun"
          title="Gun (1)"
        >
          <Crosshair size={20} />
        </button>
        <button
          type="button"
          className={`smash-icon-btn ${!isGun ? 'active' : ''}`}
          onClick={() => setWeapon('ball')}
          aria-pressed={!isGun}
          aria-label="Balls"
          title="Balls (2)"
        >
          <CircleDot size={20} />
        </button>
        <button
          type="button"
          className={`smash-icon-btn ${muted ? 'active' : ''}`}
          onClick={toggleMute}
          aria-pressed={muted}
          aria-label={muted ? 'Unmute' : 'Mute'}
          title={muted ? 'Unmute (M)' : 'Mute (M)'}
        >
          {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <button
          type="button"
          className="smash-icon-btn"
          onClick={handleReset}
          aria-label="Rebuild"
          title="Rebuild (R)"
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
          <span>DEMOLISHED — every panel down!</span>
          <button
            type="button"
            className="smash-rebuild-btn"
            onClick={handleReset}
            aria-label="Rebuild"
          >
            Rebuild
          </button>
        </div>
      )}

      {/* Bottom hint */}
      <div className="smash-hint">
        Click or hold a panel to {isGun ? 'shoot it' : 'bowl at it'}&ensp;·&ensp;1/2 weapons&ensp;·&ensp;R rebuild&ensp;·&ensp;M mute&ensp;·&ensp;<kbd>Esc</kbd> to return
      </div>
    </div>
  )
}

export default SmashOverlay
