import test from 'node:test'
import assert from 'node:assert/strict'
import { createNavHaptics } from '../src/lib/navHaptics.js'

test('held touch selection pulses on a new tab, not on hold or repeated pointer moves', () => {
  const pulses = []
  const haptics = createNavHaptics({ pulse: duration => { pulses.push(duration); return true } })
  haptics.start('home', 'touch')
  assert.equal(haptics.move('home'), false)
  assert.equal(haptics.move('projects'), true)
  assert.equal(haptics.move('projects'), false)
  assert.equal(haptics.move(null), false)
  assert.equal(haptics.move('projects'), false)
  haptics.end()
  assert.equal(haptics.move('blog'), false)
  assert.deepEqual(pulses, [12])
})

test('crossing tabs in either direction works, while rapid boundary jitter is bounded', () => {
  let time = 0, pulses = 0
  const haptics = createNavHaptics({ now: () => time, pulse: () => { pulses++; return true } })
  haptics.start('home', 'touch')
  assert.equal(haptics.move('projects'), true)
  time = 10
  assert.equal(haptics.move('home'), false)
  time = 50
  assert.equal(haptics.move('projects'), true)
  time = 100
  assert.equal(haptics.move('home'), true)
  assert.equal(pulses, 3)
})

test('mouse input stays silent and each new touch gesture starts cleanly', () => {
  let pulses = 0
  const haptics = createNavHaptics({ now: () => 0, pulse: () => { pulses++; return true } })
  haptics.start('home', 'mouse'); haptics.move('projects'); haptics.end()
  assert.equal(pulses, 0)
  for (let i = 0; i < 2; i++) {
    haptics.start('home', 'touch'); haptics.move('projects'); haptics.end()
  }
  assert.equal(pulses, 2)
})

test('unsupported or denied vibration cannot interrupt navigation', () => {
  for (const pulse of [() => false, () => { throw new Error('Vibration denied') }]) {
    const haptics = createNavHaptics({ pulse })
    haptics.start('home', 'touch')
    assert.equal(haptics.move('projects'), false)
    assert.doesNotThrow(() => haptics.end())
  }
})
