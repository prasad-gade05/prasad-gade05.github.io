import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { GraduationCap, BookOpen } from 'lucide-react'
import './Education.css'

const Education = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  const education = [
    {
      icon: GraduationCap,
      degree: 'B.Tech in Computer Engineering',
      school: "Bhartiya Vidya Bhavan's SPIT, Mumbai",
      minor: 'Minor in Management - SPJIMR',
      date: 'Expected June 2027',
      grade: 'CGPA: 9.4/10.0',
    },
    {
      icon: BookOpen,
      degree: 'Diploma in Computer Technology',
      school: 'K. K. Wagh Polytechnic, Nashik',
      minor: null,
      date: 'Aug 2021 - June 2024',
      grade: 'Grade: 96.51%',
    },
  ]

  return (
    <section id="education" className="education section">
      <div className="section-container">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          ref={ref}
        >
          <span className="section-tag">
            <span>&lt;</span> education <span>/&gt;</span>
          </span>
          <h2 className="section-title">Education</h2>
        </motion.div>

        <div className="education-grid">
          {education.map((edu, index) => (
            <motion.div 
              key={index}
              className="edu-card"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.2 }}
            >
              <div className="edu-icon">
                <edu.icon size={28} />
              </div>
              <div className="edu-content">
                <h3>{edu.degree}</h3>
                <p className="edu-school">{edu.school}</p>
                {edu.minor && <p className="edu-minor">{edu.minor}</p>}
                <div className="edu-meta">
                  <span className="edu-date">{edu.date}</span>
                  <span className="edu-grade">{edu.grade}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Education
