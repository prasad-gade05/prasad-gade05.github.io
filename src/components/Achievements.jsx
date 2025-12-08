import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Trophy, Users, FileText, Award } from 'lucide-react'
import './Achievements.css'

const Achievements = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  const achievements = [
    {
      icon: Trophy,
      title: '1st Place - Tech Horizon Hackathon',
      description: 'Secured 1st place among 80+ national teams in a 36-hour hackathon',
      date: 'March 2025',
      color: '#d29922',
      gradient: 'linear-gradient(135deg, #d29922 0%, #f59e0b 100%)',
    },
    {
      icon: Users,
      title: 'General Secretary - Student Council',
      description: 'Led organization of "Sparsh 2024" celebrating 350th anniversary of Chhatrapati Shivaji Maharaj\'s coronation',
      date: 'Aug 2023 - June 2024',
      color: '#58a6ff',
      gradient: 'linear-gradient(135deg, #58a6ff 0%, #3fb950 100%)',
    },
    {
      icon: FileText,
      title: 'Published Researcher',
      description: 'Published ML research paper in IJIES Journal on healthcare predictions',
      date: 'April 2024',
      color: '#3fb950',
      gradient: 'linear-gradient(135deg, #3fb950 0%, #58a6ff 100%)',
    },
  ]

  const certifications = [
    { name: 'Data Science Job Simulation', org: 'BCG (Forage)', date: 'Jan 2025' },
    { name: 'Developer & Technology Simulation', org: 'Accenture UK (Forage)', date: 'Jan 2025' },
    { name: 'Cloud Computing on AWS', org: 'Udemy', date: 'Jul 2024' },
    { name: 'Java Training', org: 'IIT Bombay', date: 'Mar 2024' },
    { name: 'Introduction to Machine Learning', org: 'Infosys', date: 'Nov 2022' },
  ]

  return (
    <section id="achievements" className="achievements section">
      <div className="section-container">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          ref={ref}
        >
          <span className="section-tag">
            <span>&lt;</span> achievements <span>/&gt;</span>
          </span>
          <h2 className="section-title">Achievements & Certifications</h2>
        </motion.div>

        {/* Achievements */}
        <div className="achievements-grid">
          {achievements.map((achievement, index) => (
            <motion.div 
              key={index}
              className="achievement-card"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              style={{ '--accent-color': achievement.color }}
            >
              <div 
                className="achievement-icon"
                style={{ background: achievement.gradient }}
              >
                <achievement.icon size={28} />
              </div>
              <h3>{achievement.title}</h3>
              <p>{achievement.description}</p>
              <span className="achievement-date">{achievement.date}</span>
            </motion.div>
          ))}
        </div>

        {/* Certifications */}
        <motion.div 
          className="certifications"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h3 className="certifications-title">
            <Award size={20} />
            Certifications
          </h3>
          <div className="cert-grid">
            {certifications.map((cert, index) => (
              <motion.div 
                key={index}
                className="cert-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
              >
                <div className="cert-logo">
                  {cert.org.split(' ')[0].substring(0, 3).toUpperCase()}
                </div>
                <div className="cert-content">
                  <h4>{cert.name}</h4>
                  <p>{cert.org}</p>
                  <span className="cert-date">{cert.date}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Achievements
