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
import {
  Brain,
  Shield,
  Star,
  Heart,
  Music,
  Zap,
  Globe,
  BarChart3,
  Folder,
} from "lucide-react";

export const socialLinks = [
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

export const skillIcons = {
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

export const projectIcons = {
  "Lex Simulacra": Brain,
  "Intrusion Detection": Shield,
  "Celestial Classifier": Star,
  KindHearts: Heart,
  "Audio Visualizer": Music,
  "Attendance Tracker": BarChart3,
  "Habit Tracker": Zap,
  NutriSnap: Globe,
};

export const skills = {
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

export const experience = {
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

export const education = [
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

export const achievements = [
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

export const certifications = [
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

export const projects = [
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

export const volunteering = [
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

export const hobbies = {
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

export const movies = [
  { title: "12th Fail", year: "2023", genre: "Drama, Biography" },
  { title: "Sam Bahadur", year: "2023", genre: "Biography, Drama, War" },
  { title: "Article 370", year: "2024", genre: "Action, Thriller" },
  { title: "From Paris with Love", year: "2010", genre: "Action, Thriller" },
  { title: "Shaurya", year: "2008", genre: "Drama, Thriller" },
  { title: "The Greatest Beer Run Ever", year: "2022", genre: "Adventure, Comedy, Drama" },
  { title: "Ground Zero", year: "1987", genre: "Drama, Thriller" },
  { title: "Bodyguard", year: "2011", genre: "Action, Romance, Thriller" },
  { title: "Meet Dave", year: "2008", genre: "Comedy, Family, Sci-Fi" },
  { title: "The Green Mile", year: "1999", genre: "Crime, Drama, Fantasy" },
  { title: "Snowden", year: "2016", genre: "Biography, Drama, Thriller" },
  { title: "Unbroken", year: "2014", genre: "Biography, Drama, War" },
  { title: "1917", year: "2019", genre: "Drama, War" },
  { title: "Kingdom of Heaven", year: "2005", genre: "Action, Adventure, Drama" },
  { title: "All Quiet on the Western Front", year: "2022", genre: "Action, Drama, War" },
  { title: "Kung Fu Panda", year: "2008", genre: "Animation, Action, Adventure" },
  { title: "Kung Fu Panda 2", year: "2011", genre: "Animation, Action, Adventure" },
  { title: "Kung Fu Panda 3", year: "2016", genre: "Animation, Action, Adventure" },
  { title: "Kung Fu Panda 4", year: "2024", genre: "Animation, Action, Adventure" },
  { title: "Toy Story", year: "1995", genre: "Animation, Adventure, Comedy" },
  { title: "Toy Story 2", year: "1999", genre: "Animation, Adventure, Comedy" },
  { title: "Toy Story 3", year: "2010", genre: "Animation, Adventure, Comedy" },
  { title: "Toy Story 4", year: "2019", genre: "Animation, Adventure, Comedy" },
  { title: "Cars", year: "2006", genre: "Animation, Adventure, Comedy" },
  { title: "Cars 2", year: "2011", genre: "Animation, Adventure, Comedy" },
  { title: "Cars 3", year: "2017", genre: "Animation, Adventure, Comedy" },
  { title: "Planes", year: "2013", genre: "Animation, Adventure, Comedy" },
  { title: "Planes: Fire & Rescue", year: "2014", genre: "Animation, Adventure, Comedy" },
  { title: "Rio", year: "2011", genre: "Animation, Adventure, Comedy" },
  { title: "Rio 2", year: "2014", genre: "Animation, Adventure, Comedy" },
  { title: "The Incredibles", year: "2004", genre: "Animation, Action, Adventure" },
  { title: "Incredibles 2", year: "2018", genre: "Animation, Action, Adventure" },
  { title: "Finding Nemo", year: "2003", genre: "Animation, Adventure, Comedy" },
  { title: "Finding Dory", year: "2016", genre: "Animation, Adventure, Comedy" },
  { title: "WALL·E", year: "2008", genre: "Animation, Adventure, Sci-Fi" },
  { title: "Big Hero 6", year: "2014", genre: "Animation, Action, Adventure" },
  { title: "Ratatouille", year: "2007", genre: "Animation, Adventure, Comedy" },
  { title: "The Wild Robot", year: "2024", genre: "Animation, Adventure, Sci-Fi" },
  { title: "Up", year: "2009", genre: "Animation, Adventure, Comedy" },
  { title: "Coco", year: "2017", genre: "Animation, Adventure, Family" },
  { title: "Zootopia", year: "2016", genre: "Animation, Adventure, Comedy" },
  { title: "Bolt", year: "2008", genre: "Animation, Adventure, Comedy" },
  { title: "Klaus", year: "2019", genre: "Animation, Adventure, Comedy" },
  { title: "Free Birds", year: "2013", genre: "Animation, Adventure, Comedy" },
  { title: "Baymax!", year: "2022", genre: "Animation, Adventure, Family" },
];

export const webShows = [
  { title: "Money Heist", seasons: 5, genre: "Action, Crime, Drama" },
  { title: "Money Heist: Berlin", seasons: 1, genre: "Action, Crime, Drama" },
  { title: "Squid Game", seasons: 3, genre: "Action, Drama, Thriller" },
  { title: "The Family Man", seasons: 2, genre: "Action, Drama, Thriller" },
  { title: "Special Ops", seasons: 2, genre: "Action, Drama, Thriller" },
  { title: "Scam 1992", seasons: 1, genre: "Crime, Drama" },
  { title: "Treason", seasons: 1, genre: "Drama, Thriller" },
  { title: "Scam 2003", seasons: 1, genre: "Crime, Drama" },
  { title: "Kaala", seasons: 1, genre: "Drama, Thriller" },
  { title: "Ranneeti", seasons: 1, genre: "Drama, Thriller" },
  { title: "Lucky Bhaskar", seasons: 1, genre: "Drama, Thriller" },
  { title: "The Railway Men", seasons: 1, genre: "Drama, History" },
  { title: "The Terminal List", seasons: 1, genre: "Action, Drama, Thriller" },
  { title: "Kaala Pani", seasons: 1, genre: "Drama, Thriller" },
  { title: "Bodyguard", seasons: 1, genre: "Crime, Drama, Thriller" },
];

export const profileData = {
  name: "Prasad Gade",
  status: "Open to Work",
  location: "Mumbai, India",
  profileImage: "profile.png",
  typingRoles: [
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
  ],
  bioTags: [
    { text: "B.Tech CE @ SPIT", type: "education" },
    { text: "Minor @ SPJIMR", type: "education" },
    { text: "Data Storytelling", type: "passion" },
  ],
  topSkills: [
    "Data Analytics",
    "Data Science",
    "Machine Learning",
    "Web Dev",
    "Android",
  ],
};

export const codeCardData = {
  filename: "prasad_gade.py",
  resumeLink: "https://drive.google.com/file/d/134zdT9FaQX6siuHMxnICxBqZrK_R3YXV/view?usp=sharing",
  codeLines: [
    {
      lineNum: 1,
      tokens: [
        { type: "kw", content: "class" },
        { type: "text", content: " " },
        { type: "cls", content: "DataScientist" },
        { type: "p", content: ":" },
      ],
    },
    {
      lineNum: 2,
      tokens: [
        { type: "text", content: "    " },
        { type: "kw", content: "def" },
        { type: "text", content: " " },
        { type: "fn", content: "__init__" },
        { type: "p", content: "(" },
        { type: "sf", content: "self" },
        { type: "p", content: "):" },
      ],
    },
    {
      lineNum: 3,
      tokens: [
        { type: "text", content: "        " },
        { type: "sf", content: "self" },
        { type: "p", content: "." },
        { type: "pr", content: "name" },
        { type: "text", content: " " },
        { type: "op", content: "=" },
        { type: "text", content: " " },
        { type: "st", content: '"Prasad Gade"' },
      ],
    },
    {
      lineNum: 4,
      tokens: [
        { type: "text", content: "        " },
        { type: "sf", content: "self" },
        { type: "p", content: "." },
        { type: "pr", content: "role" },
        { type: "text", content: " " },
        { type: "op", content: "=" },
        { type: "text", content: " " },
        { type: "st", content: '"DS | ML | DA"' },
      ],
    },
    {
      lineNum: 5,
      tokens: [
        { type: "text", content: "        " },
        { type: "sf", content: "self" },
        { type: "p", content: "." },
        { type: "pr", content: "skills" },
        { type: "text", content: " " },
        { type: "op", content: "=" },
        { type: "text", content: " " },
        { type: "p", content: "[" },
        { type: "st", content: '"Python"' },
        { type: "p", content: ", " },
        { type: "st", content: '"Machine Learning"' },
        { type: "p", content: "]" },
      ],
    },
    {
      lineNum: 6,
      tokens: [],
    },
    {
      lineNum: 7,
      tokens: [
        { type: "text", content: "    " },
        { type: "kw", content: "def" },
        { type: "text", content: " " },
        { type: "fn", content: "transform" },
        { type: "p", content: "(" },
        { type: "sf", content: "self" },
        { type: "p", content: ", " },
        { type: "pm", content: "data" },
        { type: "p", content: "):" },
      ],
    },
    {
      lineNum: 8,
      tokens: [
        { type: "text", content: "        " },
        { type: "kw", content: "return" },
        { type: "text", content: " " },
        { type: "sf", content: "self" },
        { type: "p", content: "." },
        { type: "fn", content: "insights" },
        { type: "p", content: "(" },
        { type: "pm", content: "data" },
        { type: "p", content: ")" },
      ],
    },
  ],
};
