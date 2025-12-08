import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { GraduationCap, Trophy, BookOpen } from 'lucide-react'
import './About.css'

const About = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  })

  const highlights = [
    { icon: GraduationCap, title: '9.4 CGPA', subtitle: 'Academic Excellence' },
    { icon: Trophy, title: 'Hackathon Winner', subtitle: '1st among 80+ teams' },
    { icon: BookOpen, title: 'Published Researcher', subtitle: 'IJIES Journal' },
  ]

  return (
    <section id="about" className="about section">
      <div className="section-container">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          ref={ref}
        >
          <span className="section-tag">
            <span>&lt;</span> about <span>/&gt;</span>
          </span>
          <h2 className="section-title">About Me</h2>
        </motion.div>

        <motion.div 
          className="about-content"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="about-intro">
            I'm a <span className="highlight">B.Tech Computer Engineering</span> student at 
            SPIT Mumbai with a Minor in Management from SPJIMR, passionate about leveraging 
            data to solve real-world problems.
          </p>
          
          <p>
            With experience in <span className="highlight">Data Analysis, Machine Learning, 
            and Full-Stack Development</span>, I specialize in building end-to-end data 
            pipelines and creating interactive visualizations that make complex insights 
            accessible to everyone.
          </p>
          
          <p>
            When I'm not training models or analyzing datasets, you'll find me leading teams 
            as a <span className="highlight">former General Secretary</span> of the Student 
            Council, organizing events, and contributing to open-source projects.
          </p>

          <div className="about-highlights">
            {highlights.map((item, index) => (
              <motion.div 
                key={index}
                className="highlight-card"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className="highlight-icon">
                  <item.icon size={24} />
                </div>
                <div className="highlight-text">
                  <strong>{item.title}</strong>
                  <span>{item.subtitle}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default About
