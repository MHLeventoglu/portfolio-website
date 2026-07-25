import { motion } from 'framer-motion'
import { useLang } from '../../context/LanguageContext'
import './LanguageToggle.css'

const langs = ['tr', 'en']

export default function LanguageToggle() {
  const { lang, setLang } = useLang()

  return (
    <div className="lang-toggle" role="group" aria-label="Language">
      {langs.map((l) => (
        <button
          key={l}
          className={`lang-opt ${lang === l ? 'active' : ''}`}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
        >
          {lang === l && <motion.span className="lang-pill" layoutId="lang-pill" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
          <span className="lang-opt-text">{l.toUpperCase()}</span>
        </button>
      ))}
    </div>
  )
}
