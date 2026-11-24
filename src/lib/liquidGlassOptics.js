const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

// A rounded capsule's inward normal bends backdrop pixels toward its centre.
// Red/green encode displacement, with 128 as the neutral value (SVG sRGB).
export function glassDisplacementMap(width, height, bend = 6) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null
  const w = Math.ceil(Math.min(width, 640)), h = Math.ceil(Math.min(height, 128))
  const radius = Math.min(w, h) / 2, rim = Math.min(10, radius * 0.55), scale = 18
  const pixels = new Uint8ClampedArray(w * h * 4)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const px = x + 0.5, py = y + 0.5
    const dx = px - clamp(px, radius, w - radius), dy = py - clamp(py, radius, h - radius)
    const length = Math.hypot(dx, dy), inset = radius - length
    const t = inset < 0 ? 0 : 1 - clamp(inset / rim, 0, 1)
    const amount = clamp(bend, 0, 8) * t * t * (3 - 2 * t)
    const offset = (y * w + x) * 4
    pixels[offset] = Math.round(127.5 - (length ? dx / length : 0) * amount / scale * 255)
    pixels[offset + 1] = Math.round(127.5 - (length ? dy / length : 0) * amount / scale * 255)
    pixels[offset + 2] = 128
    pixels[offset + 3] = 255
  }
  return { width: w, height: h, pixels, scale }
}
