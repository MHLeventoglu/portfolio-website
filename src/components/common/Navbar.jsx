import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion as Motion, AnimatePresence, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { ArrowUpRight, Menu, X } from 'lucide-react'
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
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const menuRef = useRef(null)
  const menuButtonRef = useRef(null)
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
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [location.pathname])

  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    const trigger = menuButtonRef.current
    document.body.style.overflow = 'hidden'
    const focusable = () => [...menuRef.current.querySelectorAll('a, button:not(:disabled)')]
    focusable()[0]?.focus()
    const handleKey = event => {
      if (event.key === 'Escape') setIsOpen(false)
      if (event.key !== 'Tab') return
      const elements = focusable()
      const first = elements[0]
      const last = elements[elements.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
    const handleResize = () => { if (window.innerWidth > 900) setIsOpen(false) }
    document.addEventListener('keydown', handleKey)
    window.addEventListener('resize', handleResize)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKey)
      window.removeEventListener('resize', handleResize)
      trigger?.focus({ preventScroll: true })
    }
  }, [isOpen])

  const hrefFor = (href) => (isHome ? href : `/${href}`)

  const handleNavClick = (e, href) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button > 0) return
    e.preventDefault()
    setIsOpen(false)
    if (!isHome) {
      navigate(`/${href}`)
      return
    }
    document.getElementById(href.slice(1))?.scrollIntoView({ behavior: reduce ? 'instant' : 'smooth' })
  }

  return (
    <>
      <Motion.header
        className={`navbar ${scrolled ? 'scrolled' : ''}`}
        initial={{ y: reduce ? 0 : -80, opacity: 0 }}
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
              const isActive = (isHome && activeSection === id) || (!isHome && ['blog', 'projects'].includes(id) && location.pathname.startsWith(`/${id}`))
              return (
                <a
                  key={link.key}
                  href={hrefFor(link.href)}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  {t(`nav.${link.key}`)}
                  {isActive && (
                    <Motion.span className="nav-marker" layoutId="nav-marker" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
                  )}
                </a>
              )
            })}
          </nav>

          <div className="nav-right">
            <LanguageToggle />
            <ThemeToggle />
            <a href={hrefFor('#contact')} onClick={(e) => handleNavClick(e, '#contact')} className="nav-cta" aria-current={isHome && activeSection === 'contact' ? 'location' : undefined}>
              {t('nav.cta')}
              <ArrowUpRight size={13} aria-hidden="true" />
            </a>
            <button ref={menuButtonRef} className="nav-burger" onClick={() => setIsOpen(true)} aria-label={t('nav.menu')} aria-expanded={isOpen} aria-controls="portfolio-mobile-menu">
              <Menu size={22} />
            </button>
          </div>
        </div>

        <Motion.div className="nav-progress" style={{ scaleX: reduce ? scrollYProgress : progress }} aria-hidden="true" />
      </Motion.header>

      <AnimatePresence>
        {isOpen && (
          <Motion.div ref={menuRef} id="portfolio-mobile-menu" className="mobile-menu" role="dialog" aria-modal="true" aria-label={t('nav.menu')} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <div className="mobile-menu-top">
              <Logo size={34} />
              <button onClick={() => setIsOpen(false)} aria-label="Kapat"><X size={24} /></button>
            </div>

            <nav className="mobile-links">
              {navLinks.map((link, i) => (
                <Motion.a
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
                </Motion.a>
              ))}
            </nav>

            <div className="mobile-menu-foot">
              <div className="mobile-menu-controls">
                <LanguageToggle />
                <ThemeToggle />
              </div>
              <span className="eyebrow">{t('nav.tagline')}</span>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
