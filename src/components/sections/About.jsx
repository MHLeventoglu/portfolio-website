import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { GraduationCap, MapPin, Calendar, Briefcase } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { SkeletonBox } from '../ui/Skeleton'
import './About.css'

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
}

const timeline = [
  {
    year: "2022 - 2027",
    title: "Bilgisayar Mühendisliği Lisans",
    subtitle: "İstanbul Üniversitesi-Cerrahpaşa",
    description: "GPA: 3.51 - Web, Yapay Zeka ve Robotik alanlarında uzmanlaşma",
    icon: GraduationCap
  },
  {
    year: "Temmuz 2025 - Eylül 2025",
    title: "Robotik Stajyeri",
    subtitle: "Utience Teknoloji AŞ",
    description: "Otonom AMR platformu geliştirme, ROS2, Gazebo ve SLAM sistemleri",
    icon: Briefcase
  },
  {
    year: "Kasım 2024 - Şimdi",
    title: "Yazılım Geliştirici & Bilgisayar Görü",
    subtitle: "GökmenUAV (Öğrenci Takımı)",
    description: "YOLO tabanlı nesne tespit modeli eğitimi, Teknofest Yapay Zeka yarışması",
    icon: Briefcase
  }
]

export default function About() {
  const { profile, loading, useSupabase } = useData()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  
  // Show skeleton for bio when loading or when bio is empty (no Supabase data)
  const showBioSkeleton = loading || !profile.bio

  return (
    <section id="about" className="section about" ref={ref}>
      <motion.div
        className="section-title"
        variants={fadeInUp}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        transition={{ duration: 0.5 }}
      >
        <h2>Hakkımda <span className="gradient-text">...</span></h2>
        <p>Benim hakkımda daha fazla bilgi edinin</p>
      </motion.div>

      <div className="about-content">
        <motion.div
          className="about-image-container"
          variants={fadeInUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="about-image">
            <div className="image-placeholder">
              <span>👨‍💻</span>
            </div>
            <div className="image-glow"></div>
          </div>
          
          <div className="about-info-cards">
            <div className="info-card glass-card">
              <MapPin size={18} />
              <span>{profile.location}</span>
            </div>
            <div className="info-card glass-card">
              <GraduationCap size={18} />
              <span>{profile.university}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="about-text"
          variants={fadeInUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="about-bio glass-card">
            <h3>Ben Kimim</h3>
            {showBioSkeleton ? (
              <div className="bio-skeleton">
                <SkeletonBox width="100%" height="16px" className="mb-xs" />
                <SkeletonBox width="95%" height="16px" className="mb-xs" />
                <SkeletonBox width="100%" height="16px" className="mb-xs" />
                <SkeletonBox width="85%" height="16px" className="mb-xs" />
                <SkeletonBox width="90%" height="16px" />
              </div>
            ) : (
              <p>{profile.bio}</p>
            )}
          </div>

          <div className="about-details">
            <div className="detail-item">
              <span className="detail-label">Bölüm</span>
              <span className="detail-value">{profile.degree}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Mezuniyet</span>
              <span className="detail-value">{profile.gradYear}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">GPA</span>
              <span className="detail-value">{profile.gpa}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Timeline */}
      <motion.div
        className="timeline"
        variants={fadeInUp}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h3 className="timeline-title">Deneyim</h3>
        <div className="timeline-items">
          {timeline.map((item, index) => (
            <motion.div
              key={index}
              className="timeline-item glass-card"
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
            >
              <div className="timeline-icon">
                <item.icon size={20} />
              </div>
              <div className="timeline-content">
                <span className="timeline-year">
                  <Calendar size={14} />
                  {item.year}
                </span>
                <h4>{item.title}</h4>
                <span className="timeline-subtitle">{item.subtitle}</span>
                <p>{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
