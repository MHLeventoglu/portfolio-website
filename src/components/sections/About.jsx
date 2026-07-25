import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { useData } from '../../context/DataContext'
import { useLang } from '../../context/LanguageContext'
import { SkeletonBox } from '../ui/Skeleton'
import SectionHeader from '../ui/SectionHeader'
import './About.css'

export default function About() {
  const { profile, profileLoading, loading, experiences, experiencesLoading } = useData()
  const { t } = useLang()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  const showBioSkeleton = loading || profileLoading || !profile.bio

  const meta = [
    profile.university && { label: t('about.university'), value: profile.university },
    profile.degree && { label: t('about.degree'), value: profile.degree },
    profile.gradYear && { label: t('about.grad'), value: profile.gradYear },
    profile.gpa && { label: t('about.gpa'), value: profile.gpa },
    profile.location && { label: t('about.location'), value: profile.location },
  ].filter(Boolean)

  return (
    <section id="about" className="section about" ref={ref}>
      <SectionHeader index="01" label={t('about.eyebrow')} title={t('about.title')} />

      <div className="about-grid">
        <div className="about-bio">
          {showBioSkeleton ? (
            <>
              <SkeletonBox width="100%" height="18px" className="mb-sm" />
              <SkeletonBox width="96%" height="18px" className="mb-sm" />
              <SkeletonBox width="90%" height="18px" className="mb-sm" />
              <SkeletonBox width="70%" height="18px" />
            </>
          ) : (
            <p>{profile.bio}</p>
          )}
        </div>

        <aside className="about-meta">
          {profileLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="meta-row">
                <SkeletonBox width="70px" height="12px" />
                <SkeletonBox width="120px" height="16px" />
              </div>
            ))
          ) : (
            meta.map((m, i) => (
              <motion.div
                key={m.label}
                className="meta-row"
                initial={{ opacity: 0, y: 12 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
              >
                <span className="meta-label">{m.label}</span>
                <span className="meta-value">{m.value}</span>
              </motion.div>
            ))
          )}
        </aside>
      </div>

      {/* Experience timeline */}
      <div className="about-exp">
        <div className="about-exp-head">
          <span className="eyebrow">{t('about.exp')}</span>
        </div>
        <div className="exp-list">
          {experiencesLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="exp-row">
                <div className="rule" />
                <SkeletonBox width="90px" height="14px" />
                <div className="exp-main">
                  <SkeletonBox width="220px" height="20px" className="mb-sm" />
                  <SkeletonBox width="80%" height="15px" />
                </div>
              </div>
            ))
          ) : (
            experiences.map((item, i) => (
              <motion.div
                key={item.id}
                className="exp-row"
                initial={{ opacity: 0, y: 18 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
              >
                <div className="rule" />
                <span className="exp-date">{item.date_range}</span>
                <div className="exp-main">
                  <h4 className="exp-title">{item.title}</h4>
                  <span className="exp-sub">{item.subtitle}</span>
                  <p className="exp-desc">{item.description}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
