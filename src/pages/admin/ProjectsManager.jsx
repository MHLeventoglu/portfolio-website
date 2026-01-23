import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, X, ExternalLink, Github, Star, Loader } from 'lucide-react'
import { useData } from '../../context/DataContext'
import './ProjectsManager.css'

const emptyProject = {
  title: '',
  description: '',
  image: '',
  category: 'AI/ML',
  tags: [],
  github: '',
  demo: '',
  featured: false
}

export default function ProjectsManager() {
  const { projects, addProject, updateProject, deleteProject } = useData()
  const [editingProject, setEditingProject] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState(emptyProject)
  const [tagInput, setTagInput] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const categories = ['AI/ML', 'Web', 'Mobile', 'IoT', 'Other']

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    })
  }

  const handleAddTag = (e) => {
    e.preventDefault()
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] })
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setFormData({ 
      ...formData, 
      tags: formData.tags.filter(tag => tag !== tagToRemove) 
    })
  }

  const handleEdit = (project) => {
    setEditingProject(project.id)
    setFormData(project)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      if (editingProject) {
        await updateProject(editingProject, formData)
      } else {
        await addProject(formData)
      }
      resetForm()
    } catch (err) {
      setError(err.message || 'İşlem başarısız oldu')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    setLoading(true)
    try {
      await deleteProject(id)
      setDeleteConfirm(null)
    } catch (err) {
      setError(err.message || 'Silme işlemi başarısız')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData(emptyProject)
    setEditingProject(null)
    setShowForm(false)
    setTagInput('')
  }

  return (
    <div className="projects-manager">
      <header className="manager-header">
        <div>
          <h1>Proje Yöneticisi</h1>
          <p>Portfolyonuzdaki projeleri yönetin</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
        >
          <Plus size={18} />
          Proje Ekle
        </button>
      </header>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')}><X size={16} /></button>
        </div>
      )}

      {/* Project Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="project-form-container glass-card"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="form-header">
              <h2>{editingProject ? 'Proje Düzenle' : 'Yeni Proje'}</h2>
              <button className="close-btn" onClick={resetForm}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="project-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="title">Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="input-field"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    className="input-field"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  className="input-field"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="image">Image URL</label>
                <input
                  type="url"
                  id="image"
                  name="image"
                  className="input-field"
                  placeholder="https://..."
                  value={formData.image}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="github">GitHub URL</label>
                  <input
                    type="url"
                    id="github"
                    name="github"
                    className="input-field"
                    placeholder="https://github.com/..."
                    value={formData.github}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="demo">Demo URL</label>
                  <input
                    type="url"
                    id="demo"
                    name="demo"
                    className="input-field"
                    placeholder="https://..."
                    value={formData.demo}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Tags</label>
                <div className="tags-input">
                  <div className="tags-list">
                    {formData.tags.map(tag => (
                      <span key={tag} className="tag editable-tag">
                        {tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="add-tag">
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Add tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
                    />
                    <button type="button" className="btn btn-secondary" onClick={handleAddTag}>
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                  />
                  <Star size={16} />
                  Featured Project
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  İptal
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <Loader size={18} className="spin" /> : null}
                  {editingProject ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Projects Grid */}
      <div className="projects-grid">
        {projects.map((project) => (
          <motion.div
            key={project.id}
            className="project-card glass-card"
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {project.image && (
              <div className="project-image">
                <img src={project.image} alt={project.title} />
                {project.featured && (
                  <span className="featured-badge">
                    <Star size={12} /> Featured
                  </span>
                )}
              </div>
            )}
            
            <div className="project-content">
              <div className="project-header">
                <h3>{project.title}</h3>
                <span className="project-category">{project.category}</span>
              </div>
              
              <p>{project.description}</p>
              
              <div className="project-tags">
                {project.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>

              <div className="project-links">
                {project.github && (
                  <a href={project.github} target="_blank" rel="noopener noreferrer">
                    <Github size={16} />
                  </a>
                )}
                {project.demo && (
                  <a href={project.demo} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
            </div>

            <div className="project-actions">
              <button className="action-btn edit" onClick={() => handleEdit(project)}>
                <Edit2 size={16} />
              </button>
              <button className="action-btn delete" onClick={() => setDeleteConfirm(project.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="empty-state glass-card">
          <p>No projects yet. Add your first project!</p>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <motion.div
            className="delete-modal glass-card"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Delete Project?</h3>
            <p>This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
