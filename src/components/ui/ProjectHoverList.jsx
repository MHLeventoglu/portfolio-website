import { useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'
import ProjectDescription from './ProjectDescription'
import './ProjectHoverList.css'

/**
 * Editorial project index. Rows reveal a large image preview that follows the
 * cursor on hover (desktop). On touch/small screens an inline thumbnail shows
 * instead. Reduced motion disables the floating preview.
 */
export default function ProjectHoverList({ items, renderActions }) {
  const [active, setActive] = useState(null)
  const reduce = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 260, damping: 30, mass: 0.5 })
  const sy = useSpring(y, { stiffness: 260, damping: 30, mass: 0.5 })

  const handleMove = (e) => {
    x.set(e.clientX)
    y.set(e.clientY)
  }

  const activeItem = items.find((it) => it.id === active)

  return (
    <div className="hover-list" onMouseMove={reduce ? undefined : handleMove}>
      <div className="rule" />
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          className="hover-row"
          onMouseEnter={() => setActive(item.id)}
          onMouseLeave={() => setActive((cur) => (cur === item.id ? null : cur))}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: Math.min(i * 0.04, 0.3) }}
        >
          <span className="hover-index">{String(i + 1).padStart(2, '0')}</span>

          {item.image && (
            <div className="hover-row-thumb">
              <img src={item.image} alt="" loading="lazy" />
            </div>
          )}

          <h3 className="hover-title">{item.title}</h3>
          <span className="hover-cat">{item.category}</span>
          <div className="hover-actions">{renderActions?.(item)}</div>
          {item.description && (
            <ProjectDescription className="hover-description">{item.description}</ProjectDescription>
          )}
          <div className="rule" />
        </motion.div>
      ))}

      {!reduce && (
        <motion.div className="hover-preview" style={{ left: sx, top: sy }} aria-hidden="true">
          <AnimatePresence mode="wait">
            {activeItem?.image && (
              <motion.img
                key={activeItem.id}
                src={activeItem.image}
                alt=""
                initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
