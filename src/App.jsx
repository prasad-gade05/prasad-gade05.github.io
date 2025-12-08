import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'

// Components
import Hero from './components/Hero'
import NeuralBackground from './components/NeuralBackground'
import LoadingScreen from './components/LoadingScreen'

function App() {
  const [loading, setLoading] = useState(true)
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="app">
      <AnimatePresence mode="wait">
        {loading ? (
          <LoadingScreen key="loading" />
        ) : (
          <motion.div
            key="content"
            className="content-wrapper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Cursor glow effect */}
            <div 
              className="cursor-glow"
              style={{
                left: cursorPosition.x,
                top: cursorPosition.y,
              }}
            />
            
            {/* Neural Network Background */}
            <NeuralBackground />
            
            {/* Main Content - Single View */}
            <main>
              <Hero />
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
