import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { SkillCardSkeleton, EmptyState } from '../ui/Skeleton'
import './Skills.css'

const categoryIcons = {
  "Programlama": "💻",
  "Yapay Zeka": "🧠",
  "Web": "🌐",
  "Robotik": "🤖",
  "Araçlar": "🔧"
}

export default function Skills() {
  const { profile, skillsLoading } = useData()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')

  const skills = profile?.skills || []
  const categories = ['all', ...new Set(skills.map(s => s.category))]
  const filteredSkills = activeCategory === 'all' 
    ? skills 
    : skills.filter(s => s.category === activeCategory)
  
  // Show only first 6 skills when collapsed
  const displaySkills = isExpanded ? filteredSkills : filteredSkills.slice(0, 6)

  return (
    <section id="skills" className="section skills" ref={ref}>
      <motion.div
        className="section-title"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <h2>Yetenekler & <span className="gradient-text">Teknolojiler</span></h2>
        <p>Fikirleri hayata geçirmek için kullandığım teknolojiler</p>
      </motion.div>

      <motion.div
        className="skills-categories"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat === 'all' ? '✨ Tümü' : `${categoryIcons[cat] || '📦'} ${cat}`}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div 
          className={`skills-grid ${!isExpanded ? 'collapsed' : ''}`}
          layout
          key={activeCategory}
        >
          {skillsLoading || displaySkills.length === 0 ? (
            // Show skeleton loading when loading or no data
            [...Array(6)].map((_, index) => (
              <SkillCardSkeleton key={index} />
            ))
          ) : (
            // Show actual skills
            displaySkills.map((skill, index) => (
              <motion.div
                key={skill.name}
                className="skill-card glass-card"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.03 }}
                layout
                whileHover={{ scale: 1.02 }}
              >
                <div className="skill-header">
                  <span className="skill-name">{skill.name}</span>
                  <span className="skill-category">{categoryIcons[skill.category]}</span>
                </div>
                <div className="skill-bar-container">
                  <motion.div
                    className="skill-bar"
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${skill.level}%` } : {}}
                    transition={{ duration: 1, delay: 0.3 + index * 0.03, ease: "easeOut" }}
                  />
                </div>
                <span className="skill-level">{skill.level}%</span>
              </motion.div>
            ))
          )}
        </motion.div>
      </AnimatePresence>

      {/* Expand/Collapse Button */}
      {filteredSkills.length > 6 && (
        <motion.button
          className="expand-btn glass-card"
          onClick={() => setIsExpanded(!isExpanded)}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
        >
          {isExpanded ? (
            <>
              <span>Daha Az Göster</span>
              <ChevronUp size={20} />
            </>
          ) : (
            <>
              <span>Tümünü Göster ({filteredSkills.length})</span>
              <ChevronDown size={20} />
            </>
          )}
        </motion.button>
      )}

      {/* Decorative Elements */}
      <div className="skills-decoration">
        <div className="orbit">
          <div className="orbit-dot"></div>
        </div>
      </div>
    </section>
  )
}
