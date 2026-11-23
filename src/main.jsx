import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import PWAProvider from './components/pwa/PWAProvider'
import PWALayer from './components/pwa/PWALayer'
import { DataProvider } from './context/DataContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { applyAppAppearance, readSavedTheme } from './lib/appAppearance'
import './index.css'
import './styles/surfaces.css'
import './styles/Portfolio.css'
import './components/admin/AdminTheme.css'

applyAppAppearance(readSavedTheme(), window.location.pathname)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <ThemeProvider>
          <PWAProvider>
            <DataProvider>
              <App />
            </DataProvider>
            <PWALayer />
          </PWAProvider>
        </ThemeProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
)

