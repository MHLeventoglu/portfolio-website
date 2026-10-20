import assert from 'node:assert/strict'
import test from 'node:test'
import { MAX_IMAGE_SIZE, insertMarkdownImage, validateMarkdownImage } from '../src/lib/markdownImages.js'

const url = 'https://example.com/images/photo.png'

test('inserts an image in an empty document using ordinary Markdown', () => {
  const result = insertMarkdownImage('', 0, 0, 'photo.png', url)
  assert.equal(result.content, `![photo](${url})\n\n`)
  assert.equal(result.cursor, result.content.length)
})

test('replaces the selection while preserving surrounding text and separating paragraphs', () => {
  const content = 'Önce seçilen sonra'
  const result = insertMarkdownImage(content, 5, 12, 'ekran.png', url)
  assert.equal(result.content, `Önce \n\n![ekran](${url})\n\n sonra`)
  assert.equal(result.content.slice(result.cursor), ' sonra')
})

test('inserts at the beginning, middle, and end without losing existing content', () => {
  for (const index of [0, 3, 6]) {
    const result = insertMarkdownImage('abcdef', index, index, 'photo.png', url)
    assert.ok(result.content.startsWith('abcdef'.slice(0, index)))
    assert.ok(result.content.endsWith(index === 6 ? '\n\n' : 'abcdef'.slice(index)))
    assert.ok(result.content.includes(`![photo](${url})`))
  }
})

test('does not duplicate existing blank lines', () => {
  const result = insertMarkdownImage('Önce\n\nSonra', 6, 6, 'photo.png', url)
  assert.equal(result.content, `Önce\n\n![photo](${url})\n\nSonra`)
})

test('escapes filenames and encodes URL characters that would break Markdown images', () => {
  const result = insertMarkdownImage('', 0, 0, 'a[b]\\c\nd.png', 'https://example.com/a (1).png?t=2')
  assert.equal(result.content, '![a\\[b\\]\\\\c d](https://example.com/a%20%281%29.png?t=2)\n\n')
})

test('accepts supported images up to and including the size limit', () => {
  for (const type of ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']) {
    assert.doesNotThrow(() => validateMarkdownImage({ type, size: MAX_IMAGE_SIZE }))
  }
})

test('rejects unsupported, empty, or oversized files before uploading', () => {
  assert.throws(() => validateMarkdownImage({ type: 'text/plain', size: 100 }), /formatında/)
  assert.throws(() => validateMarkdownImage({ type: 'image/png', size: 0 }), /boş/)
  assert.throws(() => validateMarkdownImage({ type: 'image/png', size: MAX_IMAGE_SIZE + 1 }), /10 MB/)
})
