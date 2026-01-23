import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, ArrowRight, Eye, EyeOff, AlertCircle, Mail } from 'lucide-react'
import { useData } from '../../context/DataContext'
import './Login.css'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login, isAuthenticated, useSupabase } = useData()
  const navigate = useNavigate()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin')
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (useSupabase) {
        // Supabase email/password login
        await login(email, password)
        navigate('/admin')
      } else {
        // Fallback: simple password check
        await new Promise(resolve => setTimeout(resolve, 500))
        const success = login(email, password)
        
        if (success) {
          navigate('/admin')
        } else {
          setError('Geçersiz şifre. "admin123" deneyin.')
          setPassword('')
        }
      }
    } catch (err) {
      setError(err.message || 'Giriş başarısız. Lütfen tekrar deneyin.')
      setPassword('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      <motion.div
        className="login-card glass-card"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="login-header">
          <div className="login-icon">
            <Lock size={28} />
          </div>
          <h1>Admin Girişi</h1>
          <p>Yönetim paneline erişmek için giriş yapın</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <motion.div
              className="login-error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle size={18} />
              {error}
            </motion.div>
          )}

          {useSupabase && (
            <div className="form-group">
              <label htmlFor="email">E-posta</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  className="input-field with-icon"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Şifre</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="input-field"
                placeholder={useSupabase ? "Şifrenizi girin" : "Admin şifresi"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus={!useSupabase}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary login-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              <>
                Giriş Yap
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="login-hint">
          {useSupabase ? (
            <p>🔒 Supabase kimlik doğrulama aktif</p>
          ) : (
            <p>💡 İpucu: Varsayılan şifre <code>admin123</code></p>
          )}
        </div>
      </motion.div>

      {/* Background decoration */}
      <div className="login-bg-orb login-bg-orb-1"></div>
      <div className="login-bg-orb login-bg-orb-2"></div>
    </div>
  )
}
