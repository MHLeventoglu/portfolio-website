import { useEffect, useId, useRef } from 'react'
import { glassDisplacementMap } from '../../lib/liquidGlassOptics'

// Chromium applies these filters to the backdrop, never to labels or icons.
// Maps are rasterised only when the bar changes size, not on pointer moves.
export default function LiquidGlassOptics({ targetRef, itemCount }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const surfaceId = `glass-surface-${id}`, lensId = `glass-lens-${id}`
  const surfaceImage = useRef(null), lensImage = useRef(null)
  useEffect(() => {
    const target = targetRef.current
    if (!target || !window.CSS?.supports('backdrop-filter', 'url("#glass")')) return
    let frame
    const paint = (image, width, height, bend) => {
      const map = glassDisplacementMap(width, height, bend)
      if (!map || !image) return false
      const canvas = document.createElement('canvas')
      canvas.width = map.width; canvas.height = map.height
      const context = canvas.getContext('2d')
      if (!context) return false
      const data = context.createImageData(map.width, map.height)
      data.data.set(map.pixels); context.putImageData(data, 0, 0)
      image.setAttribute('width', width); image.setAttribute('height', height)
      image.setAttribute('href', canvas.toDataURL())
      image.parentElement.setAttribute('width', width + 24)
      image.parentElement.setAttribute('height', height + 24)
      return true
    }
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const box = target.getBoundingClientRect()
        const item = target.querySelector('[data-liquid-id]')?.getBoundingClientRect()
        if (!box.width || !item) return
        try {
          if (paint(surfaceImage.current, box.width, box.height, 4.5)) target.style.setProperty('--glass-refraction', `url("#${surfaceId}")`)
          if (paint(lensImage.current, item.width, item.height, 6)) target.style.setProperty('--glass-lens-refraction', `url("#${lensId}")`)
        } catch { /* Rendering a decorative material must never break navigation. */ }
      })
    }
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(update) : null
    observer?.observe(target)
    window.addEventListener('resize', update)
    update()
    return () => {
      cancelAnimationFrame(frame); observer?.disconnect()
      window.removeEventListener('resize', update)
      target.style.removeProperty('--glass-refraction'); target.style.removeProperty('--glass-lens-refraction')
    }
  }, [targetRef, itemCount, surfaceId, lensId])

  return <svg className="liquid-nav__optics" width="0" height="0" aria-hidden="true" focusable="false">
    <defs>
      <filter id={surfaceId} x="-12" y="-12" width="1" height="1" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feImage ref={surfaceImage} x="0" y="0" preserveAspectRatio="none" result="map" />
        <feDisplacementMap in="SourceGraphic" in2="map" scale="18" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id={lensId} x="-12" y="-12" width="1" height="1" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feImage ref={lensImage} x="0" y="0" preserveAspectRatio="none" result="map" />
        <feDisplacementMap in="SourceGraphic" in2="map" scale="18" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
  </svg>
}
