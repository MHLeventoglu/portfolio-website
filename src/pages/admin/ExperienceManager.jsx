import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, X, Loader, GraduationCap, Briefcase, Calendar } from 'lucide-react'
import { useData } from '../../context/DataContext'
import './ExperienceManager.css'

const emptyExperience = {
  title: '',
  subtitle: '',
  description: '',
  date_range: '',
  icon: 'briefcase',
  sort_order: 0
}

const iconOptions = [
  { value: 'briefcase', label: 'İş Deneyimi', Icon: Briefcase },
  { value: 'graduation', label: 'Eğitim', Icon: GraduationCap }
]

export default function ExperienceManager() {
  const { experiences, addExperience, updateExperience, deleteExperience } = useData()
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState(emptyExperience)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === 'sort_order' ? parseInt(value) || 0 : value
    })
  }

  const handleEdit = (exp) => {
    setEditingId(exp.id)
    setFormData({
      title: exp.title,
      subtitle: exp.subtitle,
      description: exp.description || '',
      date_range: exp.date_range,
      icon: exp.icon || 'briefcase',
      sort_order: exp.sort_order || 0
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (editingId) {
        await updateExperience(editingId, formData)
      } else {
        await addExperience(formData)
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
      await deleteExperience(id)
      setDeleteConfirm(null)
    } catch (err) {
      setError(err.message || 'Silme işlemi başarısız')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData(emptyExperience)
    setEditingId(null)
    setShowForm(false)
  }

  const getIconComponent = (iconName) => {
    const found = iconOptions.find(o => o.value === iconName)
    return found ? found.Icon : Briefcase
  }

  return (
    <div className="experience-manager">
      <header className="manager-header">
        <div>
          <h1>Deneyim Yöneticisi</h1>
          <p>Eğitim ve iş deneyimlerinizi yönetin</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
        >
          <Plus size={18} />
          Deneyim Ekle
        </button>
      </header>

      {error && (
        <div className="error-message glass-card">
          <span>{error}</span>
          <button onClick={() => setError('')}><X size={16} /></button>
        </div>
      )}

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="experience-form-container glass-card"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="form-header">
              <h2>{editingId ? 'Deneyim Düzenle' : 'Yeni Deneyim'}</h2>
              <button className="close-btn" onClick={resetForm}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="experience-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="title">Pozisyon / Başlık *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="input-field"
                    placeholder="örn. Robotik Stajyeri"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subtitle">Kurum / Şirket *</label>
                  <input
                    type="text"
                    id="subtitle"
                    name="subtitle"
                    className="input-field"
                    placeholder="örn. Utience Teknoloji AŞ"
                    value={formData.subtitle}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Açıklama</label>
                <textarea
                  id="description"
                  name="description"
                  className="input-field textarea-field"
                  placeholder="Bu pozisyonda yaptığınız çalışmalar..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="form-row form-row-3">
                <div className="form-group">
                  <label htmlFor="date_range">Tarih Aralığı *</label>
                  <input
                    type="text"
                    id="date_range"
                    name="date_range"
                    className="input-field"
                    placeholder="örn. Temmuz 2025 - Eylül 2025"
                    value={formData.date_range}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="icon">İkon Tipi</label>
                  <select
                    id="icon"
                    name="icon"
                    className="input-field"
                    value={formData.icon}
                    onChange={handleChange}
                  >
                    {iconOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="sort_order">Sıralama</label>
                  <input
                    type="number"
                    id="sort_order"
                    name="sort_order"
                    className="input-field"
                    placeholder="0"
                    value={formData.sort_order}
                    onChange={handleChange}
                    min={0}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  İptal
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <Loader size={18} className="spin" /> : null}
                  {editingId ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Experience List */}
      <div className="experience-list">
        {experiences.map((exp) => {
          const IconComp = getIconComponent(exp.icon)
          return (
            <motion.div
              key={exp.id}
              className="experience-item glass-card"
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="experience-icon-wrapper">
                <div className={`experience-icon ${exp.icon === 'graduation' ? 'edu' : 'work'}`}>
                  <IconComp size={22} />
                </div>
              </div>
              <div className="experience-info">
                <div className="experience-meta">
                  <span className="experience-date">
                    <Calendar size={14} />
                    {exp.date_range}
                  </span>
                  <span className="experience-order">#{exp.sort_order}</span>
                </div>
                <h3>{exp.title}</h3>
                <span className="experience-subtitle">{exp.subtitle}</span>
                {exp.description && <p className="experience-desc">{exp.description}</p>}
              </div>
              <div className="experience-actions">
                <button
                  className="action-btn edit"
                  onClick={() => handleEdit(exp)}
                  title="Düzenle"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  className="action-btn delete"
                  onClick={() => setDeleteConfirm(exp.id)}
                  title="Sil"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {experiences.length === 0 && (
        <div className="empty-state glass-card">
          <Briefcase size={40} />
          <p>Henüz deneyim eklenmemiş. İlk deneyiminizi ekleyin!</p>
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
            <h3>Deneyim Silinsin mi?</h3>
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
