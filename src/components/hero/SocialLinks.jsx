import { motion } from "framer-motion";
import { socialLinks } from "../../data/portfolioData";
import { handleCardTilt, resetCardTilt } from "../../utils/cardTilt";

const SocialLinks = () => {
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
            className={`social-card-fun social-${link.vibe}${link.wide ? " social-card-wide" : ""}`}
            onMouseMove={handleCardTilt}
            onMouseLeave={resetCardTilt}
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
