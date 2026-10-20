import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, ArrowRight, Eye, EyeOff, AlertCircle, Mail, ShieldCheck, Info, Command, ArrowUpRight } from 'lucide-react'
import { useData } from '../../context/DataContext'
import AdminThemeToggle from '../../components/admin/AdminThemeToggle'
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
        const success = await login(email, password)
        
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
    <div className="login-page admin-theme">
      <div className="admin-ambient" aria-hidden="true"><span /><span /></div>
      <header className="login-topbar">
        <Link to="/" className="login-brand"><Command size={22} /><span>MHL <strong>STUDIO</strong></span></Link>
        <div className="login-topbar-actions"><AdminThemeToggle /><Link to="/">Portfolyoya dön <ArrowUpRight size={14} /></Link></div>
      </header>
      <div className="login-layout">
      <section className="login-story">
        <span className="login-story-label">SİZİN HİKÂYENİZ. SİZİN ALANINIZ.</span>
        <h2>Fikirlerini büyüt.<br /><span>İzini bırak.</span></h2>
        <p>Projelerin, deneyimlerin ve paylaşmaya değer<br />hikâyelerin için tek bir çalışma alanı.</p>
        <div className="login-planet" aria-hidden="true"><span /><i /><i /><b /></div>
        <span className="login-story-footer"><span />Üretmek için tasarlandı.</span>
      </section>
      <div className="login-form-area">
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
          <span className="login-welcome">ÇALIŞMA ALANINIZA HOŞ GELDİNİZ</span>
          <h1>Tekrar merhaba<span>.</span></h1>
          <p>Portfolyonuzu yönetmek için giriş yapın.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <motion.div
              className="login-error"
              role="alert"
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
                  autoComplete="username"
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
                autoComplete="current-password"
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
                Çalışma alanına gir
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="login-hint">
          {useSupabase ? (
            <p><ShieldCheck size={15} /> Supabase kimlik doğrulama aktif</p>
          ) : (
            <p><Info size={15} /> İpucu: Varsayılan şifre <code>admin123</code></p>
          )}
        </div>
      </motion.div>
      <p className="login-copyright">© {new Date().getFullYear()} MHL Studio · Portfolyo yönetim alanı</p>
      </div>
      </div>
    </div>
  )
}
