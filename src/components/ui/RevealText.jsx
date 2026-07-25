import { useRef, Fragment } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import './RevealText.css'

/**
 * Kinetic headline: each word rises out of a mask, staggered, on scroll-in.
 * Falls back to plain text under reduced motion. `text` should be a string.
 */
export default function RevealText({ text, as = 'span', className = '', stagger = 0.05, delay = 0 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const reduce = useReducedMotion()
  const Tag = motion[as] || motion.span
  const words = String(text).split(' ')

  if (reduce) {
    return <Tag ref={ref} className={className}>{text}</Tag>
  }

  return (
    <Tag ref={ref} className={`reveal-text ${className}`} aria-label={text}>
      {words.map((word, i) => (
        <Fragment key={i}>
          {i > 0 ? ' ' : ''}
          <span className="reveal-word" aria-hidden="true">
            <motion.span
              className="reveal-word-inner"
              initial={{ y: '120%' }}
              animate={inView ? { y: 0 } : { y: '120%' }}
              transition={{ duration: 0.75, delay: delay + i * stagger, ease: [0.22, 1, 0.36, 1] }}
            >
              {word}
            </motion.span>
          </span>
        </Fragment>
      ))}
    </Tag>
  )
}
