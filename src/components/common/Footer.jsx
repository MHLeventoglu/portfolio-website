import { Github, Linkedin, Twitter, Heart } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { FooterBrandSkeleton, SkeletonBox } from '../ui/Skeleton'
import './Footer.css'

export default function Footer() {
  const { profile, profileLoading } = useData()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-top">
          {profileLoading ? (
            <FooterBrandSkeleton />
          ) : (
            <div className="footer-brand">
              <h3 className="gradient-text">{profile.name}</h3>
              <p>{profile.title}</p>
            </div>
          )}
          
          <div className="footer-links">
            <a href="#home">Ana Sayfa</a>
            <a href="#about">Hakkımda</a>
            <a href="#projects">Projeler</a>
            <a href="#blog">Blog</a>
            <a href="#contact">İletişim</a>
          </div>

          <div className="footer-social">
            {profileLoading ? (
              <>
                <SkeletonBox width="36px" height="36px" borderRadius="50%" />
                <SkeletonBox width="36px" height="36px" borderRadius="50%" />
                <SkeletonBox width="36px" height="36px" borderRadius="50%" />
              </>
            ) : (
              <>
                {profile.social?.github && (
                  <a href={profile.social.github} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="GitHub">
                    <Github size={20} />
                  </a>
                )}
                {profile.social?.linkedin && (
                  <a href={profile.social.linkedin} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn">
                    <Linkedin size={20} />
                  </a>
                )}
                {profile.social?.twitter && (
                  <a href={profile.social.twitter} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Twitter">
                    <Twitter size={20} />
                  </a>
                )}
              </>
            )}
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {currentYear}{' '}
            {profileLoading ? (
              <SkeletonBox width="140px" height="14px" borderRadius="4px" style={{ display: 'inline-block', verticalAlign: 'middle' }} />
            ) : (
              profile.name
            )}
            . Made with <Heart size={14} className="heart-icon" /> and lots of ☕
          </p>
        </div>
      </div>

      <div className="footer-glow"></div>
    </footer>
  )
}
