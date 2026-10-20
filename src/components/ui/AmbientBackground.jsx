import './AmbientBackground.css'

export default function AmbientBackground({ className = '' }) {
  return <div className={`ambient-field ${className}`} aria-hidden="true"><span /><span /></div>
}
