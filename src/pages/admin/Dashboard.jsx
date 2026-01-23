import { motion } from 'framer-motion'
import { FileText, FolderKanban, Eye, TrendingUp, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import './Dashboard.css'

export default function AdminDashboard() {
  const { posts, projects, profile } = useData()

  const stats = [
    { 
      label: 'Blog Posts', 
      value: posts.length, 
      icon: FileText, 
      color: '#8b5cf6',
      link: '/admin/blog'
    },
    { 
      label: 'Projects', 
      value: projects.length, 
      icon: FolderKanban, 
      color: '#06b6d4',
      link: '/admin/projects'
    },
    { 
      label: 'Skills', 
      value: profile.skills.length, 
      icon: TrendingUp, 
      color: '#10b981',
      link: null
    },
  ]

  const recentPosts = posts.slice(0, 3)
  const recentProjects = projects.slice(0, 3)

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Welcome back, <span className="gradient-text">{profile.name.split(' ')[0]}</span>!</h1>
          <p>Here's what's happening with your portfolio</p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="stat-card glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
            {stat.link && (
              <Link to={stat.link} className="stat-link">
                <Eye size={18} />
              </Link>
            )}
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <section className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions">
          <Link to="/admin/blog" className="quick-action glass-card">
            <Plus size={20} />
            <span>New Blog Post</span>
          </Link>
          <Link to="/admin/projects" className="quick-action glass-card">
            <Plus size={20} />
            <span>New Project</span>
          </Link>
        </div>
      </section>

      {/* Recent Content */}
      <div className="dashboard-content">
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Recent Posts</h2>
            <Link to="/admin/blog" className="view-all">View All</Link>
          </div>
          <div className="items-list">
            {recentPosts.map((post) => (
              <Link to={`/admin/blog/${post.id}`} key={post.id} className="list-item glass-card">
                <div className="item-info">
                  <h4>{post.title}</h4>
                  <span className="item-date">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="item-tags">
                  {post.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <h2>Recent Projects</h2>
            <Link to="/admin/projects" className="view-all">View All</Link>
          </div>
          <div className="items-list">
            {recentProjects.map((project) => (
              <div key={project.id} className="list-item glass-card">
                <div className="item-info">
                  <h4>{project.title}</h4>
                  <span className="item-category">{project.category}</span>
                </div>
                {project.featured && <span className="featured-tag">⭐ Featured</span>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
