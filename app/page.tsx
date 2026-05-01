import { ChronoQuestExperience } from "@/components/chronoquest-experience";
import { HeroSection } from "@/components/hero-section";
import { heroContent } from "@/data/landing";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-linear-to-b from-slate-950 via-slate-950 to-indigo-950/40 pb-24">
      <HeroSection content={heroContent} />
      <ChronoQuestExperience />
    </main>
  );
}
