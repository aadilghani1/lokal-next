import { LandingNav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Features } from "@/components/landing/features";
import { CtaSection } from "@/components/landing/cta-section";
import { Separator } from "@/components/ui/separator";

export default function LandingPage() {
  return (
    <>
      <LandingNav />
      <Hero />
      <HowItWorks />
      <div className="mx-auto max-w-container px-4">
        <Separator />
      </div>
      <Features />
      <div className="mx-auto max-w-container px-4">
        <Separator />
      </div>
      <CtaSection />
      <footer className="mx-auto max-w-container px-4 py-8 text-center">
        <p className="text-[11px] font-light text-muted-foreground/50 tracking-wide">
          &copy; {new Date().getFullYear()} Lokal. All rights reserved.
        </p>
      </footer>
    </>
  );
}
