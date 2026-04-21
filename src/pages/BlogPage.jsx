import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Calendar, ArrowLeft, ArrowRight, Tag } from 'lucide-react'
import { useData } from '../context/DataContext'
import { BlogListItemSkeleton } from '../components/ui/Skeleton'
import Footer from '../components/common/Footer'
import './BlogPage.css'

export default function BlogPage() {
  const { posts, postsLoading } = useData()

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getReadingTime = (content) => {
    const wordsPerMinute = 200
    const words = content.split(/\s+/).length
    return Math.ceil(words / wordsPerMinute)
  }

  return (
    <>
      <main className="blog-page">
        <div className="page-header">
          <Link to="/" className="back-link">
            <ArrowLeft size={20} />
            Ana Sayfa
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Tüm <span className="gradient-text">Blog Yazıları</span>
          </motion.h1>
          <p>Yapay zeka, robotik ve yazılım mühendisliği hakkında düşünceler</p>
        </div>

        <div className="blog-list">
          {postsLoading ? (
            // Show skeleton list while loading
            [...Array(3)].map((_, index) => (
              <BlogListItemSkeleton key={index} />
            ))
          ) : posts.length === 0 ? (
            <div className="no-results">
              <p>Henüz blog yazısı yok</p>
            </div>
          ) : (
            posts.map((post, index) => (
              <motion.article
                key={post.id}
                className="blog-item glass-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ x: 5 }}
              >
                <Link to={`/blog/${post.slug}`} className="blog-item-link">
                  {post.cover_image && (
                    <div className="blog-item-cover">
                      <img src={post.cover_image} alt={post.title} />
                    </div>
                  )}
                  <div className="blog-item-meta">
                    <span className="blog-date">
                      <Calendar size={14} />
                      {formatDate(post.created_at || post.createdAt)}
                    </span>
                    <span className="reading-time">{getReadingTime(post.content)} dk okuma</span>
                  </div>
                  
                  <h2>{post.title}</h2>
                  <p>{post.excerpt}</p>
                  
                  <div className="blog-item-footer">
                    <div className="blog-tags">
                      {post.tags.map(tag => (
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
      </main>
      <Footer />
    </>
  )
}
