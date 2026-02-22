import { useState, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TbBrandMinecraft } from "react-icons/tb";
import { Move3D, FileText } from "lucide-react";
import "./Hero.css";
import "./MinecraftSkinViewer.css";
import ProfileSection from "./hero/ProfileSection";
import CodeCard from "./hero/CodeCard";
import SocialLinks from "./hero/SocialLinks";
import ContentTabs from "./hero/ContentTabs";
import ClickSparkle from "./ClickSparkle";

const ResumeViewer = lazy(() => import("./ResumeViewer"));
const MinecraftSkinViewer = lazy(() => import("./MinecraftSkinViewer"));

const Hero = () => {
  const [showMinecraftModal, setShowMinecraftModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showResumeModal) setShowResumeModal(false);
        if (showMinecraftModal) setShowMinecraftModal(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showResumeModal, showMinecraftModal]);

  return (
    <section className="hero">
      <ClickSparkle />
      <div className="hero-grid">
        {/* Left Column - Name First, then Code Card, then Social */}
        <div className="hero-left">
          <ProfileSection />
          <CodeCard onOpenResume={() => setShowResumeModal(true)} />
          <SocialLinks />
        </div>

        {/* Right Column - Tabbed Content */}
        <ContentTabs onOpenMinecraft={() => setShowMinecraftModal(true)} />
      </div>

      {/* Minecraft Skin Modal - Centrally Managed */}
      <AnimatePresence>
        {showResumeModal && (
          <motion.div
            className="resume-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowResumeModal(false)}
          >
            <motion.div
              className="resume-modal-card"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <Suspense fallback={<div style={{color: 'white', padding: '20px'}}>Loading PDF Viewer...</div>}>
                  <ResumeViewer 
                    pdfUrl={`${import.meta.env.BASE_URL}Prasad_Gade_Resume.pdf`}
                    onClose={() => setShowResumeModal(false)}
                  />
                </Suspense>
              </div>
            </motion.div>
          </motion.div>
        )}
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
                <Suspense fallback={<div style={{color: 'white', padding: '20px'}}>Loading 3D Viewer...</div>}>
                  <MinecraftSkinViewer
                    skinUrl={`${import.meta.env.BASE_URL}minecraft-skin.png`}
                    width={280}
                    height={400}
                  />
                </Suspense>
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
    </section>
  );
};

export default Hero;