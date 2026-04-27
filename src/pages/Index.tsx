import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import PlatformOverviewSection from "@/components/PlatformOverviewSection";
import EcosystemShowcaseSection from "@/components/EcosystemShowcaseSection";
import CategoriesSection from "@/components/CategoriesSection";
import FeaturedServices from "@/components/FeaturedServices";
import HowItWorks from "@/components/HowItWorks";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen">
    <Header />
    <HeroSection />
    <PlatformOverviewSection />
    <EcosystemShowcaseSection />
    <CategoriesSection />
    <FeaturedServices />
    <HowItWorks />
    <CTASection />
    <Footer />
  </div>
);

export default Index;
