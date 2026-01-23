import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, Github, ArrowRight } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { ProjectCardSkeleton, EmptyState } from '../ui/Skeleton'
import './Projects.css'

export default function Projects() {
  const { projects, projectsLoading } = useData()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  // Show only featured projects on homepage
  const featuredProjects = projects.filter(p => p.featured).slice(0, 3)

  return (
    <section id="projects" className="section projects" ref={ref}>
      <motion.div
        className="section-title"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <h2>Öne Çıkan <span className="gradient-text">Projeler</span></h2>
        <p>Yapay zeka ve yazılım geliştirme alanındaki çalışmalarım</p>
      </motion.div>

      <motion.div className="projects-grid" layout>
        {projectsLoading || featuredProjects.length === 0 ? (
          // Show skeleton loading when loading or no data
          [...Array(3)].map((_, index) => (
            <ProjectCardSkeleton key={index} />
          ))
        ) : (
          // Show actual projects
          featuredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              className="project-card glass-card featured"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
              layout
              whileHover={{ y: -8 }}
            >
              <div className="project-image">
                <img src={project.image} alt={project.title} />
                <span className="featured-badge">⭐ Öne Çıkan</span>
              </div>
              <div className="project-content">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="project-tags">
                  {project.tags.slice(0, 4).map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
                <div className="project-links">
                  {project.github && (
                    <a href={project.github} target="_blank" rel="noopener noreferrer" className="project-link">
                      <Github size={18} />
                      <span>Kod</span>
                    </a>
                  )}
                  {project.demo && (
                    <a href={project.demo} target="_blank" rel="noopener noreferrer" className="project-link primary">
                      <ExternalLink size={18} />
                      <span>Demo</span>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* View All Button */}
      <motion.div
        className="section-footer"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.5 }}
      >
        <Link to="/projects" className="btn btn-secondary">
          Tüm Projeleri Gör
          <ArrowRight size={18} />
        </Link>
      </motion.div>
    </section>
  )
}
