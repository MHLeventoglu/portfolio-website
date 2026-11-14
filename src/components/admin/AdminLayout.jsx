import { createElement, useEffect, useRef, useState } from 'react'
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileText, FolderKanban, Layers, User, LogOut, ArrowUpRight, Briefcase, Search, Menu, X, ChevronRight, Plus } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { MotionConfig } from 'framer-motion'
import AdminThemeToggle from './AdminThemeToggle'
import Logo from '../common/Logo'
import AdminAtmosphere from './AdminAtmosphere'
import './AdminLayout.css'

const navigation = [
  { title: 'ÇALIŞMA ALANI', links: [
    { to: '/admin', icon: LayoutDashboard, label: 'Genel bakış', end: true },
    { to: '/admin/projects', icon: FolderKanban, label: 'Projeler' },
    { to: '/admin/blog', icon: FileText, label: 'Blog yazıları' }
  ] },
  { title: 'PORTFOLYO', links: [
    { to: '/admin/skills', icon: Layers, label: 'Yetenekler' },
    { to: '/admin/experiences', icon: Briefcase, label: 'Deneyimler' }
  ] },
  { title: 'HESAP', links: [
    { to: '/admin/profile', icon: User, label: 'Profilim' }
  ] }
]
const links = navigation.flatMap(group => group.links)

