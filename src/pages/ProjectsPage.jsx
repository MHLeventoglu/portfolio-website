import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ExternalLink, Github, ArrowLeft, Search } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useLang } from '../context/LanguageContext'
import { SkeletonBox } from '../components/ui/Skeleton'
import ProjectHoverList from '../components/ui/ProjectHoverList'
import './ProjectsPage.css'

export default function ProjectsPage() {
  const { projects, projectsLoading } = useData()
  const { t } = useLang()
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const categories = ['all', ...new Set(projects.map(p => p.category))]

  const filtered = projects.filter(project => {
    const matchesCategory = activeCategory === 'all' || project.category === activeCategory
    const q = searchQuery.toLowerCase()
    const matchesSearch = project.title.toLowerCase().includes(q) ||
      project.description.toLowerCase().includes(q) ||
      project.tags.some(tag => tag.toLowerCase().includes(q))
    return matchesCategory && matchesSearch
  })

  return (
    <>
      <main className="projects-page">
        <header className="page-head">
          <Link to="/" className="back-link"><ArrowLeft size={18} /> {t('common.back')}</Link>
          <span className="eyebrow">{t('projectsPage.eyebrow')}</span>
          <h1 className="page-title display">{t('projectsPage.title')}</h1>
          <p className="page-sub">{t('projectsPage.sub')}</p>
        </header>

        {!projectsLoading && (
          <div className="page-filters">
            <div className="filter-search">
              <Search size={18} />
              <input
                type="text"
                placeholder={t('projectsPage.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field"
                aria-label={t('projectsPage.search')}
              />
            </div>
            <div className="filter-cats">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat === 'all' ? t('projectsPage.all') : cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {projectsLoading ? (
          <div className="page-loading">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="loading-row">
                <SkeletonBox width="40px" height="18px" />
                <SkeletonBox width="50%" height="34px" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="no-results"><p>{t('projectsPage.none')}</p></div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <ProjectHoverList
              items={filtered}
              renderActions={(p) => (
                <>
                  {p.github && (
                    <a href={p.github} target="_blank" rel="noopener noreferrer" className="hover-action" aria-label="Kod">
                      <Github size={16} />
                    </a>
                  )}
                  {p.demo && (
                    <a href={p.demo} target="_blank" rel="noopener noreferrer" className="hover-action" aria-label="Demo">
                      <ExternalLink size={16} />
                    </a>
                  )}
                </>
              )}
            />
          </motion.div>
        )}
      </main>
    </>
  )
}
