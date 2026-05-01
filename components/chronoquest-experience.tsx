"use client";

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

  const allQuestions = quizQuestions as QuizQuestion[];
  const nodeQuestions = allQuestions.filter((question) => question.nodeId);
  const dailyChallengePool = allQuestions.filter((question) => !question.nodeId);

  return (
    <>
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
          onCorrectAnswer={awardXp}
          onStoryComplete={() => awardXp(60)}
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.12 }}
      >
        <DailyChallenge
          questions={dailyChallengePool}
          onComplete={completeDailyChallenge}
          isCompletedToday={isDailyChallengeCompletedToday}
        />
      </motion.div>
      <section className="mx-auto mt-6 w-full max-w-4xl text-center text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
        Current level progress: {levelProgressPercent}/100 XP
      </section>
    </>
  );
}
