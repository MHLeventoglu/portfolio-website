import test from 'node:test'
import assert from 'node:assert/strict'
import { glassDisplacementMap } from '../src/lib/liquidGlassOptics.js'
import { navDragVisuals } from '../src/lib/liquidNavGesture.js'

test('refraction leaves the capsule centre neutral and bends only its rim inward', () => {
  const map = glassDisplacementMap(348, 64)
  const pixel = (x, y) => [...map.pixels.slice((y * map.width + x) * 4, (y * map.width + x) * 4 + 4)]
  assert.deepEqual(pixel(174, 32), [128, 128, 128, 255])
  assert.ok(pixel(0, 32)[0] > 128, 'left rim samples toward the centre')
  assert.ok(pixel(347, 32)[0] < 128, 'right rim samples toward the centre')
  assert.ok(pixel(174, 0)[1] > 128, 'top rim samples downward')
  assert.ok(pixel(174, 63)[1] < 128, 'bottom rim samples upward')
  assert.deepEqual(pixel(0, 0), [128, 128, 128, 255], 'clipped corners are neutral')
  assert.equal(map.scale, 18)
})

test('refraction maps have a bounded allocation and empty hidden controls need no map', () => {
  for (const dimensions of [[0, 64], [348, 0], [NaN, 64], [Infinity, 64]]) assert.equal(glassDisplacementMap(...dimensions), null)
  const map = glassDisplacementMap(5000, 2000)
  assert.equal(map.width, 640); assert.equal(map.height, 128)
  assert.equal(map.pixels.length, 640 * 128 * 4)
  const neutral = glassDisplacementMap(60, 54, 0)
  for (let i = 0; i < neutral.pixels.length; i += 4) assert.deepEqual([...neutral.pixels.slice(i, i + 4)], [128, 128, 128, 255])
})

test('icon emphasis interpolates between actual tab centres rather than snapping per tab', () => {
  const bounds = { top: 10, bottom: 70 }
  const rectangles = [{ left: 10, width: 50 }, { left: 70, width: 90 }, { left: 170, width: 60 }]
  assert.equal(navDragVisuals(bounds, rectangles, { x: 35, y: 40 }).progress, 0)
  assert.equal(navDragVisuals(bounds, rectangles, { x: 75, y: 40 }).progress, 0.5)
  assert.equal(navDragVisuals(bounds, rectangles, { x: 115, y: 40 }).progress, 1)
  assert.equal(navDragVisuals(bounds, rectangles, { x: 200, y: 40 }).progress, 2)
})

test('gel deformation responds to direction and speed while staying bounded outside the bar', () => {
  const bounds = { top: 10, bottom: 70 }, rectangles = [{ left: 10, width: 60 }, { left: 70, width: 60 }]
  const rest = navDragVisuals(bounds, rectangles, { x: 40, y: 40, time: 0 })
  const right = navDragVisuals(bounds, rectangles, { x: 100, y: 40, time: 16 }, { x: 40, y: 40, time: 0 })
  const left = navDragVisuals(bounds, rectangles, { x: 40, y: 40, time: 16 }, { x: 100, y: 40, time: 0 })
  assert.ok(right.scaleX > rest.scaleX); assert.ok(right.scaleY < rest.scaleY)
  assert.ok(right.rotate > 0); assert.ok(left.rotate < 0)
  const outside = navDragVisuals(bounds, rectangles, { x: 5000, y: -5000, time: 16 }, { x: 40, time: 16 })
  assert.ok(outside.progress <= 1.35); assert.ok(outside.scaleX < 1.12); assert.ok(outside.y >= -11)
})
