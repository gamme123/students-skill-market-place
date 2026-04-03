import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HowItWorks from "@/components/HowItWorks";
import CTASection from "@/components/CTASection";

const HowItWorksPage = () => (
  <div className="min-h-screen">
    <Header />
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-2 text-center text-3xl font-bold text-foreground">How SkillSwap Works</h1>
      <p className="mb-8 text-center text-muted-foreground">Everything you need to know to get started</p>
    </div>
    <HowItWorks />
    <section className="bg-secondary/50 py-16">
      <div className="container mx-auto grid gap-8 px-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-8">
          <h3 className="mb-3 text-xl font-bold text-foreground">🛒 For Buyers</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>✅ Browse hundreds of student services</li>
            <li>✅ Chat with sellers before ordering</li>
            <li>✅ Secure payment & money-back guarantee</li>
            <li>✅ Leave reviews to help the community</li>
          </ul>
        </div>
        <div className="rounded-xl border border-border bg-card p-8">
          <h3 className="mb-3 text-xl font-bold text-foreground">💰 For Sellers</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>✅ List your services for free</li>
            <li>✅ Set your own prices & delivery times</li>
            <li>✅ Build your portfolio & reputation</li>
            <li>✅ Get paid directly to your account</li>
          </ul>
        </div>
      </div>
    </section>
    <CTASection />
    <Footer />
  </div>
);

export default HowItWorksPage;
