import { useCallback } from "react";
import { motion } from "framer-motion";
import { socialLinks } from "../../data/portfolioData";

const SocialLinks = () => {
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

  return (
    <motion.div
      className="social-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="social-cards-grid">
        {socialLinks.map((link, idx) => (
          <a
            key={idx}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            className={`social-card-fun social-${link.vibe}`}
            onMouseMove={handleCardTilt}
            onMouseLeave={handleCardTiltReset}
          >
            <div className="social-card-content">
              <div className="social-icon-wrap">
                <link.icon className="social-icon" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </motion.div>
  );
};

export default SocialLinks;
