import type { HeroContent } from "@/types/landing";

type HeroSectionProps = {
  content: HeroContent;
};

export function HeroSection({ content }: HeroSectionProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pt-14 sm:px-10 sm:pt-18">
      <div className="relative overflow-hidden rounded-3xl border border-indigo-400/40 bg-slate-900/75 px-6 py-12 shadow-[0_20px_90px_rgba(79,70,229,0.25)] backdrop-blur-xl sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -left-24 top-0 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-52 w-52 rounded-full bg-violet-500/20 blur-3xl" />
        <span className="inline-flex rounded-full border border-indigo-300/40 bg-indigo-500/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-200">
          {content.badge}
        </span>

        <div className="mt-6 max-w-4xl space-y-6">
          <h1 className="text-balance text-4xl font-bold leading-tight text-slate-100 sm:text-5xl lg:text-6xl">
            {content.title}
          </h1>
          <p className="max-w-2xl text-pretty text-lg leading-8 text-slate-300">
            {content.subtitle}
          </p>
        </div>

        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
          Unlock timelines. Build streaks. Conquer knowledge.
        </p>

        <div className="mt-8">
          <a
            href={content.ctaHref}
            className="inline-flex items-center justify-center rounded-xl border border-indigo-300/40 bg-linear-to-r from-indigo-600 to-violet-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition duration-300 hover:-translate-y-0.5 hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-400/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            {content.ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
