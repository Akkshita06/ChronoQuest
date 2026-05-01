"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ProgressDashboard } from "@/components/progress-dashboard";
import { DailyChallenge } from "@/components/daily-challenge";
import { StoryRenderer } from "@/components/story-renderer";
import quizQuestions from "@/data/quizQuestions.json";
import storyNodes from "@/data/storyNodes.json";
import { useProgress } from "@/store/use-progress";
import type { QuizQuestion } from "@/types/quiz";
import type { StoryNode } from "@/types/story";

export function ChronoQuestExperience() {
  const {
    awardXp,
    completeDailyChallenge,
    isDailyChallengeCompletedToday,
    isLoaded,
    levelProgressPercent,
    progress,
    xpToNextLevel,
  } = useProgress();
  const [xpBurst, setXpBurst] = useState<{ id: number; amount: number } | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [lastKnownLevel, setLastKnownLevel] = useState(progress.level);

  const allQuestions = quizQuestions as QuizQuestion[];
  const nodeQuestions = allQuestions.filter((question) => question.nodeId);
  const dailyChallengePool = allQuestions.filter((question) => !question.nodeId);
  const renderDailyPool = useMemo(() => dailyChallengePool, [dailyChallengePool]);

  useEffect(() => {
    if (progress.level > lastKnownLevel) {
      setShowLevelUp(true);
      const timeoutId = window.setTimeout(() => setShowLevelUp(false), 1900);
      setLastKnownLevel(progress.level);
      return () => window.clearTimeout(timeoutId);
    }
    setLastKnownLevel(progress.level);
  }, [lastKnownLevel, progress.level]);

  const handleXpGain = (amount: number) => {
    if (amount <= 0) return;
    awardXp(amount);
    setXpBurst({ id: Date.now(), amount });
    window.setTimeout(() => setXpBurst(null), 950);
  };

  const handleDailyChallengeComplete = (amount: number) => {
    completeDailyChallenge(amount);
    if (amount > 0) {
      setXpBurst({ id: Date.now(), amount });
      window.setTimeout(() => setXpBurst(null), 950);
    }
  };

  return (
    <>
      <AnimateFloatingXp xpBurst={xpBurst} />
      <AnimateLevelUp show={showLevelUp} level={progress.level} />
      <ProgressDashboard
        progress={progress}
        xpToNextLevel={xpToNextLevel}
        isLoaded={isLoaded}
      />
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.06 }}
      >
        <StoryRenderer
          nodes={storyNodes as StoryNode[]}
          nodeQuestions={nodeQuestions}
          onCorrectAnswer={handleXpGain}
          onStoryComplete={() => handleXpGain(60)}
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.12 }}
      >
        <DailyChallenge
          questions={renderDailyPool}
          onComplete={handleDailyChallengeComplete}
          isCompletedToday={isDailyChallengeCompletedToday}
          currentStreak={progress.streak}
        />
      </motion.div>
      <section className="mx-auto mt-6 w-full max-w-4xl text-center text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
        Current level progress: {levelProgressPercent}/100 XP
      </section>
    </>
  );
}

function AnimateFloatingXp({
  xpBurst,
}: {
  xpBurst: { id: number; amount: number } | null;
}) {
  return (
    <>
      {xpBurst && (
        <motion.div
          key={xpBurst.id}
          initial={{ opacity: 0, y: 0, scale: 0.9 }}
          animate={{ opacity: 1, y: -34, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.85 }}
          className="pointer-events-none fixed right-8 top-24 z-40 rounded-full border border-amber-300/60 bg-amber-400/20 px-4 py-2 text-sm font-bold text-amber-100 shadow-lg shadow-amber-900/40"
        >
          +{xpBurst.amount} XP
        </motion.div>
      )}
    </>
  );
}

function AnimateLevelUp({ show, level }: { show: boolean; level: number }) {
  if (!show) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.72, opacity: 0, y: 14 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="rounded-3xl border border-amber-300/50 bg-slate-900/95 px-10 py-8 text-center shadow-[0_0_70px_rgba(251,191,36,0.35)]"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
          Level Up
        </p>
        <h3 className="mt-2 text-5xl font-black text-amber-100">LEVEL {level}</h3>
      </motion.div>
    </motion.div>
  );
}
