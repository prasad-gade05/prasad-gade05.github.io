import { motion } from "framer-motion";
import { Download, ExternalLink, Folder } from "lucide-react";
import { FaGithub, FaKaggle } from "react-icons/fa";
import { SiHuggingface } from "react-icons/si";
import {
  startCardFlip,
  moveCardFlip,
  endCardFlip,
  cancelCardFlip,
  leaveCardFlip,
} from "../../../utils/cardFlip";
import { projectIcons, projects } from "../../../data/portfolioData";
import { getListItemKey, getRenderableListValues } from "../../../utils/listRendering";
import { tabPaneMotionProps } from "./motion";
import { useProjectGrid } from "./useProjectGrid";
import {
  extractHfRepoId,
  extractKaggleRef,
  formatDownloadCount,
  useDatasetDownloads,
  useKaggleDownloads,
} from "./useDatasetDownloads";

const ProjectsPane = () => {
  const { adaptiveGridStyle, lastRowOffset, lastRowStartIdx } = useProjectGrid(projects.length);
  const hfDownloads = useDatasetDownloads(projects.map((project) => project.dataset));
  const kaggleDownloads = useKaggleDownloads(projects.map((project) => project.kaggleDataset));

  return (
    <motion.div key="projects" className="tab-pane projects-pane" {...tabPaneMotionProps}>
      <div className="projects-grid" style={adaptiveGridStyle}>
        {projects.map((project, index) => {
          const ProjectIcon = projectIcons[project.title] || Folder;
          const techTags = getRenderableListValues(project.tech);
          const hfRepoId = project.dataset ? extractHfRepoId(project.dataset) : null;
          const downloadCount = hfRepoId ? hfDownloads[hfRepoId] : null;
          const kaggleRef = project.kaggleDataset ? extractKaggleRef(project.kaggleDataset) : null;
          const kaggleCount = kaggleRef ? kaggleDownloads[kaggleRef] : null;

          return (
            <div
              key={`${project.title || "project"}-${index}`}
              className="project-card"
              data-shortcut-target="true"
              aria-label={`${project.title} project card`}
              role="group"
              tabIndex={-1}
              style={index === lastRowStartIdx ? { gridColumnStart: lastRowOffset } : undefined}
              onPointerDown={startCardFlip}
              onPointerMove={moveCardFlip}
              onPointerUp={endCardFlip}
              onPointerCancel={cancelCardFlip}
              onPointerLeave={leaveCardFlip}
            >
              <div className="project-card-front">
                {project.badge && (
                  <span className={`project-badge${project.badge === "1st Place" ? " first-place" : ""}`}>
                    {project.badge}
                  </span>
                )}
                <div className="project-header">
                  <ProjectIcon size={20} />
                </div>
                <div className="project-body">
                  <div className="project-meta">
                    <span className="project-cat">{project.category}</span>
                    <span className="project-stats">{project.stats}</span>
                  </div>
                  <h3 className="project-title">{project.title}</h3>
                  <p className="project-subtitle">{project.subtitle}</p>
                  {project.description && <p className="project-desc">{project.description}</p>}
                  <div className="project-tech">
                    {techTags.map((tech, techIndex) => (
                      <span
                        key={getListItemKey(`${project.title || "project"}-tech`, tech, techIndex)}
                        className="tech-tag"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="project-card-links">
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-card-link"
                        data-shortcut-target="true"
                        aria-label={`${project.title} GitHub`}
                        title={`${project.title} GitHub`}
                      >
                        <FaGithub size={14} />
                      </a>
                    )}
                    {project.demo && (
                      <a
                        href={project.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-card-link demo"
                        data-shortcut-target="true"
                        aria-label={`${project.title} live demo`}
                        title={`${project.title} live demo`}
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                    {project.dataset && (
                      <a
                        href={project.dataset}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-card-link"
                        title="Hugging Face Dataset"
                        data-shortcut-target="true"
                        aria-label={`${project.title} Hugging Face dataset`}
                      >
                        <SiHuggingface size={14} />
                      </a>
                    )}
                    {hfRepoId && typeof downloadCount === "number" && (
                      <span
                        className="project-dataset-downloads"
                        title="All-time Hugging Face downloads"
                      >
                        <Download size={10} />
                        {formatDownloadCount(downloadCount)}
                      </span>
                    )}
                    {project.kaggleDataset && (
                      <a
                        href={project.kaggleDataset}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-card-link"
                        title="Kaggle Dataset"
                        data-shortcut-target="true"
                        aria-label={`${project.title} Kaggle dataset`}
                      >
                        <FaKaggle size={14} />
                      </a>
                    )}
                    {kaggleRef && typeof kaggleCount === "number" && (
                      <span
                        className="project-dataset-downloads"
                        title="All-time Kaggle downloads"
                      >
                        <Download size={10} />
                        {formatDownloadCount(kaggleCount)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="project-card-back" aria-hidden="true">
                <ProjectIcon size={26} />
                <span className="project-card-back-title">{project.title}</span>
                <span className="project-card-back-hint">the flip side</span>
              </div>
            </div>
          );
        })}
      </div>
      <a
        href="https://github.com/prasad-gade05"
        target="_blank"
        rel="noopener noreferrer"
        className="view-all-btn"
        data-shortcut-target="true"
      >
        <FaGithub size={14} />
        <span>View All on GitHub</span>
        <ExternalLink size={12} />
      </a>
    </motion.div>
  );
};

export default ProjectsPane;
