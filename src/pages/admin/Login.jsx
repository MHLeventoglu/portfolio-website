import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion as Motion, useReducedMotion } from 'framer-motion'
import { Lock, ArrowRight, Eye, EyeOff, AlertCircle, Mail, ShieldCheck, Info, ArrowUpRight } from 'lucide-react'
import { useData } from '../../context/DataContext'
import AdminThemeToggle from '../../components/admin/AdminThemeToggle'
import Logo from '../../components/common/Logo'
import AdminAtmosphere from '../../components/admin/AdminAtmosphere'
import './Login.css'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login, isAuthenticated, useSupabase } = useData()
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()

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
      <AdminAtmosphere />
      <header className="login-topbar">
        <Link to="/" className="login-brand"><Logo /></Link>
        <div className="login-topbar-actions"><AdminThemeToggle /><Link to="/">Portfolyoya dön <ArrowUpRight size={14} /></Link></div>
      </header>
      <div className="login-layout">
      <Motion.section
        className="login-form-area"
        aria-labelledby="login-title"
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.5 }}
      >
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <Lock size={28} />
          </div>
          <span className="login-welcome">ÇALIŞMA ALANINIZA HOŞ GELDİNİZ</span>
          <h1 id="login-title">Tekrar merhaba<span>.</span></h1>
          <p>Portfolyonuzu yönetmek için giriş yapın.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <Motion.div
              className="login-error"
              role="alert"
              initial={reduceMotion ? false : { opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle size={18} />
              {error}
            </Motion.div>
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
      </div>
      <p className="login-copyright">© {new Date().getFullYear()} MHL · Portfolyo yönetim alanı</p>
      </Motion.section>
      </div>
    </div>
  )
}
