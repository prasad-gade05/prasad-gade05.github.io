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
        {activeTabs.includes("projects") && <ProjectsPane />}
        {activeTabs.includes("about") && <AboutPane isSplit={isSplit} />}
        {activeTabs.includes("skills") && <SkillsPane isSplit={isSplit} />}
        {activeTabs.includes("experience") && <ExperiencePane isSplit={isSplit} />}
        {activeTabs.includes("education") && <EducationPane isSplit={isSplit} />}
        {activeTabs.includes("achievements") && <AchievementsPane isSplit={isSplit} />}
        {activeTabs.includes("certifications") && <CertificationsPane isSplit={isSplit} />}
        {activeTabs.includes("volunteering") && <VolunteeringPane isSplit={isSplit} />}
        {activeTabs.includes("hobbies") && (
          <HobbiesPane
            isSplit={isSplit}
            onOpenMinecraft={onOpenMinecraft}
            onOpenMovies={onOpenMovies}
            onStartDoodle={onStartDoodle}
            onStartSmash={onStartSmash}
          />
        )}
        {activeTabs.includes("blogs") && <BlogsTabPane />}
      </AnimatePresence>
    </div>
  );
};

export default ContentTabPanes;
