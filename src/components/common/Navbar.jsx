import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Home, User, Wrench, FolderKanban, BookOpen, Mail, Settings } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import './Navbar.css'

const navLinks = [
  { name: 'Ana Sayfa', href: '#home', icon: Home },
  { name: 'Hakkımda', href: '#about', icon: User },
  { name: 'Yetenekler', href: '#skills', icon: Wrench },
  { name: 'Projeler', href: '#projects', icon: FolderKanban },
  { name: 'Blog', href: '#blog', icon: BookOpen },
  { name: 'İletişim', href: '#contact', icon: Mail },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
      
      // Detect active section
      const sections = navLinks.map(link => link.href.replace('#', ''))
      for (const section of sections.reverse()) {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 150) {
            setActiveSection(section)
            break
          }
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (e, href) => {
    if (location.pathname !== '/') {
      return
    }
    e.preventDefault()
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsOpen(false)
  }

  return (
    <>
      {/* Floating Pill Navbar */}
      <motion.nav 
        className={`navbar-pill ${scrolled ? 'scrolled' : ''}`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="navbar-pill-container">
          <Link to="/" className="navbar-logo">
            <span className="logo-text">
              <span className="gradient-text">MHL</span>
            </span>
          </Link>

          <div className="navbar-links-pill">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = activeSection === link.href.replace('#', '')
              return (
                <motion.a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`nav-link-pill ${isActive ? 'active' : ''}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon size={18} />
                  <span className="nav-link-text">{link.name}</span>
                </motion.a>
              )
            })}
          </div>

          <div className="navbar-actions">
            <ThemeToggle />
          </div>

          <button 
            className="navbar-toggle"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="mobile-menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="mobile-menu-panel glass-card"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mobile-menu-header">
                <span className="gradient-text">Menü</span>
                <button onClick={() => setIsOpen(false)}>
                  <X size={24} />
                </button>
              </div>
              
              <div className="mobile-nav-links">
                {navLinks.map((link, index) => {
                  const Icon = link.icon
                  return (
                    <motion.a
                      key={link.name}
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className="mobile-nav-link"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Icon size={20} />
                      {link.name}
                    </motion.a>
                  )
                })}
              </div>

              <div className="mobile-menu-footer">
                <ThemeToggle />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
