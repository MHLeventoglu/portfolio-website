import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Home from './pages/Home'
import BlogPost from './pages/BlogPost'
import ProjectsPage from './pages/ProjectsPage'
import BlogPage from './pages/BlogPage'
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import AdminBlogEditor from './pages/admin/BlogEditor'
import AdminBlogManager from './pages/admin/BlogManager'
import AdminProjects from './pages/admin/ProjectsManager'
import AdminSkills from './pages/admin/SkillsManager'
import AdminExperiences from './pages/admin/ExperienceManager'
import AdminProfile from './pages/admin/ProfileManager'
import AdminLayout from './components/admin/AdminLayout'
import ProtectedRoute from './components/admin/ProtectedRoute'
import PortfolioLayout from './components/common/PortfolioLayout'

const Finance = lazy(() => import('./pages/finance/Finance'))

function App() {
  return (
    <>
      <AnimatePresence mode="wait">
        <Routes>
        {/* Public Routes */}
        <Route element={<PortfolioLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
        </Route>
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/finance" element={<ProtectedRoute><Suspense fallback={<div className="admin-theme" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }} role="status">Finans yükleniyor…</div>}><Finance /></Suspense></ProtectedRoute>} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="blog" element={<AdminBlogManager />} />
          <Route path="blog/new" element={<AdminBlogEditor key="new-post" />} />
          <Route path="blog/:id" element={<AdminBlogEditor key="edit-post" />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="skills" element={<AdminSkills />} />
          <Route path="experiences" element={<AdminExperiences />} />
        </Route>
        </Routes>
      </AnimatePresence>
    </>
  )
}

export default App
