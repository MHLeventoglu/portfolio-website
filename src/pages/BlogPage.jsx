import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useLang } from '../context/LanguageContext'
import { SkeletonBox } from '../components/ui/Skeleton'
import Footer from '../components/common/Footer'
import './BlogPage.css'

export default function BlogPage() {
  const { posts, postsLoading } = useData()
  const { t, locale } = useLang()

  const formatDate = (d) => new Date(d).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })
  const readingTime = (content) => Math.ceil(content.split(/\s+/).length / 200)

  return (
    <>
      <main className="blog-page">
        <header className="page-head">
          <Link to="/" className="back-link"><ArrowLeft size={18} /> {t('common.back')}</Link>
          <span className="eyebrow">{t('blogPage.eyebrow')}</span>
          <h1 className="page-title display">{t('blogPage.title')}</h1>
          <p className="page-sub">{t('blogPage.sub')}</p>
        </header>

        <div className="post-list">
          <div className="rule" />
          {postsLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="post-row">
                <SkeletonBox width="90px" height="14px" />
                <div className="post-main">
                  <SkeletonBox width="60%" height="26px" className="mb-sm" />
                  <SkeletonBox width="90%" height="15px" />
                </div>
                <div className="rule" />
              </div>
            ))
          ) : posts.length === 0 ? (
            <div className="no-results"><p>{t('blogPage.none')}</p></div>
          ) : (
            posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: Math.min(i * 0.05, 0.3) }}
              >
                <Link to={`/blog/${post.slug}`} className="post-row">
                  <span className="post-date">
                    {formatDate(post.created_at || post.createdAt)}
                    <span className="post-read">{readingTime(post.content)} {t('blogPage.read')}</span>
                  </span>
                  <div className="post-main">
                    <h3 className="post-title">{post.title}</h3>
                    <p className="post-excerpt">{post.excerpt}</p>
                    <div className="post-tags">
                      {post.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                    </div>
                  </div>
                  <span className="post-arrow"><ArrowUpRight size={22} /></span>
                  <div className="rule" />
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
