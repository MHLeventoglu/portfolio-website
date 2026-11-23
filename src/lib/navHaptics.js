function vibrate(duration) {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return false
  return navigator.vibrate(duration)
}

export function createNavHaptics({ pulse = vibrate, now = Date.now } = {}) {
  let enabled = false, previous = null, lastPulse = -Infinity
  return {
    start(candidateId, pointerType) {
      enabled = pointerType === 'touch' || pointerType === 'pen'
      previous = candidateId
      lastPulse = -Infinity
    },
    move(candidateId) {
      if (!enabled || candidateId == null || candidateId === previous) return false
      previous = candidateId
      const time = now()
      // Avoid a continuous buzz when a finger jitters on a tab boundary.
      if (time - lastPulse < 40) return false
      lastPulse = time
      try { return !!pulse(12) } catch { return false }
    },
    end() { enabled = false; previous = null }
  }
}
