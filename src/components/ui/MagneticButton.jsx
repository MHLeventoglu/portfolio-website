import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'

/**
 * Subtle magnetic pull toward the cursor. Wraps any content (a link/button)
 * in an inline-flex motion element. No-op under reduced motion.
 */
export default function MagneticButton({ children, className = '', strength = 0.35, ...rest }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 200, damping: 15, mass: 0.4 })
  const springY = useSpring(y, { stiffness: 200, damping: 15, mass: 0.4 })

  const handleMove = (e) => {
    if (reduce) return
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength)
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength)
  }

  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: springX, y: springY, display: 'inline-flex' }}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
