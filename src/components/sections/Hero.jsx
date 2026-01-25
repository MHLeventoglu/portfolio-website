import { motion } from 'framer-motion'
import { ArrowDown, Github, Linkedin, Mail, Download, MapPin, GraduationCap } from 'lucide-react'
import { useData } from '../../context/DataContext'
import './Hero.css'

// Floating shapes for background animation
const FloatingShape = ({ delay, duration, size, left, top, color }) => (
  <motion.div
    className="floating-shape"
    style={{
      width: size,
      height: size,
      left: `${left}%`,
      top: `${top}%`,
      background: color,
    }}
    animate={{
      y: [0, -30, 0],
      rotate: [0, 180, 360],
      scale: [1, 1.1, 1],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  />
)

export default function Hero() {
  const { profile } = useData()

  const scrollToAbout = () => {
    document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="home" className="hero">
      {/* Animated Background Shapes */}
      <div className="hero-shapes">
        <FloatingShape delay={0} duration={6} size={80} left={5} top={20} color="rgba(139, 92, 246, 0.15)" />
        <FloatingShape delay={1} duration={8} size={60} left={90} top={10} color="rgba(6, 182, 212, 0.15)" />
        <FloatingShape delay={2} duration={7} size={70} left={85} top={70} color="rgba(236, 72, 153, 0.12)" />
        <FloatingShape delay={0.5} duration={9} size={50} left={15} top={80} color="rgba(139, 92, 246, 0.1)" />
      </div>

      {/* Main Content - Split Layout */}
      <div className="hero-split">
        {/* Left: Text Content */}
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="badge-dot"></span>
            <span>Fırsatlara açık</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Merhaba, ben
            <br />
            <span className="gradient-text">{profile.name}</span>
          </motion.h1>

          <motion.h2
            className="hero-subtitle"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {profile.title}
          </motion.h2>

          <motion.p
            className="hero-description"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {profile.subtitle}
          </motion.p>

          {/* Quick Info Pills */}
          <motion.div
            className="hero-info-pills"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            <div className="info-pill">
              <MapPin size={14} />
              <span>{profile.location}</span>
            </div>
            <div className="info-pill">
              <GraduationCap size={14} />
              <span>GPA: {profile.gpa}</span>
            </div>
          </motion.div>

          <motion.div
            className="hero-buttons"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <a href="#projects" className="btn btn-primary">
              Projelerimi Gör
            </a>
            <a href="#contact" className="btn btn-secondary">
              <Mail size={18} />
              İletişime Geç
            </a>
          </motion.div>

          {/* Social Links */}
          <motion.div
            className="hero-socials"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <a href={profile.social.github} target="_blank" rel="noopener noreferrer" className="social-link">
              <Github size={20} />
            </a>
            <a href={profile.social.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
              <Linkedin size={20} />
            </a>
            <a href={`mailto:${profile.email}`} className="social-link">
              <Mail size={20} />
            </a>
          </motion.div>
        </motion.div>

        {/* Right: Profile Image */}
        <motion.div 
          className="hero-image-container"
          initial={{ opacity: 0, x: 50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="hero-image-wrapper">
            <div className="hero-image-glow"></div>
            <div className="hero-image-border"></div>
            <img 
              src="https://media.licdn.com/dms/image/v2/D4D03AQFBvgiGsZ6jIQ/profile-displayphoto-crop_800_800/B4DZv0q6f5IAAI-/0/1769336450059?e=1770854400&v=beta&t=DeiwwHZRZ8EJgODV-I2j0xpTdKuZ2Rfae3RB2wXjPS8" 
              alt={profile.name}
              className="hero-image"
            />
            
            {/* Floating Cards around image */}
            <motion.div 
              className="floating-card card-experience glass-card"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="floating-card-value">3+</span>
              <span className="floating-card-label">Yıl Deneyim</span>
            </motion.div>
            
            <motion.div 
              className="floating-card card-gpa glass-card"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <span className="floating-card-value">{profile.gpa}</span>
              <span className="floating-card-label">GPA</span>
            </motion.div>

            <motion.div 
              className="floating-card card-projects glass-card"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <span className="floating-card-value">5+</span>
              <span className="floating-card-label">AI Proje</span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.button
        className="scroll-indicator"
        onClick={scrollToAbout}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        whileHover={{ scale: 1.1 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ArrowDown size={24} />
        </motion.div>
      </motion.button>

      {/* Gradient Orbs */}
      <div className="hero-orb hero-orb-1"></div>
      <div className="hero-orb hero-orb-2"></div>
    </section>
  )
}
