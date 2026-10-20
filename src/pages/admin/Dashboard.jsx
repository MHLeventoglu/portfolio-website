import { createElement, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDownLeft, ArrowRight, ArrowUpRight, Briefcase, Check, CheckCircle2, ChevronRight, FileText, FolderKanban, Layers, Plus, Sparkles, Star, UserRound, CalendarDays, PenLine } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { profileChecklist, projectCompleteness, publicationSeries, recentItems } from '../../lib/adminOverview'
import './Dashboard.css'

function PublicationChart({ series }) {
  const id = useId().replace(/:/g, '')
  const [activeIndex, setActiveIndex] = useState(null)
  const width = 680
  const height = 210
  const base = height - 22
  const max = Math.max(4, ...series.flatMap(month => [month.posts, month.projects]))
  const ceiling = Math.ceil(max / 4) * 4
  const active = activeIndex === null ? null : series[activeIndex]
  const position = index => 38 + index * (width - 54) / (series.length - 1)
  const points = field => series.map((month, index) => [position(index), base - month[field] / ceiling * (base - 20)])
  const path = entries => entries.reduce((line, [x, y], index) => {
    if (!index) return `M ${x} ${y}`
    const previous = entries[index - 1]
    const middle = (previous[0] + x) / 2
    return `${line} C ${middle} ${previous[1]}, ${middle} ${y}, ${x} ${y}`
  }, '')

  return (
    <div className="dash-chart">
      <div className="dash-chart-readout" role="status" aria-live="polite" aria-atomic="true">
        {active ? (
          <div key={active.key}>
            <strong>{active.fullLabel}</strong>
            <span><i />{active.posts} yazı</span>
            <span><i />{active.projects} proje</span>
          </div>
        ) : <p>Bir aya gelin veya seçerek ayrıntılarını görün.</p>}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={`${id}-title ${id}-desc`}>
        <title id={`${id}-title`}>Aylara göre eklenen blog yazıları ve projeler</title>
        <desc id={`${id}-desc`}>{series.map(month => `${month.fullLabel}: ${month.posts} yazı, ${month.projects} proje`).join('; ')}</desc>
        <defs>
          <linearGradient id={`${id}-fill`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3, 4].map(step => {
          const y = base - step / 4 * (base - 20)
          return (
            <g key={step}>
              <line x1="38" x2={width - 12} y1={y} y2={y} stroke="var(--line)" strokeDasharray="2 6" />
              <text x="21" y={y + 4} textAnchor="end" fill="var(--ink-2)" fontSize="10">{ceiling / 4 * step}</text>
            </g>
          )
        })}
        {active && <line x1={position(activeIndex)} x2={position(activeIndex)} y1="14" y2={base} stroke="var(--accent-deep)" strokeOpacity="0.3" strokeDasharray="3 5" />}
        <g className="dash-chart-series">
          <path d={`${path(points('posts'))} L ${width - 16} ${base} L 38 ${base} Z`} fill={`url(#${id}-fill)`} />
          {['projects', 'posts'].map(field => (
            <g key={field}>
              <path d={path(points(field))} fill="none" stroke={field === 'posts' ? 'var(--accent-deep)' : 'var(--ink-2)'} strokeWidth={field === 'posts' ? 3 : 2} strokeDasharray={field === 'projects' ? '4 5' : undefined} strokeLinecap="round" />
              {points(field).map(([x, y], index) => (
                <circle key={index} cx={x} cy={y} r={activeIndex === index ? 6 : 3.5} fill={field === 'posts' ? 'var(--accent-deep)' : 'var(--ink-2)'} stroke="var(--paper)" strokeWidth="2" className="dash-chart-point">
                  <title>{`${series[index].fullLabel}: ${series[index][field]} ${field === 'posts' ? 'yazı' : 'proje'}`}</title>
                </circle>
              ))}
            </g>
          ))}
        </g>
      </svg>
      <div className="dash-chart-labels" style={{ gridTemplateColumns: `repeat(${series.length}, 1fr)` }} role="group" aria-label="Aylık içerik ayrıntıları">
        {series.map((month, index) => (
          <button type="button" key={month.key} aria-pressed={activeIndex === index} aria-label={`${month.fullLabel}: ${month.posts} yazı, ${month.projects} proje`} onMouseEnter={() => setActiveIndex(index)} onFocus={() => setActiveIndex(index)} onClick={() => setActiveIndex(index)}>{month.label}</button>
        ))}
      </div>
    </div>
  )
}

