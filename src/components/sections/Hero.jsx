import { useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowDown, ArrowUpRight, Github, Linkedin, Mail, Code2 } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useLang } from '../../context/LanguageContext'
import { HeroTextSkeleton, HeroImageSkeleton } from '../ui/Skeleton'
import RevealText from '../ui/RevealText'
import Marquee from '../ui/Marquee'
import DotWave from '../ui/DotWave'
import './Hero.css'

export default function Hero() {
  const { profile, profileLoading, projects, experiences, projectsLoading, experiencesLoading } = useData()
  const { t } = useLang()
  const ref = useRef(null)
  const reduce = useReducedMotion()

  const scrollToAbout = () => document.querySelector('#about')?.scrollIntoView({ behavior: reduce ? 'instant' : 'smooth' })

  const aiProjectCount = projectsLoading ? null : projects.filter(p => p.category === 'AI/ML').length
  const expCount = experiencesLoading ? null : experiences.length

  const keywords = ['Yapay Zeka', 'Bilgisayarlı Görü', 'Robotik', 'ROS2', 'YOLO', 'PyTorch', 'React', '.NET', 'SLAM', 'Docker']

  return (
    <section id="home" className="hero" ref={ref}>
      <DotWave mode="object" className="hero-dotwave" gap={16} baseRadius={1.15} />
      <div className="hero-top">
        <span className="eyebrow">{t('hero.eyebrow')}</span>
        <span className="hero-status"><span className="status-dot" /> {t('hero.status')}</span>
      </div>

      {profileLoading ? (
        <div className="hero-loading">
          <HeroTextSkeleton />
        </div>
      ) : (
        <div className="hero-body">
          <div className="hero-left">
            <h1 className="hero-headline display">
              <RevealText text={profile.name || 'Muaz Leventoğlu'} />
            </h1>

            <motion.p className="hero-role" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
              {profile.title}
            </motion.p>
            <motion.p className="hero-desc" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
              {profile.subtitle}
            </motion.p>

            <motion.div className="hero-actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}>
              <a href="#projects" className="btn btn-accent hero-cta">
                {t('hero.cta')} <ArrowUpRight size={18} />
              </a>
              <div className="hero-socials">
                {profile.social?.github && (
                  <a href={profile.social.github} target="_blank" rel="noopener noreferrer" className="hero-social" aria-label="GitHub"><Github size={18} /></a>
                )}
                {profile.social?.linkedin && (
                  <a href={profile.social.linkedin} target="_blank" rel="noopener noreferrer" className="hero-social" aria-label="LinkedIn"><Linkedin size={18} /></a>
                )}
                {profile.email && (
                  <a href={`mailto:${profile.email}`} className="hero-social" aria-label="E-posta"><Mail size={18} /></a>
                )}
              </div>
            </motion.div>

            <motion.div className="hero-stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.7 }}>
              {profile.gpa && (<div className="hero-stat"><span className="hero-stat-num">{profile.gpa}</span><span className="hero-stat-label">{t('hero.gpa')}</span></div>)}
              {aiProjectCount !== null && (<div className="hero-stat"><span className="hero-stat-num">{aiProjectCount}+</span><span className="hero-stat-label">{t('hero.ai')}</span></div>)}
              {expCount !== null && (<div className="hero-stat"><span className="hero-stat-num">{expCount}+</span><span className="hero-stat-label">{t('hero.exp')}</span></div>)}
            </motion.div>
          </div>

          <motion.figure
            className="hero-figure"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="hero-portrait"
              animate={reduce ? {} : { y: [0, -12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="corner corner-tl" />
              <span className="corner corner-tr" />
              <span className="corner corner-bl" />
              <span className="corner corner-br" />
              <div className="hero-portrait-media">
                {profile.image_url ? (
                  <img src={profile.image_url} alt={profile.name} />
                ) : (
                  <div className="hero-portrait-placeholder"><Code2 size={56} strokeWidth={1.3} /></div>
                )}
              </div>
            </motion.div>
            <figcaption className="hero-figure-cap">
              <span>fig.01 — {profile.location || 'İstanbul, TR'}</span>
              <span className="hero-figure-avail">● {t('hero.avail')}</span>
            </figcaption>
          </motion.figure>
        </div>
      )}

      {profileLoading && <div className="hero-figure-loading"><HeroImageSkeleton /></div>}

      <div className="hero-marquee">
        <div className="rule" />
        <Marquee speed={40}>
          {keywords.map((k, i) => (
            <span key={i} className="hero-kw">{k}<span className="hero-kw-sep">/</span></span>
          ))}
        </Marquee>
        <div className="rule" />
      </div>

      <button className="hero-scroll" onClick={scrollToAbout} aria-label="Aşağı kaydır">
        <motion.span animate={reduce ? {} : { y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
          <ArrowDown size={18} />
        </motion.span>
        {t('hero.scroll')}
      </button>
    </section>
  )
}
