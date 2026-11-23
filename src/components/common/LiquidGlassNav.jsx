import { createElement, useEffect, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { LayoutGroup, motion as Motion, useReducedMotion } from 'framer-motion'
import './LiquidGlassNav.css'

const MotionLink = Motion.create(Link)
const glide = { type: 'spring', stiffness: 340, damping: 28, mass: 0.9 }

export default function LiquidGlassNav({ items, activeId, label, variant = 'portfolio' }) {
  const id = useId()
  const reduce = useReducedMotion()
  const [keyboardOpen, setKeyboardOpen] = useState(false)

  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return
    const update = () => {
      const editing = document.activeElement?.matches('input:not([type="checkbox"]):not([type="radio"]):not([type="range"]), textarea, [contenteditable="true"]')
      setKeyboardOpen(!!editing && window.innerHeight - viewport.height > 140)
    }
    viewport.addEventListener('resize', update)
    document.addEventListener('focusin', update)
    document.addEventListener('focusout', update)
    return () => {
      viewport.removeEventListener('resize', update)
      document.removeEventListener('focusin', update)
      document.removeEventListener('focusout', update)
    }
  }, [])

  return <LayoutGroup id={id}>
    <nav className={`liquid-nav liquid-nav--${variant}${keyboardOpen ? ' is-keyboard-open' : ''}`} aria-label={label} aria-hidden={keyboardOpen || undefined} inert={keyboardOpen || undefined}>
      <div className="liquid-nav__surface" aria-hidden="true" />
      <div className="liquid-nav__items">{items.map(item => {
        const active = item.id === activeId
        const Component = item.to ? MotionLink : item.href ? Motion.a : Motion.button
        const destination = item.to ? { to: item.to } : item.href ? { href: item.href } : { type: 'button' }
        return <Component key={item.id} {...destination} className={`liquid-nav__item${active ? ' is-active' : ''}`} aria-label={item.label} aria-current={active ? item.current || 'page' : undefined} onClick={item.onClick} whileTap={reduce ? undefined : { scale: 0.97 }} transition={reduce ? { duration: 0 } : glide}>
          {active && <Motion.span className="liquid-nav__lens" layoutId="liquid-lens" transition={reduce ? { duration: 0 } : glide} aria-hidden="true" />}
          <span className="liquid-nav__icon">{createElement(item.icon, { size: 20, strokeWidth: active ? 2 : 1.7, 'aria-hidden': true })}</span>
          <span className="liquid-nav__label">{item.shortLabel || item.label}</span>
        </Component>
      })}</div>
    </nav>
  </LayoutGroup>
}
