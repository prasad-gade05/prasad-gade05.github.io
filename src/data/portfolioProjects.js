import {
  Brain,
  Shield,
  Star,
  Heart,
  Music,
  Zap,
  Globe,
  BarChart3,
  Satellite,
} from "lucide-react";

export const projectIcons = {
  GraphShield: Shield,
  "IPL Analytics Platform": BarChart3,
  "Lex Simulacra": Brain,
  "Intrusion Detection": Shield,
  "Celestial Classifier": Star,
  KindHearts: Heart,
  "Audio Visualizer": Music,
  "Music Player": Music,
  "Attendance Tracker": BarChart3,
  "Habit Tracker": Zap,
  NutriSnap: Globe,
  "UPI Analytics": BarChart3,
  "Orbital Commons": Satellite,
};

export const projects = [
  {
    title: "GraphShield",
    subtitle: "Real-Data Graph ML for Financial Fraud Detection",
    category: "ML",
    stats: "3.7M Nodes",
    description:
      "Leakage-safe DGraphFin research pipeline with a dual-path spectral GNN, 6-seed ablations, paired-bootstrap testing, and conformal calibration.",
    tech: ["Python", "PyTorch", "PyG", "Scikit-learn", "XGBoost", "Pytest"],
    github: "https://github.com/prasad-gade05/GraphShield",
  },
  {
    title: "IPL Analytics Platform",
    subtitle: "Interactive Cricket Data Dashboard",
    category: "Data",
    stats: "19 Seasons",
    description:
      "3-stage IPL data pipeline over 278,205 ball-by-ball records, a 15-page Streamlit app with 19 DuckDB views, deterministic SQL-backed semantic search, and 52 pytest checks.",
    tech: ["Python", "DuckDB", "Pandas", "NumPy", "PyArrow", "Apache Parquet", "pytest"],
    github: "https://github.com/prasad-gade05/IPL_Analysis",
    demo: "https://analytics-ipl.streamlit.app/",
    dataset: "https://huggingface.co/datasets/prasad-gade05/ipl-enriched-dataset",
    kaggleDataset: "https://www.kaggle.com/datasets/prasadgade/ipl-2008-2025-enriched-dataset",
  },
  {
    title: "UPI Analytics",
    subtitle: "Data Engineering & Analytics Platform",
    category: "Data",
    stats: "9,026 Files",
    description:
      "Full-stack data platform analyzing India's UPI payments across 788 districts with medallion architecture and 11-tab Streamlit dashboard.",
    tech: ["Python", "DuckDB", "Streamlit", "Plotly"],
    github: "https://github.com/prasad-gade05/UPI_DS_Project",
    demo: "https://upi-analytics.streamlit.app/",
    dataset: "https://huggingface.co/datasets/prasad-gade05/india-upi-ecosystem-2018-2025",
    kaggleDataset: "https://www.kaggle.com/datasets/prasadgade/india-upi-ecosystem-2018-2025",
  },
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
    title: "Orbital Commons",
    subtitle: "Satellite Traffic & Conjunction Risk Analytics",
    category: "Data",
    stats: "148,985 Events",
    description:
      "Medallion pipeline (Bronze → Silver → Gold in DuckDB) over CelesTrak's live catalog with SGP4 propagation, Foster/Chan Pc scoring, K-Means risk shells, and an 8-page Streamlit mission console.",
    tech: ["Python", "DuckDB", "Streamlit", "SGP4", "Skyfield", "Scikit-learn", "pytest"],
    github: "https://github.com/prasad-gade05/space_analytics",
    demo: "https://space-analytics.streamlit.app/",
    dataset: "https://huggingface.co/datasets/prasad-gade05/Satellite_Traffic_Conjunction_Risk",
    kaggleDataset:
      "https://www.kaggle.com/datasets/prasadgade/satellite-traffic-conjunction-risk",
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
    title: "Portfolio",
    subtitle: "Personal Developer Portfolio",
    category: "Web",
    stats: "4 Themes",
    description:
      "Interactive portfolio with multi-theme support, 3D elements, and responsive design.",
    tech: ["React", "Three.js", "Framer Motion", "Vite"],
    github: "https://github.com/prasad-gade05/prasad-gade05.github.io",
    demo: "https://prasadgade.dev",
  },
  {
    title: "Music Player",
    subtitle: "Offline Android Music Player",
    category: "Mobile",
    stats: "~2.6 MB APK",
    description:
      "Folder-based offline player with tag filters, queue control, and constraint-balanced smart shuffle on Media3.",
    tech: ["Kotlin", "Jetpack Compose", "Media3 ExoPlayer", "Coil"],
    github: "https://github.com/prasad-gade05/Music_Player",
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
    demo: "https://prasadgade.dev/audio_visualizer_app/",
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
    demo: "https://prasadgade.dev/attendance/",
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
    demo: "https://prasadgade.dev/Habit-Tracker/",
  },
  {
    title: "NutriSnap",
    subtitle: "AI Nutrition Tracker",
    category: "AI",
    stats: "Image Analysis",
    description: "Nutrition tracking using Gemini API for food image analysis.",
    tech: ["React", "Gemini API"],
    github: "https://github.com/prasad-gade05/nutrition_tracker",
    demo: "https://prasadsnutritiontracker.netlify.app/",
  },
];
