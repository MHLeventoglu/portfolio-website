import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ExternalLink, Github, ArrowLeft, Search } from 'lucide-react'
import { useData } from '../context/DataContext'
import Footer from '../components/common/Footer'
import './ProjectsPage.css'

export default function ProjectsPage() {
  const { projects } = useData()
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const categories = ['all', ...new Set(projects.map(p => p.category))]
  
  const filteredProjects = projects.filter(project => {
    const matchesCategory = activeCategory === 'all' || project.category === activeCategory
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  return (
    <>
      <main className="projects-page">
        <div className="page-header">
          <Link to="/" className="back-link">
            <ArrowLeft size={20} />
            Ana Sayfa
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Tüm <span className="gradient-text">Projeler</span>
          </motion.h1>
          <p>Yapay zeka, robotik ve web geliştirme projelerim</p>
        </div>

        <div className="page-filters">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Proje ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
            />
          </div>
          
          <div className="category-filters">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === 'all' ? 'Tümü' : cat}
              </button>
            ))}
          </div>
        </div>

        <motion.div 
          className="projects-grid-full"
          layout
        >
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              className={`project-card-full glass-card ${project.featured ? 'featured' : ''}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              layout
              whileHover={{ y: -5 }}
            >
              {project.image && (
                <div className="project-image">
                  <img src={project.image} alt={project.title} />
                  {project.featured && <span className="featured-badge">⭐ Öne Çıkan</span>}
                </div>
              )}
              <div className="project-content">
                <div className="project-header">
                  <h3>{project.title}</h3>
                  <span className="project-category">{project.category}</span>
                </div>
                <p>{project.description}</p>
                <div className="project-tags">
                  {project.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
                <div className="project-links">
                  {project.github && (
                    <a href={project.github} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                      <Github size={16} />
                      Kodu Gör
                    </a>
                  )}
                  {project.demo && (
                    <a href={project.demo} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                      <ExternalLink size={16} />
                      Canlı Demo
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredProjects.length === 0 && (
          <div className="no-results">
            <p>Sonuç bulunamadı</p>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
