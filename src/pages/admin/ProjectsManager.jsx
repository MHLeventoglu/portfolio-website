import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, X, ExternalLink, Github, Star, Loader } from 'lucide-react'
import { useData } from '../../context/DataContext'
import MarkdownEditor from '../../components/admin/MarkdownEditor'
import ProjectDescription from '../../components/ui/ProjectDescription'
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
  const [searchParams, setSearchParams] = useSearchParams()
  const [editingProject, setEditingProject] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState(emptyProject)
  const [tagInput, setTagInput] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [loading, setLoading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [error, setError] = useState('')

  const categories = ['AI/ML', 'Web', 'Mobile', 'IoT', 'Other']

  useEffect(() => {
    const requestedId = searchParams.get('edit')
    const project = projects.find(item => String(item.id) === requestedId)
    if (project) {
      setEditingProject(project.id)
      setFormData(project)
      setShowForm(true)
    } else if (searchParams.get('new') === '1') {
      setEditingProject(null)
      setFormData(emptyProject)
      setShowForm(true)
    } else {
      return
    }
    const next = new URLSearchParams(searchParams)
    next.delete('edit')
    next.delete('new')
    setSearchParams(next, { replace: true })
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [searchParams, projects, setSearchParams])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value 
    }))
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
    if (imageUploading) return
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
          disabled={loading || imageUploading}
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
              <button className="close-btn" onClick={resetForm} disabled={loading || imageUploading}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="project-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="title">Proje adı *</label>
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
                  <label htmlFor="category">Kategori</label>
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

              <MarkdownEditor
                key={editingProject || 'new'}
                id="description"
                name="description"
                label="Proje açıklaması (Markdown) *"
                rows={8}
                value={formData.description}
                onChange={description => setFormData(prev => ({ ...prev, description }))}
                uploadFolder="projects"
                onUploadingChange={setImageUploading}
                disabled={loading}
                required
              />

              <div className="form-group">
                <label htmlFor="image">Kapak görseli adresi</label>
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
                  <label htmlFor="github">GitHub bağlantısı</label>
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
                  <label htmlFor="demo">Demo bağlantısı</label>
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
                <label>Teknolojiler / etiketler</label>
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
                      placeholder="Etiket ekle…"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
                    />
                    <button type="button" className="btn btn-secondary" onClick={handleAddTag}>
                      Ekle
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
                  Ana sayfada öne çıkar
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm} disabled={loading || imageUploading}>
                  İptal
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading || imageUploading}>
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
                    <Star size={12} /> Öne çıkan
                  </span>
                )}
              </div>
            )}
            
            <div className="project-content">
              <div className="project-header">
                <h3>{project.title}</h3>
                <span className="project-category">{project.category}</span>
              </div>
              
              <ProjectDescription>{project.description}</ProjectDescription>
              
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
              <button className="action-btn edit" onClick={() => handleEdit(project)} disabled={loading || imageUploading}>
                <Edit2 size={16} />
              </button>
              <button className="action-btn delete" onClick={() => setDeleteConfirm(project.id)} disabled={loading || imageUploading}>
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="empty-state glass-card">
          <p>Henüz proje yok. İlk projenizi ekleyin.</p>
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
            <h3>Proje silinsin mi?</h3>
            <p>Bu işlem geri alınamaz.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>
                İptal
              </button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>
                Sil
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
