import { useEffect, useRef } from 'react'
import './DotWave.css'

/**
 * Animated dotted field on a canvas.
 *  - mode="grid": subtle rippling grid that swells near the cursor.
 *  - mode="dune": a faint dot field crossed by a travelling teal wave crest
 *    (à la Silana's hero), with gentle vertical displacement for a 3D feel.
 * Reads the live --accent colour (re-reads on theme change), caps DPR, pauses
 * when the tab is hidden, and renders a single static frame under reduced motion.
 */
export default function DotWave({ className = '', gap = 26, baseRadius = 1.3, mode = 'grid', global = false }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let w = 0, h = 0, cols = 0, rows = 0, raf = 0, running = true
    const mouse = { x: -9999, y: -9999 }

    const hexToRgb = (hex) => {
      const s = hex.trim().replace('#', '')
      const n = s.length === 3 ? s.split('').map(c => c + c).join('') : s
      const int = parseInt(n || '0fbca9', 16)
      return [(int >> 16) & 255, (int >> 8) & 255, int & 255]
    }
    const readAccent = () => getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#0fbca9'
    let teal = hexToRgb(readAccent())
    const base = [150, 162, 178]

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      w = rect.width; h = rect.height
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.round(w * dpr))
      canvas.height = Math.max(1, Math.round(h * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cols = Math.ceil(w / gap) + 1
      rows = Math.ceil(h / gap) + 1
    }

    const drawGrid = (tm) => {
      const t = tm * 0.001
      ctx.clearRect(0, 0, w, h)
      for (let iy = 0; iy < rows; iy++) {
        for (let ix = 0; ix < cols; ix++) {
          const x = ix * gap, y = iy * gap
          const wave = Math.sin(x * 0.015 + t * 0.9) + Math.cos(y * 0.02 - t * 0.7)
          const py = y + (reduce ? 0 : wave * 6)
          let a = 0.08 + ((wave + 2) / 4) * 0.14
          let r = baseRadius + ((wave + 2) / 4) * 0.7
          const dx = x - mouse.x, dy = py - mouse.y, d2 = dx * dx + dy * dy, R = 140
          if (d2 < R * R) { const f = 1 - Math.sqrt(d2) / R; a += f * 0.55; r += f * 2.4 }
          ctx.beginPath()
          ctx.fillStyle = `rgba(${teal[0]},${teal[1]},${teal[2]},${a < 0.85 ? a : 0.85})`
          ctx.arc(x, py, r, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    const drawDune = (tm) => {
      const t = tm * 0.001
      ctx.clearRect(0, 0, w, h)
      for (let iy = 0; iy < rows; iy++) {
        for (let ix = 0; ix < cols; ix++) {
          const x = ix * gap, y = iy * gap
          // broad travelling height field (diagonal), plus a slow secondary swell
          const phase = x * 0.006 + y * 0.0035 - (reduce ? 0 : t * 0.5)
          const swell = Math.sin(y * 0.01 + (reduce ? 0 : t * 0.25))
          const height = Math.sin(phase) * 0.7 + swell * 0.3            // -1..1
          const crest = Math.pow(Math.max(0, height), 2.4)              // 0..1 sharp ridge
          const py = y - (reduce ? 0 : height * 10)                     // vertical lift => 3D feel

          // faint grey base everywhere, teal along the crest
          let a = 0.05 + (height * 0.5 + 0.5) * 0.06 + crest * 0.5
          let r = baseRadius * (0.85 + crest * 1.2)
          const cr = base[0] + (teal[0] - base[0]) * crest
          const cg = base[1] + (teal[1] - base[1]) * crest
          const cb = base[2] + (teal[2] - base[2]) * crest

          const dx = x - mouse.x, dy = py - mouse.y, d2 = dx * dx + dy * dy, R = 150
          if (d2 < R * R) { const f = 1 - Math.sqrt(d2) / R; a += f * 0.4; r += f * 1.8 }

          ctx.beginPath()
          ctx.fillStyle = `rgba(${cr | 0},${cg | 0},${cb | 0},${a < 0.9 ? a : 0.9})`
          ctx.arc(x, py, r, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    // Metaball height-field rendered as a dot matrix — a soft 3D mass that
    // slowly morphs, with a teal glow tracing its silhouette (à la Silana).
    const smooth = (a, b, x) => { const tt = Math.min(1, Math.max(0, (x - a) / (b - a))); return tt * tt * (3 - 2 * tt) }
    const drawObject = (tm) => {
      const mt = reduce ? 0 : tm * 0.0005   // slow mass morph
      const wt = reduce ? 0 : tm * 0.0016   // faster wave travel
      ctx.clearRect(0, 0, w, h)
      const R = Math.min(w, h) * 0.16
      const R2 = R * R
      const cx = w * 0.5
      // a wide, low mass with a domed top; each blob drifts on its own path
      const cs = [
        [(0.30 + Math.sin(mt * 0.9) * 0.06) * w, (0.60 + Math.cos(mt * 0.7) * 0.05) * h],
        [(0.45 + Math.sin(mt * 1.1 + 1.7) * 0.07) * w, (0.50 + Math.cos(mt * 0.8 + 0.5) * 0.06) * h],
        [(0.58 + Math.sin(mt * 0.8 + 3.1) * 0.07) * w, (0.52 + Math.cos(mt * 1.0 + 2.2) * 0.06) * h],
        [(0.70 + Math.sin(mt * 1.2 + 4.6) * 0.06) * w, (0.60 + Math.cos(mt * 0.6 + 1.1) * 0.05) * h],
        [(0.50 + Math.sin(mt * 1.4 + 2.4) * 0.08) * w, (0.44 + Math.cos(mt * 0.9 + 3.5) * 0.06) * h],
      ]
      for (let iy = 0; iy < rows; iy++) {
        for (let ix = 0; ix < cols; ix++) {
          const x = ix * gap, y = iy * gap
          let field = 0
          for (let k = 0; k < cs.length; k++) {
            const dx = x - cs[k][0], dy = y - cs[k][1]
            field += R2 / (dx * dx + dy * dy + 1)
          }
          const H = smooth(0.8, 2.6, field)            // 0..1 solid mass
          const diff = field - 1.0
          const rim = Math.exp(-(diff * diff) / 0.02)  // glow along the iso silhouette

          // travelling wave field over the whole grid + an outward ripple
          const ripple = Math.sin((Math.hypot(x - cx, y - h) * 0.03) - wt * 2.2)
          const wave = (Math.sin(x * 0.019 + wt * 2.4) + Math.cos(y * 0.022 - wt * 1.7) + Math.sin((x + y) * 0.013 + wt * 1.3) + ripple * 0.8) / 3.8 // ~ -1..1
          const wCrest = Math.pow(Math.max(0, wave), 3)

          const py = y - (reduce ? 0 : H * 14 + wave * 9)

          let a = 0.05 + H * 0.12 + rim * 0.5 + Math.max(0, wave) * 0.13 + wCrest * 0.22
          let r = baseRadius * (0.75 + H * 0.5 + rim * 0.8 + Math.max(0, wave) * 0.5)
          let k = rim + wCrest * 0.85
          if (k > 1) k = 1
          const cr = base[0] + (teal[0] - base[0]) * k
          const cg = base[1] + (teal[1] - base[1]) * k
          const cb = base[2] + (teal[2] - base[2]) * k

          const mx = x - mouse.x, my = py - mouse.y, d2 = mx * mx + my * my, MR = 160
          if (d2 < MR * MR) { const f = 1 - Math.sqrt(d2) / MR; a += f * 0.4; r += f * 1.8 }

          ctx.beginPath()
          ctx.fillStyle = `rgba(${cr | 0},${cg | 0},${cb | 0},${a < 0.92 ? a : 0.92})`
          ctx.arc(x, py, r, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    const draw = mode === 'object' ? drawObject : mode === 'dune' ? drawDune : drawGrid

    const loop = (t) => { if (!running) return; draw(t); raf = requestAnimationFrame(loop) }

    resize()
    if (reduce) draw(0)
    else raf = requestAnimationFrame(loop)

    const onResize = () => resize()
    const onMove = (e) => { const rect = canvas.getBoundingClientRect(); mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top }
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999 }
    const onVis = () => {
      if (document.hidden) { running = false; cancelAnimationFrame(raf) }
      else if (!reduce && !running) { running = true; raf = requestAnimationFrame(loop) }
    }
    const themeObs = new MutationObserver(() => { teal = hexToRgb(readAccent()) })
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    const moveTarget = global ? window : canvas
    window.addEventListener('resize', onResize)
    moveTarget.addEventListener('mousemove', onMove, { passive: true })
    if (!global) canvas.addEventListener('mouseleave', onLeave)
    document.addEventListener('visibilitychange', onVis)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      moveTarget.removeEventListener('mousemove', onMove)
      if (!global) canvas.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('visibilitychange', onVis)
      themeObs.disconnect()
    }
  }, [gap, baseRadius, mode, global])

  return <canvas ref={canvasRef} className={`dotwave ${global ? 'dotwave-global' : ''} ${className}`} aria-hidden="true" />
}
