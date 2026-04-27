import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import PlatformOverviewSection from "@/components/PlatformOverviewSection";
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
    <CategoriesSection />
    <FeaturedServices />
    <HowItWorks />
    <CTASection />
    <Footer />
  </div>
);

export default Index;
