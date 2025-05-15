import Footer from "@/app/components/layout/Footer";
import Header from "@/app/components/layout/Header";
import CTASection from "@/app/components/layout/home-page/CTASection";
import FeaturesSection from "@/app/components/layout/home-page/FeaturesSection";
import HeroSection from "@/app/components/layout/home-page/HeroSection";
import StepsSection from "@/app/components/layout/home-page/StepsSection";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 to-black">
    <Header />
    <main className="flex-grow bg-transparent">
      <HeroSection />
      <FeaturesSection />
      <StepsSection />
      <CTASection />
    </main>
    <Footer />
  </div>
  );
}
