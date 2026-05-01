"use client";

import { motion } from "framer-motion";
import type { HeroContent } from "@/types/landing";

type HeroSectionProps = {
  content: HeroContent;
};

export function HeroSection({ content }: HeroSectionProps) {
  const container = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.12 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-6 pt-14 sm:px-10 sm:pt-18">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative overflow-hidden rounded-3xl border border-indigo-400/40 bg-slate-900/75 px-6 py-12 shadow-[0_20px_90px_rgba(79,70,229,0.25)] backdrop-blur-xl sm:px-10 sm:py-14"
      >
        <div className="pointer-events-none absolute -left-24 top-0 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-52 w-52 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(192,132,252,0.12),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(226,232,240,0.6)_0.7px,transparent_0.7px)] bg-size-[26px_26px] opacity-40" />
        <motion.span
          variants={item}
          className="inline-flex rounded-full border border-indigo-300/40 bg-indigo-500/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-200"
        >
          {content.badge}
        </motion.span>

        <motion.div variants={item} className="mt-6 max-w-4xl space-y-6">
          <h1 className="text-balance text-4xl font-black leading-tight text-slate-100 sm:text-5xl lg:text-6xl">
            {content.title}
          </h1>
          <p className="max-w-2xl text-pretty text-lg leading-8 text-slate-300">
            {content.subtitle}
          </p>
        </motion.div>

        <motion.p
          variants={item}
          className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400"
        >
          Unlock timelines. Build streaks. Conquer knowledge.
        </motion.p>

        <motion.div variants={item} className="mt-8">
          <motion.a
            href={content.ctaHref}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            animate={{
              boxShadow: [
                "0 0 0 rgba(99,102,241,0.2)",
                "0 0 24px rgba(99,102,241,0.55)",
                "0 0 0 rgba(99,102,241,0.2)",
              ],
            }}
            transition={{
              boxShadow: { repeat: Infinity, duration: 2.6, ease: "easeInOut" },
            }}
            className="inline-flex items-center justify-center rounded-xl border border-indigo-300/40 bg-linear-to-r from-indigo-500 via-violet-500 to-fuchsia-500 px-7 py-3 text-sm font-bold text-white transition duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            {content.ctaLabel}
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  );
}
