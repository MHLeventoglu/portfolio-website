import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Send, Mail, MapPin, Github, Linkedin, Twitter } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { SkeletonBox } from '../ui/Skeleton'
import './Contact.css'

// Contact form skeleton component
function ContactFormSkeleton() {
  return (
    <div className="contact-form glass-card skeleton-form">
      <div className="form-group">
        <SkeletonBox width="60px" height="16px" className="mb-xs" />
        <SkeletonBox width="100%" height="48px" borderRadius="12px" />
      </div>
      <div className="form-group">
        <SkeletonBox width="70px" height="16px" className="mb-xs" />
        <SkeletonBox width="100%" height="48px" borderRadius="12px" />
      </div>
      <div className="form-group">
        <SkeletonBox width="50px" height="16px" className="mb-xs" />
        <SkeletonBox width="100%" height="140px" borderRadius="12px" />
      </div>
      <SkeletonBox width="160px" height="48px" borderRadius="12px" />
    </div>
  )
}

export default function Contact() {
  const { profile, useSupabase, loading } = useData()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  // Show skeleton when Supabase is configured (form needs backend)
  const showFormSkeleton = useSupabase && loading

  return (
    <section id="contact" className="section contact" ref={ref}>
      <motion.div
        className="section-title"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <h2>İletişime <span className="gradient-text">Geç</span></h2>
        <p>Bir projeniz mi var veya sadece sohbet etmek mi istiyorsunuz? Sizden haber almak isterim!</p>
      </motion.div>

      <div className="contact-content">
        <motion.div
          className="contact-info"
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="info-item glass-card">
            <div className="info-icon">
              <Mail size={24} />
            </div>
            <div>
              <h4>E-posta</h4>
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
            </div>
          </div>

          <div className="info-item glass-card">
            <div className="info-icon">
              <MapPin size={24} />
            </div>
            <div>
              <h4>Konum</h4>
              <span>{profile.location}</span>
            </div>
          </div>

          <div className="social-links">
            <h4>Benimle bağlantı kurun</h4>
            <div className="social-icons">
              <a 
                href={profile.social.github} 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-icon glass-card"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a 
                href={profile.social.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-icon glass-card"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a 
                href={profile.social.twitter} 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-icon glass-card"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {showFormSkeleton ? (
            <ContactFormSkeleton />
          ) : (
            <div className="contact-form glass-card form-coming-soon">
              <div className="coming-soon-content">
                <span className="coming-soon-icon">🚧</span>
                <h3>Yakında Aktif</h3>
                <p>İletişim formu henüz yapım aşamasında. Şimdilik e-posta ile ulaşabilirsiniz.</p>
                <a href={`mailto:${profile.email}`} className="btn btn-primary">
                  <Mail size={18} />
                  E-posta Gönder
                </a>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
