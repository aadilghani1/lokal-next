import { MagnifyingGlass, ChartBar, PencilLine } from "@phosphor-icons/react/dist/ssr";

const steps = [
  {
    number: "01",
    icon: MagnifyingGlass,
    title: "Audit",
    description:
      "Paste your Google Business Profile URL. We score your listing across reviews, photos, posts, completeness, and keywords.",
  },
  {
    number: "02",
    icon: ChartBar,
    title: "Compare",
    description:
      "See exactly where you rank against your top 5 local competitors. No guesswork, just data.",
  },
  {
    number: "03",
    icon: PencilLine,
    title: "Rank",
    description:
      "One click generates SEO-optimized blog articles tailored to your business and location. Published instantly.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-container px-4 py-12 sm:py-24 md:py-32">
      <div className="mx-auto max-w-4xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary mb-3">
          How it works
        </p>
        <h2 className="font-heading text-xl font-light tracking-tight text-balance sm:text-2xl md:text-3xl mb-10 sm:mb-14">
          Three steps to better rankings.
        </h2>

        <div className="grid gap-8 md:grid-cols-3 md:gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="flex flex-col gap-4 rounded-2xl bg-card p-6 shadow-[var(--shadow-surface)]"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] font-bold text-primary/40">
                  {step.number}
                </span>
                <step.icon className="size-5 text-primary" weight="duotone" />
              </div>
              <h3 className="font-heading text-base font-semibold tracking-tight">
                {step.title}
              </h3>
              <p className="text-sm font-light text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
