import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const LanguageContext = createContext()

const translations = {
  tr: {
    nav: { home: 'Ana Sayfa', about: 'Hakkımda', skills: 'Yetenekler', projects: 'Projeler', blog: 'Blog', contact: 'İletişim', cta: 'İletişim', menu: 'Menü', tagline: 'Digital by design', langLabel: 'Dil', admin: 'Admin', finance: 'Finans', workspace: 'Çalışma alanları' },
    hero: { eyebrow: 'Bilgisayar Mühendisi', status: 'Fırsatlara açık', cta: 'Projelerimi Gör', scroll: 'Kaydır', avail: 'açık', gpa: 'GPA', ai: 'AI Proje', exp: 'Deneyim' },
    about: { eyebrow: 'Hakkımda', title: 'Yapay zeka, havacılık ve otomasyon', exp: 'Deneyim', university: 'Üniversite', degree: 'Bölüm', grad: 'Mezuniyet', gpa: 'GPA', location: 'Konum' },
    skills: { eyebrow: 'Yetenekler', title: 'Fikirleri hayata döndüren teknolojiler.' },
    projects: { eyebrow: 'Seçili İşler', title: 'Öne çıkan projeler.', viewAll: 'Tüm projeleri gör', featured: 'Öne çıkan' },
    blog: { eyebrow: 'Günlük', title: 'Son yazılar.', viewAll: 'Tüm yazıları gör' },
    contact: { eyebrow: 'İletişim', line1: 'Benimle çalışmak', line2: 'ister misiniz?', cta: 'İletişime Geç' },
    footer: { menu: 'Menü', links: 'Bağlantılar', rights: 'Tüm hakları saklıdır', top: 'Başa dön', email: 'E-posta', role: 'Bilgisayar Mühendisi' },
    projectsPage: { eyebrow: 'Portföy', title: 'Projeler', sub: 'Yapay zeka, robotik ve web geliştirme çalışmaları.', search: 'Proje ara...', all: 'Tümü', none: 'Sonuç bulunamadı' },
    blogPage: { eyebrow: 'Günlük', title: 'Blog', sub: 'Yapay zeka, robotik ve yazılım mühendisliği üzerine notlar.', none: 'Henüz blog yazısı yok', read: 'dk' },
    post: { back: 'Bloga Dön', read: 'dk okuma', shareText: 'Bu yazıyı beğendiniz mi? Başkalarıyla paylaşın!', shareTw: 'Twitter’da Paylaş', shareLi: 'LinkedIn’de Paylaş', nfTitle: 'Yazı Bulunamadı', nfText: 'Aradığınız blog yazısı mevcut değil.', nfBack: 'Ana Sayfaya Dön' },
    common: { back: 'Ana Sayfa' },
  },
  en: {
    nav: { home: 'Home', about: 'About', skills: 'Skills', projects: 'Projects', blog: 'Blog', contact: 'Contact', cta: 'Contact', menu: 'Menu', tagline: 'Digital by design', langLabel: 'Language', admin: 'Admin', finance: 'Finance', workspace: 'Workspace' },
    hero: { eyebrow: 'Computer Engineer', status: 'Open to opportunities', cta: 'View My Work', scroll: 'Scroll', avail: 'open', gpa: 'GPA', ai: 'AI Projects', exp: 'Experience' },
    about: { eyebrow: 'About', title: 'AI, Aviation & Automation.', exp: 'Experience', university: 'University', degree: 'Field', grad: 'Graduation', gpa: 'GPA', location: 'Location' },
    skills: { eyebrow: 'Skills', title: 'Technologies that brings ideas into life.' },
    projects: { eyebrow: 'Selected Work', title: 'Featured projects.', viewAll: 'View all projects', featured: 'Featured' },
    blog: { eyebrow: 'Journal', title: 'Latest writing.', viewAll: 'View all posts' },
    contact: { eyebrow: 'Contact', line1: 'Let’s build', line2: 'something together.', cta: 'Get in touch' },
    footer: { menu: 'Menu', links: 'Links', rights: 'All rights reserved', top: 'Back to top', email: 'Email', role: 'Computer Engineer' },
    projectsPage: { eyebrow: 'Portfolio', title: 'Projects', sub: 'Work across AI, robotics and web development.', search: 'Search projects...', all: 'All', none: 'No results found' },
    blogPage: { eyebrow: 'Journal', title: 'Blog', sub: 'Notes on AI, robotics and software engineering.', none: 'No posts yet', read: 'min' },
    post: { back: 'Back to Blog', read: 'min read', shareText: 'Enjoyed this post? Share it with others!', shareTw: 'Share on Twitter', shareLi: 'Share on LinkedIn', nfTitle: 'Post Not Found', nfText: 'The post you are looking for does not exist.', nfBack: 'Back to Home' },
    common: { back: 'Home' },
  },
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('portfolio_lang') || 'tr')

  useEffect(() => {
    localStorage.setItem('portfolio_lang', lang)
    document.documentElement.lang = lang
  }, [lang])

  const t = useCallback((path) => {
    const parts = path.split('.')
    let node = translations[lang]
    for (const p of parts) {
      node = node?.[p]
      if (node === undefined) break
    }
    if (node === undefined) {
      // fallback to Turkish, then the key itself
      let fb = translations.tr
      for (const p of parts) fb = fb?.[p]
      return fb ?? path
    }
    return node
  }, [lang])

  const toggle = useCallback(() => setLang((l) => (l === 'tr' ? 'en' : 'tr')), [])

  const value = { lang, setLang, toggle, t, locale: lang === 'tr' ? 'tr-TR' : 'en-US' }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used within a LanguageProvider')
  return ctx
}
