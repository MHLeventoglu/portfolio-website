import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

test('Markdown image storage and rendering', async t => {
  const server = await createServer({
    configFile: false,
    server: { middlewareMode: true, hmr: false, ws: false },
    esbuild: { jsx: 'automatic' },
    plugins: [{
      name: 'mock-image-storage',
      enforce: 'pre',
      resolveId(source, importer) {
        if (source === 'virtual:image-storage' || (source === './supabase' && importer?.endsWith('/src/lib/storage.js'))) {
          return '\0virtual:image-storage'
        }
      },
      load(id) {
        if (id !== '\0virtual:image-storage') return
        return `
          export const state = { calls: [], error: null }
          export const supabase = {
            storage: {
              from(bucket) {
                return {
                  async upload(path, file, options) {
                    state.calls.push({ bucket, path, file, options })
                    return { error: state.error }
                  },
                  getPublicUrl(path) {
                    return { data: { publicUrl: 'https://example.com/storage/' + bucket + '/' + path } }
                  }
                }
              }
            }
          }
        `
      }
    }]
  })

  try {
    const { state } = await server.ssrLoadModule('virtual:image-storage')
    const { uploadMarkdownImage } = await server.ssrLoadModule('/src/lib/storage.js')
    const file = new File(['test image'], 'screen (1).unexpected', { type: 'image/png' })

    await t.test('uploads to the existing bucket using unique paths and a normalized extension', async () => {
      const first = await uploadMarkdownImage(file, 'blog')
      const second = await uploadMarkdownImage(file, 'blog')
      const third = await uploadMarkdownImage(file, 'projects')
      assert.match(first, /^https:\/\/example.com\/storage\/images\/blog\/content\/[\w-]+\.png\?t=\d+$/)
      assert.notEqual(state.calls[0].path, state.calls[1].path)
      assert.match(third, /\/projects\/content\//)
      assert.notEqual(first, second)
      assert.equal(state.calls[0].bucket, 'images')
      assert.equal(state.calls[0].file.type, 'image/png')
      assert.equal(await state.calls[0].file.text(), await file.text())
    })

    await t.test('rejects invalid files before making a storage request', async () => {
      const count = state.calls.length
      await assert.rejects(uploadMarkdownImage(new File(['text'], 'file.txt', { type: 'text/plain' }), 'blog'), /formatında/)
      assert.equal(state.calls.length, count)
    })

    await t.test('propagates storage failures so the editor can preserve the document', async () => {
      state.error = new Error('Upload denied')
      await assert.rejects(uploadMarkdownImage(file, 'projects'), /Upload denied/)
      state.error = null
    })

    await t.test('renders standard Markdown images and formatting in project descriptions', async () => {
      const { default: ProjectDescription } = await server.ssrLoadModule('/src/components/ui/ProjectDescription.jsx')
      const markup = renderToStaticMarkup(createElement(ProjectDescription, null,
        '**Proje**\n\n![Ekran görüntüsü](https://example.com/image.png)'))
      assert.match(markup, /<strong>Proje<\/strong>/)
      assert.match(markup, /<img[^>]+src="https:\/\/example.com\/image.png"[^>]+alt="Ekran görüntüsü"/)
      assert.doesNotMatch(markup, /!\[Ekran/)
    })
  } finally {
    await server.close()
  }
})
