import { motion } from 'framer-motion'
import './Skeleton.css'

// Base skeleton box with shimmer animation
export function SkeletonBox({ width = '100%', height = '20px', borderRadius = '8px', className = '' }) {
  return (
    <div 
      className={`skeleton-box ${className}`}
      style={{ width, height, borderRadius }}
    />
  )
}

// Skill card skeleton
export function SkillCardSkeleton() {
  return (
    <div className="skill-card glass-card skeleton-card">
      <div className="skill-header">
        <SkeletonBox width="60%" height="18px" />
        <SkeletonBox width="24px" height="24px" borderRadius="50%" />
      </div>
      <div className="skill-bar-container">
        <SkeletonBox width="75%" height="8px" borderRadius="4px" />
      </div>
      <SkeletonBox width="40px" height="16px" />
    </div>
  )
}

// Project card skeleton (homepage)
export function ProjectCardSkeleton() {
  return (
    <motion.div 
      className="project-card glass-card featured skeleton-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="project-image skeleton-image">
        <SkeletonBox width="100%" height="200px" borderRadius="12px 12px 0 0" />
      </div>
      <div className="project-content">
        <SkeletonBox width="70%" height="24px" className="mb-sm" />
        <SkeletonBox width="100%" height="16px" className="mb-xs" />
        <SkeletonBox width="85%" height="16px" className="mb-md" />
        <div className="project-tags">
          <SkeletonBox width="60px" height="24px" borderRadius="12px" />
          <SkeletonBox width="50px" height="24px" borderRadius="12px" />
          <SkeletonBox width="70px" height="24px" borderRadius="12px" />
        </div>
        <div className="project-links" style={{ marginTop: '1rem' }}>
          <SkeletonBox width="80px" height="36px" borderRadius="8px" />
          <SkeletonBox width="80px" height="36px" borderRadius="8px" />
        </div>
      </div>
    </motion.div>
  )
}

// Blog card skeleton
export function BlogCardSkeleton() {
  return (
    <motion.article
      className="blog-card glass-card skeleton-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="blog-card-header">
        <SkeletonBox width="120px" height="16px" />
      </div>
      <SkeletonBox width="80%" height="24px" className="mb-sm" />
      <SkeletonBox width="100%" height="16px" className="mb-xs" />
      <SkeletonBox width="90%" height="16px" className="mb-md" />
      <div className="blog-card-footer">
        <div className="blog-tags">
          <SkeletonBox width="50px" height="20px" borderRadius="10px" />
          <SkeletonBox width="60px" height="20px" borderRadius="10px" />
        </div>
        <SkeletonBox width="100px" height="16px" />
      </div>
    </motion.article>
  )
}

// Timeline item skeleton
export function TimelineItemSkeleton({ index = 0 }) {
  return (
    <motion.div
      className="timeline-item glass-card skeleton-card"
      initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
    >
      <div className="timeline-icon">
        <SkeletonBox width="20px" height="20px" borderRadius="50%" />
      </div>
      <div className="timeline-content">
        <SkeletonBox width="140px" height="16px" className="mb-xs" />
        <SkeletonBox width="70%" height="20px" className="mb-xs" />
        <SkeletonBox width="50%" height="14px" className="mb-sm" />
        <SkeletonBox width="100%" height="14px" />
      </div>
    </motion.div>
  )
}

// ── Hero skeletons ──────────────────────────────────────────────────────────

export function HeroTextSkeleton() {
  return (
    <div className="hero-skeleton-text">
      <SkeletonBox width="140px" height="28px" borderRadius="20px" className="mb-md" />
      <SkeletonBox width="180px" height="28px" borderRadius="8px" className="mb-xs" />
      <SkeletonBox width="320px" height="56px" borderRadius="10px" className="mb-md" />
      <SkeletonBox width="90%" height="22px" borderRadius="8px" className="mb-xs" />
      <SkeletonBox width="70%" height="22px" borderRadius="8px" className="mb-md" />
      <div className="hero-skeleton-pills">
        <SkeletonBox width="140px" height="32px" borderRadius="20px" />
        <SkeletonBox width="100px" height="32px" borderRadius="20px" />
      </div>
      <div className="hero-skeleton-buttons">
        <SkeletonBox width="160px" height="48px" borderRadius="12px" />
        <SkeletonBox width="160px" height="48px" borderRadius="12px" />
      </div>
      <div className="hero-skeleton-socials">
        <SkeletonBox width="44px" height="44px" borderRadius="50%" />
        <SkeletonBox width="44px" height="44px" borderRadius="50%" />
        <SkeletonBox width="44px" height="44px" borderRadius="50%" />
      </div>
    </div>
  )
}

