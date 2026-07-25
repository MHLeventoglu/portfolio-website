import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import LanguageToggle from './LanguageToggle'
import Logo from './Logo'
import { useLang } from '../../context/LanguageContext'
import './Navbar.css'

const navLinks = [
  { key: 'home', href: '#home' },
  { key: 'about', href: '#about' },
  { key: 'skills', href: '#skills' },
  { key: 'projects', href: '#projects' },
  { key: 'blog', href: '#blog' },
  { key: 'contact', href: '#contact' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const location = useLocation()
  const isHome = location.pathname === '/'
  const { t } = useLang()

  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40)
      const sections = navLinks.map(link => link.href.replace('#', ''))
      for (const section of sections.reverse()) {
        const el = document.getElementById(section)
        if (el && el.getBoundingClientRect().top <= 160) {
          setActiveSection(section)
          break
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const hrefFor = (href) => (isHome ? href : `/${href}`)

  const handleNavClick = (e, href) => {
    if (!isHome) return
    e.preventDefault()
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
    setIsOpen(false)
  }

  return (
    <>
      <motion.header
        className={`navbar ${scrolled ? 'scrolled' : ''}`}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo" aria-label="Ana Sayfa">
            <Logo size={34} />
          </Link>

          <nav className="nav-links">
            {navLinks.map((link) => {
              const id = link.href.replace('#', '')
              const isActive = isHome && activeSection === id
              return (
                <a
                  key={link.key}
                  href={hrefFor(link.href)}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  {t(`nav.${link.key}`)}
                  {isActive && (
                    <motion.span className="nav-marker" layoutId="nav-marker" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
                  )}
                </a>
              )
            })}
          </nav>

          <div className="nav-right">
            <LanguageToggle />
            <ThemeToggle />
            <a href={hrefFor('#contact')} onClick={(e) => handleNavClick(e, '#contact')} className="btn btn-primary nav-cta">
              {t('nav.cta')}
            </a>
            <button className="nav-burger" onClick={() => setIsOpen(true)} aria-label={t('nav.menu')}>
              <Menu size={22} />
            </button>
          </div>
        </div>

        <motion.div className="nav-progress" style={{ scaleX: progress }} aria-hidden="true" />
      </motion.header>

      <AnimatePresence>
        {isOpen && (
          <motion.div className="mobile-menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <div className="mobile-menu-top">
              <Logo size={34} />
              <button onClick={() => setIsOpen(false)} aria-label="Kapat"><X size={24} /></button>
            </div>

            <nav className="mobile-links">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.key}
                  href={hrefFor(link.href)}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="mobile-link"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: 0.08 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="mobile-link-index">{String(i + 1).padStart(2, '0')}</span>
                  {t(`nav.${link.key}`)}
                </motion.a>
              ))}
            </nav>

            <div className="mobile-menu-foot">
              <div className="mobile-menu-controls">
                <LanguageToggle />
                <ThemeToggle />
              </div>
              <span className="eyebrow">{t('nav.tagline')}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
