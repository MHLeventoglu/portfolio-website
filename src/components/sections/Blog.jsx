import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useLang } from '../../context/LanguageContext'
import { SkeletonBox } from '../ui/Skeleton'
import SectionHeader from '../ui/SectionHeader'
import './Blog.css'

export default function Blog() {
  const { posts, postsLoading } = useData()
  const { t, locale } = useLang()
  const displayPosts = posts.slice(0, 3)

  const formatDate = (d) => new Date(d).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })

  return (
    <section id="blog" className="section blog">
      <SectionHeader index="04" label={t('blog.eyebrow')} title={t('blog.title')} />

      <div className="post-list">
        <div className="rule" />
        {postsLoading || displayPosts.length === 0 ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="post-row">
              <SkeletonBox width="90px" height="14px" />
              <div className="post-main">
                <SkeletonBox width="60%" height="26px" className="mb-sm" />
                <SkeletonBox width="90%" height="15px" />
              </div>
              <div className="rule" />
            </div>
          ))
        ) : (
          displayPosts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <Link to={`/blog/${post.slug}`} className="post-row">
                <span className="post-date">{formatDate(post.created_at || post.createdAt)}</span>
                <div className="post-main">
                  <h3 className="post-title">{post.title}</h3>
                  <p className="post-excerpt">{post.excerpt}</p>
                  <div className="post-tags">
                    {post.tags.slice(0, 3).map(tag => <span key={tag} className="tag">{tag}</span>)}
                  </div>
                </div>
                <span className="post-arrow"><ArrowUpRight size={22} /></span>
                <div className="rule" />
              </Link>
            </motion.div>
          ))
        )}
      </div>

      <div className="blog-all">
        <Link to="/blog" className="blog-all-link">
          {t('blog.viewAll')} <ArrowUpRight size={22} />
        </Link>
      </div>
    </section>
  )
}
