import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { useData } from '../../context/DataContext'
import { useLang } from '../../context/LanguageContext'
import { SkeletonBox } from '../ui/Skeleton'
import SectionHeader from '../ui/SectionHeader'
import Marquee from '../ui/Marquee'
import './Skills.css'

export default function Skills() {
  const { profile, skillsLoading } = useData()
  const { t } = useLang()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  const skills = profile?.skills || []
  const categories = [...new Set(skills.map(s => s.category))]

  return (
    <section id="skills" className="section skills" ref={ref}>
      <SectionHeader index="02" label={t('skills.eyebrow')} title={t('skills.title')} />

      <div className="skill-groups">
        {skillsLoading || skills.length === 0 ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="skill-cat">
              <div className="rule" />
              <SkeletonBox width="140px" height="26px" />
              <div className="skill-items">
                {[...Array(4)].map((__, j) => (
                  <div key={j} className="skill-item">
                    <SkeletonBox width="100%" height="16px" />
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          categories.map((cat, ci) => {
            const items = skills.filter(s => s.category === cat)
            return (
              <div key={cat} className="skill-cat">
                <div className="rule" />
                <div className="skill-cat-head">
                  <span className="skill-cat-index">{String(ci + 1).padStart(2, '0')}</span>
                  <h3 className="skill-cat-name">{cat}</h3>
                  <span className="skill-cat-count">{items.length}</span>
                </div>
                <div className="skill-items">
                  {items.map((skill, i) => (
                    <motion.div
                      key={skill.name}
                      className="skill-item"
                      initial={{ opacity: 0, y: 12 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.4, delay: 0.05 + i * 0.03 }}
                    >
                      <div className="skill-item-top">
                        <span className="skill-item-name">{skill.name}</span>
                        <span className="skill-item-lvl">{skill.level}</span>
                      </div>
                      <div className="skill-track">
                        <motion.span
                          className="skill-fill"
                          initial={{ scaleX: 0 }}
                          animate={isInView ? { scaleX: skill.level / 100 } : {}}
                          transition={{ duration: 1, delay: 0.2 + i * 0.03, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>

      {skills.length > 0 && (
        <div className="skills-marquee">
          <Marquee speed={44}>
            {skills.map((s) => (
              <span key={s.name} className="skills-kw">{s.name}<span className="skills-kw-dot">•</span></span>
            ))}
          </Marquee>
        </div>
      )}
    </section>
  )
}
