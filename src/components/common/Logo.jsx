import './Logo.css'

/**
 * Brand mark: a dot-wave monogram (nods to the site's DotWave motif) inside a
 * rounded ink square, with the accent dots forming an "M" peak. Theme-aware via
 * CSS custom properties. Hover animates the dots.
 */
export default function Logo({ size = 36, withText = true }) {
  return (
    <span className="logo" style={{ '--logo-size': `${size}px` }}>
      {withText && <span className="logo-word">MHL<span className="logo-word-dot">.</span></span>}
    </span>
  )
}