const formatDate = value => {
  const date = new Date(value || '')
  return Number.isNaN(date.getTime()) ? 'Tarih belirtilmedi' : date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminDashboard() {
  const { posts, projects, profile, experiences, postsLoading, projectsLoading, skillsLoading, experiencesLoading, useSupabase } = useData()
  const [months, setMonths] = useState(6)
  const skills = profile.skills || []
  const series = publicationSeries(posts, projects, months)
  const currentMonth = series[series.length - 1]
  const checklist = profileChecklist(profile)
  const completed = checklist.filter(item => item.done).length
  const completion = Math.round(completed / checklist.length * 100)
  const missing = checklist.filter(item => !item.done)
  const featured = projects.filter(project => project.featured).length
  const recentPosts = recentItems(posts)
  const recentProjects = recentItems(projects)
  const categories = [...new Set(projects.map(project => project.category).filter(Boolean))]
  const periodTotal = series.reduce((sum, month) => sum + month.posts + month.projects, 0)
  const total = posts.length + projects.length
  const loading = useSupabase && (postsLoading || projectsLoading)
  const stats = [
    { label: 'Blog yazıları', value: posts.length, hint: `Bu ay ${currentMonth.posts} yeni yazı`, icon: FileText, color: 'teal', to: '/admin/blog', loading: useSupabase && postsLoading },
    { label: 'Projeler', value: projects.length, hint: `${featured} proje öne çıkarılıyor`, icon: FolderKanban, color: 'ink', to: '/admin/projects', loading: useSupabase && projectsLoading },
    { label: 'Yetenekler', value: skills.length, hint: 'Teknik yetenek koleksiyonu', icon: Layers, color: 'mint', to: '/admin/skills', loading: useSupabase && skillsLoading },
    { label: 'Deneyimler', value: experiences.length, hint: 'Kariyer ve eğitim yolculuğu', icon: Briefcase, color: 'neutral', to: '/admin/experiences', loading: useSupabase && experiencesLoading }
  ]

  return (
    <div className="dashboard">
      <div className="dash-heading">
        <div><span className="dash-eyebrow">ÇALIŞMA ALANINIZA HOŞ GELDİNİZ</span><h1>Portfolyonuza bir bakış<span>.</span></h1><p>Fikirlerinizi, projelerinizi ve hikâyelerinizi tek bir yerden yönetin.</p></div>
        <span className="dash-today"><CalendarDays size={15} />{new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
      </div>

      <section className="dash-stats" aria-label="Portfolyo istatistikleri">
        {stats.map(({ icon: Icon, ...stat }) => (
          <Link to={stat.to} className="dash-stat admin-panel" key={stat.label}>
            <div><p>{stat.label}</p><strong>{stat.loading ? '—' : stat.value}</strong><span>{stat.loading ? 'Yükleniyor…' : stat.hint}</span></div>
            <span className={`dash-stat-icon ${stat.color}`}>{createElement(Icon, { size: 21 })}</span><ArrowUpRight className="dash-stat-arrow" size={14} />
          </Link>
        ))}
      </section>

      <div className="dash-intro-grid">
        <section className="dash-welcome admin-panel">
          <div className="dash-orbit-art" aria-hidden="true"><i /><i /><i /><span /><b /><em /></div>
          <div className="dash-welcome-content"><span className="dash-welcome-label"><Sparkles size={13} /> ÜRETMEYE DEVAM</span><p>Tekrar merhaba,</p><h2>{profile.name?.split(' ')[0] || 'Yönetici'} <span>✦</span></h2><p>Bir sonraki harika fikriniz<br />burada hayat bulsun.</p><Link to="/admin/blog/new">Yeni bir hikâye yaz <ArrowRight size={16} /></Link></div>
        </section>

        <section className="dash-profile admin-panel">
          <div className="dash-card-title"><h2>Profil durumu</h2><UserRound size={16} /></div>
          <p className="dash-card-subtitle">İyi bir ilk izlenim için</p>
          <div className="dash-gauge" style={{ '--completion': `${completion}%` }} role="img" aria-label={`Profiliniz yüzde ${completion} tamamlandı`}><div><CheckCircle2 size={19} /><strong>%{completion}</strong><span>tamamlandı</span></div></div>
          <div className="dash-gauge-footer"><span>{completed} / {checklist.length} alan hazır</span><Link to="/admin/profile">Profili düzenle <ChevronRight size={13} /></Link></div>
        </section>

        <section className="dash-collection admin-panel">
          <div className="dash-card-title"><h2>İçerik koleksiyonu</h2><Layers size={16} /></div><p className="dash-card-subtitle">Biriken fikirler, büyüyen portfolyo</p>
          <div className="dash-collection-total"><strong>{total}</strong><span>toplam içerik</span><span className="dash-collection-icon"><FolderKanban size={29} strokeWidth={1.2} /></span></div>
          <div className="dash-collection-bar" aria-hidden="true"><span style={{ width: `${total ? posts.length / total * 100 : 0}%` }} /><i style={{ width: `${total ? projects.length / total * 100 : 0}%` }} /></div>
          <div className="dash-collection-legend"><span><i />Blog yazıları <strong>{posts.length}</strong></span><span><i />Projeler <strong>{projects.length}</strong></span></div>
          <div className="dash-collection-foot"><Star size={13} /><span>{featured} öne çıkan proje</span><span>{categories.length} kategori</span></div>
        </section>
      </div>

      <div className="dash-middle-grid">
        <section className="dash-publications admin-panel">
          <div className="dash-panel-heading"><div><h2>İçerik üretimi</h2><p>Son {months} ayda <strong>{periodTotal} içerik</strong> eklendi</p></div><div className="dash-period-toggle" role="group" aria-label="Grafik dönemi">{[6, 12].map(value => <button type="button" aria-pressed={months === value} className={months === value ? 'active' : ''} key={value} onClick={() => setMonths(value)}>{value} ay</button>)}</div></div>
          <div className="dash-chart-legend"><span><i />Blog yazıları</span><span><i />Projeler</span></div>
          <PublicationChart key={months} series={series} />
          {!periodTotal && <p className="dash-chart-empty">{loading ? 'İçerikler yükleniyor…' : 'Bu dönemde henüz içerik eklenmemiş. İlk içeriğinizle başlayın.'}</p>}
        </section>

        <section className="dash-shortcuts admin-panel">
          <div className="dash-panel-heading"><div><h2>Bir adım ileri</h2><p>Bugün ne üzerinde çalışıyoruz?</p></div><span className="dash-shortcut-heading-icon"><Sparkles size={18} /></span></div>
          <div className="dash-shortcut-list">
            <Link to="/admin/blog/new"><span className="dash-shortcut-icon teal"><PenLine size={19} /></span><span><strong>Yeni bir yazı paylaş</strong><small>Düşüncelerine bir alan aç.</small></span><Plus size={17} /></Link>
            <Link to="/admin/projects?new=1"><span className="dash-shortcut-icon ink"><FolderKanban size={19} /></span><span><strong>Bir proje ekle</strong><small>Ürettiklerin görünür olsun.</small></span><Plus size={17} /></Link>
            <Link to="/admin/profile"><span className="dash-shortcut-icon mint"><UserRound size={19} /></span><span><strong>Profilini güncelle</strong><small>Hikâyenin en güncel hâli.</small></span><ChevronRight size={17} /></Link>
          </div>
          <div className="dash-next-step">{missing.length ? <><span className="dash-next-dot" /><p>Sıradaki küçük adım: <Link to={missing[0].to || '/admin/profile'}>{missing[0].label.toLocaleLowerCase('tr')} ekleyin <ArrowUpRight size={12} /></Link></p></> : <><CheckCircle2 size={15} /><p>Profilinizin tüm temel alanları hazır.</p></>}</div>
        </section>
      </div>

      <div className="dash-bottom-grid">
        <section className="dash-projects admin-panel">
          <div className="dash-panel-heading"><div><h2>Son projeler</h2><p><Check size={13} />{projects.length} proje · fikirden gerçeğe</p></div><Link className="dash-see-all" to="/admin/projects">Tüm projeler <ArrowUpRight size={14} /></Link></div>
          {recentProjects.length ? <div className="dash-table-scroll"><table className="dash-project-table"><thead><tr><th>PROJE</th><th>KATEGORİ</th><th>İÇERİK TAMAMLIĞI</th><th><span className="admin-sr-only">Düzenle</span></th></tr></thead><tbody>{recentProjects.map(project => {
            const progress = projectCompleteness(project)
            return <tr key={project.id}><td><Link to={`/admin/projects?edit=${encodeURIComponent(project.id)}`} className="dash-project-name"><span className="dash-project-thumb">{project.image ? <img src={project.image} alt="" loading="lazy" /> : <FolderKanban size={17} />}</span><span><strong>{project.title}</strong><small>{project.featured ? <><Star size={10} /> Öne çıkan</> : `${project.tags?.length || 0} teknoloji`}</small></span></Link></td><td><span className="dash-category">{project.category || 'Diğer'}</span></td><td><div className={`dash-project-progress ${progress === 100 ? 'complete' : ''}`}><span>%{progress}</span><div><i style={{ width: `${progress}%` }} /></div></div></td><td><Link className="dash-table-action" to={`/admin/projects?edit=${encodeURIComponent(project.id)}`} aria-label={`${project.title} projesini düzenle`}><ArrowUpRight size={16} /></Link></td></tr>
          })}</tbody></table><p className="dash-table-note">Tamamlık: başlık, açıklama, görsel, etiketler ve proje bağlantısı.</p></div> : <div className="dash-empty"><FolderKanban size={27} /><h3>{loading ? 'Projeler yükleniyor…' : 'İlk projenizle başlayın'}</h3><p>Ürettiğiniz işleri portfolyonuzda bir araya getirin.</p><Link to="/admin/projects?new=1">Proje ekle <Plus size={14} /></Link></div>}
        </section>

        <section className="dash-recent-posts admin-panel">
          <div className="dash-panel-heading"><div><h2>Son yazılar</h2><p>Paylaştığınız son hikâyeler</p></div><Link className="dash-see-all" to="/admin/blog" aria-label="Tüm blog yazıları"><ArrowUpRight size={17} /></Link></div>
          {recentPosts.length ? <div className="dash-post-timeline">{recentPosts.map(post => <Link to={`/admin/blog/${post.id}`} key={post.id} className="dash-post-entry"><span className="dash-post-dot"><FileText size={13} /></span><div><h3>{post.title}</h3><p>{formatDate(post.created_at || post.createdAt)}</p>{post.tags?.[0] && <span>{post.tags[0]}</span>}</div><ArrowUpRight size={14} /></Link>)}</div> : <div className="dash-empty"><FileText size={27} /><h3>{loading ? 'Yazılar yükleniyor…' : 'Hikâyeniz burada başlasın'}</h3><p>Bir fikir, bir deneyim, yeni bir yazı.</p><Link to="/admin/blog/new">Yazı oluştur <ArrowRight size={14} /></Link></div>}
          <Link to="/admin/blog" className="dash-timeline-footer">Yazı alanına git <ArrowDownLeft size={14} /></Link>
        </section>
      </div>
    </div>
  )
}
