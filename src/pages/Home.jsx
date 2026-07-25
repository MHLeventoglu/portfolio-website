import { motion } from 'framer-motion'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import Hero from '../components/sections/Hero'
import About from '../components/sections/About'
import Skills from '../components/sections/Skills'
import Projects from '../components/sections/Projects'
import Blog from '../components/sections/Blog'
import Contact from '../components/sections/Contact'
import './Home.css'

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Navbar />
      <main>
        <Hero />
        <div className="band band-a"><About /></div>
        <div className="band band-b"><Skills /></div>
        <div className="band band-a"><Projects /></div>
        <div className="band band-b"><Blog /></div>
        <Contact />
      </main>
      <Footer />
    </motion.div>
  )
}
