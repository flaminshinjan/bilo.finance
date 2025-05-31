import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { IntegrationsSection } from "@/components/IntegrationsSection";

export default function Home() {
  return (
    <main className="h-screen max-w-[1200px] mx-auto px-4">
      <Navigation />
      <HeroSection />
      <IntegrationsSection />
    </main>
  );
}
