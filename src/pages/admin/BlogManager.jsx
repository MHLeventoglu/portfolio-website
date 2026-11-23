import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, FileText, PenLine, Plus, Search, X } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { recentItems } from '../../lib/adminOverview'
import './BlogManager.css'

export default function BlogManager() {
  const { posts, postsLoading, useSupabase } = useData()
  const [query, setQuery] = useState('')
  const [tag, setTag] = useState('all')
  const tags = [...new Set(posts.flatMap(post => post.tags || []))]
  const filtered = recentItems(posts, posts.length).filter(post => {
    const matchesQuery = `${post.title} ${post.excerpt} ${(post.tags || []).join(' ')}`.toLocaleLowerCase('tr').includes(query.toLocaleLowerCase('tr'))
    return matchesQuery && (tag === 'all' || post.tags?.includes(tag))
  })
  const loading = useSupabase && postsLoading
  const formatDate = post => {
    const date = new Date(post.created_at || post.createdAt || '')
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
  }
  return (
    <div className="blog-manager">
      <header className="manager-header"><div><h1>Blog Yazıları</h1></div><Link to="/admin/blog/new" className="btn btn-primary"><Plus size={16} />Yazı ekle</Link></header>
      <section className="blog-library admin-panel">
        <div className="blog-library-toolbar">
          <div><h2>Yazılar <span>{posts.length}</span></h2></div>
          <div className="blog-library-filters"><div className="blog-library-search"><Search size={15} /><input aria-label="Blog yazılarında ara" placeholder="Yazı ara…" value={query} onChange={event => setQuery(event.target.value)} />{query && <button type="button" onClick={() => setQuery('')} aria-label="Aramayı temizle"><X size={14} /></button>}</div><select className="input-field" aria-label="Etikete göre filtrele" value={tag} onChange={event => setTag(event.target.value)}><option value="all">Tüm etiketler</option>{tags.map(value => <option key={value} value={value}>{value}</option>)}</select></div>
        </div>
        {filtered.length ? <div className="blog-library-table-scroll"><table className="blog-library-table"><thead><tr><th>YAZI</th><th>ETİKETLER</th><th>EKLENME TARİHİ</th><th>İŞLEMLER</th></tr></thead><tbody>{filtered.map(post => <tr key={post.id}><td><Link className="blog-library-post" to={`/admin/blog/${post.id}`}><span className="blog-library-cover">{post.cover_image ? <img src={post.cover_image} alt="" loading="lazy" /> : <FileText size={21} />}</span><span><strong>{post.title}</strong><small>{post.excerpt || 'Bu yazı için açıklama eklenmemiş.'}</small></span></Link></td><td><div className="blog-library-tags">{(post.tags || []).slice(0, 2).map(value => <span className="tag" key={value}>{value}</span>)}{post.tags?.length > 2 && <span className="blog-library-extra">+{post.tags.length - 2}</span>}</div></td><td><time>{formatDate(post)}</time></td><td><div className="blog-library-actions"><Link to={`/admin/blog/${post.id}`} className="admin-icon-button" aria-label={`${post.title} yazısını düzenle`} title="Yazıyı düzenle"><PenLine size={16} /></Link>{post.slug && <Link to={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="admin-icon-button" aria-label={`${post.title} yazısını sitede aç`} title="Sitede görüntüle"><ArrowUpRight size={17} /></Link>}</div></td></tr>)}</tbody></table></div> : <div className="blog-library-empty"><span><FileText size={29} /></span><h2>{loading ? 'Yazılar yükleniyor…' : posts.length ? 'Eşleşen yazı bulunamadı' : 'Henüz yazı yok'}</h2>{posts.length > 0 && <p>Başka bir kelime veya etiketle tekrar deneyin.</p>}{!loading && (posts.length ? <button className="btn btn-secondary" onClick={() => { setQuery(''); setTag('all') }}>Filtreleri temizle</button> : <Link to="/admin/blog/new" className="btn btn-primary"><Plus size={16} />Yazı ekle</Link>)}</div>}
        <div className="blog-library-footer" aria-live="polite"><span>{filtered.length} yazı gösteriliyor</span><span><PenLine size={12} />Markdown desteklenir.</span></div>
      </section>
    </div>
  )
}
