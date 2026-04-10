import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { ArrowLeft, Calendar, Tag, Clock } from 'lucide-react'
import { useData } from '../context/DataContext'
import Footer from '../components/common/Footer'
import './BlogPost.css'

export default function BlogPost() {
  const { slug } = useParams()
  const { getPostBySlug } = useData()
  const post = getPostBySlug(slug)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Estimate reading time (words / 200 wpm)
  const getReadingTime = (content) => {
    const words = content.split(/\s+/).length
    const minutes = Math.ceil(words / 200)
    return `${minutes} min read`
  }

  if (!post) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="blog-post-container not-found">
          <h1>Post Not Found</h1>
          <p>The blog post you're looking for doesn't exist.</p>
          <Link to="/" className="btn btn-primary">
            <ArrowLeft size={18} />
            Back to Home
          </Link>
        </div>
        <Footer />
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <article className="blog-post-container">
        <Link to="/#blog" className="back-link">
          <ArrowLeft size={18} />
          Back to Blog
        </Link>

        <header className="blog-post-header">
          <div className="blog-post-meta">
            <span className="meta-item">
              <Calendar size={16} />
              {formatDate(post.createdAt)}
            </span>
            <span className="meta-item">
              <Clock size={16} />
              {getReadingTime(post.content)}
            </span>
          </div>
          
          <h1>{post.title}</h1>
          
          <div className="blog-post-tags">
            {post.tags.map(tag => (
              <span key={tag} className="tag">
                <Tag size={12} />
                {tag}
              </span>
            ))}
          </div>

          {post.cover_image && (
            <div className="blog-post-cover">
              <img src={post.cover_image} alt={post.title} />
            </div>
          )}
        </header>

        <div className="blog-post-content markdown-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              }
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        <footer className="blog-post-footer">
          <div className="share-section glass-card">
            <p>Enjoyed this article? Share it with others!</p>
            <div className="share-buttons">
              <a 
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                Share on Twitter
              </a>
              <a 
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                Share on LinkedIn
              </a>
            </div>
          </div>
        </footer>
      </article>
      <Footer />
    </motion.div>
  )
}
