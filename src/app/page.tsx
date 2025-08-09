import CTASection from "@/app/components/layout/home-page/CTASection";
import { HowItWorksSection } from "@/app/components/layout/home-page/HowItWorksSection";
import HeroSection from "@/app/components/layout/home-page/HeroSection";
import Layout from "./components/layout/Layout";
import { FeaturesSection } from "./components/layout/home-page/FeaturesSection";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Layout>
          <HeroSection />
          <HowItWorksSection />
          <FeaturesSection />
          <CTASection />
      </Layout>
    </div>
  );
}
