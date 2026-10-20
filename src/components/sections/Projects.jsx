import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ExternalLink, Github, ArrowUpRight } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useLang } from '../../context/LanguageContext'
import { SkeletonBox } from '../ui/Skeleton'
import SectionHeader from '../ui/SectionHeader'
import ProjectDescription from '../ui/ProjectDescription'
import './Projects.css'

export default function Projects() {
  const { projects, projectsLoading } = useData()
  const { t } = useLang()
  const featured = projects.filter(p => p.featured).slice(0, 3)

  return (
    <section id="projects" className="section projects">
      <SectionHeader index="03" label={t('projects.eyebrow')} title={t('projects.title')} />

      <div className="proj-blocks">
        {projectsLoading || featured.length === 0 ? (
          [...Array(2)].map((_, i) => (
            <div key={i} className="proj-block">
              <SkeletonBox width="100%" height="360px" borderRadius="10px" />
              <div className="proj-content">
                <SkeletonBox width="60%" height="34px" className="mb-md" />
                <SkeletonBox width="100%" height="16px" className="mb-sm" />
                <SkeletonBox width="80%" height="16px" />
              </div>
            </div>
          ))
        ) : (
          featured.map((project, i) => (
            <motion.article
              key={project.id}
              className={`proj-block ${i % 2 === 1 ? 'reverse' : ''}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="proj-media">
                <img src={project.image} alt={project.title} loading="lazy" />
                <span className="proj-tag-featured">{t('projects.featured')}</span>
              </div>
              <div className="proj-content">
                <span className="proj-index">{String(i + 1).padStart(2, '0')} — {project.category}</span>
                <h3 className="proj-title">{project.title}</h3>
                <ProjectDescription className="proj-desc">{project.description}</ProjectDescription>
                <div className="proj-tags">
                  {project.tags.slice(0, 5).map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
                <div className="proj-links">
                  {project.github && (
                    <a href={project.github} target="_blank" rel="noopener noreferrer" className="proj-link">
                      <Github size={16} /> Kod
                    </a>
                  )}
                  {project.demo && (
                    <a href={project.demo} target="_blank" rel="noopener noreferrer" className="proj-link">
                      <ExternalLink size={16} /> Demo
                    </a>
                  )}
                </div>
              </div>
            </motion.article>
          ))
        )}
      </div>

      <div className="proj-all">
        <div className="rule" />
        <Link to="/projects" className="proj-all-link">
          {t('projects.viewAll')} <ArrowUpRight size={22} />
        </Link>
      </div>
    </section>
  )
}
