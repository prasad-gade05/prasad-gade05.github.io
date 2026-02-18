import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder,
  Code,
  Briefcase,
  GraduationCap,
  Trophy,
  Award,
  Heart,
  Music,
  Sun,
  Moon,
  ExternalLink,
  Gamepad2,
  Tv,
  Headphones,
  Joystick,
} from "lucide-react";
import { FaGithub, FaSpotify } from "react-icons/fa";
import { GiCricketBat, GiBookCover } from "react-icons/gi";
import { MdMovie } from "react-icons/md";
import { TbBrandMinecraft } from "react-icons/tb";
import "../../components/hero/MoviesModal.css";

const MoviesModal = lazy(() => import("./MoviesModal"));

// Data Imports
import {
  projectIcons,
  skills,
  skillIcons,
  experience,
  education,
  achievements,
  certifications,
  volunteering,
  hobbies,
  projects,
  movies,
  webShows
} from "../../data/portfolioData";

const ContentTabs = ({ onOpenMinecraft }) => {
  const [activeTabs, setActiveTabs] = useState(["projects"]);
  const themeOrder = ['dark', 'light', 'arcade-dark', 'arcade-light'];
  const [theme, setTheme] = useState('dark');
  const [isMoviesModalOpen, setIsMoviesModalOpen] = useState(false);

  const handleCardTilt = useCallback((e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const MAX_ROTATION = 25;
    const rotateY = ((x - centerX) / centerX) * MAX_ROTATION;
    const rotateX = ((centerY - y) / centerY) * MAX_ROTATION;
    card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
  }, []);

  const handleCardTiltReset = useCallback((e) => {
    e.currentTarget.style.transform = '';
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const getNextTheme = (current) => {
    const currentIndex = themeOrder.indexOf(current);
    return themeOrder[(currentIndex + 1) % themeOrder.length];
  };

  const toggleTheme = (e) => {
    if (!document.startViewTransition) {
      setTheme(prev => getNextTheme(prev));
      return;
    }

    const x = e.clientX;
    const y = e.clientY;
    
    const right = window.innerWidth - x;
    const bottom = window.innerHeight - y;
    const maxRadius = Math.hypot(
      Math.max(x, right),
      Math.max(y, bottom)
    );

    const transition = document.startViewTransition(() => {
      setTheme(prev => getNextTheme(prev));
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 500,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'dark': return <Sun size={16} />;
      case 'light': return <Moon size={16} />;
      case 'arcade-dark': return <Joystick size={16} />;
      case 'arcade-light': return <Moon size={16} />;
      default: return <Sun size={16} />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'dark': return 'Light';
      case 'light': return 'Arcade Dark';
      case 'arcade-dark': return 'Arcade Light';
      case 'arcade-light': return 'Dark';
      default: return 'Light';
    }
  };

  const tabs = [
    { id: "projects", label: "Projects", icon: Folder },
    { id: "skills", label: "Skills", icon: Code },
    {
      id: "experience",
      label: "Experience",
      icon: Briefcase,
      splitGroup: "exp-edu",
    },
    {
      id: "education",
      label: "Education",
      icon: GraduationCap,
      splitGroup: "exp-edu",
    },
    {
      id: "achievements",
      label: "Achievements",
      icon: Trophy,
      splitGroup: "ach-cert",
    },
    {
      id: "certifications",
      label: "Certs",
      icon: Award,
      splitGroup: "ach-cert",
    },
    {
      id: "volunteering",
      label: "Volunteer",
      icon: Heart,
      splitGroup: "vol-hob",
    },
    { id: "hobbies", label: "Hobbies", icon: Music, splitGroup: "vol-hob" },
  ];

  const splitGroups = {
    "exp-edu": ["experience", "education"],
    "ach-cert": ["achievements", "certifications"],
    "vol-hob": ["volunteering", "hobbies"],
  };

  const handleTabClick = (tab) => {
    if (tab.splitGroup && splitGroups[tab.splitGroup]) {
      setActiveTabs(splitGroups[tab.splitGroup]);
    } else {
      setActiveTabs([tab.id]);
    }
  };

  const isTabActive = (tab) => {
    return activeTabs.includes(tab.id);
  };

  return (
    <motion.div
      className="hero-right"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div className="tabs-header">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${isTabActive(tab) ? "active" : ""}`}
            onClick={() => handleTabClick(tab)}
          >
            <tab.icon size={14} />
            <span>{tab.label}</span>
          </button>
        ))}
        <button
          className={`theme-toggle-tab ${theme.startsWith('arcade') ? 'arcade-active' : ''}`}
          onClick={toggleTheme}
          aria-label={`Switch to ${getThemeLabel()} theme`}
          title={`Switch to ${getThemeLabel()}`}
        >
          {getThemeIcon()}
        </button>
      </div>

      <div
        className={`tabs-content ${
          activeTabs.length > 1 ? "split-view" : ""
        }`}
      >
        <AnimatePresence mode="wait">
          {activeTabs.includes("projects") && (
            <motion.div
              key="projects"
              className="tab-pane projects-pane"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
            >
              <div className="projects-grid">
                {projects.map((project, i) => {
                  const ProjectIcon = projectIcons[project.title] || Folder;
                  return (
                    <div
                      key={i}
                      className="project-card"
                      onMouseMove={handleCardTilt}
                      onMouseLeave={handleCardTiltReset}
                    >
                      {project.badge && (
                        <span className={`project-badge${project.badge === "1st Place" ? " first-place" : ""}`}>
                          {project.badge}
                        </span>
                      )}
                      <div className="project-header">
                        <ProjectIcon size={20} />
                      </div>
                      <div className="project-body">
                        <div className="project-meta">
                          <span className="project-cat">
                            {project.category}
                          </span>
                          <span className="project-stats">
                            {project.stats}
                          </span>
                        </div>
                        <h3 className="project-title">{project.title}</h3>
                        <p className="project-subtitle">
                          {project.subtitle}
                        </p>
                        {project.description && (
                          <p className="project-desc">
                            {project.description}
                          </p>
                        )}
                        <div className="project-tech">
                          {project.tech.map((t, j) => (
                            <span key={j} className="tech-tag">
                              {t}
                            </span>
                          ))}
                        </div>
                        <div className="project-card-links">
                          {project.github && (
                            <a
                              href={project.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="project-card-link"
                            >
                              <FaGithub size={14} />
                            </a>
                          )}
                          {project.demo && (
                            <a
                              href={project.demo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="project-card-link demo"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
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

          {activeTabs.includes("skills") && (
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
                  <div key={category} className="skill-group"
                    onMouseMove={handleCardTilt}
                    onMouseLeave={handleCardTiltReset}
                  >
                    <span className="skill-category">{category}</span>
                    <div className="skill-items">
                      {items.map((skill, i) => {
                        const IconComp = skillIcons[skill];
                        return (
                          <span key={i} className="skill-chip">
                            {IconComp && <IconComp size={14} />}
                            {skill}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTabs.includes("experience") && (
            <motion.div
              key="experience"
              className={`tab-pane experience-pane ${
                activeTabs.length > 1 ? "split" : ""
              }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
            >
              <div className="pane-header">
                <Briefcase size={16} />
                <span>Experience</span>
              </div>
              <div className="exp-card"
                onMouseMove={handleCardTilt}
                onMouseLeave={handleCardTiltReset}
              >
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
                    <span key={i} className="exp-tag">
                      {tag}
                    </span>
                  ))}
                </div>
                {experience.certificateLink && (
                  <a
                    href={experience.certificateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="exp-cert-link"
                  >
                    <ExternalLink size={12} />
                    View Certificate
                  </a>
                )}
              </div>
            </motion.div>
          )}

          {activeTabs.includes("education") && (
            <motion.div
              key="education"
              className={`tab-pane education-pane ${
                activeTabs.length > 1 ? "split" : ""
              }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
            >
              <div className="pane-header">
                <GraduationCap size={16} />
                <span>Education</span>
              </div>
              <div className="edu-list">
                {education.map((edu, i) => (
                  <div key={i} className="edu-item"
                    onMouseMove={handleCardTilt}
                    onMouseLeave={handleCardTiltReset}
                  >
                    <div className="edu-main">
                      <h3>{edu.degree}</h3>
                      <p>{edu.school}</p>
                      {edu.minor && (
                        <p className="edu-minor">{edu.minor}</p>
                      )}
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

          {activeTabs.includes("achievements") && (
            <motion.div
              key="achievements"
              className={`tab-pane achievements-pane ${
                activeTabs.length > 1 ? "split" : ""
              }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
            >
              <div className="pane-header">
                <Trophy size={16} />
                <span>Achievements</span>
              </div>
              <div className="achieve-list">
                {achievements.map((ach, i) => (
                  <div
                    key={i}
                    className="achieve-item"
                    style={{ "--accent": ach.color }}
                    onMouseMove={handleCardTilt}
                    onMouseLeave={handleCardTiltReset}
                  >
                    <div className="achieve-dot"></div>
                    <div className="achieve-content">
                      <h3>{ach.title}</h3>
                      <p>{ach.desc}</p>
                      {ach.link && (
                        <a
                          href={ach.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="achieve-link"
                        >
                          <ExternalLink size={10} />
                          {ach.linkText || "View Certificate"}
                        </a>
                      )}
                    </div>
                    <span className="achieve-date">{ach.date}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTabs.includes("certifications") && (
            <motion.div
              key="certifications"
              className={`tab-pane certs-pane ${
                activeTabs.length > 1 ? "split" : ""
              }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
            >
              <div className="pane-header">
                <Award size={16} />
                <span>Certifications</span>
              </div>
              <div className="certs-grid">
                {certifications.map((cert, i) => (
                  <div key={i} className="cert-item"
                    onMouseMove={handleCardTilt}
                    onMouseLeave={handleCardTiltReset}
                  >
                    <div className="cert-badge">
                      {cert.org.slice(0, 3).toUpperCase()}
                    </div>
                    <div className="cert-info">
                      <span className="cert-name">{cert.name}</span>
                      <span className="cert-org">{cert.org}</span>
                    </div>
                    <div className="cert-actions">
                      <span className="cert-date">{cert.date}</span>
                      {cert.link && (
                        <a
                          href={cert.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cert-link"
                        >
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTabs.includes("volunteering") && (
            <motion.div
              key="volunteering"
              className={`tab-pane volunteering-pane ${
                activeTabs.length > 1 ? "split" : ""
              }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
            >
              <div className="pane-header">
                <Heart size={16} />
                <span>Volunteering</span>
              </div>
              <div className="volunteer-list">
                {volunteering.map((vol, i) => (
                  <div key={i} className="volunteer-item"
                    onMouseMove={handleCardTilt}
                    onMouseLeave={handleCardTiltReset}
                  >
                    <div className="volunteer-icon">
                      <Heart size={16} />
                    </div>
                    <div className="volunteer-content">
                      <h3>{vol.title}</h3>
                      <p className="volunteer-org">{vol.organization}</p>
                      <p className="volunteer-location">{vol.location}</p>
                      <div className="volunteer-meta">
                        <span className="volunteer-date">{vol.date}</span>
                        {vol.certificateLink && (
                          <a
                            href={vol.certificateLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="volunteer-cert-link"
                          >
                            <ExternalLink size={10} />
                            View Certificate
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTabs.includes("hobbies") && (
            <motion.div
              key="hobbies"
              className={`tab-pane hobbies-pane ${
                activeTabs.length > 1 ? "split" : ""
              }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
            >
              <div className="pane-header">
                <Music size={16} />
                <span>Hobbies & Interests</span>
              </div>
              <div className="hobbies-grid">
                <div className="hobby-card hobby-sports"
                  onMouseMove={handleCardTilt}
                  onMouseLeave={handleCardTiltReset}
                >
                  <div className="hobby-card-header">
                    <div className="hobby-card-icon">
                      <Gamepad2 size={20} />
                    </div>
                    <h4>Sports & Gaming</h4>
                  </div>
                  <div className="hobby-card-content">
                    <div className="hobby-activities">
                      <div className="hobby-activity-item">
                        <GiCricketBat size={18} />
                        <span>{hobbies.sports.cricket}</span>
                      </div>
                      <div 
                        className="hobby-activity-item minecraft-clickable"
                        onClick={onOpenMinecraft}
                      >
                        <TbBrandMinecraft size={18} />
                        <span>{hobbies.sports.minecraft}</span>
                      </div>
                    </div>
                  </div>
                  <div className="hobby-card-decoration"></div>
                </div>

                <div className="hobby-card hobby-reading"
                  onMouseMove={handleCardTilt}
                  onMouseLeave={handleCardTiltReset}
                >
                  <div className="hobby-card-header">
                    <div className="hobby-card-icon">
                      <GiBookCover size={20} />
                    </div>
                    <h4>Currently Reading</h4>
                  </div>
                  <div className="hobby-card-content">
                    <div className="book-info">
                      <span className="book-title">
                        {hobbies.book.title}
                      </span>
                      <span className="book-author">
                        by {hobbies.book.author}
                      </span>
                    </div>
                  </div>
                  <div className="hobby-card-decoration"></div>
                </div>

                <div className="hobby-card hobby-music"
                  onMouseMove={handleCardTilt}
                  onMouseLeave={handleCardTiltReset}
                >
                  <div className="hobby-card-header">
                    <div className="hobby-card-icon">
                      <Headphones size={20} />
                    </div>
                    <h4>Favorite Tracks</h4>
                    <div className="equalizer">
                      <span className="bar"></span>
                      <span className="bar"></span>
                      <span className="bar"></span>
                      <span className="bar"></span>
                    </div>
                  </div>
                  <div className="hobby-card-content">
                    <div className="hobby-songs">
                      {hobbies.songs.map((song, i) => (
                        <a
                          key={i}
                          href={song.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="song-link"
                        >
                          <FaSpotify size={14} />
                          <span>{song.name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                  <div className="hobby-card-decoration"></div>
                </div>

                <div className="hobby-card hobby-series"
                  onMouseMove={handleCardTilt}
                  onMouseLeave={handleCardTiltReset}
                >
                  <div className="hobby-card-header">
                    <div className="hobby-card-icon">
                      <Tv size={20} />
                    </div>
                    <h4>Binge Watching</h4>
                  </div>
                  <div className="hobby-card-content">
                    <div className="hobby-tags">
                      {hobbies.series.map((series, i) => (
                        <span key={i} className="series-tag">
                          <MdMovie size={14} />
                          {series}
                        </span>
                      ))}
                    </div>
                    <button 
                      className="see-more-btn"
                      onClick={() => setIsMoviesModalOpen(true)}
                    >
                      <MdMovie size={14} />
                      <span>See All Movies & Shows</span>
                    </button>
                  </div>
                  <div className="hobby-card-decoration"></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Suspense fallback={null}>
        {isMoviesModalOpen && (
          <MoviesModal 
            isOpen={isMoviesModalOpen}
            onClose={() => setIsMoviesModalOpen(false)}
            movies={movies}
            shows={webShows}
          />
        )}
      </Suspense>
    </motion.div>
  );
};

export default ContentTabs;
