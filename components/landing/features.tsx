import {
  Gauge,
  Users,
  Lightning,
  Globe,
} from "@phosphor-icons/react/dist/ssr";

const features = [
  {
    icon: Gauge,
    title: "Instant scoring",
    description:
      "Your profile is scored across 5 key categories. See exactly what's working and what needs attention.",
  },
  {
    icon: Users,
    title: "Competitor intel",
    description:
      "Side-by-side comparison with your top local competitors. Ratings, reviews, scores, ranked.",
  },
  {
    icon: Lightning,
    title: "One-click content",
    description:
      "Generate SEO blog posts optimized for your business type and location. Published to your tenant blog.",
  },
  {
    icon: Globe,
    title: "Multi-tenant blogs",
    description:
      "Each business gets its own blog subdomain. Clean URLs, fast loading, automatic publishing.",
  },
] as const;

export function Features() {
  return (
    <section className="mx-auto max-w-container px-4 py-12 sm:py-24 md:py-32">
      <div className="mx-auto max-w-4xl">
        <div className="grid gap-6 sm:grid-cols-2 md:gap-x-8 md:gap-y-10">
          {features.map((feature) => (
            <div key={feature.title} className="flex gap-4">
              <div className="mt-0.5 shrink-0 flex size-9 items-center justify-center rounded-xl bg-primary/8 shadow-[inset_0_1px_1px_oklch(0.82_0.14_65_/_30%),inset_0_-1px_2px_oklch(0.35_0.08_45_/_15%)]">
                <feature.icon
                  className="size-[18px] text-primary"
                  weight="duotone"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-sm font-semibold tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-sm font-light text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
