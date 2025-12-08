import { useEffect, useRef } from 'react'
import './NeuralBackground.css'

const NeuralBackground = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationId
    let particles = []
    let mouse = { x: null, y: null }
    
    const colors = [
      { r: 88, g: 166, b: 255 },   // Blue
      { r: 63, g: 185, b: 80 },    // Green
      { r: 136, g: 136, b: 136 },  // Gray
    ]
    
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles()
    }

    const initParticles = () => {
      particles = []
      const numParticles = Math.floor((canvas.width * canvas.height) / 20000)
      
      for (let i = 0; i < numParticles; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)]
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          radius: Math.random() * 1.2 + 0.3,
          opacity: Math.random() * 0.3 + 0.1,
          color: color,
          pulseSpeed: Math.random() * 0.02 + 0.01,
          pulseOffset: Math.random() * Math.PI * 2,
        })
      }
    }

    const drawParticle = (p, time) => {
      const pulse = Math.sin(time * p.pulseSpeed + p.pulseOffset) * 0.5 + 0.5
      const opacity = p.opacity * (0.7 + pulse * 0.3)
      
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${opacity})`
      ctx.fill()
    }

    const drawConnection = (p1, p2, distance) => {
      const maxDist = 120
      const opacity = (1 - distance / maxDist) * 0.08
      
      // Gradient line
      const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y)
      gradient.addColorStop(0, `rgba(${p1.color.r}, ${p1.color.g}, ${p1.color.b}, ${opacity})`)
      gradient.addColorStop(1, `rgba(${p2.color.r}, ${p2.color.g}, ${p2.color.b}, ${opacity})`)
      
      ctx.beginPath()
      ctx.moveTo(p1.x, p1.y)
      ctx.lineTo(p2.x, p2.y)
      ctx.strokeStyle = gradient
      ctx.lineWidth = 0.5
      ctx.stroke()
    }

    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach((p, i) => {
        // Smooth movement
        p.x += p.vx
        p.y += p.vy
        
        // Soft bounce
        if (p.x < 0) { p.x = 0; p.vx *= -1 }
        if (p.x > canvas.width) { p.x = canvas.width; p.vx *= -1 }
        if (p.y < 0) { p.y = 0; p.vy *= -1 }
        if (p.y > canvas.height) { p.y = canvas.height; p.vy *= -1 }
        
        // Mouse interaction - subtle repulsion
        if (mouse.x !== null && mouse.y !== null) {
          const dx = p.x - mouse.x
          const dy = p.y - mouse.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            const force = (100 - dist) / 100 * 0.02
            p.vx += (dx / dist) * force
            p.vy += (dy / dist) * force
          }
        }
        
        // Damping
        p.vx *= 0.999
        p.vy *= 0.999
        
        drawParticle(p, time * 0.001)
        
        // Connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < 120) {
            drawConnection(p, p2, distance)
          }
        }
      })
      
      animationId = requestAnimationFrame(animate)
    }

    const handleMouseMove = (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }

    const handleMouseLeave = () => {
      mouse.x = null
      mouse.y = null
    }

    resize()
    animate(0)
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas ref={canvasRef} className="neural-background" />
  )
}

export default NeuralBackground
