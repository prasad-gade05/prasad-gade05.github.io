import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Command, X, User, Briefcase, FolderKanban, GraduationCap, Trophy, Award, FileText } from 'lucide-react'
import './CommandNav.css'

const CommandNav = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100)
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
      if (e.key === 'Escape') setIsOpen(false)
    }
    
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const navItems = [
    { icon: User, label: 'About', href: '#hero', shortcut: '1' },
    { icon: Briefcase, label: 'Experience', href: '#experience-section', shortcut: '2' },
    { icon: FolderKanban, label: 'Projects', href: '#projects', shortcut: '3' },
    { icon: GraduationCap, label: 'Education', href: '#education-section', shortcut: '4' },
    { icon: Trophy, label: 'Achievements', href: '#achievements-section', shortcut: '5' },
    { icon: Award, label: 'Certifications', href: '#certifications-section', shortcut: '6' },
    { icon: FileText, label: 'Resume', href: '/resume.pdf', shortcut: 'R', external: true },
  ]

  const handleNavClick = (href, external) => {
    setIsOpen(false)
    if (external) {
      window.open(href, '_blank')
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      {/* Floating Command Button */}
      <motion.button
        className={`command-trigger ${scrolled ? 'scrolled' : ''}`}
        onClick={() => setIsOpen(true)}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.2, duration: 0.3 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Command size={18} />
        <span className="command-hint">⌘K</span>
      </motion.button>

      {/* Command Palette */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              className="command-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div 
              className="command-palette"
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.15 }}
            >
              <div className="command-header">
                <Command size={16} />
                <span>Quick Navigation</span>
                <button className="command-close" onClick={() => setIsOpen(false)}>
                  <X size={14} />
                </button>
              </div>
              
              <div className="command-list">
                {navItems.map((item, index) => (
                  <button
                    key={item.label}
                    className="command-item"
                    onClick={() => handleNavClick(item.href, item.external)}
                  >
                    <div className="command-item-left">
                      <item.icon size={16} />
                      <span>{item.label}</span>
                    </div>
                    <kbd className="command-shortcut">{item.shortcut}</kbd>
                  </button>
                ))}
              </div>
              
              <div className="command-footer">
                <span>Press ESC to close</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default CommandNav