export function HeroImageSkeleton() {
  return (
    <div className="hero-image-skeleton">
      <SkeletonBox width="300px" height="300px" borderRadius="50%" />
    </div>
  )
}

// ── About skeletons ─────────────────────────────────────────────────────────

export function ProfileInfoCardSkeleton() {
  return (
    <div className="info-card glass-card skeleton-card" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <SkeletonBox width="18px" height="18px" borderRadius="4px" />
      <SkeletonBox width="140px" height="16px" borderRadius="6px" />
    </div>
  )
}

export function AboutDetailSkeleton() {
  return (
    <div className="detail-item">
      <SkeletonBox width="60px" height="14px" borderRadius="4px" />
      <SkeletonBox width="120px" height="16px" borderRadius="6px" />
    </div>
  )
}

// ── Contact skeletons ───────────────────────────────────────────────────────

export function ContactInfoSkeleton() {
  return (
    <div className="info-item glass-card skeleton-card">
      <div className="info-icon">
        <SkeletonBox width="24px" height="24px" borderRadius="50%" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <SkeletonBox width="60px" height="16px" borderRadius="6px" />
        <SkeletonBox width="160px" height="16px" borderRadius="6px" />
      </div>
    </div>
  )
}

export function SocialIconSkeleton() {
  return <SkeletonBox width="44px" height="44px" borderRadius="12px" />
}

// ── Footer skeletons ────────────────────────────────────────────────────────

export function FooterBrandSkeleton() {
  return (
    <div className="footer-brand" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <SkeletonBox width="200px" height="24px" borderRadius="8px" />
      <SkeletonBox width="260px" height="16px" borderRadius="6px" />
    </div>
  )
}

// ── Admin skeletons ─────────────────────────────────────────────────────────

export function AdminNameSkeleton() {
  return (
    <div className="admin-info" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <SkeletonBox width="140px" height="18px" borderRadius="6px" />
      <SkeletonBox width="80px" height="14px" borderRadius="4px" />
    </div>
  )
}

export function DashboardWelcomeSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <SkeletonBox width="280px" height="32px" borderRadius="8px" />
      <SkeletonBox width="220px" height="18px" borderRadius="6px" />
    </div>
  )
}

// ── BlogPage full-width skeleton ─────────────────────────────────────────────

export function BlogListItemSkeleton() {
  return (
    <motion.div
      className="blog-item glass-card skeleton-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
        <SkeletonBox width="120px" height="16px" borderRadius="6px" />
        <SkeletonBox width="80px" height="16px" borderRadius="6px" />
      </div>
      <SkeletonBox width="70%" height="26px" borderRadius="8px" className="mb-sm" />
      <SkeletonBox width="100%" height="16px" borderRadius="6px" className="mb-xs" />
      <SkeletonBox width="85%" height="16px" borderRadius="6px" className="mb-md" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <SkeletonBox width="60px" height="22px" borderRadius="10px" />
          <SkeletonBox width="70px" height="22px" borderRadius="10px" />
        </div>
        <SkeletonBox width="100px" height="16px" borderRadius="6px" />
      </div>
    </motion.div>
  )
}

// ── ProjectsPage full-width skeleton ─────────────────────────────────────────

export function ProjectsPageCardSkeleton() {
  return (
    <motion.div
      className="project-card-full glass-card skeleton-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="skeleton-image">
        <SkeletonBox width="100%" height="200px" borderRadius="12px 12px 0 0" />
      </div>
      <div className="project-content">
        <div className="project-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <SkeletonBox width="55%" height="24px" borderRadius="8px" />
          <SkeletonBox width="80px" height="22px" borderRadius="12px" />
        </div>
        <SkeletonBox width="100%" height="16px" borderRadius="6px" className="mb-xs" />
        <SkeletonBox width="80%" height="16px" borderRadius="6px" className="mb-md" />
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <SkeletonBox width="60px" height="24px" borderRadius="12px" />
          <SkeletonBox width="50px" height="24px" borderRadius="12px" />
          <SkeletonBox width="70px" height="24px" borderRadius="12px" />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <SkeletonBox width="100px" height="36px" borderRadius="8px" />
          <SkeletonBox width="100px" height="36px" borderRadius="8px" />
        </div>
      </div>
    </motion.div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

export function EmptyState({ message = "Henüz veri bulunmuyor", icon = "📭" }) {
  return (
    <motion.div 
      className="empty-state glass-card"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <span className="empty-icon">{icon}</span>
      <p>{message}</p>
    </motion.div>
  )
}
