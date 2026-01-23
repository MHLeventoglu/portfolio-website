import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, X, Loader } from 'lucide-react'
import { useData } from '../../context/DataContext'
import './SkillsManager.css'

const emptySkill = {
  name: '',
  category: 'Programlama',
  level: 80
}

const categories = ['Programlama', 'Yapay Zeka', 'Web', 'Robotik', 'Araçlar']

export default function SkillsManager() {
  const { profile, addSkill, updateSkill, deleteSkill } = useData()
  const [editingSkill, setEditingSkill] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState(emptySkill)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [filterCategory, setFilterCategory] = useState('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ 
      ...formData, 
      [name]: name === 'level' ? parseInt(value) : value 
    })
  }

  const handleEdit = (skill) => {
    setEditingSkill(skill.id || skill.name)
    setFormData(skill)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      if (editingSkill) {
        await updateSkill(editingSkill, formData)
      } else {
        await addSkill(formData)
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
      await deleteSkill(id)
      setDeleteConfirm(null)
    } catch (err) {
      setError(err.message || 'Silme işlemi başarısız')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData(emptySkill)
    setEditingSkill(null)
    setShowForm(false)
  }

  const filteredSkills = filterCategory === 'all' 
    ? profile.skills 
    : profile.skills.filter(s => s.category === filterCategory)

  const groupedSkills = categories.reduce((acc, cat) => {
    acc[cat] = filteredSkills.filter(s => s.category === cat)
    return acc
  }, {})

  return (
    <div className="skills-manager">
      <header className="manager-header">
        <div>
          <h1>Yetenekler Yöneticisi</h1>
          <p>Portfolyonuzdaki yeteneklerinizi yönetin</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
        >
          <Plus size={18} />
          Yetenek Ekle
        </button>
      </header>

      {/* Filter */}
      <div className="skills-filter">
        <button 
          className={`filter-btn ${filterCategory === 'all' ? 'active' : ''}`}
          onClick={() => setFilterCategory('all')}
        >
          Tümü ({profile.skills.length})
        </button>
        {categories.map(cat => {
          const count = profile.skills.filter(s => s.category === cat).length
          return (
            <button 
              key={cat}
              className={`filter-btn ${filterCategory === cat ? 'active' : ''}`}
              onClick={() => setFilterCategory(cat)}
            >
              {cat} ({count})
            </button>
          )
        })}
      </div>

      {/* Skill Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="skill-form-container glass-card"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="form-header">
              <h2>{editingSkill ? 'Yetenek Düzenle' : 'Yeni Yetenek'}</h2>
              <button className="close-btn" onClick={resetForm}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="skill-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Yetenek Adı *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="input-field"
                    placeholder="örn. Python, React, ROS2..."
                    value={formData.name}
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

              <div className="form-group">
                <label htmlFor="level">Seviye: {formData.level}%</label>
                <input
                  type="range"
                  id="level"
                  name="level"
                  min="10"
                  max="100"
                  step="5"
                  value={formData.level}
                  onChange={handleChange}
                  className="range-input"
                />
                <div className="level-preview">
                  <div 
                    className="level-bar" 
                    style={{ width: `${formData.level}%` }}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  İptal
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <Loader size={18} className="spin" /> : null}
                  {editingSkill ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skills List */}
      <div className="skills-list">
        {Object.entries(groupedSkills).map(([category, skills]) => {
          if (skills.length === 0) return null
          return (
            <div key={category} className="skills-category-group">
              <h3 className="category-title">{category}</h3>
              <div className="skills-grid">
                {skills.map((skill) => (
                  <motion.div
                    key={skill.id || skill.name}
                    className="skill-item glass-card"
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="skill-info">
                      <span className="skill-name">{skill.name}</span>
                      <span className="skill-level">{skill.level}%</span>
                    </div>
                    <div className="skill-bar-container">
                      <div 
                        className="skill-bar" 
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                    <div className="skill-actions">
                      <button 
                        className="action-btn edit" 
                        onClick={() => handleEdit(skill)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        className="action-btn delete" 
                        onClick={() => setDeleteConfirm(skill.id || skill.name)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {profile.skills.length === 0 && (
        <div className="empty-state glass-card">
          <p>Henüz yetenek eklenmemiş. İlk yeteneğinizi ekleyin!</p>
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
            <h3>Yetenek Silinsin mi?</h3>
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
