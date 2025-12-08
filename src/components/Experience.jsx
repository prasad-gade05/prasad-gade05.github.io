import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { MapPin, Calendar } from 'lucide-react'
import './Experience.css'

const Experience = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  const experiences = [
    {
      title: 'Data Analyst Intern',
      company: 'R3 Systems India Pvt. Ltd.',
      location: 'Nashik, India',
      date: 'June 2023 - July 2023',
      description: [
        'Learned Data Analysis and Business Intelligence using Power BI',
        'Developed various BI dashboards using real company datasets',
        'Delivered a sales dashboard for North Wind Traders, improving data visibility by 70%',
      ],
      tags: ['Power BI', 'Data Analysis', 'Business Intelligence', 'Dashboard Design'],
    },
  ]

  return (
    <section id="experience" className="experience section">
      <div className="section-container">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          ref={ref}
        >
          <span className="section-tag">
            <span>&lt;</span> experience <span>/&gt;</span>
          </span>
          <h2 className="section-title">Experience</h2>
        </motion.div>

        <div className="timeline">
          {experiences.map((exp, index) => (
            <motion.div 
              key={index}
              className="timeline-item"
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.2 }}
            >
              <div className="timeline-marker">
                <div className="marker-dot" />
                <div className="marker-line" />
              </div>
              
              <div className="timeline-content">
                <div className="timeline-header">
                  <div className="timeline-meta">
                    <span className="timeline-date">
                      <Calendar size={14} />
                      {exp.date}
                    </span>
                    <span className="timeline-location">
                      <MapPin size={14} />
                      {exp.location}
                    </span>
                  </div>
                </div>
                
                <h3 className="timeline-title">{exp.title}</h3>
                <h4 className="timeline-company">{exp.company}</h4>
                
                <ul className="timeline-details">
                  {exp.description.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                
                <div className="timeline-tags">
                  {exp.tags.map((tag, i) => (
                    <span key={i} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Experience
