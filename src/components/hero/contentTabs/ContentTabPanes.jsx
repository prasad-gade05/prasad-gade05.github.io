import { AnimatePresence } from "framer-motion";
import ProjectsPane from "./ProjectsPane";
import { AboutPane, SkillsPane } from "./ProfilePanes";
import {
  AchievementsPane,
  CertificationsPane,
  EducationPane,
  ExperiencePane,
  VolunteeringPane,
} from "./CareerPanes";
import { BlogsTabPane, HobbiesPane } from "./PersonalPanes";

const ContentTabPanes = ({
  activeTabs,
  contentRef,
  onOpenMinecraft,
  onOpenMovies,
  onStartDoodle,
  onStartSmash,
}) => {
  const isSplit = activeTabs.length > 1;

  return (
    <div ref={contentRef} className={`tabs-content ${isSplit ? "split-view" : ""}`}>
      <AnimatePresence mode="sync">
        {activeTabs.includes("projects") && <ProjectsPane key="projects" />}
        {activeTabs.includes("about") && <AboutPane key="about" isSplit={isSplit} />}
        {activeTabs.includes("skills") && <SkillsPane key="skills" isSplit={isSplit} />}
        {activeTabs.includes("experience") && <ExperiencePane key="experience" isSplit={isSplit} />}
        {activeTabs.includes("education") && <EducationPane key="education" isSplit={isSplit} />}
        {activeTabs.includes("achievements") && <AchievementsPane key="achievements" isSplit={isSplit} />}
        {activeTabs.includes("certifications") && <CertificationsPane key="certifications" isSplit={isSplit} />}
        {activeTabs.includes("volunteering") && <VolunteeringPane key="volunteering" isSplit={isSplit} />}
        {activeTabs.includes("hobbies") && (
          <HobbiesPane
            key="hobbies"
            isSplit={isSplit}
            onOpenMinecraft={onOpenMinecraft}
            onOpenMovies={onOpenMovies}
            onStartDoodle={onStartDoodle}
            onStartSmash={onStartSmash}
          />
        )}
        {activeTabs.includes("blogs") && <BlogsTabPane key="blogs" />}
      </AnimatePresence>
    </div>
  );
};

export default ContentTabPanes;
