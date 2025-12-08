import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TypeAnimation } from 'react-type-animation'
import { 
  MapPin, Code, Briefcase, GraduationCap, Trophy, Award,
  ExternalLink, Folder, BarChart2
} from 'lucide-react'
import { FaGithub, FaLinkedin, FaKaggle, FaTwitter, FaInstagram, FaKeyboard, FaPython, FaJs, FaJava, FaReact, FaNodeJs, FaDocker, FaAws, FaLinux, FaGitAlt, FaDatabase } from 'react-icons/fa'
import { SiTypescript, SiCplusplus, SiPandas, SiNumpy, SiScikitlearn, SiPytorch, SiTensorflow, SiKeras, SiPlotly, SiFlask, SiFastapi, SiStreamlit, SiMongodb, SiSqlite, SiPostgresql, SiLangchain } from 'react-icons/si'
import { HiMail } from 'react-icons/hi'
import './Hero.css'

const Hero = () => {
  const [activeTab, setActiveTab] = useState('projects')

  const socialLinks = [
    { 
      icon: FaGithub, 
      href: 'https://github.com/prasad-gade05', 
      label: 'GitHub', 
      handle: '@prasad-gade05', 
      bgColor: '#161b22',
      accentColor: '#6e7681',
      stat: '15+',
      statLabel: 'repos',
      vibe: 'code'
    },
    { 
      icon: FaLinkedin, 
      href: 'https://www.linkedin.com/in/prasad-gade05/', 
      label: 'LinkedIn', 
      handle: 'prasad-gade05', 
      bgColor: '#1a1f2e',
      accentColor: '#58a6ff',
      stat: '500+',
      statLabel: 'connections',
      vibe: 'professional'
    },
    { 
      icon: FaKaggle, 
      href: 'https://kaggle.com/prasadgade', 
      label: 'Kaggle', 
      handle: 'prasadgade', 
      bgColor: '#1a2332',
      accentColor: '#58a6ff',
      stat: 'DS',
      statLabel: 'notebooks',
      vibe: 'data'
    },
    { 
      icon: FaKeyboard, 
      href: 'https://monkeytype.com/profile/prasad_gade05', 
      label: 'Monkeytype', 
      handle: 'prasad_gade05', 
      bgColor: '#1e1e1e',
      accentColor: '#8b949e',
      stat: '100+',
      statLabel: 'WPM',
      vibe: 'speed'
    },
    { 
      icon: FaTwitter, 
      href: 'https://twitter.com/prasad_gade05', 
      label: 'Twitter', 
      handle: '@prasad_gade05', 
      bgColor: '#1a1f2e',
      accentColor: '#6e7681',
      stat: 'X',
      statLabel: 'thoughts',
      vibe: 'social'
    },
    { 
      icon: FaInstagram, 
      href: 'https://instagram.com/prasad_gade05', 
      label: 'Instagram', 
      handle: '@prasad_gade05', 
      bgColor: '#1f1a1e',
      accentColor: '#8b949e',
      stat: 'IG',
      statLabel: 'moments',
      vibe: 'creative'
    },
    { 
      icon: HiMail, 
      href: 'mailto:prasadgade4405@gmail.com', 
      label: 'Email', 
      handle: 'prasadgade4405@gmail.com', 
      bgColor: '#1e1a1a',
      accentColor: '#8b949e',
      stat: 'Say',
      statLabel: 'hello!',
      vibe: 'contact'
    },
  ]

  const skillIcons = {
    'Python': FaPython, 'JavaScript': FaJs, 'TypeScript': SiTypescript, 'Java': FaJava, 'C++': SiCplusplus, 'SQL': FaDatabase,
    'Pandas': SiPandas, 'NumPy': SiNumpy, 'Scikit-Learn': SiScikitlearn, 'PyTorch': SiPytorch, 'TensorFlow': SiTensorflow, 'LangChain': SiLangchain, 'Keras': SiKeras,
    'Matplotlib': SiPlotly, 'Seaborn': SiPlotly, 'Power BI': BarChart2, 'Plotly': SiPlotly,
    'React': FaReact, 'Flask': SiFlask, 'FastAPI': SiFastapi, 'Node.js': FaNodeJs, 'Streamlit': SiStreamlit,
    'MongoDB': SiMongodb, 'SQLite': SiSqlite, 'ChromaDB': FaDatabase, 'PostgreSQL': SiPostgresql,
    'Git': FaGitAlt, 'Docker': FaDocker, 'AWS': FaAws, 'Linux': FaLinux,
  }

  const skills = {
    'Languages': ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'SQL'],
    'ML/DS': ['Pandas', 'NumPy', 'Scikit-Learn', 'PyTorch', 'TensorFlow', 'LangChain', 'Keras'],
    'Visualization': ['Matplotlib', 'Seaborn', 'Power BI', 'Plotly'],
    'Web': ['React', 'Flask', 'FastAPI', 'Node.js', 'Streamlit'],
    'Databases': ['MongoDB', 'SQLite', 'ChromaDB', 'PostgreSQL'],
    'DevOps': ['Git', 'Docker', 'AWS', 'Linux'],
  }

  const experience = {
    title: 'Data Analyst Intern',
    company: 'R3 Systems India Pvt. Ltd.',
    date: 'Jun - Jul 2023',
    points: ['Power BI dashboards', 'Business Intelligence', '70% improved data visibility'],
    tags: ['Power BI', 'Data Analysis', 'BI']
  }

  const education = [
    { degree: 'B.Tech Computer Engineering', school: 'SPIT Mumbai', minor: 'Minor: Management @ SPJIMR', date: 'Expected 2027', grade: '9.4 CGPA' },
    { degree: 'Diploma in Computer Technology', school: 'K. K. Wagh Polytechnic', date: '2021 - 2024', grade: '96.51%' },
  ]

  const achievements = [
    { title: '1st Place - Tech Horizon Hackathon', desc: '80+ teams', date: 'Mar 2025', color: '#d29922' },
    { title: 'General Secretary - Student Council', desc: 'Led Sparsh 2024', date: '2023-24', color: '#58a6ff' },
    { title: 'Published Researcher', desc: 'IJIES Journal', date: 'Apr 2024', color: '#3fb950' },
  ]

  const certifications = [
    { name: 'Data Science Job Simulation', org: 'BCG', date: 'Jan 2025' },
    { name: 'Developer & Tech Simulation', org: 'Accenture', date: 'Jan 2025' },
    { name: 'Cloud Computing on AWS', org: 'Udemy', date: 'Jul 2024' },
    { name: 'Java Training', org: 'IIT Bombay', date: 'Mar 2024' },
    { name: 'Intro to ML', org: 'Infosys', date: 'Nov 2022' },
  ]

  const projects = [
    {
      title: 'Lex Simulacra',
      subtitle: 'AI Legal Courtroom Simulator',
      category: 'AI',
      stats: '99% accuracy',
      tech: ['LangChain', 'FastAPI', 'ChromaDB'],
      gradient: 'linear-gradient(135deg, #58a6ff 0%, #3fb950 100%)',
    },
    {
      title: 'Intrusion Detection',
      subtitle: 'ML/DL Comparative Analysis',
      category: 'ML',
      stats: '99.99% recall',
      tech: ['XGBoost', 'PyTorch', 'SHAP'],
      gradient: 'linear-gradient(135deg, #3fb950 0%, #58a6ff 100%)',
    },
    {
      title: 'KindHearts',
      subtitle: 'Donation Platform',
      category: 'Web',
      badge: '1st Place',
      stats: '80+ teams',
      tech: ['React', 'TypeScript', 'MongoDB'],
      gradient: 'linear-gradient(135deg, #d29922 0%, #f59e0b 100%)',
    },
    {
      title: 'Celestial Classifier',
      subtitle: 'SDSS Dataset Analysis',
      category: 'ML',
      stats: '99.07% accuracy',
      tech: ['Keras', 'Scikit-learn'],
      gradient: 'linear-gradient(135deg, #58a6ff 0%, #79c0ff 100%)',
    },
    {
      title: 'NutriSnap',
      subtitle: 'AI Nutrition Tracker',
      category: 'AI',
      stats: '95% accuracy',
      tech: ['Flask', 'Gemini API', 'OpenCV'],
      gradient: 'linear-gradient(135deg, #3fb950 0%, #7ee787 100%)',
    },
    {
      title: 'Audio Visualizer',
      subtitle: 'Real-Time Music Viz',
      category: 'Web',
      stats: '1000+ visitors',
      tech: ['TypeScript', 'Web Audio', 'Canvas'],
      gradient: 'linear-gradient(135deg, #f85149 0%, #ff7b72 100%)',
    },
  ]

  const tabs = [
    { id: 'projects', label: 'Projects', icon: Folder },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'certifications', label: 'Certs', icon: Award },
  ]

  return (
    <section className="hero">
      <div className="hero-grid">
        {/* Left Column - Name First, then Code Card, then Social */}
        <div className="hero-left">
          {/* Info Section - Top */}
          <motion.div 
            className="info-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="info-header">
              <div className="status-badge">
                <span className="status-dot"></span>
                <span>Open to Work</span>
              </div>
              <div className="location">
                <MapPin size={12} />
                <span>Mumbai, India</span>
              </div>
            </div>

            <h1 className="name">Prasad Gade</h1>
            
            <div className="role-typing">
              <TypeAnimation
                sequence={['Data Scientist', 2000, 'ML Engineer', 2000, 'Data Storyteller', 2000]}
                wrapper="span"
                repeat={Infinity}
              />
            </div>

            <p className="bio">
              B.Tech CE @ SPIT · Minor @ SPJIMR · Former Gen Sec · Transforming data into insights
            </p>
          </motion.div>

          {/* Code Card - Middle */}
          <motion.div 
            className="code-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="code-header">
              <div className="code-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <span className="code-filename">prasad_gade.py</span>
            </div>
            <pre className="code-content">
              <code>
                <span className="line"><span className="ln">1</span><span className="kw">class</span> <span className="cls">DataScientist</span><span className="p">:</span></span>
                <span className="line"><span className="ln">2</span><span className="kw">    def</span> <span className="fn">__init__</span><span className="p">(</span><span className="sf">self</span><span className="p">):</span></span>
                <span className="line"><span className="ln">3</span><span className="sf">        self</span><span className="p">.</span><span className="pr">name</span> <span className="op">=</span> <span className="st">"Prasad Gade"</span></span>
                <span className="line"><span className="ln">4</span><span className="sf">        self</span><span className="p">.</span><span className="pr">roles</span> <span className="op">=</span> <span className="p">[</span></span>
                <span className="line"><span className="ln">5</span>            <span className="st">"Data Scientist"</span><span className="p">,</span></span>
                <span className="line"><span className="ln">6</span>            <span className="st">"ML Engineer"</span><span className="p">,</span></span>
                <span className="line"><span className="ln">7</span>            <span className="st">"Data Analyst"</span><span className="p">,</span></span>
                <span className="line"><span className="ln">8</span>            <span className="st">"Computer Engineer"</span></span>
                <span className="line"><span className="ln">9</span><span className="sf">        </span><span className="p">]</span></span>
                <span className="line"><span className="ln">10</span><span className="sf">        self</span><span className="p">.</span><span className="pr">passion</span> <span className="op">=</span> <span className="st">"Data Storytelling"</span></span>
                <span className="line"><span className="ln">11</span><span className="sf">        self</span><span className="p">.</span><span className="pr">skills</span> <span className="op">=</span> <span className="p">[</span><span className="st">"Python"</span><span className="p">,</span> <span className="st">"ML"</span><span className="p">,</span> <span className="st">"AI"</span><span className="p">]</span></span>
                <span className="line"><span className="ln">12</span></span>
                <span className="line"><span className="ln">13</span><span className="kw">    def</span> <span className="fn">transform</span><span className="p">(</span><span className="sf">self</span><span className="p">,</span> <span className="pm">data</span><span className="p">):</span></span>
                <span className="line"><span className="ln">14</span><span className="kw">        return</span> <span className="sf">self</span><span className="p">.</span><span className="fn">insights</span><span className="p">(</span><span className="pm">data</span><span className="p">)</span></span>
              </code>
            </pre>
          </motion.div>

          {/* Social Cards - Bottom */}
          <motion.div 
            className="social-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="social-cards-grid">
              {socialLinks.map((link, idx) => (
                <motion.a 
                  key={idx}
                  href={link.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`social-card-fun social-${link.vibe}`}
                  style={{ 
                    '--card-bg': link.bgColor,
                    '--card-accent': link.accentColor
                  }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="social-card-content">
                    <div className="social-icon-wrap">
                      <link.icon className="social-icon" />
                    </div>
                    <div className="social-details">
                      <span className="social-platform">{link.label}</span>
                      <span className="social-handle">{link.handle}</span>
                    </div>
                    <div className="social-stat">
                      <span className="stat-value">{link.stat}</span>
                      <span className="stat-label">{link.statLabel}</span>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column - Tabbed Content */}
        <motion.div 
          className="hero-right"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* Tab Headers */}
          <div className="tabs-header">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={12} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="tabs-content">
            <AnimatePresence mode="wait">
              {activeTab === 'projects' && (
                <motion.div 
                  key="projects"
                  className="tab-pane projects-pane"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="projects-grid">
                    {projects.map((project, i) => (
                      <div key={i} className="project-card">
                        {project.badge && (
                          <span className="project-badge">{project.badge}</span>
                        )}
                        <div className="project-header" style={{ background: project.gradient }}>
                          <BarChart2 size={18} />
                        </div>
                        <div className="project-body">
                          <div className="project-meta">
                            <span className="project-cat">{project.category}</span>
                            <span className="project-stats">{project.stats}</span>
                          </div>
                          <h3 className="project-title">{project.title}</h3>
                          <p className="project-subtitle">{project.subtitle}</p>
                          <div className="project-tech">
                            {project.tech.map((t, j) => (
                              <span key={j} className="tech-tag">{t}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <a 
                    href="https://github.com/prasad-gade05" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="view-all-btn"
                  >
                    <FaGithub size={14} />
                    <span>View All on GitHub</span>
                    <ExternalLink size={12} />
                  </a>
                </motion.div>
              )}

              {activeTab === 'skills' && (
                <motion.div 
                  key="skills"
                  className="tab-pane skills-pane"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="skills-compact">
                    {Object.entries(skills).map(([category, items]) => (
                      <div key={category} className="skill-group">
                        <span className="skill-category">{category}</span>
                        <div className="skill-items">
                          {items.map((skill, i) => {
                            const IconComp = skillIcons[skill]
                            return (
                              <span key={i} className="skill-chip">
                                {IconComp && <IconComp size={12} />}
                                {skill}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'experience' && (
                <motion.div 
                  key="experience"
                  className="tab-pane experience-pane"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="exp-card">
                    <div className="exp-header">
                      <div>
                        <h3>{experience.title}</h3>
                        <p className="exp-company">{experience.company}</p>
                      </div>
                      <span className="exp-date">{experience.date}</span>
                    </div>
                    <ul className="exp-points">
                      {experience.points.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                    <div className="exp-tags">
                      {experience.tags.map((tag, i) => (
                        <span key={i} className="exp-tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'education' && (
                <motion.div 
                  key="education"
                  className="tab-pane education-pane"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="edu-list">
                    {education.map((edu, i) => (
                      <div key={i} className="edu-item">
                        <div className="edu-main">
                          <h3>{edu.degree}</h3>
                          <p>{edu.school}</p>
                          {edu.minor && <p className="edu-minor">{edu.minor}</p>}
                        </div>
                        <div className="edu-meta">
                          <span className="edu-date">{edu.date}</span>
                          <span className="edu-grade">{edu.grade}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'achievements' && (
                <motion.div 
                  key="achievements"
                  className="tab-pane achievements-pane"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="achieve-list">
                    {achievements.map((ach, i) => (
                      <div key={i} className="achieve-item" style={{ '--accent': ach.color }}>
                        <div className="achieve-dot"></div>
                        <div className="achieve-content">
                          <h3>{ach.title}</h3>
                          <p>{ach.desc}</p>
                        </div>
                        <span className="achieve-date">{ach.date}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'certifications' && (
                <motion.div 
                  key="certifications"
                  className="tab-pane certs-pane"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="certs-grid">
                    {certifications.map((cert, i) => (
                      <div key={i} className="cert-item">
                        <div className="cert-badge">{cert.org.slice(0, 3).toUpperCase()}</div>
                        <div className="cert-info">
                          <span className="cert-name">{cert.name}</span>
                          <span className="cert-org">{cert.org}</span>
                        </div>
                        <span className="cert-date">{cert.date}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero
