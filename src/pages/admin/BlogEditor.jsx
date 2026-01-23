import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Save, ArrowLeft, Eye, Edit3, Trash2, Plus, X, Loader } from 'lucide-react'
import { useData } from '../../context/DataContext'
import './BlogEditor.css'

export default function BlogEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { posts, addPost, updatePost, deletePost, getPostById } = useData()
  
  const [isPreview, setIsPreview] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    tags: []
  })

  const isEditing = !!id
  const existingPost = isEditing ? getPostById(id) : null

  useEffect(() => {
    if (existingPost) {
      setFormData({
        title: existingPost.title,
        excerpt: existingPost.excerpt,
        content: existingPost.content,
        tags: existingPost.tags
      })
    }
  }, [existingPost])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAddTag = (e) => {
    e.preventDefault()
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] })
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setFormData({ 
      ...formData, 
      tags: formData.tags.filter(tag => tag !== tagToRemove) 
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      if (isEditing) {
        await updatePost(id, formData)
      } else {
        await addPost(formData)
      }
      navigate('/admin/blog')
    } catch (err) {
      setError(err.message || 'İşlem başarısız oldu')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deletePost(id)
      navigate('/admin/blog')
    } catch (err) {
      setError(err.message || 'Silme işlemi başarısız')
      setLoading(false)
    }
  }

  return (
    <div className="blog-editor">
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')}><X size={16} /></button>
        </div>
      )}
      <header className="editor-header">
        <Link to="/admin/blog" className="back-btn">
          <ArrowLeft size={20} />
          Yazılara Dön
        </Link>
        
        <div className="editor-actions">
          <button
            type="button"
            className={`btn btn-secondary toggle-btn ${isPreview ? '' : 'active'}`}
            onClick={() => setIsPreview(false)}
          >
            <Edit3 size={18} />
            Düzenle
          </button>
          <button
            type="button"
            className={`btn btn-secondary toggle-btn ${isPreview ? 'active' : ''}`}
            onClick={() => setIsPreview(true)}
          >
            <Eye size={18} />
            Önizleme
          </button>
        </div>
      </header>

      <div className="editor-container">
        {!isPreview ? (
          <form onSubmit={handleSubmit} className="editor-form">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                className="input-field"
                placeholder="Enter post title..."
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="excerpt">Excerpt</label>
              <textarea
                id="excerpt"
                name="excerpt"
                className="input-field"
                placeholder="Brief description of the post..."
                rows="2"
                value={formData.excerpt}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="content">Content (Markdown)</label>
              <textarea
                id="content"
                name="content"
                className="input-field content-editor"
                placeholder="Write your post content in Markdown..."
                value={formData.content}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Tags</label>
              <div className="tags-input-container">
                <div className="tags-list">
                  {formData.tags.map(tag => (
                    <span key={tag} className="tag editable-tag">
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="add-tag-form">
                  <input
                    type="text"
                    className="input-field tag-input"
                    placeholder="Add a tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
                  />
                  <button type="button" className="btn btn-secondary" onClick={handleAddTag}>
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <Loader size={18} className="spin" /> : <Save size={18} />}
                {isEditing ? 'Güncelle' : 'Yayınla'}
              </button>
              
              {isEditing && (
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={loading}
                >
                  <Trash2 size={18} />
                  Sil
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className="preview-container glass-card">
            <h1>{formData.title || 'Untitled Post'}</h1>
            <p className="preview-excerpt">{formData.excerpt}</p>
            <div className="preview-tags">
              {formData.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
            <div className="markdown-content">
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
                {formData.content || '*No content yet...*'}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* Post List for non-editing mode */}
      {!id && (
        <section className="posts-list-section">
          <h2>All Blog Posts</h2>
          <div className="posts-list">
            {posts.length === 0 ? (
              <p className="no-posts">No posts yet. Create your first one!</p>
            ) : (
              posts.map((post) => (
                <Link to={`/admin/blog/${post.id}`} key={post.id} className="post-item glass-card">
                  <div className="post-info">
                    <h3>{post.title}</h3>
                    <span className="post-date">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="post-tags">
                    {post.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <motion.div 
            className="delete-modal glass-card"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Delete Post?</h3>
            <p>Are you sure you want to delete "{existingPost?.title}"? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
