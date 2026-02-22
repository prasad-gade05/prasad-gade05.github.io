import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { MapPin, HelpCircle } from "lucide-react";
import { profileData } from "../../data/portfolioData";
import AnimatedName from "./AnimatedName";
import CurrentTime from "./CurrentTime";
import HelpModal from "./HelpModal";
import "./HelpModal.css";

const ProfileSection = () => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showProfileModal) setShowProfileModal(false);
        if (showHelpModal) setShowHelpModal(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showProfileModal, showHelpModal]);

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
          <span>{profileData.status}</span>
        </div>
        <div className="location">
          <MapPin size={12} />
          <span>{profileData.location}</span>
        </div>
        <CurrentTime />
        <button 
          className="help-button"
          onClick={() => setShowHelpModal(true)}
          title="Start Here - Guide for visitors"
          aria-label="Open help guide"
        >
          <HelpCircle />
        </button>
      </div>

      <div className="name-row">
        <div 
          className="profile-image-wrapper"
          onClick={() => setShowProfileModal(true)}
        >
          <img 
            src={`${import.meta.env.BASE_URL}${profileData.profileImage}`}
            alt={profileData.name} 
            className="profile-image"
          />
        </div>
        <AnimatedName />
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
                src={`${import.meta.env.BASE_URL}${profileData.profileImage}`}
                alt={profileData.name} 
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
        {showHelpModal && (
          <HelpModal onClose={() => setShowHelpModal(false)} />
        )}
      </AnimatePresence>

      <div className="role-typing">
        <TypeAnimation
          sequence={profileData.typingRoles}
          wrapper="span"
          repeat={Infinity}
        />
      </div>

      <div className="bio-section">
        <div className="bio-tags">
          {profileData.bioTags.map((tag, index) => (
            <span key={index} className={`bio-tag ${tag.type}`}>
              {tag.text}
            </span>
          ))}
        </div>
      </div>

      <div className="skills-section">
        <span className="skills-label">Top Skills</span>
        <div className="skills-tags">
          {profileData.topSkills.map((skill, index) => (
            <span key={index} className="skill-tag">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileSection;
