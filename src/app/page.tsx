import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import CTASection from "@/components/layout/home-page/CTASection";
import FeaturesSection from "@/components/layout/home-page/FeaturesSection";
import HeroSection from "@/components/layout/home-page/HeroSection";
import StepsSection from "@/components/layout/home-page/StepsSection";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-grow">
      <HeroSection />
      <FeaturesSection />
      <StepsSection />
      <CTASection />
    </main>
    <Footer />
  </div>
  );
}
