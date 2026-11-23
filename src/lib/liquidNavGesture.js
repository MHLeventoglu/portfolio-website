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
