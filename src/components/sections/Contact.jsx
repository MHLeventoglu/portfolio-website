import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ArrowUpRight, Github, Linkedin, Twitter, MapPin } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useLang } from '../../context/LanguageContext'
import RevealText from '../ui/RevealText'
import './Contact.css'

export default function Contact() {
  const { profile } = useData()
  const { t } = useLang()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="contact" className="section contact" ref={ref}>
      <motion.div
        className="contact-box"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="corner corner-tl" />
        <span className="corner corner-tr" />
        <span className="corner corner-bl" />
        <span className="corner corner-br" />

        <div className="contact-box-inner">
          <span className="eyebrow">05 — {t('contact.eyebrow')}</span>
          <h2 className="contact-big">
            <RevealText text={t('contact.line1')} /> <br />
            <RevealText text={t('contact.line2')} className="accent-text" delay={0.15} />
          </h2>
          {profile.email && (
            <a href={`mailto:${profile.email}`} className="contact-cta">
              {t('contact.cta')} <ArrowUpRight size={18} />
            </a>
          )}
        </div>
      </motion.div>

      <div className="contact-foot">
        {profile.location && (
          <div className="contact-loc"><MapPin size={16} /> {profile.location}</div>
        )}
        <div className="contact-socials">
          {profile.email && (
            <a href={`mailto:${profile.email}`} className="contact-social">{profile.email}</a>
          )}
          {profile.social?.github && (
            <a href={profile.social.github} target="_blank" rel="noopener noreferrer" className="contact-social"><Github size={16} /> GitHub</a>
          )}
          {profile.social?.linkedin && (
            <a href={profile.social.linkedin} target="_blank" rel="noopener noreferrer" className="contact-social"><Linkedin size={16} /> LinkedIn</a>
          )}
          {profile.social?.twitter && (
            <a href={profile.social.twitter} target="_blank" rel="noopener noreferrer" className="contact-social"><Twitter size={16} /> Twitter</a>
          )}
        </div>
      </div>
    </section>
  )
}
