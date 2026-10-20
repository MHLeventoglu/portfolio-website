export const IMAGE_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif'
}

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024

export function validateMarkdownImage(file) {
  if (!IMAGE_TYPES[file.type]) {
    throw new Error('PNG, JPEG, WebP, GIF veya AVIF formatında bir görsel seçin.')
  }
  if (file.size === 0 || file.size > MAX_IMAGE_SIZE) {
    throw new Error('Görsel boş olmamalı ve 10 MB boyutunu aşmamalıdır.')
  }
}

export function insertMarkdownImage(content, start, end, filename, url) {
  const alt = filename.replace(/\.[^.]+$/, '').replace(/[\\[\]]/g, '\\$&').replace(/[\r\n]/g, ' ')
  const source = url.replace(/[\s()<>]/g, char => encodeURIComponent(char).replace(/\(/g, '%28').replace(/\)/g, '%29'))
  const markdown = `![${alt}](${source})`
  const before = content.slice(0, start)
  const after = content.slice(end)
  const insertion = `${before && !before.endsWith('\n\n') ? (before.endsWith('\n') ? '\n' : '\n\n') : ''}${markdown}${after.startsWith('\n\n') ? '' : (after.startsWith('\n') ? '\n' : '\n\n')}`

  return {
    content: before + insertion + after,
    cursor: before.length + insertion.length
  }
}
