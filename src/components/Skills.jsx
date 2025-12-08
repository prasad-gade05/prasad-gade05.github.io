import { useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import './Skills.css'

const Skills = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  const [activeStage, setActiveStage] = useState(0)

  const pipeline = [
    { icon: '📥', label: 'Raw Data', color: '#58a6ff' },
    { icon: '⚙️', label: 'Processing', color: '#3fb950' },
    { icon: '🧠', label: 'ML Model', color: '#58a6ff' },
    { icon: '📊', label: 'Insights', color: '#3fb950' },
  ]

  const skillCategories = [
    {
      title: 'Languages',
      icon: '🐍',
      skills: ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'SQL']
    },
    {
      title: 'ML / Data Science',
      icon: '🤖',
      skills: ['Pandas', 'NumPy', 'Scikit-Learn', 'PyTorch', 'TensorFlow', 'LangChain', 'Keras', 'OpenCV']
    },
    {
      title: 'Visualization',
      icon: '📈',
      skills: ['Matplotlib', 'Seaborn', 'Power BI', 'Recharts', 'Plotly']
    },
    {
      title: 'Web & Frameworks',
      icon: '🌐',
      skills: ['React', 'Flask', 'FastAPI', 'Node.js', 'Streamlit', 'Django']
    },
    {
      title: 'Databases',
      icon: '🗄️',
      skills: ['MongoDB', 'SQLite', 'ChromaDB', 'Firebase', 'PostgreSQL']
    },
    {
      title: 'Tools & DevOps',
      icon: '🛠️',
      skills: ['Git', 'GitHub', 'Linux', 'Docker', 'AWS']
    },
  ]

  // Animate pipeline stages
  useState(() => {
    const interval = setInterval(() => {
      setActiveStage(prev => (prev + 1) % pipeline.length)
    }, 800)
    return () => clearInterval(interval)
  }, [])

  return (
    <section id="skills" className="skills section">
      <div className="section-container">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          ref={ref}
        >
          <span className="section-tag">
            <span>&lt;</span> skills <span>/&gt;</span>
          </span>
          <h2 className="section-title">Tech Stack</h2>
        </motion.div>

        {/* Data Pipeline Animation */}
        <motion.div 
          className="data-pipeline"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {pipeline.map((stage, index) => (
            <div key={index} className="pipeline-item">
              <motion.div 
                className={`pipeline-stage ${activeStage === index ? 'active' : ''}`}
                style={{ '--stage-color': stage.color }}
                animate={activeStage === index ? { scale: 1.05 } : { scale: 1 }}
              >
                <span className="stage-icon">{stage.icon}</span>
                <span className="stage-label">{stage.label}</span>
              </motion.div>
              {index < pipeline.length - 1 && (
                <div className="pipeline-connector">
                  <motion.div 
                    className="connector-fill"
                    animate={{
                      scaleX: activeStage > index ? 1 : 0,
                      opacity: activeStage > index ? 1 : 0.3
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </div>
          ))}
        </motion.div>

        {/* Skills Grid */}
        <div className="skills-grid">
          {skillCategories.map((category, catIndex) => (
            <motion.div 
              key={catIndex}
              className="skill-card"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + catIndex * 0.1 }}
            >
              <div className="skill-card-header">
                <span className="category-icon">{category.icon}</span>
                <h3>{category.title}</h3>
              </div>
              <div className="skill-tags">
                {category.skills.map((skill, skillIndex) => (
                  <span key={skillIndex} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Skills
