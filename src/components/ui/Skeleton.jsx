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

// Project card skeleton
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

// Empty state component
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
