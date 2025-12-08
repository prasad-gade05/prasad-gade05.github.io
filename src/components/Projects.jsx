import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ExternalLink, Github, Award, BarChart2 } from 'lucide-react'
import './Projects.css'

const Projects = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  const [filter, setFilter] = useState('all')

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'ml', label: 'Machine Learning' },
    { id: 'web', label: 'Web Apps' },
    { id: 'ai', label: 'AI/LLM' },
  ]

  const projects = [
    {
      title: 'Lex Simulacra',
      subtitle: 'AI-Powered Legal Courtroom Simulator',
      category: 'ai',
      featured: false,
      description: '8-agent multi-role legal simulation achieving 99% citation accuracy with advanced RAG pipeline processing 100K+ legal documents.',
      stats: [
        { value: '99%', label: 'Accuracy' },
        { value: '75%', label: 'Time Saved' },
        { value: '3.2×', label: 'Relevance' },
      ],
      tech: ['LangChain', 'LangGraph', 'FastAPI', 'ChromaDB', 'Streamlit'],
      date: 'Nov 2025',
      gradient: 'linear-gradient(135deg, #58a6ff 0%, #3fb950 100%)',
    },
    {
      title: 'Intrusion Detection System',
      subtitle: 'ML/DL Comparative Analysis',
      category: 'ml',
      featured: false,
      description: 'Compared 6 models on 8.6M samples achieving 99.99% recall and 100% precision. Tree models outperformed with 12.8× speed advantage.',
      stats: [
        { value: '99.99%', label: 'Recall' },
        { value: '8.6M', label: 'Samples' },
        { value: '12.8×', label: 'Faster' },
      ],
      tech: ['XGBoost', 'PyTorch', 'SHAP', 'Scikit-learn'],
      date: 'Oct 2025',
      gradient: 'linear-gradient(135deg, #3fb950 0%, #58a6ff 100%)',
    },
    {
      title: 'KindHearts',
      subtitle: 'Multi-Role Donation Platform',
      category: 'web',
      featured: true,
      badge: 'Hackathon Winner',
      description: 'Won 1st place among 80+ teams. Built transparent donation ecosystem with smart request tracking and LLM-driven matchmaking.',
      stats: [
        { value: '60%', label: 'Faster Processing' },
        { value: '45%', label: 'More Engagement' },
      ],
      tech: ['React', 'TypeScript', 'MongoDB', 'Tailwind'],
      date: 'Mar 2025',
      gradient: 'linear-gradient(135deg, #d29922 0%, #f59e0b 100%)',
    },
    {
      title: 'Celestial Object Classifier',
      subtitle: 'SDSS Dataset Analysis',
      category: 'ml',
      featured: false,
      description: 'Classified 10,000 celestial objects (stars, galaxies, quasars) with 99.07% accuracy using Neural Networks optimized via Keras Tuner.',
      stats: [
        { value: '99.07%', label: 'Accuracy' },
        { value: '10K', label: 'Objects' },
      ],
      tech: ['Keras', 'Keras Tuner', 'Scikit-learn', 'Pandas'],
      date: 'Nov 2024',
      gradient: 'linear-gradient(135deg, #58a6ff 0%, #79c0ff 100%)',
    },
    {
      title: 'NutriSnap',
      subtitle: 'AI Nutrition Tracker',
      category: 'ai',
      featured: false,
      description: 'Nutrition tracking app using Gemini API for food image analysis with 95% accurate nutrient estimates and interactive dashboards.',
      stats: [
        { value: '95%', label: 'Accuracy' },
        { value: '85%', label: 'Faster Logging' },
      ],
      tech: ['Flask', 'Gemini API', 'OpenCV', 'SQLite'],
      date: 'Aug 2025',
      gradient: 'linear-gradient(135deg, #3fb950 0%, #7ee787 100%)',
    },
    {
      title: 'Audio Visualizer',
      subtitle: 'Real-Time Music Visualization',
      category: 'web',
      featured: false,
      description: 'Interactive audio visualization with multiple dynamic modes. Reached 1000+ unique visitors within the first month.',
      stats: [
        { value: '1000+', label: 'Visitors' },
        { value: '55%', label: 'Engagement' },
      ],
      tech: ['TypeScript', 'Web Audio API', 'Canvas', 'shadcn/ui'],
      date: 'Aug 2025',
      gradient: 'linear-gradient(135deg, #f85149 0%, #ff7b72 100%)',
    },
  ]

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(p => p.category === filter)

  return (
    <section id="projects" className="projects section">
      <div className="section-container">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          ref={ref}
        >
          <span className="section-tag">
            <span>&lt;</span> projects <span>/&gt;</span>
          </span>
          <h2 className="section-title">Featured Projects</h2>
        </motion.div>

        {/* Filters */}
        <motion.div 
          className="project-filters"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {filters.map((f) => (
            <button
              key={f.id}
              className={`filter-btn ${filter === f.id ? 'active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </motion.div>

        {/* Projects Grid */}
        <motion.div className="projects-grid" layout>
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.title}
                className={`project-card ${project.featured ? 'featured' : ''}`}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                {project.badge && (
                  <div className="project-badge">
                    <Award size={14} />
                    {project.badge}
                  </div>
                )}
                
                <div className="project-visual" style={{ background: project.gradient }}>
                  <div className="project-visual-content">
                    <BarChart2 size={32} />
                  </div>
                </div>
                
                <div className="project-content">
                  <div className="project-header">
                    <span className="project-category">{project.category.toUpperCase()}</span>
                    <span className="project-date">{project.date}</span>
                  </div>
                  
                  <h3 className="project-title">{project.title}</h3>
                  <p className="project-subtitle">{project.subtitle}</p>
                  <p className="project-description">{project.description}</p>
                  
                  <div className="project-stats">
                    {project.stats.map((stat, i) => (
                      <div key={i} className="stat-item">
                        <span className="stat-value">{stat.value}</span>
                        <span className="stat-label">{stat.label}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="project-tech">
                    {project.tech.map((tech, i) => (
                      <span key={i} className="tech-tag">{tech}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* GitHub Link */}
        <motion.div 
          className="projects-cta"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
        >
          <a 
            href="https://github.com/prasad-gade05" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-outline"
          >
            <Github size={18} />
            View All Projects on GitHub
            <ExternalLink size={14} />
          </a>
        </motion.div>
      </div>
    </section>
  )
}

export default Projects
