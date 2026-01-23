import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, User, MapPin, GraduationCap, Mail, Phone, Globe, Github, Linkedin, CheckCircle } from 'lucide-react'
import { useData } from '../../context/DataContext'
import './ProfileManager.css'

export default function ProfileManager() {
  const { profile, setProfile, useSupabase } = useData()
  const [formData, setFormData] = useState({})
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setFormData({
      name: profile.name || '',
      title: profile.title || '',
      subtitle: profile.subtitle || '',
      bio: profile.bio || '',
      email: profile.email || '',
      phone: profile.phone || '',
      location: profile.location || '',
      university: profile.university || '',
      degree: profile.degree || '',
      gradYear: profile.gradYear || '',
      gpa: profile.gpa || '',
      github: profile.social?.github || '',
      linkedin: profile.social?.linkedin || '',
      website: profile.social?.website || ''
    })
  }, [profile])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setSaved(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const updatedProfile = {
        ...profile,
        name: formData.name,
        title: formData.title,
        subtitle: formData.subtitle,
        bio: formData.bio,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        university: formData.university,
        degree: formData.degree,
        gradYear: formData.gradYear,
        gpa: formData.gpa,
        social: {
          github: formData.github,
          linkedin: formData.linkedin,
          website: formData.website
        }
      }

      // If using Supabase, update the profile in database
      if (useSupabase) {
        const { supabase } = await import('../../lib/supabase')
        const { error } = await supabase
          .from('profile')
          .update({
            name: formData.name,
            title: formData.title,
            subtitle: formData.subtitle,
            bio: formData.bio,
            email: formData.email,
            phone: formData.phone,
            location: formData.location,
            university: formData.university,
            degree: formData.degree,
            grad_year: formData.gradYear,
            gpa: formData.gpa,
            github: formData.github,
            linkedin: formData.linkedin,
            website: formData.website
          })
          .eq('id', 1)
        
        if (error) throw error
      }

      setProfile(updatedProfile)
      setSaved(true)
      
      // Also save to localStorage as backup
      localStorage.setItem('portfolio_profile', JSON.stringify(updatedProfile))

      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Kaydetme başarısız: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="profile-manager">
      <header className="manager-header">
        <div>
          <h1>Profil Yönetimi</h1>
          <p>Kişisel bilgilerinizi düzenleyin</p>
        </div>
        <button 
          className={`btn ${saved ? 'btn-success' : 'btn-primary'}`}
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <span className="loading-spinner"></span>
          ) : saved ? (
            <>
              <CheckCircle size={18} />
              Kaydedildi
            </>
          ) : (
            <>
              <Save size={18} />
              Kaydet
            </>
          )}
        </button>
      </header>

      <form onSubmit={handleSubmit} className="profile-form">
        {/* Personal Info Section */}
        <motion.section 
          className="form-section glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="section-header">
            <User size={20} />
            <h2>Kişisel Bilgiler</h2>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">İsim</label>
              <input
                type="text"
                id="name"
                name="name"
                className="input-field"
                placeholder="Adınız Soyadınız"
                value={formData.name || ''}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="title">Ünvan</label>
              <input
                type="text"
                id="title"
                name="title"
                className="input-field"
                placeholder="örn. Yazılım Mühendisi"
                value={formData.title || ''}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="subtitle">Alt Başlık</label>
              <input
                type="text"
                id="subtitle"
                name="subtitle"
                className="input-field"
                placeholder="Kısa tanıtım cümlesi"
                value={formData.subtitle || ''}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="bio">Biyografi</label>
              <textarea
                id="bio"
                name="bio"
                className="input-field"
                placeholder="Kendinizi tanıtın..."
                rows="4"
                value={formData.bio || ''}
                onChange={handleChange}
              />
            </div>
          </div>
        </motion.section>

        {/* Contact Info Section */}
        <motion.section 
          className="form-section glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="section-header">
            <Mail size={20} />
            <h2>İletişim Bilgileri</h2>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="email">
                <Mail size={14} /> E-posta
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="input-field"
                placeholder="email@example.com"
                value={formData.email || ''}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">
                <Phone size={14} /> Telefon
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="input-field"
                placeholder="0555 555 55 55"
                value={formData.phone || ''}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">
                <MapPin size={14} /> Konum
              </label>
              <input
                type="text"
                id="location"
                name="location"
                className="input-field"
                placeholder="Şehir, Ülke"
                value={formData.location || ''}
                onChange={handleChange}
              />
            </div>
          </div>
        </motion.section>

        {/* Education Section */}
        <motion.section 
          className="form-section glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="section-header">
            <GraduationCap size={20} />
            <h2>Eğitim Bilgileri</h2>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="university">Üniversite</label>
              <input
                type="text"
                id="university"
                name="university"
                className="input-field"
                placeholder="Üniversite adı"
                value={formData.university || ''}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="degree">Bölüm / Derece</label>
              <input
                type="text"
                id="degree"
                name="degree"
                className="input-field"
                placeholder="örn. Bilgisayar Mühendisliği"
                value={formData.degree || ''}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="gradYear">Mezuniyet Yılı</label>
              <input
                type="text"
                id="gradYear"
                name="gradYear"
                className="input-field"
                placeholder="2027"
                value={formData.gradYear || ''}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="gpa">GPA</label>
              <input
                type="text"
                id="gpa"
                name="gpa"
                className="input-field"
                placeholder="3.51"
                value={formData.gpa || ''}
                onChange={handleChange}
              />
            </div>
          </div>
        </motion.section>

        {/* Social Links Section */}
        <motion.section 
          className="form-section glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="section-header">
            <Globe size={20} />
            <h2>Sosyal Medya</h2>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="github">
                <Github size={14} /> GitHub
              </label>
              <input
                type="url"
                id="github"
                name="github"
                className="input-field"
                placeholder="https://github.com/username"
                value={formData.github || ''}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="linkedin">
                <Linkedin size={14} /> LinkedIn
              </label>
              <input
                type="url"
                id="linkedin"
                name="linkedin"
                className="input-field"
                placeholder="https://linkedin.com/in/username"
                value={formData.linkedin || ''}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="website">
                <Globe size={14} /> Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                className="input-field"
                placeholder="https://yourwebsite.com"
                value={formData.website || ''}
                onChange={handleChange}
              />
            </div>
          </div>
        </motion.section>
      </form>
    </div>
  )
}
