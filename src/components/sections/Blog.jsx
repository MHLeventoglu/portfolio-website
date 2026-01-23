import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, ArrowRight, Tag } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { BlogCardSkeleton, EmptyState } from '../ui/Skeleton'
import './Blog.css'

export default function Blog() {
  const { posts, postsLoading } = useData()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  // Show only latest 2 posts on homepage
  const displayPosts = posts.slice(0, 2)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <section id="blog" className="section blog" ref={ref}>
      <motion.div
        className="section-title"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <h2>Son <span className="gradient-text">Blog Yazıları</span></h2>
        <p>Yapay zeka, robotik ve yazılım mühendisliği hakkında düşünceler ve rehberler</p>
      </motion.div>

      <div className="blog-grid">
        {postsLoading || displayPosts.length === 0 ? (
          // Show skeleton loading when loading or no data
          [...Array(2)].map((_, index) => (
            <BlogCardSkeleton key={index} />
          ))
        ) : (
          // Show actual posts
          displayPosts.map((post, index) => (
            <motion.article
              key={post.id}
              className="blog-card glass-card"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Link to={`/blog/${post.slug}`} className="blog-card-link">
                <div className="blog-card-header">
                  <div className="blog-date">
                    <Calendar size={14} />
                    {formatDate(post.createdAt)}
                  </div>
                </div>
                
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                
                <div className="blog-card-footer">
                  <div className="blog-tags">
                    {post.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="tag">
                        <Tag size={10} />
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="read-more">
                    Devamını Oku <ArrowRight size={16} />
                  </span>
                </div>
              </Link>
            </motion.article>
          ))
        )}
      </div>

      {/* View All Button */}
      <motion.div
        className="section-footer"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.5 }}
      >
        <Link to="/blog" className="btn btn-secondary">
          Tüm Yazıları Gör
          <ArrowRight size={18} />
        </Link>
      </motion.div>
    </section>
  )
}
