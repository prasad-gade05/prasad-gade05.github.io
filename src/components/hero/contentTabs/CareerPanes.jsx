import { motion } from "framer-motion";
import {
  Award,
  Briefcase,
  Download,
  ExternalLink,
  GraduationCap,
  Heart,
  Trophy,
} from "lucide-react";
import { FaKaggle } from "react-icons/fa";
import { SiHuggingface } from "react-icons/si";
import { handleCardTilt, resetCardTilt } from "../../../utils/cardTilt";
import { getListItemKey, getRenderableListValues } from "../../../utils/listRendering";
import {
  extractHfRepoId,
  extractKaggleRef,
  formatDownloadCount,
  useDatasetDownloads,
  useKaggleDownloads,
} from "./useDatasetDownloads";
import {
  achievements,
  certifications,
  education,
  experience,
  volunteering,
} from "../../../data/portfolioData";
import { tabPaneMotionProps } from "./motion";

const HF_DATASET_LINKS = achievements
  .flatMap((achievement) => achievement.links ?? [])
  .filter((link) => link.platform === "huggingface");

const HF_DATASET_URLS = [...new Set(HF_DATASET_LINKS.map((link) => link.href))];

const KAGGLE_DATASET_URLS = [
  ...new Set(
    achievements
      .flatMap((achievement) => achievement.links ?? [])
      .filter((link) => link.platform === "kaggle")
      .map((link) => link.href)
  ),
];

const getHfDownloadCount = (link, hfDownloads) => {
  if (link.platform !== "huggingface") return null;
  const repoId = extractHfRepoId(link.href);
  const count = repoId ? hfDownloads[repoId] : null;
  return typeof count === "number" ? count : null;
};

const getKaggleDownloadCount = (link, kaggleDownloads) => {
  if (link.platform !== "kaggle") return null;
  const ref = extractKaggleRef(link.href);
  const count = ref ? kaggleDownloads[ref] : null;
  return typeof count === "number" ? count : null;
};

const getAchievementLinkIcon = (platform) => {
  if (platform === "kaggle") return <FaKaggle size={11} />;
  if (platform === "huggingface") return <SiHuggingface size={11} />;
  return <ExternalLink size={10} />;
};

export const ExperiencePane = ({ isSplit }) => (
  <motion.div
    key="experience"
    className={`tab-pane experience-pane ${isSplit ? "split" : ""}`}
    {...tabPaneMotionProps}
  >
    <div className="pane-header">
      <Briefcase size={16} />
      <span>Experience</span>
    </div>
    <div
      className="exp-card"
      data-shortcut-target="true"
      aria-label={`${experience.title} at ${experience.company}`}
      role="group"
      tabIndex={-1}
      onMouseMove={handleCardTilt}
      onMouseLeave={resetCardTilt}
    >
      <div className="exp-header">
        <div>
          <h3>{experience.title}</h3>
          <p className="exp-company">{experience.company}</p>
        </div>
        <span className="exp-date">{experience.date}</span>
      </div>
      <ul className="exp-points">
        {getRenderableListValues(experience.points).map((point, index) => (
          <li key={getListItemKey("experience-point", point, index)}>{point}</li>
        ))}
      </ul>
      <div className="exp-tags">
        {getRenderableListValues(experience.tags).map((tag, index) => (
          <span key={getListItemKey("experience-tag", tag, index)} className="exp-tag">
            {tag}
          </span>
        ))}
      </div>
      {experience.certificateLink && (
        <a
          href={experience.certificateLink}
          target="_blank"
          rel="noopener noreferrer"
          className="exp-cert-link"
          data-shortcut-target="true"
        >
          <ExternalLink size={12} />
          View Certificate
        </a>
      )}
    </div>
  </motion.div>
);

