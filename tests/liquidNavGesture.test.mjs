import test from 'node:test'
import assert from 'node:assert/strict'
import { createHoldDragController, navDragFrame } from '../src/lib/liquidNavGesture.js'

function harness() {
  const events = [], timers = new Map()
  let sequence = 0
  const controller = createHoldDragController({
    onStart: point => events.push(['start', point.x]), onMove: point => events.push(['preview', point.x]), onEnd: (point, cancelled) => events.push(['end', point.x, cancelled]),
    setTimer: callback => { const id = ++sequence; timers.set(id, callback); return id }, clearTimer: id => timers.delete(id)
  })
  return { controller, events, hold() { const callbacks = [...timers.values()]; timers.clear(); callbacks.forEach(callback => callback()) } }
}
const point = (x, y = 30, id = 1) => ({ x, y, id })

test('a short tap is left to the ordinary link click, without a second navigation', () => {
  const { controller, events, hold } = harness()
  controller.down(point(30)); assert.equal(controller.up(point(30)), 'tap'); hold()
  assert.deepEqual(events, [])
})

test('holding previews every crossed tab but commits only once when released', () => {
  const { controller, events, hold } = harness()
  controller.down(point(30)); hold()
  for (const x of [90, 150, 210, 270, 330]) controller.move(point(x))
  assert.equal(events.filter(event => event[0] === 'end').length, 0)
  assert.equal(controller.up(point(330)), 'drag')
  assert.deepEqual(events.at(-1), ['end', 330, false])
  assert.equal(controller.up(point(330)), 'idle')
  assert.equal(events.filter(event => event[0] === 'end').length, 1)
})

test('intentional horizontal dragging works immediately; vertical movement cancels a pending hold', () => {
  const { controller, events, hold } = harness()
  controller.down(point(30)); assert.equal(controller.move(point(70)), 'drag')
  controller.up(point(70))
  assert.deepEqual(events.at(-1), ['end', 70, false])
  events.length = 0
  controller.down(point(30)); assert.equal(controller.move(point(32, 60)), 'cancelled'); hold()
  assert.deepEqual(events, [])
})

test('another pointer cannot steal the gesture, and cancel/unmount never commit', () => {
  const { controller, events, hold } = harness()
  controller.down(point(30)); hold()
  assert.equal(controller.move(point(300, 30, 2)), 'idle')
  assert.equal(controller.up(point(300, 30, 2)), 'idle')
  assert.equal(controller.cancel(), 'drag')
  assert.deepEqual(events.at(-1), ['end', 30, true])
  controller.down(point(40)); controller.dispose(); hold()
  assert.equal(controller.isActive(), false)
  assert.equal(events.filter(event => event[0] === 'end').length, 1)
})

test('drag hit testing uses actual tab positions and cancels when released away from the bar', () => {
  const bounds = { left: 10, right: 370, width: 360, top: 10, bottom: 70 }
  const rects = Array.from({ length: 6 }, (_, i) => ({ left: 10 + i * 60, width: 60 }))
  assert.deepEqual(navDragFrame(bounds, rects, point(340)), { index: 5, width: 60, x: 300, targetX: 300 })
  assert.equal(navDragFrame(bounds, rects, point(160)).index, 2)
  assert.equal(navDragFrame(bounds, rects, point(160, 120)).index, null)
  assert.equal(navDragFrame(bounds, rects, point(-50)).index, null)
  assert.ok(navDragFrame(bounds, rects, point(0)).x >= -10)
})
