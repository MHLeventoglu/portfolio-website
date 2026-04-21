import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const DataContext = createContext()

export function DataProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [projects, setProjects] = useState([])
  const [posts, setPosts] = useState([])
  const [experiences, setExperiences] = useState([])
  // Profile starts fully empty - all fields come from Supabase only
  const emptyProfile = {
    name: '',
    title: '',
    subtitle: '',
    bio: '',
    email: '',
    phone: '',
    location: '',
    university: '',
    degree: '',
    gradYear: '',
    gpa: '',
    image_url: '',
    social: { github: '', linkedin: '', twitter: '', website: '' },
    skills: []
  }
  const [profile, setProfile] = useState(emptyProfile)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(true)
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [postsLoading, setPostsLoading] = useState(true)
  const [skillsLoading, setSkillsLoading] = useState(true)
  const [experiencesLoading, setExperiencesLoading] = useState(true)
  const [useSupabase, setUseSupabase] = useState(false)

  // ============================================
  // LOAD FROM SUPABASE
  // ============================================
  const loadFromSupabase = async () => {
    setProfileLoading(true)
    setProjectsLoading(true)
    setPostsLoading(true)
    setSkillsLoading(true)
    setExperiencesLoading(true)

    // Load projects
    try {
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
      if (projectsError) throw projectsError
      setProjects(projectsData || [])
    } catch (err) {
      console.error('Error loading projects:', err)
    } finally {
      setProjectsLoading(false)
    }

    // Load posts
    try {
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
      if (postsError) throw postsError
      setPosts(postsData || [])
    } catch (err) {
      console.error('Error loading posts:', err)
    } finally {
      setPostsLoading(false)
    }

    // Load profile & skills
    try {
      const { data: profileRow, error: profileError } = await supabase
        .from('profile')
        .select('*')
        .single()

      if (profileError) {
        console.warn('Profile not found or error:', profileError.message)
        setSkillsLoading(false)
        setProfileLoading(false)
      } else if (profileRow) {
        const { data: skillsData } = await supabase
          .from('skills')
          .select('*')
          .order('category', { ascending: true })

        setProfile({
          ...profileRow,
          image_url: profileRow.image_url || '',
          gradYear: profileRow.grad_year,
          social: {
            github: profileRow.github || '',
            linkedin: profileRow.linkedin || '',
            twitter: profileRow.twitter || '',
            website: profileRow.website || ''
          },
          skills: skillsData || []
        })
        setSkillsLoading(false)
        setProfileLoading(false)
      } else {
        setSkillsLoading(false)
        setProfileLoading(false)
      }
    } catch (err) {
      console.error('Error loading profile/skills:', err)
      setSkillsLoading(false)
      setProfileLoading(false)
    }

    // Load experiences (independent - always runs)
    try {
      const { data: experiencesData, error: experiencesError } = await supabase
        .from('experiences')
        .select('*')
        .order('sort_order', { ascending: true })
      if (experiencesError) throw experiencesError
      setExperiences(experiencesData || [])
    } catch (err) {
      console.error('Error loading experiences:', err)
    } finally {
      setExperiencesLoading(false)
    }
  }

  // ============================================
  // LOAD FROM LOCALSTORAGE (fallback)
  // ============================================
  const loadFromLocalStorage = () => {
    const savedAuth = localStorage.getItem('portfolio_auth')

    // Projects, posts, skills, experiences, profile - all empty when no Supabase
    setProjects([])
    setExperiences([])
    setPosts([])
    // Profile stays empty - all data must come from Supabase
    // profileLoading stays true to show skeletons permanently when no Supabase
    setIsAuthenticated(savedAuth === 'true')
  }

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])






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
          cover_image: post.cover_image || null,
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
  // EXPERIENCE CRUD
  // ============================================
  const addExperience = async (experience) => {
    if (useSupabase) {
      const { data, error } = await supabase
        .from('experiences')
        .insert([{
          title: experience.title,
          subtitle: experience.subtitle,
          description: experience.description,
          date_range: experience.date_range,
          icon: experience.icon || 'briefcase',
          sort_order: experience.sort_order || 0
        }])
        .select()
        .single()
      
      if (error) throw error
      setExperiences(prev => [...prev, data].sort((a, b) => a.sort_order - b.sort_order))
      return data
    } else {
      const newExperience = {
        ...experience,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      }
      setExperiences(prev => [...prev, newExperience])
      return newExperience
    }
  }

  const updateExperience = async (id, updates) => {
    if (useSupabase) {
      const { error } = await supabase
        .from('experiences')
        .update(updates)
        .eq('id', id)
      
      if (error) throw error
    }
    setExperiences(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e)
      .sort((a, b) => a.sort_order - b.sort_order))
  }

  const deleteExperience = async (id) => {
    if (useSupabase) {
      const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    }
    setExperiences(prev => prev.filter(e => e.id !== id))
  }

  // ============================================
  // PROFILE IMAGE
  // ============================================
  const updateProfileImage = async (imageUrl) => {
    if (useSupabase) {
      const { error } = await supabase
        .from('profile')
        .update({ image_url: imageUrl })
        .eq('id', 1)
      if (error) throw error
    }
    setProfile(prev => ({ ...prev, image_url: imageUrl }))
  }

  // ============================================
  // CONTEXT VALUE
  // ============================================
  const value = {
    // State
    isAuthenticated,
    user,
    loading,
    profileLoading,
    projectsLoading,
    postsLoading,
    skillsLoading,
    experiencesLoading,
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
    updateProfileImage,
    addSkill,
    updateSkill,
    deleteSkill,
    // Experiences
    experiences,
    addExperience,
    updateExperience,
    deleteExperience,
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
