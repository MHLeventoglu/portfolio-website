import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { sampleProjects, samplePosts, profileData } from '../data/sampleData'

const DataContext = createContext()

export function DataProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [projects, setProjects] = useState([])
  const [posts, setPosts] = useState([])
  // Initialize profile with empty bio and skills - these only come from Supabase
  const [profile, setProfile] = useState({ ...profileData, bio: '', skills: [] })
  const [loading, setLoading] = useState(true)
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [postsLoading, setPostsLoading] = useState(true)
  const [skillsLoading, setSkillsLoading] = useState(true)
  const [useSupabase, setUseSupabase] = useState(false)

  // Check if Supabase is configured and load data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true)
      
      if (isSupabaseConfigured()) {
        setUseSupabase(true)
        
        // Check auth session
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          setIsAuthenticated(true)
          setUser(session.user)
        }

        // Listen for auth changes
        supabase.auth.onAuthStateChange((event, session) => {
          setIsAuthenticated(!!session)
          setUser(session?.user || null)
        })

        // Load data from Supabase
        await loadFromSupabase()
      } else {
        // Fallback to localStorage
        loadFromLocalStorage()
      }
      
      setLoading(false)
    }

    initializeData()
  }, [])

  // Load data from Supabase
  const loadFromSupabase = async () => {
    setProjectsLoading(true)
    setPostsLoading(true)
    setSkillsLoading(true)
    
    try {
      // Load projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (projectsError) throw projectsError
      setProjects(projectsData || [])
      setProjectsLoading(false)

      // Load posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (postsError) throw postsError
      setPosts(postsData || [])
      setPostsLoading(false)

      // Load profile
      const { data: profileRow, error: profileError } = await supabase
        .from('profile')
        .select('*')
        .single()
      
      if (profileRow) {
        // Load skills
        const { data: skillsData } = await supabase
          .from('skills')
          .select('*')
          .order('category', { ascending: true })
        
        setProfile({
          ...profileRow,
          gradYear: profileRow.grad_year,
          social: {
            github: profileRow.github,
            linkedin: profileRow.linkedin,
            website: profileRow.website
          },
          skills: skillsData || []
        })
        setSkillsLoading(false)
      } else {
        setSkillsLoading(false)
      }
    } catch (error) {
      console.error('Error loading from Supabase:', error)
      // Keep empty arrays on error - show skeleton/empty state
      setProjectsLoading(false)
      setPostsLoading(false)
      setSkillsLoading(false)
    }
  }

  // Load data from localStorage (fallback - only for profile and auth)
  // When Supabase is not configured, keep loading states TRUE to show skeleton permanently
  const loadFromLocalStorage = () => {
    const savedProfile = localStorage.getItem('portfolio_profile')
    const savedAuth = localStorage.getItem('portfolio_auth')
    
    // Projects, posts, skills - always empty when no Supabase
    setProjects([])
    setPosts([])
    
    // Profile can use localStorage or default, but bio and skills must be empty (come from Supabase only)
    const baseProfile = savedProfile ? JSON.parse(savedProfile) : profileData
    setProfile({ ...baseProfile, bio: '', skills: [] })
    setIsAuthenticated(savedAuth === 'true')
    
    // KEEP LOADING STATES TRUE - show skeleton permanently when no Supabase
    // This indicates data is not available without Supabase connection
    // projectsLoading, postsLoading, skillsLoading remain true (their initial state)
  }

  // Save profile to localStorage (for admin edits when no Supabase)
  useEffect(() => {
    if (!useSupabase && profile.skills) {
      localStorage.setItem('portfolio_profile', JSON.stringify(profile))
    }
  }, [profile, useSupabase])

  // ============================================
  // AUTH FUNCTIONS
  // ============================================
  const login = async (email, password) => {
    if (useSupabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      setIsAuthenticated(true)
      setUser(data.user)
      return true
    } else {
      // Fallback: simple password check
      if (password === 'admin123') {
        setIsAuthenticated(true)
        localStorage.setItem('portfolio_auth', 'true')
        return true
      }
      return false
    }
  }

  const logout = async () => {
    if (useSupabase) {
      await supabase.auth.signOut()
    }
    setIsAuthenticated(false)
    setUser(null)
    localStorage.removeItem('portfolio_auth')
  }

  // ============================================
  // PROJECT CRUD
  // ============================================
  const addProject = async (project) => {
    if (useSupabase) {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          title: project.title,
          description: project.description,
          image: project.image,
          category: project.category,
          tags: project.tags,
          github: project.github,
          demo: project.demo,
          featured: project.featured || false
        }])
        .select()
        .single()
      
      if (error) throw error
      setProjects(prev => [data, ...prev])
      return data
    } else {
      const newProject = {
        ...project,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      }
      setProjects(prev => [newProject, ...prev])
      return newProject
    }
  }

  const updateProject = async (id, updates) => {
    if (useSupabase) {
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
      
      if (error) throw error
    }
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  const deleteProject = async (id) => {
    if (useSupabase) {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    }
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  // ============================================
  // POST CRUD
  // ============================================
  const addPost = async (post) => {
    const slug = post.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    
    if (useSupabase) {
      const { data, error } = await supabase
        .from('posts')
        .insert([{
          title: post.title,
          slug,
          excerpt: post.excerpt,
          content: post.content,
          tags: post.tags
        }])
        .select()
        .single()
      
      if (error) throw error
      setPosts(prev => [data, ...prev])
      return data
    } else {
      const newPost = {
        ...post,
        id: Date.now().toString(),
        slug,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setPosts(prev => [newPost, ...prev])
      return newPost
    }
  }

  const updatePost = async (id, updates) => {
    const slug = updates.title 
      ? updates.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      : undefined
    
    if (useSupabase) {
      const updateData = { ...updates }
      if (slug) updateData.slug = slug
      
      const { error } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', id)
      
      if (error) throw error
    }
    
    setPosts(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, ...updates, slug: slug || p.slug, updated_at: new Date().toISOString() }
      }
      return p
    }))
  }

  const deletePost = async (id) => {
    if (useSupabase) {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    }
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  const getPostBySlug = (slug) => {
    return posts.find(p => p.slug === slug)
  }

  const getPostById = (id) => {
    return posts.find(p => p.id === id)
  }

  // ============================================
  // SKILLS CRUD
  // ============================================
  const addSkill = async (skill) => {
    if (useSupabase) {
      const { data, error } = await supabase
        .from('skills')
        .insert([{
          name: skill.name,
          category: skill.category,
          level: skill.level
        }])
        .select()
        .single()
      
      if (error) throw error
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, data]
      }))
      return data
    } else {
      const newSkill = { ...skill, id: Date.now().toString() }
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill]
      }))
      return newSkill
    }
  }

  const updateSkill = async (id, updates) => {
    if (useSupabase) {
      const { error } = await supabase
        .from('skills')
        .update(updates)
        .eq('id', id)
      
      if (error) throw error
    }
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.map(s => s.id === id || s.name === id ? { ...s, ...updates } : s)
    }))
  }

  const deleteSkill = async (id) => {
    if (useSupabase) {
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    }
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s.id !== id && s.name !== id)
    }))
  }

  // ============================================
  // CONTEXT VALUE
  // ============================================
  const value = {
    // State
    isAuthenticated,
    user,
    loading,
    projectsLoading,
    postsLoading,
    skillsLoading,
    useSupabase,
    // Auth
    login,
    logout,
    // Projects
    projects,
    addProject,
    updateProject,
    deleteProject,
    // Posts
    posts,
    addPost,
    updatePost,
    deletePost,
    getPostBySlug,
    getPostById,
    // Profile & Skills
    profile,
    setProfile,
    addSkill,
    updateSkill,
    deleteSkill,
    // Refresh
    refresh: useSupabase ? loadFromSupabase : loadFromLocalStorage
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
