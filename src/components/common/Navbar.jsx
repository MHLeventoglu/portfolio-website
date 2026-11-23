import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion as Motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { ArrowUpRight, House, UserRound, Code2, FolderKanban, BookOpen, Mail, LayoutDashboard, Wallet } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import LanguageToggle from './LanguageToggle'
import Logo from './Logo'
import LiquidGlassNav from './LiquidGlassNav'
import { useLang } from '../../context/LanguageContext'
import { useData } from '../../context/DataContext'
import './Navbar.css'

const navLinks = [
  { key: 'home', href: '#home', icon: House },
  { key: 'about', href: '#about', icon: UserRound },
  { key: 'skills', href: '#skills', icon: Code2 },
  { key: 'projects', href: '#projects', icon: FolderKanban },
  { key: 'blog', href: '#blog', icon: BookOpen },
  { key: 'contact', href: '#contact', icon: Mail },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const navigationTarget = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const isHome = location.pathname === '/'
  const { t } = useLang()
  const { isAuthenticated } = useData()
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })

  useEffect(() => {
    let scrollSettled
    const handleScroll = () => {
      setScrolled(window.scrollY > 40)
      // Keep the clicked destination selected while smooth scrolling past other sections.
      if (navigationTarget.current) {
        clearTimeout(scrollSettled)
        scrollSettled = setTimeout(() => { navigationTarget.current = null }, 180)
        return
      }
      if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        setActiveSection('contact')
        return
      }
      const sections = navLinks.map(link => link.href.replace('#', ''))
      for (const section of sections.reverse()) {
        const el = document.getElementById(section)
        if (el && el.getBoundingClientRect().top <= 160) {
          setActiveSection(section)
          break
        }
      }
    }
    const interruptNavigation = event => {
      if (event.type === 'keydown' && !['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) return
      if (event.type === 'touchstart' && event.target.closest('.liquid-nav, .navbar')) return
      navigationTarget.current = null
      clearTimeout(scrollSettled)
      handleScroll()
    }
    const routeTarget = location.hash.slice(1)
    const syncRoute = () => {
      if (isHome && navLinks.some(link => link.key === routeTarget)) {
        navigationTarget.current = routeTarget
        setActiveSection(routeTarget)
      } else if (!isHome) navigationTarget.current = null
      handleScroll()
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('wheel', interruptNavigation, { passive: true })
    window.addEventListener('touchstart', interruptNavigation, { passive: true })
    window.addEventListener('keydown', interruptNavigation)
    syncRoute()
    return () => {
      clearTimeout(scrollSettled)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('wheel', interruptNavigation)
      window.removeEventListener('touchstart', interruptNavigation)
      window.removeEventListener('keydown', interruptNavigation)
    }
  }, [location.pathname, location.hash, isHome])

  const hrefFor = (href) => (isHome ? href : `/${href}`)

  const handleNavClick = (e, href) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button > 0) return
    e.preventDefault()
    navigationTarget.current = href.slice(1)
    setActiveSection(href.slice(1))
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

          <nav className="nav-links" aria-label="Ana gezinme">
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
            {isAuthenticated && <nav className="nav-workspace-links" aria-label={t('nav.workspace')}>
              <Link to="/admin" aria-label={t('nav.admin')} title={t('nav.admin')}><LayoutDashboard size={16} aria-hidden="true" /><span>{t('nav.admin')}</span></Link>
              <Link to="/finance" aria-label={t('nav.finance')} title={t('nav.finance')}><Wallet size={16} aria-hidden="true" /><span>{t('nav.finance')}</span></Link>
            </nav>}
            <LanguageToggle />
            <ThemeToggle />
            <a href={hrefFor('#contact')} onClick={(e) => handleNavClick(e, '#contact')} className="nav-cta" aria-current={isHome && activeSection === 'contact' ? 'location' : undefined}>
              {t('nav.cta')}
              <ArrowUpRight size={13} aria-hidden="true" />
            </a>
          </div>
        </div>

        <Motion.div className="nav-progress" style={{ scaleX: reduce ? scrollYProgress : progress }} aria-hidden="true" />
      </Motion.header>

      <LiquidGlassNav label={t('nav.menu')} variant="portfolio" activeId={isHome ? activeSection : location.pathname.startsWith('/blog') ? 'blog' : location.pathname.startsWith('/projects') ? 'projects' : null} items={navLinks.map(link => ({
        id: link.key, label: t(`nav.${link.key}`), icon: link.icon, href: hrefFor(link.href), current: isHome ? 'location' : 'page', onClick: event => handleNavClick(event, link.href)
      }))} />
    </>
  )
}
