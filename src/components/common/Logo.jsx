import './Logo.css'

/**
 * Brand mark: a dot-wave monogram (nods to the site's DotWave motif) inside a
 * rounded ink square, with the accent dots forming an "M" peak. Theme-aware via
 * CSS custom properties. Hover animates the dots.
 */
export default function Logo({ size = 36, withText = true }) {
  return (
    <span className="logo" style={{ '--logo-size': `${size}px` }}>
      <svg className="logo-mark" width={size} height={size} viewBox="0 0 40 40" fill="none" role="img" aria-label="Muaz Leventoğlu">
        <rect x="1" y="1" width="38" height="38" rx="11" className="logo-bg" />
        <path d="M9 27 Q20 9 31 27" className="logo-wave" fill="none" strokeWidth="1.6" strokeLinecap="round" />
        <circle className="logo-dot logo-dot-1" cx="9" cy="27" r="2.6" />
        <circle className="logo-dot logo-dot-2" cx="20" cy="14" r="2.6" />
        <circle className="logo-dot logo-dot-3" cx="31" cy="27" r="2.6" />
      </svg>
      {withText && <span className="logo-word">MHL<span className="logo-word-dot">.</span></span>}
    </span>
  )
}
