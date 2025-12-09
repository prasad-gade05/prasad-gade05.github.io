import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import {
  MapPin,
  Code,
  Briefcase,
  GraduationCap,
  Trophy,
  Award,
  ExternalLink,
  Folder,
  Heart,
  Music,
  FileText,
  Gamepad2,
  Book,
  Tv,
  Headphones,
  Brain,
  Shield,
  Star,
  Globe,
  Rocket,
  Zap,
  Database,
  BarChart3,
} from "lucide-react";
import {
  FaGithub,
  FaLinkedin,
  FaKaggle,
  FaTwitter,
  FaInstagram,
  FaKeyboard,
  FaPython,
  FaJs,
  FaJava,
  FaReact,
  FaNodeJs,
  FaDocker,
  FaAws,
  FaLinux,
  FaGitAlt,
  FaDatabase,
  FaSpotify,
} from "react-icons/fa";
import {
  SiTypescript,
  SiCplusplus,
  SiPandas,
  SiNumpy,
  SiScikitlearn,
  SiPytorch,
  SiTensorflow,
  SiKeras,
  SiPlotly,
  SiFlask,
  SiFastapi,
  SiStreamlit,
  SiMongodb,
  SiSqlite,
  SiPostgresql,
  SiLangchain,
} from "react-icons/si";
import { HiMail } from "react-icons/hi";
import { GiCricketBat, GiBookCover } from "react-icons/gi";
import { MdMovie } from "react-icons/md";
import { TbBrandMinecraft } from "react-icons/tb";
import "./Hero.css";

