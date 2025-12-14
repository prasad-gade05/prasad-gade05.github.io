import { motion } from "framer-motion";
import { socialLinks } from "../../data/portfolioData";

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
  );
};

export default SocialLinks;