export const EducationPane = ({ isSplit }) => (
  <motion.div
    key="education"
    className={`tab-pane education-pane ${isSplit ? "split" : ""}`}
    {...tabPaneMotionProps}
  >
    <div className="pane-header">
      <GraduationCap size={16} />
      <span>Education</span>
    </div>
    <div className="edu-list">
      {education.map((edu, index) => (
        <div
          key={`${edu.degree || "degree"}-${edu.school || "school"}-${index}`}
          className="edu-item"
          onMouseMove={handleCardTilt}
          onMouseLeave={resetCardTilt}
        >
          <div className="edu-main">
            <h3>{edu.degree}</h3>
            <p>{edu.school}</p>
            {edu.minor && <p className="edu-minor">{edu.minor}</p>}
          </div>
          <div className="edu-meta">
            <span className="edu-date">{edu.date}</span>
            <span className="edu-grade">{edu.grade}</span>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

export const AchievementsPane = ({ isSplit }) => {
  const hfDownloads = useDatasetDownloads(HF_DATASET_URLS);
  const kaggleDownloads = useKaggleDownloads(KAGGLE_DATASET_URLS);

  return (
    <motion.div
      key="achievements"
      className={`tab-pane achievements-pane ${isSplit ? "split" : ""}`}
      {...tabPaneMotionProps}
    >
      <div className="pane-header">
        <Trophy size={16} />
        <span>Achievements</span>
      </div>
      <div className="achieve-list">
        {achievements.map((achievement, achievementIndex) => {
          const achievementLinks = achievement.links ?? (
            achievement.link
              ? [{
                  href: achievement.link,
                  text: achievement.linkText || "View Certificate",
                  platform: "external",
                }]
              : []
          );
          const hfLinkCountByHref = new Map(
            achievementLinks
              .filter((link) => link.platform === "huggingface")
              .map((link) => [link.href, getHfDownloadCount(link, hfDownloads)])
          );
          const kaggleLinkCountByHref = new Map(
            achievementLinks
              .filter((link) => link.platform === "kaggle")
              .map((link) => [link.href, getKaggleDownloadCount(link, kaggleDownloads)])
          );
          const allLinkCounts = [
            ...hfLinkCountByHref.values(),
            ...kaggleLinkCountByHref.values(),
          ];
          const totalDownloads =
            allLinkCounts.length > 0 && allLinkCounts.every((count) => count !== null)
              ? formatDownloadCount(allLinkCounts.reduce((sum, count) => sum + count, 0))
              : null;

          return (
            <div
              key={`${achievement.title || "achievement"}-${achievementIndex}`}
              className={`achieve-item ${achievementLinks.length > 1 ? "multi-link" : ""}`}
              data-shortcut-target="true"
              aria-label={achievement.title}
              role="group"
              tabIndex={-1}
              style={{ "--accent": achievement.color }}
              onMouseMove={handleCardTilt}
              onMouseLeave={resetCardTilt}
            >
              <div className="achieve-dot"></div>
              <div className="achieve-content">
                <h3>{achievement.title}</h3>
                <p>{achievement.desc}</p>
                {achievementLinks.length > 0 && (
                  <div className="achieve-links">
                    {achievementLinks.map((link, index) => {
                      const downloadCount =
                        hfLinkCountByHref.get(link.href) ?? kaggleLinkCountByHref.get(link.href);
                      return (
                        <a
                          key={`${achievement.title}-${link.href}-${index}`}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`achieve-link ${link.platform ? `platform-${link.platform}` : ""}`}
                          data-shortcut-target="true"
                        >
                          {getAchievementLinkIcon(link.platform)}
                          {link.text}
                          {typeof downloadCount === "number" && (
                            <span className="achieve-link-count">
                              {formatDownloadCount(downloadCount)}
                            </span>
                          )}
                        </a>
                      );
                    })}
                  </div>
                )}
                {totalDownloads && (
                  <div className="achieve-downloads-total">
                    <Download size={11} />
                    <span>{totalDownloads} all-time downloads</span>
                  </div>
                )}
              </div>
              <span className="achieve-date">{achievement.date}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export const CertificationsPane = ({ isSplit }) => (
  <motion.div
    key="certifications"
    className={`tab-pane certs-pane ${isSplit ? "split" : ""}`}
    {...tabPaneMotionProps}
  >
    <div className="pane-header">
      <Award size={16} />
      <span>Certifications</span>
    </div>
    <div className="certs-grid">
      {certifications.map((certification, index) => (
        <div
          key={`${certification.name || "certification"}-${certification.org || index}`}
          className="cert-item"
          data-shortcut-target="true"
          aria-label={`${certification.name} certification`}
          role="group"
          tabIndex={-1}
          onMouseMove={handleCardTilt}
          onMouseLeave={resetCardTilt}
        >
          <div className="cert-badge">{certification.org.slice(0, 3).toUpperCase()}</div>
          <div className="cert-info">
            <span className="cert-name">{certification.name}</span>
            <span className="cert-org">{certification.org}</span>
          </div>
          <div className="cert-actions">
            <span className="cert-date">{certification.date}</span>
            {certification.link && (
              <a
                href={certification.link}
                target="_blank"
                rel="noopener noreferrer"
                className="cert-link"
                data-shortcut-target="true"
                aria-label={`Open ${certification.name} certificate`}
                title={`Open ${certification.name} certificate`}
              >
                <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

export const VolunteeringPane = ({ isSplit }) => (
  <motion.div
    key="volunteering"
    className={`tab-pane volunteering-pane ${isSplit ? "split" : ""}`}
    {...tabPaneMotionProps}
  >
    <div className="pane-header">
      <Heart size={16} />
      <span>Volunteering</span>
    </div>
    <div className="volunteer-list">
      {volunteering.map((volunteer, index) => {
        const certificateLinks =
          Array.isArray(volunteer.certificateLinks) && volunteer.certificateLinks.length > 0
            ? volunteer.certificateLinks
            : volunteer.certificateLink
              ? [{ label: "Certificate", url: volunteer.certificateLink }]
              : [];

        return (
          <div
            key={`${volunteer.title}-${index}`}
            className="volunteer-item"
            data-shortcut-target="true"
            aria-label={volunteer.title}
            role="group"
            tabIndex={-1}
            onMouseMove={handleCardTilt}
            onMouseLeave={resetCardTilt}
          >
            <div className="volunteer-icon">
              <Heart size={16} />
            </div>
            <div className="volunteer-content">
              <h3>{volunteer.title}</h3>
              <p className="volunteer-org">{volunteer.organization}</p>
              <p className="volunteer-location">{volunteer.location}</p>
              <div className="volunteer-meta">
                <span className="volunteer-date">{volunteer.date}</span>
                {certificateLinks.length > 0 && (
                  <div className="volunteer-cert-group">
                    <span className="volunteer-cert-label">
                      <ExternalLink size={10} />
                      {certificateLinks.length > 1 ? `Certificates (${certificateLinks.length})` : "Certificate"}
                    </span>
                    <div className="volunteer-cert-list">
                      {certificateLinks.map((certificate, certificateIndex) => (
                        <a
                          key={certificate.url || certificateIndex}
                          href={certificate.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="volunteer-cert-link"
                          data-shortcut-target="true"
                          aria-label={`Open ${certificate.label || `Certificate ${certificateIndex + 1}`}`}
                        >
                          {certificate.label || `Certificate ${certificateIndex + 1}`}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </motion.div>
);