const Hero = () => {
  const [activeTabs, setActiveTabs] = useState(["projects"]); // Support multiple active tabs
  const [showProfileModal, setShowProfileModal] = useState(false);

  const socialLinks = [
    {
      icon: FaGithub,
      href: "https://github.com/prasad-gade05",
      label: "GitHub",
      handle: "prasad-gade05",
      vibe: "github",
    },
    {
      icon: FaLinkedin,
      href: "https://www.linkedin.com/in/prasad-gade05/",
      label: "LinkedIn",
      handle: "prasad-gade05",
      vibe: "linkedin",
    },
    {
      icon: FaKaggle,
      href: "https://kaggle.com/prasadgade",
      label: "Kaggle",
      handle: "prasadgade",
      vibe: "kaggle",
    },
    {
      icon: FaKeyboard,
      href: "https://monkeytype.com/profile/prasad_gade05",
      label: "Monkeytype",
      handle: "prasad_gade05",
      vibe: "monkeytype",
    },
    {
      icon: FaTwitter,
      href: "https://twitter.com/prasad_gade05",
      label: "Twitter",
      handle: "@prasad_gade05",
      vibe: "twitter",
    },
    {
      icon: FaInstagram,
      href: "https://instagram.com/prasad_gade05",
      label: "Instagram",
      handle: "@prasad_gade05",
      vibe: "instagram",
    },
    {
      icon: HiMail,
      href: "mailto:prasadgade4405@gmail.com",
      label: "Email",
      handle: "prasadgade4405@gmail.com",
      vibe: "email",
    },
    {
      icon: FaSpotify,
      href: "https://open.spotify.com/user/31uuwb7ecf3gglu7rwpl6oxx4hau?si=kXL6l30RRi-wn_ZMEHL7HQ",
      label: "Spotify",
      handle: "prasad_gade",
      vibe: "spotify",
    },
  ];

  const skillIcons = {
    Python: FaPython,
    JavaScript: FaJs,
    TypeScript: SiTypescript,
    Java: FaJava,
    "C++": SiCplusplus,
    SQL: FaDatabase,
    Pandas: SiPandas,
    NumPy: SiNumpy,
    "Scikit-Learn": SiScikitlearn,
    PyTorch: SiPytorch,
    TensorFlow: SiTensorflow,
    LangChain: SiLangchain,
    Keras: SiKeras,
    Matplotlib: SiPlotly,
    Seaborn: SiPlotly,
    "Power BI": BarChart3,
    Plotly: SiPlotly,
    React: FaReact,
    Flask: SiFlask,
    FastAPI: SiFastapi,
    "Node.js": FaNodeJs,
    Streamlit: SiStreamlit,
    MongoDB: SiMongodb,
    SQLite: SiSqlite,
    ChromaDB: FaDatabase,
    PostgreSQL: SiPostgresql,
    Git: FaGitAlt,
    Docker: FaDocker,
    AWS: FaAws,
    Linux: FaLinux,
  };

  // Project icons mapping
  const projectIcons = {
    "Lex Simulacra": Brain,
    "Intrusion Detection": Shield,
    "Celestial Classifier": Star,
    KindHearts: Heart,
    "Audio Visualizer": Music,
    "Attendance Tracker": BarChart3,
    "Habit Tracker": Zap,
    NutriSnap: Globe,
  };

  const skills = {
    Languages: ["Python", "JavaScript", "TypeScript", "Java", "C++", "SQL"],
    "ML/DS": [
      "Pandas",
      "NumPy",
      "Scikit-Learn",
      "PyTorch",
      "TensorFlow",
      "LangChain",
      "Keras",
    ],
    Visualization: ["Matplotlib", "Seaborn", "Power BI", "Plotly"],
    Web: ["React", "Flask", "FastAPI", "Node.js", "Streamlit"],
    Databases: ["MongoDB", "SQLite", "ChromaDB", "PostgreSQL"],
    DevOps: ["Git", "Docker", "AWS", "Linux"],
  };

  const experience = {
    title: "Data Analyst Intern",
    company: "R3 Systems India Pvt. Ltd.",
    date: "Jun - Jul 2023",
    points: [
      "Power BI dashboards",
      "Business Intelligence",
      "70% improved data visibility",
    ],
    tags: ["Power BI", "Data Analysis", "BI"],
    certificateLink:
      "https://drive.google.com/file/d/1FP5WnbkzvDJZOVNOtqmmt1sJCc7pjzju/view?usp=sharing",
  };

  const education = [
    {
      degree: "B.Tech Computer Engineering",
      school: "SPIT Mumbai",
      date: "Expected 2027",
      grade: "9.4 CGPA",
    },
    {
      degree: "Minor in Management",
      school: "SPJIMR (SP Jain Institute of Management & Research)",
      date: "Expected 2027",
      grade: "Ongoing",
    },
    {
      degree: "Diploma in Computer Technology",
      school: "K. K. Wagh Polytechnic",
      date: "2021 - 2024",
      grade: "96.51%",
    },
  ];

  const achievements = [
    {
      title: "1st Place - Tech Horizon Hackathon",
      desc: "80+ teams",
      date: "Mar 2025",
      color: "#d29922",
      link: "https://drive.google.com/file/d/19EXpm1wVqM35qLiHvbcFzmwwwEiFSr_4/view?usp=drive_link",
      linkText: "View Certificate",
    },
    {
      title: "Published Researcher",
      desc: "IJIES Journal",
      date: "Apr 2024",
      color: "#3fb950",
      link: "https://ijies.net/finial-docs/finial-pdf/220424918.pdf",
      linkText: "View Paper",
    },
  ];

  const certifications = [
    {
      name: "Data Science Job Simulation",
      org: "BCG (Forage)",
      date: "Jan 2025",
      link: "https://drive.google.com/file/d/1gpK6qqplU6bqYPZBVsR0iIuJwvS9_HoX/view?usp=drive_link",
    },
    {
      name: "Developer & Technology Simulation",
      org: "Accenture UK (Forage)",
      date: "Jan 2025",
      link: "https://drive.google.com/file/d/1pOHKmObTLFRdyLv6xlPkTdhbIK2NTT4Y/view?usp=drive_link",
    },
    {
      name: "Cloud Computing on AWS",
      org: "Udemy",
      date: "Jul 2024",
      link: "https://drive.google.com/file/d/1ax32PpCzf4mP2hFectfl5lubdnKU5FV6/view?usp=drive_link",
    },
    {
      name: "The World of Computer Networking",
      org: "Udemy",
      date: "Jun 2024",
      link: "https://drive.google.com/file/d/1yzSMpeOIgKBUel5RJ9TANkUIbMajd_FE/view?usp=drive_link",
    },
    {
      name: "Java Training",
      org: "IIT Bombay",
      date: "Mar 2024",
      link: "https://drive.google.com/file/d/1i7k6dmtUvIENZHQk_xJkmoKe2Lyhjnpv/view?usp=drive_link",
    },
    {
      name: "Arduino Course",
      org: "Robo-Tech-X",
      date: "Aug 2023",
      link: "https://drive.google.com/file/d/1DsDhr7ArZC82L7uLxHtBjRuT8j6TQRR5/view?usp=sharing",
    },
  ];

  const projects = [
    {
      title: "Lex Simulacra",
      subtitle: "AI Legal Courtroom Simulator",
      category: "AI",
      stats: "8 AI Agents",
      description:
        "Multi-agent legal simulation with LangGraph for realistic trial proceedings.",
      tech: ["LangChain", "FastAPI", "ChromaDB"],
      github: "https://github.com/prasad-gade05/Law_Courtroom_Simulator",
    },
    {
      title: "Intrusion Detection",
      subtitle: "TII-SSRC-23 Analysis",
      category: "ML",
      stats: "100% recall",
      description:
        "Compared 6 ML/DL models on 8.6M samples. Tree models outperformed.",
      tech: ["XGBoost", "PyTorch", "SHAP"],
      github: "https://github.com/prasad-gade05/IDS_on_TII-SSRC-23",
    },
    {
      title: "Celestial Classifier",
      subtitle: "SDSS Dataset Analysis",
      category: "ML",
      stats: "4 ML Models",
      description:
        "Classification of celestial objects from Sloan Digital Sky Survey dataset.",
      tech: ["Keras", "Scikit-learn"],
      github:
        "https://github.com/prasad-gade05/Celestial-Object-Classifier-using-Solana-Digital-Sky-Survey-Dataset",
    },
    {
      title: "KindHearts",
      subtitle: "Donation Platform",
      category: "Web",
      badge: "1st Place",
      stats: "80+ teams",
      description:
        "Multi-role donation platform with crypto payments and real-time tracking.",
      tech: ["React", "TypeScript", "MongoDB"],
      github:
        "https://github.com/prasad-gade05/KindHearts-Multi-Role-Donation-Management-Platform",
    },
    {
      title: "Audio Visualizer",
      subtitle: "Real-Time Music Viz",
      category: "Web",
      stats: "3D Globe",
      description:
        "Audio visualization with file upload, system capture, and 3D globe mode.",
      tech: ["TypeScript", "Web Audio", "Canvas"],
      github: "https://github.com/prasad-gade05/audio_visualizer_app",
      demo: "https://prasad-gade05.github.io/audio_visualizer_app/",
    },
    {
      title: "Attendance Tracker",
      subtitle: "Smart Schedule & Attendance",
      category: "Web",
      stats: "Offline Ready",
      description:
        "Attendance simulation to calculate required classes with goal tracking.",
      tech: ["React", "TypeScript", "Dexie.js"],
      github: "https://github.com/prasad-gade05/attendance",
      demo: "https://prasad-gade05.github.io/attendance/",
    },
    {
      title: "Habit Tracker",
      subtitle: "Privacy-First Tracking",
      category: "Web",
      stats: "Local Storage",
      description:
        "Client-side habit tracking with GitHub-style contribution charts.",
      tech: ["React 19", "Zustand", "Dexie.js"],
      github: "https://github.com/prasad-gade05/Habit-Tracker",
      demo: "https://prasad-gade05.github.io/Habit-Tracker/",
    },
    {
      title: "NutriSnap",
      subtitle: "AI Nutrition Tracker",
      category: "AI",
      stats: "Image Analysis",
      description:
        "Nutrition tracking using Gemini API for food image analysis.",
      tech: ["React", "Gemini API"],
      github: "https://github.com/prasad-gade05/nutrition_tracker",
      demo: "https://prasadsnutritiontracker.netlify.app/",
    },
  ];

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

  // Define split groups
  const splitGroups = {
    "exp-edu": ["experience", "education"],
    "ach-cert": ["achievements", "certifications"],
    "vol-hob": ["volunteering", "hobbies"],
  };

  // Handle tab click - if part of a split group, open both
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

  const volunteering = [
    {
      title: "Teaching Assistant",
      organization:
        "Bhartiya Vidya Bhavan's Sardar Patel Institute of Technology",
      location: "Munshi Nagar, Andheri, Mumbai",
      date: "2025",
      certificateLink:
        "https://drive.google.com/file/d/1JnA6WtIeWsKkc0x4YsTQ95hjl5PNQwgh/view?usp=sharing",
    },
    {
      title: "General Secretary - Students Council",
      organization: "K. K. Wagh Polytechnic",
      location: "Nashik",
      date: "2023 - 2024",
      certificateLink: null,
    },
  ];

  const hobbies = {
    sports: {
      cricket: "Cricket",
      minecraft: "Minecraft",
    },
    book: {
      title: "How to Win Friends and Influence People",
      author: "Dale Carnegie",
    },
    songs: [
      {
        name: "Take Me Home, Country Roads - John Denver",
        link: "https://open.spotify.com/track/1YYhDizHx7PnDhAhko6cDS?si=b5b58f4e8aa2480e",
      },
      {
        name: "Main Zindagi Ka Saath Nibhata Chala Gaya - Mohammed Rafi",
        link: "https://open.spotify.com/track/1TAoZRnSmZOOXUSoJqycxN?si=59e59c8d6f1747a6",
      },
    ],
    series: ["Squid Games", "Money Heist"],
  };

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

            <div className="name-row">
              <div 
                className="profile-image-wrapper"
                onClick={() => setShowProfileModal(true)}
              >
                <img 
                  src={`${import.meta.env.BASE_URL}profile.png`}
                  alt="Prasad Gade" 
                  className="profile-image"
                />
              </div>
              <h1 className="name">Prasad Gade</h1>
            </div>

            {/* Profile Image Modal */}
            <AnimatePresence>
              {showProfileModal && (
                <motion.div 
                  className="profile-modal-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowProfileModal(false)}
                >
                  <motion.div 
                    className="profile-modal-card"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img 
                      src={`${import.meta.env.BASE_URL}profile.png`}
                      alt="Prasad Gade" 
                      className="profile-modal-image"
                    />
                    <button 
                      className="profile-modal-close"
                      onClick={() => setShowProfileModal(false)}
                    >
                      ×
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="role-typing">
              <TypeAnimation
                sequence={[
                  "Data Scientist",
                  2000,
                  "ML Engineer",
                  2000,
                  "Computer Engineer",
                  2000,
                  "Data Analyst",
                  2000,
                  "Data Science & Business Intelligence",
                  2000,
                  "Cross Platform Application Developer",
                  2000,
                ]}
                wrapper="span"
                repeat={Infinity}
              />
            </div>

            <div className="bio-section">
              <div className="bio-tags">
                <span className="bio-tag education">B.Tech CE @ SPIT</span>
                <span className="bio-tag education">Minor @ SPJIMR</span>
                <span className="bio-tag passion">Data Storytelling</span>
              </div>
            </div>

            <div className="skills-section">
              <span className="skills-label">Top Skills</span>
              <div className="skills-tags">
                <span className="skill-tag">Data Analytics</span>
                <span className="skill-tag">Data Science</span>
                <span className="skill-tag">Machine Learning</span>
                <span className="skill-tag">Web Dev</span>
                <span className="skill-tag">Android</span>
              </div>
            </div>
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
              <a
                href="https://drive.google.com/file/d/134zdT9FaQX6siuHMxnICxBqZrK_R3YXV/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="resume-btn"
              >
                <FileText size={12} />
                Resume
                <ExternalLink size={10} />
              </a>
            </div>
            <pre className="code-content">
              <code>
                <span className="line">
                  <span className="ln">1</span>
                  <span className="kw">class</span>{" "}
                  <span className="cls">DataScientist</span>
                  <span className="p">:</span>
                </span>
                <span className="line">
                  <span className="ln">2</span>
                  {"    "}
                  <span className="kw">def</span>{" "}
                  <span className="fn">__init__</span>
                  <span className="p">(</span>
                  <span className="sf">self</span>
                  <span className="p">):</span>
                </span>
                <span className="line">
                  <span className="ln">3</span>
                  {"        "}
                  <span className="sf">self</span>
                  <span className="p">.</span>
                  <span className="pr">name</span> <span className="op">=</span>{" "}
                  <span className="st">"Prasad Gade"</span>
                </span>
                <span className="line">
                  <span className="ln">4</span>
                  {"        "}
                  <span className="sf">self</span>
                  <span className="p">.</span>
                  <span className="pr">role</span> <span className="op">=</span>{" "}
                  <span className="st">"DS | ML | DA"</span>
                </span>
                <span className="line">
                  <span className="ln">5</span>
                  {"        "}
                  <span className="sf">self</span>
                  <span className="p">.</span>
                  <span className="pr">skills</span>{" "}
                  <span className="op">=</span> <span className="p">[</span>
                  <span className="st">"Python"</span>
                  <span className="p">,</span>{" "}
                  <span className="st">"Machine Learning"</span>
                  <span className="p">]</span>
                </span>
                <span className="line">
                  <span className="ln">6</span>
                </span>
                <span className="line">
                  <span className="ln">7</span>
                  {"    "}
                  <span className="kw">def</span>{" "}
                  <span className="fn">transform</span>
                  <span className="p">(</span>
                  <span className="sf">self</span>
                  <span className="p">,</span> <span className="pm">data</span>
                  <span className="p">):</span>
                </span>
                <span className="line">
                  <span className="ln">8</span>
                  {"        "}
                  <span className="kw">return</span>{" "}
                  <span className="sf">self</span>
                  <span className="p">.</span>
                  <span className="fn">insights</span>
                  <span className="p">(</span>
                  <span className="pm">data</span>
                  <span className="p">)</span>
                </span>
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
                  whileHover={{ y: -3 }}
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
                className={`tab-btn ${isTabActive(tab) ? "active" : ""}`}
                onClick={() => handleTabClick(tab)}
              >
                <tab.icon size={14} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content - Split View Support */}
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
                        <div key={i} className="project-card">
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
                      <div key={category} className="skill-group">
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
                      <div key={i} className="edu-item">
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
                      <div key={i} className="cert-item">
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
                      <div key={i} className="volunteer-item">
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
                    <div className="hobby-card hobby-sports">
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
                          <div className="hobby-activity-item">
                            <TbBrandMinecraft size={18} />
                            <span>{hobbies.sports.minecraft}</span>
                          </div>
                        </div>
                      </div>
                      <div className="hobby-card-decoration"></div>
                    </div>

                    <div className="hobby-card hobby-reading">
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

                    <div className="hobby-card hobby-music">
                      <div className="hobby-card-header">
                        <div className="hobby-card-icon">
                          <Headphones size={20} />
                        </div>
                        <h4>Favorite Tracks</h4>
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

                    <div className="hobby-card hobby-series">
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
                      </div>
                      <div className="hobby-card-decoration"></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
