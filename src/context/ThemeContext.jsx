import { createContext, useContext, useState, useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { applyAppAppearance, readSavedTheme } from '../lib/appAppearance'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readSavedTheme)
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    applyAppAppearance(theme, pathname)
    try { localStorage.setItem('portfolio_theme', theme) } catch { /* Theme still works when storage is unavailable. */ }
  }, [theme, pathname])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark'
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