export default function AdminLayout() {
  const { logout, profile, posts, projects, useSupabase } = useData()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const [loggingOut, setLoggingOut] = useState(false)
  const menuRef = useRef(null)
  const menuButtonRef = useRef(null)
  const current = links.find(link => link.end ? pathname === link.to : pathname.startsWith(link.to)) || links[0]
  const title = pathname === '/admin/blog/new' ? 'Yeni yazı' : pathname.startsWith('/admin/blog/') ? 'Yazıyı düzenle' : current.label
  const initials = profile.name?.split(' ').filter(Boolean).slice(0, 2).map(word => word[0]).join('') || 'M'
  const searchItems = [
    ...links.map(link => ({ ...link, detail: 'Yönetim sayfası' })),
    ...posts.map(post => ({ to: `/admin/blog/${post.id}`, label: post.title, detail: 'Blog yazısı', icon: FileText })),
    ...projects.map(project => ({ to: `/admin/projects?edit=${encodeURIComponent(project.id)}`, label: project.title, detail: 'Proje', icon: FolderKanban }))
  ]
  const results = query.trim() ? searchItems.filter(item => item.label.toLocaleLowerCase('tr').includes(query.trim().toLocaleLowerCase('tr'))).slice(0, 6) : []

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const menu = menuRef.current
    const trigger = menuButtonRef.current
    const focusable = () => [...menu.querySelectorAll('a, button:not(:disabled)')]
    focusable()[0]?.focus()
    const handleKey = event => {
      if (event.key === 'Escape') setMenuOpen(false)
      if (event.key !== 'Tab') return
      const elements = focusable()
      const first = elements[0]
      const last = elements[elements.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
    const handleResize = () => { if (window.innerWidth > 1100) setMenuOpen(false) }
    document.addEventListener('keydown', handleKey)
    window.addEventListener('resize', handleResize)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKey)
      window.removeEventListener('resize', handleResize)
      trigger?.focus()
    }
  }, [menuOpen])

  const handleLogout = async () => {
    setLoggingOut(true)
    setLogoutError('')
    try {
      await logout()
      navigate('/admin/login')
    } catch {
      setLogoutError('Çıkış yapılamadı. Lütfen tekrar deneyin.')
    } finally {
      setLoggingOut(false)
    }
  }
  const closeSearch = () => { setQuery(''); setSearchFocused(false); setMenuOpen(false) }

  return (
    <MotionConfig reducedMotion="user">
    <div className="admin-layout admin-theme">
      <AdminAtmosphere />
      <a className="admin-skip-link" href="#admin-content">İçeriğe geç</a>
      {menuOpen && <div className="admin-menu-backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true" />}
      <aside ref={menuRef} id="admin-navigation" className={`admin-sidebar ${menuOpen ? 'is-open' : ''}`} aria-label="Yönetim menüsü" role={menuOpen ? 'dialog' : undefined} aria-modal={menuOpen || undefined}>
        <div className="admin-brand-row">
          <Link to="/admin" className="admin-brand" onClick={() => setMenuOpen(false)}>
            <Logo />
          </Link>
          <button type="button" className="admin-menu-close admin-icon-button" onClick={() => setMenuOpen(false)} aria-label="Menüyü kapat"><X size={20} /></button>
        </div>
        <nav className="admin-sidebar-nav">
          {navigation.map(group => (
            <div className="admin-nav-group" key={group.title}>
              <p className="admin-nav-label">{group.title}</p>
              {group.links.map(({ icon: Icon, ...link }) => (
                <NavLink key={link.to} to={link.to} end={link.end} onClick={() => setMenuOpen(false)} className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                  <span className="admin-nav-icon">{createElement(Icon, { size: 17 })}</span>
                  <span>{link.label}</span>
                  {link.to === '/admin/projects' && <small>{projects.length}</small>}
                  {link.to === '/admin/blog' && <small>{posts.length}</small>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <a href="/" target="_blank" rel="noopener noreferrer" className="admin-site-link">Portfolyoyu görüntüle <ArrowUpRight size={16} /></a>
          <div className="admin-sidebar-account">
            <Link to="/admin/profile" className="admin-account-link" onClick={() => setMenuOpen(false)}>
              <span className="admin-user-avatar">{profile.image_url ? <img src={profile.image_url} alt="" /> : initials}</span>
              <span><strong>{profile.name || 'Yönetici'}</strong><small>Yönetici hesabı</small></span>
            </Link>
            <button className="admin-icon-button admin-logout" type="button" onClick={handleLogout} disabled={loggingOut} aria-label="Çıkış yap" title="Çıkış yap"><LogOut size={18} /></button>
          </div>
          {logoutError && <p className="admin-inline-error" role="alert">{logoutError}</p>}
        </div>
      </aside>
      <div className="admin-main" inert={menuOpen ? true : undefined}>
        <header className="admin-topbar">
          <div className="admin-page-location">
            <button ref={menuButtonRef} type="button" className="admin-icon-button admin-menu-toggle" onClick={() => setMenuOpen(true)} aria-label="Menüyü aç" aria-expanded={menuOpen} aria-controls="admin-navigation"><Menu size={21} /></button>
            <div>
              <nav className="admin-breadcrumb" aria-label="Sayfa yolu"><Link to="/admin">Yönetim</Link><ChevronRight size={11} /><span>{title}</span></nav>
              <p>{title}</p>
            </div>
          </div>
          <div className="admin-topbar-actions">
            <div className="admin-search" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setSearchFocused(false) }}>
              <Search size={16} aria-hidden="true" />
              <input aria-label="Yönetim panelinde ara" placeholder="Sayfa veya içerik ara…" value={query} onFocus={() => setSearchFocused(true)} onChange={event => setQuery(event.target.value)} onKeyDown={event => {
                if (event.key === 'Escape') closeSearch()
                if (event.key === 'Enter' && results[0]) { navigate(results[0].to); closeSearch() }
              }} />
              {query && <button type="button" onClick={closeSearch} aria-label="Aramayı temizle"><X size={14} /></button>}
              {searchFocused && query.trim() && (
                <div className="admin-search-results" role="region" aria-label="Arama sonuçları">
                  <p>ARAMA SONUÇLARI</p>
                  {results.length ? results.map(({ icon: Icon, ...result }) => (
                    <Link to={result.to} key={`${result.to}-${result.label}`} onClick={closeSearch}>{createElement(Icon, { size: 17 })}<span><strong>{result.label}</strong><small>{result.detail}</small></span><ChevronRight size={14} /></Link>
                  )) : <div className="admin-search-empty">Aramanızla eşleşen içerik yok.</div>}
                </div>
              )}
            </div>
            <Link to="/admin/blog/new" className="admin-create-button" aria-label="Yeni yazı oluştur"><Plus size={17} /><span>Yeni yazı</span></Link>
            <AdminThemeToggle />
            <Link to="/admin/profile" className="admin-user-avatar admin-topbar-avatar" aria-label="Profilimi düzenle">{profile.image_url ? <img src={profile.image_url} alt="" /> : initials}</Link>
          </div>
        </header>
        <main className="admin-content" id="admin-content" tabIndex={-1}><div className="admin-route" key={pathname}><Outlet /></div></main>
        <footer className="admin-footer">
          <p>© {new Date().getFullYear()} <strong>MHL</strong><span> · Portfolyo yönetim alanı</span></p>
          <span className={`admin-connection ${useSupabase ? 'connected' : ''}`}><i />{useSupabase ? 'Supabase bağlantısı etkin' : 'Yerel çalışma alanı'}</span>
        </footer>
      </div>
    </div>
    </MotionConfig>
  )
}
