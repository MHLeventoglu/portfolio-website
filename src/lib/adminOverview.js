const timestamp = item => {
  const value = new Date(item.created_at || item.createdAt || '').getTime()
  return Number.isFinite(value) ? value : 0
}

export function recentItems(items, limit = 4) {
  return [...items].sort((a, b) => timestamp(b) - timestamp(a)).slice(0, limit)
}

export function publicationSeries(posts, projects, count = 6, now = new Date()) {
  const months = Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - count + 1 + index, 1)
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleDateString('tr-TR', { month: 'short' }),
      fullLabel: date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }),
      posts: 0,
      projects: 0
    }
  })
  for (const [items, field] of [[posts, 'posts'], [projects, 'projects']]) {
    for (const item of items) {
      const time = timestamp(item)
      if (!time || time > now.getTime()) continue
      const date = new Date(time)
      const month = months.find(entry => entry.key === `${date.getFullYear()}-${date.getMonth()}`)
      if (month) month[field] += 1
    }
  }
  return months
}

export function profileChecklist(profile) {
  return [
    { label: 'Ad ve soyad', done: !!profile.name?.trim() },
    { label: 'Mesleki ünvan', done: !!profile.title?.trim() },
    { label: 'Biyografi', done: !!profile.bio?.trim() },
    { label: 'Profil fotoğrafı', done: !!profile.image_url },
    { label: 'E-posta adresi', done: !!profile.email?.trim() },
    { label: 'Konum', done: !!profile.location?.trim() },
    { label: 'Sosyal bağlantılar', done: !!(profile.social?.github || profile.social?.linkedin || profile.social?.website) },
    { label: 'Yetenekler', done: !!profile.skills?.length, to: '/admin/skills' }
  ]
}

export function projectCompleteness(project) {
  const fields = [project.title?.trim(), project.description?.trim(), project.image, project.tags?.length, project.github || project.demo]
  return Math.round(fields.filter(Boolean).length / fields.length * 100)
}
