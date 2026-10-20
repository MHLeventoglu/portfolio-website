import { Github, Linkedin, Twitter, ArrowUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useReducedMotion } from 'framer-motion'
import { useData } from '../../context/DataContext'
import { useLang } from '../../context/LanguageContext'
import Marquee from '../ui/Marquee'
import './Footer.css'

export default function Footer() {
  const { profile } = useData()
  const { t } = useLang()
  const reduce = useReducedMotion()
  const currentYear = new Date().getFullYear()
  const name = profile.name || 'Muaz Leventoğlu'

  const scrollTop = () => window.scrollTo({ top: 0, behavior: reduce ? 'instant' : 'smooth' })

  const marqueeItems = [name, 'Digital by design', 'Yapay Zeka & Robotik', 'Portföy']

  return (
    <footer className="footer">
      <div className="footer-marquee" aria-hidden="true">
        <Marquee speed={26}>
          {marqueeItems.map((item, i) => (
            <span key={i} className="footer-mark">{item}<span className="footer-mark-dot">✳</span></span>
          ))}
        </Marquee>
      </div>

      <div className="footer-inner">
        <div className="footer-cols">
          <div className="footer-col footer-brand">
            <span className="wordmark">{name}<span className="wordmark-dot">.</span></span>
            <p>{profile.title || t('footer.role')}</p>
          </div>

          <div className="footer-col">
            <span className="footer-col-label">{t('footer.menu')}</span>
            <Link to="/#about">{t('nav.about')}</Link>
            <Link to="/#projects">{t('nav.projects')}</Link>
            <Link to="/#blog">{t('nav.blog')}</Link>
            <Link to="/#contact">{t('nav.contact')}</Link>
          </div>

          <div className="footer-col">
            <span className="footer-col-label">{t('footer.links')}</span>
            {profile.social?.github && (
              <a href={profile.social.github} target="_blank" rel="noopener noreferrer" className="footer-social-link"><Github size={15} /> GitHub</a>
            )}
            {profile.social?.linkedin && (
              <a href={profile.social.linkedin} target="_blank" rel="noopener noreferrer" className="footer-social-link"><Linkedin size={15} /> LinkedIn</a>
            )}
            {profile.social?.twitter && (
              <a href={profile.social.twitter} target="_blank" rel="noopener noreferrer" className="footer-social-link"><Twitter size={15} /> Twitter</a>
            )}
            {profile.email && (
              <a href={`mailto:${profile.email}`} className="footer-social-link">{t('footer.email')}</a>
            )}
          </div>
        </div>

        <div className="rule" />

        <div className="footer-bottom">
          <span className="footer-copy">© {currentYear} {name} — {t('footer.rights')}</span>
          <button className="footer-top-btn" onClick={scrollTop}>{t('footer.top')} <ArrowUp size={15} /></button>
        </div>
      </div>
    </footer>
  )
}
