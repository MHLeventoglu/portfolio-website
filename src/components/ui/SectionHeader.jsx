import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import './SectionHeader.css'

/**
 * Editorial section header: index number + mono label on a hairline rule,
 * then a large title. Animates the rule + content in on scroll.
 */
export default function SectionHeader({ index, label, title, kicker, align = 'left', children }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <div ref={ref} className={`section-header align-${align}`}>
      <div className="section-header-meta">
        {index && <span className="section-index">{index}</span>}
        {label && <span className="eyebrow">{label}</span>}
      </div>
      <motion.span
        className="section-header-rule"
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
      {title && (
        <motion.h2
          className="section-header-title"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {title}
        </motion.h2>
      )}
      {kicker && (
        <motion.p
          className="section-header-kicker"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {kicker}
        </motion.p>
      )}
      {children}
    </div>
  )
}
