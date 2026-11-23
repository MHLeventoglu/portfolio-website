import { createElement, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion as Motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { createHoldDragController, navDragFrame } from '../../lib/liquidNavGesture'
import './LiquidGlassNav.css'

const MotionLink = Motion.create(Link)
const glide = { type: 'spring', stiffness: 340, damping: 28, mass: 0.9 }
const pointFrom = event => ({ id: event.pointerId, x: event.clientX, y: event.clientY, event })

export default function LiquidGlassNav({ items, activeId, label, variant = 'portfolio' }) {
  const hintId = useId(), navigate = useNavigate(), reduce = useReducedMotion()
  const [keyboardOpen, setKeyboardOpen] = useState(false), [drag, setDrag] = useState(null)
  const nav = useRef(null), track = useRef(null), callbacks = useRef({}), initialized = useRef(false), suppressClick = useRef(false), capturedPointer = useRef(null)
  const x = useSpring(0, glide), width = useSpring(0, glide), lift = useSpring(0, glide), scaleX = useSpring(1, glide), scaleY = useSpring(1, glide), opacity = useMotionValue(0)
  const gesture = useRef(null)
  useLayoutEffect(() => {
    const controller = createHoldDragController({ onStart: point => callbacks.current.start?.(point), onMove: point => callbacks.current.move?.(point), onEnd: (point, cancelled) => callbacks.current.end?.(point, cancelled) })
    gesture.current = controller
    return () => { controller.dispose(); gesture.current = null }
  }, [])

  const geometry = useCallback(() => {
    if (!track.current) return null
    return { bounds: track.current.getBoundingClientRect(), elements: [...track.current.querySelectorAll('[data-liquid-id]')] }
  }, [])
  const syncLens = useCallback((snap = false) => {
    if (gesture.current?.isActive()) return
    const measured = geometry(), target = measured?.elements.find(element => element.dataset.liquidId === activeId)
    if (!target || !measured.bounds.width) { opacity.set(0); initialized.current = false; return }
    const rectangle = target.getBoundingClientRect(), jump = snap || reduce || !initialized.current
    if (jump) { x.jump(rectangle.left - measured.bounds.left); width.jump(rectangle.width) }
    else { x.set(rectangle.left - measured.bounds.left); width.set(rectangle.width) }
    opacity.set(1); initialized.current = true
  }, [activeId, gesture, geometry, opacity, reduce, width, x])

  useLayoutEffect(() => {
    const preview = point => {
      const measured = geometry()
      if (!measured) return null
      const frame = navDragFrame(measured.bounds, measured.elements.map(element => element.getBoundingClientRect()), point)
      if (!frame) return null
      x.jump(frame.x); width.jump(frame.width); opacity.set(1)
      const candidateId = frame.index === null ? null : measured.elements[frame.index].dataset.liquidId
      setDrag(previous => previous?.candidateId === candidateId ? previous : { candidateId })
      return { ...frame, candidateId }
    }
    const releaseCapture = () => {
      const pointer = capturedPointer.current
      capturedPointer.current = null
      if (pointer !== null && nav.current?.hasPointerCapture(pointer)) nav.current.releasePointerCapture(pointer)
    }
    callbacks.current = {
      resize: () => syncLens(true),
      start(point) {
        try { nav.current?.setPointerCapture(point.id); capturedPointer.current = point.id } catch { /* The OS may have cancelled this contact. */ }
        if (!reduce) { lift.set(-3); scaleX.set(1.1); scaleY.set(1.07) }
        preview(point)
      },
      move: preview,
      end(point, cancelled) {
        const frame = cancelled ? null : preview(point)
        setDrag(null); lift.set(0); scaleX.set(1); scaleY.set(1)
        releaseCapture()
        if (!frame?.candidateId) { syncLens(); return }
        const item = items.find(item => item.id === frame.candidateId)
        if (!item) { syncLens(); return }
        if (reduce) x.jump(frame.targetX)
        else x.set(frame.targetX)
        // Route changes happen only here, never while the lens passes intermediate tabs.
        if (item.onClick) item.onClick(point.event)
        else if (item.to) navigate(item.to)
        else if (item.href) navigate(item.href)
      }
    }
  }, [geometry, items, lift, navigate, opacity, reduce, scaleX, scaleY, syncLens, width, x])

  useLayoutEffect(() => { syncLens() }, [syncLens])
  useEffect(() => {
    const observer = new ResizeObserver(() => callbacks.current.resize?.())
    if (track.current) observer.observe(track.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const cancel = () => { if (gesture.current?.cancel() === 'drag') suppressClick.current = true }
    const visibility = () => { if (document.hidden) cancel() }
    window.addEventListener('blur', cancel)
    window.addEventListener('resize', cancel)
    document.addEventListener('visibilitychange', visibility)
    return () => { window.removeEventListener('blur', cancel); window.removeEventListener('resize', cancel); document.removeEventListener('visibilitychange', visibility) }
  }, [gesture])

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
    return () => { viewport.removeEventListener('resize', update); document.removeEventListener('focusin', update); document.removeEventListener('focusout', update) }
  }, [])

  return <nav ref={nav} className={`liquid-nav liquid-nav--${variant}${keyboardOpen ? ' is-keyboard-open' : ''}${drag ? ' is-dragging' : ''}`} aria-label={label} aria-describedby={hintId} aria-hidden={keyboardOpen || undefined} inert={keyboardOpen || undefined}
    onPointerDown={event => {
      suppressClick.current = false
      if (!event.isPrimary) { gesture.current?.cancel(); return }
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || !event.target.closest('[data-liquid-id]')) return
      gesture.current?.down(pointFrom(event))
    }}
    onPointerMove={event => { const result = gesture.current?.move(pointFrom(event)); if (result === 'drag') event.preventDefault(); if (result === 'cancelled') suppressClick.current = true }}
    onPointerUp={event => { if (gesture.current?.isActive()) { event.preventDefault(); suppressClick.current = true }; gesture.current?.up(pointFrom(event)) }}
    onPointerCancel={() => { if (gesture.current?.cancel() === 'drag') suppressClick.current = true }}
    onLostPointerCapture={() => { gesture.current?.cancel() }}
    onContextMenu={event => { if (gesture.current?.isActive()) event.preventDefault() }}
    onDragStart={event => event.preventDefault()}
    onKeyDown={event => { if (event.key === 'Escape') gesture.current?.cancel() }}
    onClickCapture={event => { if (suppressClick.current && event.detail !== 0) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false } }}>
    <div className="liquid-nav__surface" aria-hidden="true" />
    <div className="liquid-nav__items" ref={track}>
      <Motion.span className="liquid-nav__lens" style={{ x, width, y: lift, scaleX, scaleY, opacity }} aria-hidden="true" />
      {items.map(item => {
        const active = item.id === activeId, preview = drag?.candidateId === item.id
        const Component = item.to ? MotionLink : item.href ? Motion.a : Motion.button
        const destination = item.to ? { to: item.to } : item.href ? { href: item.href } : { type: 'button' }
        return <Component key={item.id} {...destination} data-liquid-id={item.id} draggable={false} className={`liquid-nav__item${active ? ' is-active' : ''}${preview ? ' is-preview' : ''}`} aria-label={item.label} aria-current={active ? item.current || 'page' : undefined} onClick={item.onClick} whileTap={reduce || drag ? undefined : { scale: 0.97 }} transition={reduce ? { duration: 0 } : glide}>
          <span className="liquid-nav__icon">{createElement(item.icon, { size: 20, strokeWidth: (drag ? preview : active) ? 2 : 1.7, 'aria-hidden': true })}</span><span className="liquid-nav__label">{item.shortLabel || item.label}</span>
        </Component>
      })}
    </div>
    <span className="liquid-nav__hint" id={hintId}>Sekmelere dokunun veya basılı tutup sürükleyin. Bıraktığınız sekme açılır.</span>
  </nav>
}
