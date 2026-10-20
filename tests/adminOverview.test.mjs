import assert from 'node:assert/strict'
import test from 'node:test'
import { profileChecklist, projectCompleteness, publicationSeries, recentItems } from '../src/lib/adminOverview.js'

const now = new Date(2026, 1, 15, 12)

test('publication counts cross year boundaries and use both supported date fields', () => {
  const result = publicationSeries([
    { created_at: new Date(2025, 11, 5).toISOString() },
    { createdAt: new Date(2026, 0, 5).toISOString() },
    { created_at: new Date(2026, 0, 12).toISOString() }
  ], [{ created_at: new Date(2026, 1, 1).toISOString() }], 6, now)
  assert.deepEqual(result.map(month => month.key), ['2025-8', '2025-9', '2025-10', '2025-11', '2026-0', '2026-1'])
  assert.deepEqual(result.map(month => month.posts), [0, 0, 0, 1, 2, 0])
  assert.deepEqual(result.map(month => month.projects), [0, 0, 0, 0, 0, 1])
})

test('publication chart excludes invalid, future, and out-of-period dates', () => {
  const items = [
    {}, { created_at: 'invalid' },
    { created_at: new Date(2026, 2, 1).toISOString() },
    { created_at: new Date(2020, 0, 1).toISOString() }
  ]
  const result = publicationSeries(items, items, 12, now)
  assert.equal(result.length, 12)
  assert.ok(result.every(month => month.posts === 0 && month.projects === 0))
})

test('recent content is sorted without changing the original collection', () => {
  const items = [{ id: 1, createdAt: '2026-01-01' }, { id: 2 }, { id: 3, created_at: '2026-02-01' }]
  assert.deepEqual(recentItems(items, 2).map(item => item.id), [3, 1])
  assert.deepEqual(items.map(item => item.id), [1, 2, 3])
})

test('profile progress handles an empty profile and identifies the correct next page', () => {
  const empty = profileChecklist({})
  assert.equal(empty.filter(item => item.done).length, 0)
  assert.equal(empty.find(item => item.label === 'Yetenekler').to, '/admin/skills')
  const complete = profileChecklist({ name: 'Muaz', title: 'Engineer', bio: 'Bio', image_url: '/image.png', email: 'me@example.com', location: 'Ankara', social: { github: 'https://github.com/example' }, skills: [{ name: 'React' }] })
  assert.ok(complete.every(item => item.done))
})

test('project completeness reflects actual content fields and does not imply a publication status', () => {
  assert.equal(projectCompleteness({}), 0)
  assert.equal(projectCompleteness({ title: 'Project' }), 20)
  assert.equal(projectCompleteness({ title: 'Project', description: 'Description', image: '/image.png', tags: ['React'], demo: 'https://example.com' }), 100)
})
