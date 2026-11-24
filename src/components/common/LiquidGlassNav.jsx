import { createElement, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion as Motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { createHoldDragController, navDragFrame, navDragVisuals } from '../../lib/liquidNavGesture'
import { createNavHaptics } from '../../lib/navHaptics'
import LiquidGlassOptics from './LiquidGlassOptics'
import './LiquidGlassNav.css'

const MotionLink = Motion.create(Link)
const glide = { type: 'spring', stiffness: 430, damping: 32, mass: 0.8 }
const gel = { type: 'spring', stiffness: 520, damping: 30, mass: 0.65 }
const pointFrom = event => ({ id: event.pointerId, x: event.clientX, y: event.clientY, time: event.timeStamp, event })

function LiquidNavItem({ item, index, active, preview, dragging, progress, energy, reduce }) {
  const emphasis = useTransform([progress, energy], ([position, amount]) => reduce ? 0 : Math.max(0, 1 - Math.abs(position - index)) * amount)
  const iconScale = useSpring(useTransform(emphasis, value => 1 + value * 0.12), gel)
  const iconLift = useSpring(useTransform(emphasis, value => -value * 1.5), gel)
  const Component = item.to ? MotionLink : item.href ? Motion.a : Motion.button
  const destination = item.to ? { to: item.to } : item.href ? { href: item.href } : { type: 'button' }
  return <Component {...destination} data-liquid-id={item.id} draggable={false} className={`liquid-nav__item${active ? ' is-active' : ''}${preview ? ' is-preview' : ''}`} aria-label={item.label} aria-current={active ? item.current || 'page' : undefined} onClick={item.onClick} whileTap={reduce || dragging ? undefined : { scale: 0.96 }} transition={reduce ? { duration: 0 } : gel}>
    <Motion.span className="liquid-nav__icon" style={reduce ? { scale: 1, y: 0 } : { scale: iconScale, y: iconLift }}>{createElement(item.icon, { size: 22, strokeWidth: (dragging ? preview : active) ? 2.15 : 1.8, 'aria-hidden': true })}</Motion.span>
    <span className="liquid-nav__label">{item.shortLabel || item.label}</span>
  </Component>
}

export default function LiquidGlassNav({ items, activeId, label, variant = 'portfolio' }) {
  const hintId = useId(), navigate = useNavigate(), reduce = useReducedMotion()
  const [keyboardOpen, setKeyboardOpen] = useState(false), [drag, setDrag] = useState(null)
  const nav = useRef(null), track = useRef(null), callbacks = useRef({}), initialized = useRef(false), suppressClick = useRef(false), capturedPointer = useRef(null)
  const dragGeometry = useRef(null), lastDragPoint = useRef(null)
  const x = useSpring(0, glide), width = useSpring(0, glide), lift = useSpring(0, gel), scaleX = useSpring(1, gel), scaleY = useSpring(1, gel), rotate = useSpring(0, gel), opacity = useMotionValue(0)
  const lightX = useMotionValue(0), lightY = useMotionValue(0), touchEnergy = useSpring(0, gel), dragEnergy = useSpring(0, gel), dragProgress = useMotionValue(-1)
  const touchLight = useMotionTemplate`radial-gradient(110px 70px at ${lightX}px ${lightY}px, rgba(255,255,255,.42), rgba(255,255,255,.12) 42%, transparent 76%)`
  const gesture = useRef(null), haptics = useRef(null)
  useLayoutEffect(() => {
    haptics.current = createNavHaptics()
    const controller = createHoldDragController({ onStart: point => callbacks.current.start?.(point), onMove: point => callbacks.current.move?.(point), onEnd: (point, cancelled) => callbacks.current.end?.(point, cancelled) })
    gesture.current = controller
    return () => { controller.dispose(); gesture.current = null; haptics.current?.end(); haptics.current = null }
  }, [])

  const geometry = useCallback(() => {
    if (!track.current) return null
    const elements = [...track.current.querySelectorAll('[data-liquid-id]')]
    return { bounds: track.current.getBoundingClientRect(), elements, rectangles: elements.map(element => element.getBoundingClientRect()) }
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
    const reset = () => {
      touchEnergy.set(0); dragEnergy.set(0)
      lift.set(0); scaleX.set(1); scaleY.set(1); rotate.set(0)
      lastDragPoint.current = null; dragGeometry.current = null
      haptics.current?.end()
    }
    const preview = point => {
      const measured = dragGeometry.current || geometry()
      if (!measured) return null
      const frame = navDragFrame(measured.bounds, measured.rectangles, point)
      if (!frame) return null
      x.jump(frame.x); width.jump(frame.width); opacity.set(1)
      const visual = navDragVisuals(measured.bounds, measured.rectangles, point, lastDragPoint.current)
      if (visual) {
        dragProgress.set(frame.index === null ? -2 : visual.progress)
        if (!reduce) { lift.set(visual.y); scaleX.set(visual.scaleX); scaleY.set(visual.scaleY); rotate.set(visual.rotate) }
      }
      lastDragPoint.current = point
      lightX.set(point.x - measured.bounds.left + 5); lightY.set(point.y - measured.bounds.top + 5)
      const candidateId = frame.index === null ? null : measured.elements[frame.index].dataset.liquidId
      haptics.current?.move(candidateId)
      setDrag(previous => previous?.candidateId === candidateId ? previous : { candidateId })
      return { ...frame, candidateId }
    }
    const releaseCapture = () => {
      const pointer = capturedPointer.current
      capturedPointer.current = null
      if (pointer !== null && nav.current?.hasPointerCapture(pointer)) nav.current.releasePointerCapture(pointer)
    }
    callbacks.current = {
      reset,
      resize: () => syncLens(true),
      start(point) {
        dragGeometry.current = geometry()
        try { nav.current?.setPointerCapture(point.id); capturedPointer.current = point.id } catch { /* The OS may have cancelled this contact. */ }
        if (reduce) dragEnergy.jump(1)
        else dragEnergy.set(1)
        preview(point)
      },
      move: preview,
      end(point, cancelled) {
        const frame = cancelled ? null : preview(point)
        reset(); setDrag(null)
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
  }, [dragEnergy, dragProgress, geometry, items, lift, lightX, lightY, navigate, opacity, reduce, rotate, scaleX, scaleY, syncLens, touchEnergy, width, x])

  useLayoutEffect(() => { syncLens() }, [syncLens])
  useLayoutEffect(() => {
    if (reduce) { lift.jump(0); scaleX.jump(1); scaleY.jump(1); rotate.jump(0) }
  }, [reduce, lift, scaleX, scaleY, rotate])
  useEffect(() => {
    if (typeof ResizeObserver !== 'function') return
    const observer = new ResizeObserver(() => callbacks.current.resize?.())
    if (track.current) observer.observe(track.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const cancel = () => { if (gesture.current?.cancel() === 'drag') suppressClick.current = true; callbacks.current.reset?.() }
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
      if (!event.isPrimary) { gesture.current?.cancel(); callbacks.current.reset?.(); return }
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || !event.target.closest('[data-liquid-id]')) return
      if (gesture.current?.down(pointFrom(event))) {
        haptics.current?.start(event.target.closest('[data-liquid-id]').dataset.liquidId, event.pointerType)
        const bounds = nav.current.getBoundingClientRect()
        lightX.set(event.clientX - bounds.left); lightY.set(event.clientY - bounds.top)
        if (reduce) touchEnergy.jump(0.5)
        else touchEnergy.set(1)
      }
    }}
    onPointerMove={event => { const result = gesture.current?.move(pointFrom(event)); if (result === 'drag') event.preventDefault(); if (result === 'cancelled') { suppressClick.current = true; callbacks.current.reset?.() } }}
    onPointerUp={event => { if (gesture.current?.isActive()) { event.preventDefault(); suppressClick.current = true }; if (gesture.current?.up(pointFrom(event)) !== 'drag') callbacks.current.reset?.() }}
    onPointerCancel={() => { if (gesture.current?.cancel() === 'drag') suppressClick.current = true; callbacks.current.reset?.() }}
    onLostPointerCapture={() => { gesture.current?.cancel(); callbacks.current.reset?.() }}
    onContextMenu={event => { if (gesture.current?.isActive()) event.preventDefault() }}
    onDragStart={event => event.preventDefault()}
    onKeyDown={event => { if (event.key === 'Escape') { gesture.current?.cancel(); callbacks.current.reset?.() } }}
    onClickCapture={event => { if (suppressClick.current && event.detail !== 0) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false } }}>
    <LiquidGlassOptics targetRef={nav} itemCount={items.length} />
    <div className="liquid-nav__edge" aria-hidden="true" />
    <div className="liquid-nav__surface" aria-hidden="true" />
    <Motion.div className="liquid-nav__touch-light" style={{ opacity: touchEnergy, background: touchLight }} aria-hidden="true" />
    <div className="liquid-nav__items" ref={track}>
      <Motion.span className="liquid-nav__lens" style={{ x, width, y: lift, scaleX, scaleY, rotate, opacity }} aria-hidden="true"><span className="liquid-nav__lens-glass" /><span className="liquid-nav__lens-light" /></Motion.span>
      {items.map((item, index) => {
        const active = item.id === activeId, preview = drag?.candidateId === item.id
        return <LiquidNavItem key={item.id} item={item} index={index} active={active} preview={preview} dragging={!!drag} progress={dragProgress} energy={dragEnergy} reduce={reduce} />
      })}
    </div>
    <span className="liquid-nav__hint" id={hintId}>Sekmelere dokunun veya basılı tutup sürükleyin. Bıraktığınız sekme açılır.</span>
  </nav>
}
