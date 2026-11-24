const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

export function navDragFrame(bounds, rectangles, point, tolerance = 36) {
  if (!rectangles.length || bounds.width <= 0) return null
  let index = 0
  for (let i = 1; i < rectangles.length; i++) {
    if (Math.abs(point.x - (rectangles[i].left + rectangles[i].width / 2)) < Math.abs(point.x - (rectangles[index].left + rectangles[index].width / 2))) index = i
  }
  const width = rectangles[index].width
  const raw = point.x - bounds.left - width / 2
  const constrained = clamp(raw, 0, Math.max(0, bounds.width - width))
  const outside = point.x < bounds.left - tolerance || point.x > bounds.right + tolerance || point.y < bounds.top - tolerance || point.y > bounds.bottom + tolerance
  return { index: outside ? null : index, width, x: constrained + clamp((raw - constrained) * 0.16, -10, 10), targetX: rectangles[index].left - bounds.left }
}

// These are tuned web interaction values, not Apple's private spring constants.
export function navDragVisuals(bounds, rectangles, point, previous = null) {
  if (!rectangles.length) return null
  const centers = rectangles.map(rectangle => rectangle.left + rectangle.width / 2)
  let progress = 0
  if (point.x <= centers[0]) progress = Math.max(-0.35, (point.x - centers[0]) / rectangles[0].width)
  else if (point.x >= centers.at(-1)) progress = centers.length - 1 + Math.min(0.35, (point.x - centers.at(-1)) / rectangles.at(-1).width)
  else {
    const next = centers.findIndex(center => center >= point.x)
    progress = next - 1 + (point.x - centers[next - 1]) / (centers[next] - centers[next - 1])
  }
  const dt = previous ? clamp((point.time || 0) - (previous.time || 0), 8, 64) : 16
  const velocity = previous ? clamp((point.x - previous.x) / dt, -1.6, 1.6) : 0
  return {
    progress,
    scaleX: 1.055 + Math.abs(velocity) * 0.035,
    scaleY: 1.065 - Math.abs(velocity) * 0.022,
    y: -2 + clamp((point.y - (bounds.top + bounds.bottom) / 2) * 0.2, -9, 9),
    rotate: velocity * 1.1
  }
}

// No navigation is performed here. A held drag commits exactly once, at release.
export function createHoldDragController({ onStart, onMove, onEnd, delay = 180, slop = 9, setTimer = setTimeout, clearTimer = clearTimeout }) {
  let press = null, timer = null
  const clear = () => { if (timer !== null) clearTimer(timer); timer = null }
  const activate = () => { if (press && !press.active) { clear(); press.active = true; onStart(press.last) } }
  const end = (point, cancelled, notify = true) => {
    if (!press) return 'idle'
    const wasActive = press.active
    clear(); press = null
    if (wasActive && notify) onEnd(point, cancelled)
    return wasActive ? 'drag' : 'tap'
  }
  return {
    down(point) {
      if (press) return false
      press = { origin: point, last: point, active: false }
      timer = setTimer(activate, delay)
      return true
    },
    move(point) {
      if (!press || point.id !== press.origin.id) return 'idle'
      press.last = point
      if (!press.active) {
        const dx = Math.abs(point.x - press.origin.x), dy = Math.abs(point.y - press.origin.y)
        if (dy > slop && dy > dx) { end(point, true); return 'cancelled' }
        if (dx > slop) activate()
      }
      if (press?.active) { onMove(point); return 'drag' }
      return 'pending'
    },
    up(point) { return press && point.id === press.origin.id ? end(point, false) : 'idle' },
    cancel() { return press ? end(press.last, true) : 'idle' },
    dispose() { if (press) end(press.last, true, false); clear() },
    isActive: () => !!press?.active
  }
}
