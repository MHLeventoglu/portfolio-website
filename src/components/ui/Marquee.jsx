import './Marquee.css'

/**
 * Infinite horizontal marquee (21st.dev pattern) via CSS animation, so
 * prefers-reduced-motion pauses it globally. Content is duplicated for a
 * seamless loop; edges fade out with a mask.
 */
export default function Marquee({ children, speed = 32, reverse = false, className = '' }) {
  return (
    <div className={`marquee ${className}`}>
      <div
        className="marquee-track"
        style={{ animationDuration: `${speed}s`, animationDirection: reverse ? 'reverse' : 'normal' }}
      >
        <div className="marquee-group">{children}</div>
        <div className="marquee-group" aria-hidden="true">{children}</div>
      </div>
    </div>
  )
}
