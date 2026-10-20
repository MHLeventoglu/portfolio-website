import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function AdminThemeToggle() {
  const { isDark, toggleTheme } = useTheme()
  const label = isDark ? 'Aydınlık temaya geç' : 'Karanlık temaya geç'

  return (
    <button type="button" className="admin-icon-button admin-theme-toggle" onClick={toggleTheme} aria-label={label} title={label}>
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
