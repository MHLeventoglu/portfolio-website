import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import AmbientBackground from '../ui/AmbientBackground'
import Navbar from './Navbar'
import Footer from './Footer'

export default function PortfolioLayout() {
  const { pathname, hash, key } = useLocation()

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (hash) {
        let id = hash.slice(1)
        try { id = decodeURIComponent(id) } catch { /* Keep malformed anchors harmless. */ }
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'instant' : 'smooth' })
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' })
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash, key])

  return (
    <MotionConfig reducedMotion="user">
      <div className="portfolio-shell">
        <AmbientBackground />
        <a className="portfolio-skip-link" href="#portfolio-content">İçeriğe geç</a>
        <Navbar />
        <div className="portfolio-content" id="portfolio-content" tabIndex={-1}>
          <div className="portfolio-route" key={pathname}><Outlet /></div>
          <Footer />
        </div>
      </div>
    </MotionConfig>
  )
}
