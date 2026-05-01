"use client";

import { motion } from "framer-motion";
import { XpBar } from "@/components/xp-bar";
import type { ProgressState } from "@/types/progress";

type ProgressDashboardProps = {
  progress: ProgressState;
  xpToNextLevel: number;
  isLoaded: boolean;
};

export function ProgressDashboard({
  progress,
  xpToNextLevel,
  isLoaded,
}: ProgressDashboardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="mx-auto mt-8 w-full max-w-5xl rounded-3xl border border-indigo-400/30 bg-slate-900/80 p-6 shadow-[0_16px_70px_rgba(79,70,229,0.2)] backdrop-blur-xl sm:p-8"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-100">Command Deck</h2>
        <div className="rounded-full border border-amber-300/50 bg-amber-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-amber-200">
          Level {progress.level} Vanguard
        </div>
        {!isLoaded && (
          <span className="text-xs font-medium uppercase tracking-wide text-indigo-200">
            Syncing progress...
          </span>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <motion.article whileHover={{ y: -3 }} className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Level
          </p>
          <p className="mt-2 text-3xl font-bold text-indigo-200">{progress.level}</p>
        </motion.article>

        <motion.article whileHover={{ y: -3 }} className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Total XP
          </p>
          <p className="mt-2 text-3xl font-bold text-cyan-200">{progress.xp}</p>
        </motion.article>

        <motion.article whileHover={{ y: -3 }} className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            🔥 Daily Streak
          </p>
          <p className="mt-2 text-3xl font-bold text-violet-200">{progress.streak} days</p>
        </motion.article>
      </div>

      <div className="mt-6">
        <XpBar currentXpInLevel={progress.xp % 100} />
        <p className="mt-3 text-sm text-slate-300">
          {xpToNextLevel} XP until Level {progress.level + 1}
        </p>
      </div>
    </motion.section>
  );
}
