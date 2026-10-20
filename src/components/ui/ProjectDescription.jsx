import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function ProjectDescription({ children, className = '' }) {
  return (
    <div className={`markdown-content project-description ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children || ''}</ReactMarkdown>
    </div>
  )
}
