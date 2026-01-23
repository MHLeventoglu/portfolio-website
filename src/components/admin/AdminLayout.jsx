import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, FileText, FolderKanban, Wrench, User, LogOut, Home } from 'lucide-react'
import { useData } from '../../context/DataContext'
import './AdminLayout.css'

const sidebarLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/profile', icon: User, label: 'Profil' },
  { to: '/admin/blog', icon: FileText, label: 'Blog Yazıları' },
  { to: '/admin/projects', icon: FolderKanban, label: 'Projeler' },
  { to: '/admin/skills', icon: Wrench, label: 'Yetenekler' },
]

export default function AdminLayout() {
  const { logout, profile } = useData()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar glass-card">
        <div className="sidebar-header">
          <div className="admin-avatar">
            <span>👨‍💻</span>
          </div>
          <div className="admin-info">
            <h3>{profile.name}</h3>
            <span>Admin Panel</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <link.icon size={20} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/" className="sidebar-link">
            <Home size={20} />
            View Site
          </NavLink>
          <button className="sidebar-link logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="admin-content"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  )
}
