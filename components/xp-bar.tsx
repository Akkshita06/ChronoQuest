"use client";

import { motion } from "framer-motion";

type XpBarProps = {
  currentXpInLevel: number;
  maxXpPerLevel?: number;
};

export function XpBar({ currentXpInLevel, maxXpPerLevel = 100 }: XpBarProps) {
  const boundedXp = Math.min(Math.max(currentXpInLevel, 0), maxXpPerLevel);
  const progressPercent = (boundedXp / maxXpPerLevel) * 100;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-400">
        <span>Level Progress</span>
        <span>
          {boundedXp}/{maxXpPerLevel} XP
        </span>
      </div>
      <div className="h-3.5 w-full overflow-hidden rounded-full border border-indigo-400/30 bg-slate-800">
        <motion.div
          initial={false}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="h-full rounded-full bg-linear-to-r from-cyan-400 via-indigo-500 to-fuchsia-500"
        />
      </div>
    </div>
  );
}
