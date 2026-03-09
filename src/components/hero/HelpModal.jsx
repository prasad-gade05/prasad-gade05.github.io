import { motion } from "framer-motion";
import { X, HelpCircle, User, Globe, Folder, Github, Compass, Palette, Code, Gamepad2, Film, FileText, Sparkles } from "lucide-react";
import "./HelpModal.css";

const HelpModal = ({ onClose }) => {
  return (
    <motion.div
      className="help-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="help-modal-card"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="help-modal-header">
          <HelpCircle className="help-icon" />
          <h2>Welcome! Start Here</h2>
          <button className="help-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="help-modal-content">
          {/* Who am I */}
          <section className="help-section">
            <div className="help-section-title">
              <User size={16} />
              <h3>Who am I?</h3>
            </div>
            <p>
              Hi, I'm <strong>Prasad</strong> — a computer engineer who builds software, 
              works with data, and creates intelligent tools to solve real problems.
            </p>
          </section>

          {/* What is this site */}
          <section className="help-section">
            <div className="help-section-title">
              <Globe size={16} />
              <h3>What is this site?</h3>
            </div>
            <p>
              This dashboard is my digital home — showcasing my software, skills, and data stories 
              all in one view. Think of it as an interactive, visual version of my resume.
            </p>
            <p className="help-subtext">
              <em>For recruiters, collaborators, and anyone curious about who I am and what I build.</em>
            </p>
          </section>

          {/* What are projects */}
          <section className="help-section">
            <div className="help-section-title">
              <Folder size={16} />
              <h3>What are "projects"?</h3>
            </div>
            <p>
              Each card is a real project — apps, data analysis, or AI tools. 
              The title tells you what problem it solves.
            </p>
          </section>

          {/* GitHub explanation */}
          <section className="help-section">
            <div className="help-section-title">
              <Github size={16} />
              <h3>Why GitHub links?</h3>
            </div>
            <p>
              These links let employers and collaborators verify my work 
              and see how I actually build things.
            </p>
          </section>

          {/* How to navigate */}
          <section className="help-section help-section-navigate">
            <div className="help-section-title">
              <Compass size={16} />
              <h3>How to explore</h3>
            </div>
            <ul className="help-list">
              <li><strong>Tabs</strong> — Switch between Skills, Projects, Education, Hobbies</li>
              <li><strong>Skills</strong> — Python, JS, etc. are programming languages; React, Flask are tools</li>
              <li><strong>Social icons</strong> — Open my profiles (LinkedIn, GitHub, etc.)</li>
              <li><strong>Resume</strong> — Opens traditional PDF resume</li>
            </ul>
          </section>

          {/* Interactive features */}
          <section className="help-section">
            <div className="help-section-title">
              <Sparkles size={16} />
              <h3>Interactive bits</h3>
            </div>
            <ul className="help-list">
              <li><strong>My photo</strong> — Click to enlarge</li>
              <li><strong>prasad_gade.py</strong> — My intro in code style (for fun!)</li>
              <li><strong>Minecraft button</strong> — See my game character</li>
              <li><strong>See All Movies</strong> — My watchlist</li>
            </ul>
          </section>

          {/* Theme toggle */}
          <section className="help-section">
            <div className="help-section-title">
              <Palette size={16} />
              <h3>Themes</h3>
            </div>
            <p>
              Cycle through <strong>4 themes</strong> — Dark, Light, Arcade Dark, and Arcade Light — 
              using the toggle button. The arcade themes bring a retro game aesthetic!
            </p>
          </section>

          {/* Paper Playground / Doodle */}
          <section className="help-section">
            <div className="help-section-title">
              <Sparkles size={16} />
              <h3>Paper Playground</h3>
            </div>
            <p>
              Head to the <strong>Hobbies</strong> tab and click <strong>Paper Playground</strong> — 
              it captures the page and turns it into a draggable tissue paper with real-time physics! 
              Pin it, fold it, drag it around, and press <kbd>Esc</kbd> to return.
            </p>
          </section>

          {/* Easter egg hint for nerds */}
          <section className="help-section help-section-easter">
            <div className="help-section-title">
              <Gamepad2 size={16} />
              <h3>For the curious...</h3>
            </div>
            <p className="easter-hint">
              Try some classic controller moves on your keyboard… 🎮✨
            </p>
          </section>
        </div>

        <div className="help-modal-footer">
          <p>Thanks for visiting! Feel free to explore.</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HelpModal;
