import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Mail, MapPin } from 'lucide-react'
import { FaGithub, FaLinkedin, FaKaggle, FaTwitter, FaInstagram, FaKeyboard } from 'react-icons/fa'
import './Contact.css'

const Contact = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  const socialCards = [
    { 
      icon: FaGithub, 
      name: 'GitHub', 
      handle: '@prasad-gade05',
      href: 'https://github.com/prasad-gade05',
      color: '#e6edf3',
      bgColor: '#161b22',
      description: 'Open source projects & contributions',
      stats: '15+ repos'
    },
    { 
      icon: FaLinkedin, 
      name: 'LinkedIn', 
      handle: 'prasad-gade05',
      href: 'https://www.linkedin.com/in/prasad-gade05/',
      color: '#ffffff',
      bgColor: '#0a66c2',
      description: 'Professional network & experience',
      stats: 'Connect'
    },
    { 
      icon: FaKaggle, 
      name: 'Kaggle', 
      handle: 'prasadgade',
      href: 'https://kaggle.com/prasadgade',
      color: '#ffffff',
      bgColor: '#20beff',
      description: 'Data science competitions & notebooks',
      stats: 'Notebooks'
    },
    { 
      icon: FaKeyboard, 
      name: 'Monkeytype', 
      handle: 'prasad_gade05',
      href: 'https://monkeytype.com/profile/prasad_gade05',
      color: '#d1d0c5',
      bgColor: '#323437',
      description: 'Typing speed & accuracy stats',
      stats: '100+ WPM'
    },
    { 
      icon: FaTwitter, 
      name: 'Twitter', 
      handle: '@prasad_gade05',
      href: 'https://twitter.com/prasad_gade05',
      color: '#ffffff',
      bgColor: '#1da1f2',
      description: 'Thoughts on tech & data science',
      stats: 'Follow'
    },
    { 
      icon: FaInstagram, 
      name: 'Instagram', 
      handle: '@prasad_gade05',
      href: 'https://instagram.com/prasad_gade05',
      color: '#ffffff',
      bgColor: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
      description: 'Life beyond code',
      stats: 'Follow'
    },
    { 
      icon: Mail, 
      name: 'Email', 
      handle: 'prasadgade4405@gmail.com',
      href: 'mailto:prasadgade4405@gmail.com',
      color: '#ffffff',
      bgColor: '#ea4335',
      description: 'Best way to reach me',
      stats: 'Send mail'
    },
  ]

  return (
    <section id="contact" className="contact section">
      <div className="section-container">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          ref={ref}
        >
          <span className="section-tag">
            <span>&lt;</span> contact <span>/&gt;</span>
          </span>
          <h2 className="section-title">Get In Touch</h2>
        </motion.div>

        <motion.p 
          className="contact-intro"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          I'm always open to discussing new projects, opportunities in data science, 
          or interesting collaborations. Let's connect!
        </motion.p>

        <motion.div 
          className="contact-location"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <MapPin size={18} />
          <span>Mumbai, India</span>
        </motion.div>

        <div className="social-cards-grid">
          {socialCards.map((social, index) => (
            <motion.a 
              key={index}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="social-card"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <div 
                className="social-card-icon"
                style={{ 
                  background: social.bgColor.includes('gradient') ? social.bgColor : social.bgColor,
                  color: social.color
                }}
              >
                <social.icon size={28} />
              </div>
              <div className="social-card-content">
                <h3 className="social-card-name">{social.name}</h3>
                <p className="social-card-handle">{social.handle}</p>
                <p className="social-card-desc">{social.description}</p>
              </div>
              <div className="social-card-stats">
                {social.stats}
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Contact
