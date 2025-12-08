import { Github, Linkedin } from 'lucide-react'
import { SiKaggle } from 'react-icons/si'
import './Footer.css'

const Footer = () => {
  const socialLinks = [
    { icon: Github, href: 'https://github.com/prasad-gade05', label: 'GitHub' },
    { icon: Linkedin, href: 'https://linkedin.com/in/prasad-gade05', label: 'LinkedIn' },
    { icon: SiKaggle, href: 'https://kaggle.com/prasadgade', label: 'Kaggle' },
  ]

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <a href="#" className="footer-logo">
            <span>&lt;</span>PG<span>/&gt;</span>
          </a>
          <p className="footer-text">Designed & Built by Prasad Gade</p>
          <p className="footer-copyright">© 2024 All Rights Reserved</p>
        </div>
        
        <div className="footer-social">
          {socialLinks.map((link, index) => (
            <a 
              key={index}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label={link.label}
            >
              <link.icon size={18} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}

export default Footer
