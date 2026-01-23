import { Github, Linkedin, Twitter, Heart } from 'lucide-react'
import { useData } from '../../context/DataContext'
import './Footer.css'

export default function Footer() {
  const { profile } = useData()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-top">
          <div className="footer-brand">
            <h3 className="gradient-text">{profile.name}</h3>
            <p>{profile.title}</p>
          </div>
          
          <div className="footer-links">
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#projects">Projects</a>
            <a href="#blog">Blog</a>
            <a href="#contact">Contact</a>
          </div>

          <div className="footer-social">
            <a href={profile.social.github} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="GitHub">
              <Github size={20} />
            </a>
            <a href={profile.social.linkedin} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn">
              <Linkedin size={20} />
            </a>
            <a href={profile.social.twitter} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Twitter">
              <Twitter size={20} />
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {currentYear} {profile.name}. Made with <Heart size={14} className="heart-icon" /> and lots of ☕
          </p>
        </div>
      </div>

      <div className="footer-glow"></div>
    </footer>
  )
}
