import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { MapPin, Move3D } from "lucide-react";
import { TbBrandMinecraft } from "react-icons/tb";
import MinecraftSkinViewer from "../MinecraftSkinViewer";
import "../MinecraftSkinViewer.css";

const ProfileSection = () => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMinecraftModal, setShowMinecraftModal] = useState(false);

  return (
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

      {/* Minecraft Skin Modal - Exposed via prop or context if needed elsewhere, keeping local for now */}
      <AnimatePresence>
        {showMinecraftModal && (
          <motion.div 
            className="minecraft-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMinecraftModal(false)}
          >
            <motion.div 
              className="minecraft-modal-card"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="minecraft-modal-header">
                <TbBrandMinecraft />
                <h3>My Minecraft Skin</h3>
                <span className="minecraft-gamertag">prasadgade05</span>
              </div>
              <div className="minecraft-skin-container">
                <MinecraftSkinViewer 
                  skinUrl={`${import.meta.env.BASE_URL}minecraft-skin.png`}
                  width={280}
                  height={400}
                />
                <div className="minecraft-controls-hint">
                  <Move3D />
                  <span>Drag to rotate • Scroll to zoom</span>
                </div>
              </div>
              <button 
                className="minecraft-modal-close"
                onClick={() => setShowMinecraftModal(false)}
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
  );
};

export default ProfileSection;
