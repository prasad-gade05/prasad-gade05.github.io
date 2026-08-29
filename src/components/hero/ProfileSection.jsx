import { useCallback, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { MapPin, HelpCircle, Eye } from "lucide-react";
import { profileData } from "../../data/portfolioData";
import AnimatedName from "./AnimatedName";
import CurrentTime from "./CurrentTime";
import HelpModal from "./HelpModal";
import { useGoatCounterViews } from "./useGoatCounterViews";
import "./HelpModal.css";

const ProfileSection = ({ onOpenHelp, onCloseHelp, showHelpModal }) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [internalShowHelpModal, setInternalShowHelpModal] = useState(false);
  const isHelpModalControlled = typeof showHelpModal === "boolean";
  const isHelpModalOpen = isHelpModalControlled ? showHelpModal : internalShowHelpModal;
  const views = useGoatCounterViews("TOTAL");
  const totalViews = views.TOTAL;
  const openHelpModal = useCallback(() => {
    if (onOpenHelp) {
      onOpenHelp();
      return;
    }

    setInternalShowHelpModal(true);
  }, [onOpenHelp]);

  const closeHelpModal = useCallback(() => {
    if (onCloseHelp) {
      onCloseHelp();
      return;
    }

    setInternalShowHelpModal(false);
  }, [onCloseHelp]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showProfileModal) setShowProfileModal(false);
        if (isHelpModalOpen) closeHelpModal();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeHelpModal, isHelpModalOpen, showProfileModal]);

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
        {typeof totalViews === "string" && (
          <div className="site-views" title="All-time page views">
            <Eye size={12} />
            <span>{totalViews}</span>
          </div>
        )}
        <CurrentTime />
        <button 
          className="help-button"
          onClick={openHelpModal}
          title="Start Here and keyboard shortcuts (?)"
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
            key="profile-modal"
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
        {isHelpModalOpen && (
          <HelpModal key="help-modal" onClose={closeHelpModal} />
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
