import "./Hero.css";
import ProfileSection from "./hero/ProfileSection";
import CodeCard from "./hero/CodeCard";
import SocialLinks from "./hero/SocialLinks";
import ContentTabs from "./hero/ContentTabs";

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-grid">
        {/* Left Column - Name First, then Code Card, then Social */}
        <div className="hero-left">
          <ProfileSection />
          <CodeCard />
          <SocialLinks />
        </div>

        {/* Right Column - Tabbed Content */}
        <ContentTabs />
      </div>
    </section>
  );
};

export default Hero;