import { useEffect, useRef, useState, lazy, Suspense, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue } from 'framer-motion'
import confetti from 'canvas-confetti'
import { captureDOM } from './utils/domCapture'
import { captureSmashScene, prefetchSmashRoom } from './components/smash/elementCapture'
import './App.css'

// Components
import Hero from './components/Hero'

const NeuralBackground = lazy(() => import('./components/NeuralBackground'))
const TissueOverlay = lazy(() => import('./components/tissue/TissueOverlay'))
const SmashOverlay = lazy(() => import('./components/smash/SmashOverlay'))

function App() {
  const [isTissueMode, setIsTissueMode] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)
  const [isSmashMode, setIsSmashMode] = useState(false)
  const [smashScene, setSmashScene] = useState(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  // Ref so the stable keydown handler can always read the latest value
  // without needing to be re-created whenever the mode changes.
  const isTissueModeRef = useRef(isTissueMode)
  const isSmashModeRef = useRef(isSmashMode)
  useEffect(() => {
    isTissueModeRef.current = isTissueMode
  }, [isTissueMode])
  useEffect(() => {
    isSmashModeRef.current = isSmashMode
  }, [isSmashMode])

  useEffect(() => {
    const handleMouseMove = (e) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [cursorX, cursorY])

  useEffect(() => {
    const konamiCode = [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
      'b', 'a'
    ]
    const hesoyamCode = ['h', 'e', 's', 'o', 'y', 'a', 'm']
    const keys = []

    const checkCode = (code) => {
      if (keys.length < code.length) return false
      const recentKeys = keys.slice(-code.length)
      return recentKeys.every((key, i) => key.toLowerCase() === code[i].toLowerCase())
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isTissueModeRef.current) {
        setIsTissueMode(false)
        setCapturedImage(null)
        return
      }
      if (e.key === 'Escape' && isSmashModeRef.current) {
        setIsSmashMode(false)
        return
      }

      keys.push(e.key)
      if (keys.length > konamiCode.length) keys.shift()

      if (checkCode(konamiCode) || checkCode(hesoyamCode)) {
        const count = 200
        const defaults = { origin: { y: 0.7 }, zIndex: 200000 }
        const fire = (particleRatio, opts) => {
          confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) })
        }

        fire(0.25, { spread: 26, startVelocity: 55 })
        fire(0.2, { spread: 60 })
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
        fire(0.1, { spread: 120, startVelocity: 45 })

        keys.length = 0
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handlePeel = useCallback(async () => {
    if (isCapturing || isTissueMode || isSmashMode) return
    setIsCapturing(true)

    const appContent = document.getElementById('app-content')
    if (!appContent) {
      setIsCapturing(false)
      return
    }

    const dataUrl = await captureDOM(appContent)
    if (dataUrl) {
      setCapturedImage(dataUrl)
      setIsTissueMode(true)
    }
    setIsCapturing(false)
  }, [isCapturing, isTissueMode, isSmashMode])

  // The smash room captures the real page: full backdrop plus one
  // screenshot per card, so every element looks exactly like the site
  // and breaks on its own.
  const handleSmash = useCallback(async () => {
    if (isCapturing || isTissueMode || isSmashMode) return
    // Warm the overlay chunk in parallel with the screenshot so its
    // fetch never sits behind the capture on the critical path.
    prefetchSmashRoom()
    setIsCapturing(true)

    const appContent = document.getElementById('app-content')
    if (!appContent) {
      setIsCapturing(false)
      return
    }

    const scene = await captureSmashScene(appContent)
    if (scene?.backdrop) {
      setSmashScene(scene)
      setIsSmashMode(true)
    }
    setIsCapturing(false)
  }, [isCapturing, isTissueMode, isSmashMode])

  const handleExitTissue = useCallback(() => {
    setIsTissueMode(false)
    setCapturedImage(null)
  }, [])

  const handleExitSmash = useCallback(() => {
    setIsSmashMode(false)
    setSmashScene(null)
  }, [])

  return (
    <div className="app">
      <motion.div
        key="content"
        id="app-content"
        className="content-wrapper"
        initial={{ opacity: 0 }}
        animate={{ opacity: isTissueMode || isSmashMode ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        style={{ pointerEvents: isTissueMode || isSmashMode ? 'none' : 'auto' }}
      >
        {/* Cursor glow effect */}
        <motion.div 
          className="cursor-glow"
          style={{
            left: cursorX,
            top: cursorY,
          }}
        />
        
        {/* Neural Network Background */}
        <Suspense fallback={null}>
          <NeuralBackground />
        </Suspense>
        
        {/* Main content lives in the root HTML landmark; this section labels the interactive surface. */}
        <section aria-label="Interactive portfolio">
          <Hero onStartDoodle={handlePeel} onStartSmash={handleSmash} isOverlayOpen={isTissueMode || isSmashMode} />
        </section>
      </motion.div>

      {/* Tissue Paper Physics Mode */}
      <AnimatePresence>
        {isTissueMode && capturedImage && (
          <motion.div
            key="tissue"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ position: 'fixed', inset: 0, zIndex: 10000 }}
          >
            <Suspense fallback={null}>
              <TissueOverlay textureUrl={capturedImage} onExit={handleExitTissue} />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Smash Room Wrecking-Ball Mode */}
      <AnimatePresence>
        {isSmashMode && smashScene && (
          <motion.div
            key="smash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ position: 'fixed', inset: 0, zIndex: 10000 }}
          >
            <Suspense fallback={null}>
              <SmashOverlay scene={smashScene} onExit={handleExitSmash} />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>

      {isCapturing && (
        <div className="capture-toast" role="status" aria-live="polite">
          Capturing the site for the arena…
        </div>
      )}
    </div>
  )
}

export default App
