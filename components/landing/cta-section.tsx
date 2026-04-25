import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="mx-auto max-w-container px-4 py-12 sm:py-24 md:py-32">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
        <h2 className="font-heading text-xl font-light tracking-tight text-balance sm:text-2xl md:text-3xl">
          Stop guessing. Start ranking.
        </h2>
        <p className="text-sm font-light text-muted-foreground/70 max-w-md leading-relaxed text-balance">
          Your competitors are already optimizing their profiles. See where you
          stand and take action in under a minute.
        </p>
        <a href="/sign-up">
          <Button variant="glow" size="lg" className="gap-2">
            Get your free audit
            <ArrowRight className="size-4" weight="bold" />
          </Button>
        </a>
      </div>
    </section>
  );
}
