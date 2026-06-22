import {
  HeroSection,
  OverviewSection,
  FeaturedAgentsSection,
  FeaturedProjectsSection,
  WorkflowPreviewSection,
  ImpactMetricsSection,
} from "@/components/home/sections";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <OverviewSection />
      <WorkflowPreviewSection />
      <FeaturedAgentsSection />
      <FeaturedProjectsSection />
      <ImpactMetricsSection />
    </>
  );
}
