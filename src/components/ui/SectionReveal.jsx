import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

/** Shared reveal variants — used across every section for a consistent feel. */
export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

/** Hook version for components that need the raw ref + in-view flag. */
export function useReveal(margin = '-100px') {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin })
  return { ref, inView }
}

/**
 * Scroll-triggered reveal wrapper. Replaces the repeated
 * useRef + useInView + initial/animate boilerplate in each section.
 */
export default function SectionReveal({
  children,
  as = 'div',
  className = '',
  delay = 0,
  y = 24,
  once = true,
  margin = '-100px',
  ...rest
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once, margin })
  const MotionTag = motion[as] || motion.div

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </MotionTag>
  )
}
