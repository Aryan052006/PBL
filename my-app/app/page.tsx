import Hero from "./components/Hero";
import StatsBar from "./components/sections/StatsBar";
import FeaturesSection from "./components/sections/FeaturesSection";
import HowItWorksSection from "./components/sections/HowItWorksSection";
import CTASection from "./components/sections/CTASection";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Hero />
      <StatsBar />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
    </main>
  );
}
