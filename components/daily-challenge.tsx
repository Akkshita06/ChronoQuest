"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  calculateDailyChallengeXp,
  getTodayUTCKey,
  selectDailyQuestions,
  type DailyChallengeResult,
  type LeaderboardEntry,
} from "@/lib/daily-challenge";
import type { QuizQuestion } from "@/types/quiz";

type DailyChallengeProps = {
  questions: QuizQuestion[];
  onComplete: (xpReward: number) => void;
  isCompletedToday: boolean;
  currentStreak: number;
};

const LEADERBOARD_KEY = "chronoquest.dailyChallenge.leaderboard";
const DAILY_RESULT_PREFIX = "chronoquest.dailyChallenge.result";

export function DailyChallenge({
  questions,
  onComplete,
  isCompletedToday,
  currentStreak,
}: DailyChallengeProps) {
  const [challengeQuestions, setChallengeQuestions] = useState<QuizQuestion[] | null>(
    null,
  );
  const [dateKey, setDateKey] = useState<string | null>(null);
  const [dailySeed, setDailySeed] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [completedResult, setCompletedResult] = useState<DailyChallengeResult | null>(
    null,
  );
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [shareStatus, setShareStatus] = useState<"idle" | "shared" | "copied">("idle");

  useEffect(() => {
    const todayKey = getTodayUTCKey();
    const selection = selectDailyQuestions(questions, todayKey, 5);
    setDateKey(todayKey);
    setDailySeed(selection.seed);
    setChallengeQuestions(selection.questions);
    setCurrentIndex(0);
    setSelectedOptionId("");
    setSubmitted(false);
    setCorrectCount(0);
    setIsFinished(false);
    setShareStatus("idle");

    try {
      const rawBoard = window.localStorage.getItem(LEADERBOARD_KEY);
      if (rawBoard) {
        setLeaderboard(JSON.parse(rawBoard) as LeaderboardEntry[]);
      } else {
        setLeaderboard([]);
      }

      const rawResult = window.localStorage.getItem(
        `${DAILY_RESULT_PREFIX}.${todayKey}`,
      );
      if (rawResult) {
        setCompletedResult(JSON.parse(rawResult) as DailyChallengeResult);
      } else {
        setCompletedResult(null);
      }
    } catch {
      setLeaderboard([]);
      setCompletedResult(null);
    }
  }, [questions]);

  const currentQuestion = challengeQuestions?.[currentIndex];
  const isLastQuestion =
    challengeQuestions !== null && currentIndex === challengeQuestions.length - 1;
  const isCorrect = selectedOptionId === currentQuestion?.correctOptionId;
  const projectedStreak = isCompletedToday ? currentStreak : currentStreak + 1;
  const todayLeaderboard = useMemo(
    () =>
      leaderboard
        .filter((entry) => (dateKey ? entry.dateKey === dateKey : true))
        .sort((a, b) => b.totalXp - a.totalXp)
        .slice(0, 5),
    [leaderboard, dateKey],
  );

  const handleSubmit = () => {
    if (!selectedOptionId || submitted || !currentQuestion) return;
    setSubmitted(true);
    if (isCorrect) {
      setCorrectCount((count) => count + 1);
    }
  };

  const handleNext = () => {
    if (!submitted || !currentQuestion) return;

    if (isLastQuestion) {
      const finalCorrectCount = isCorrect ? correctCount + 1 : correctCount;
      const totalQuestions = challengeQuestions?.length ?? 5;
      const xp = calculateDailyChallengeXp({
        correctCount: finalCorrectCount,
        streak: projectedStreak,
        totalQuestions,
      });
      const result: DailyChallengeResult = {
        dateKey: dateKey ?? getTodayUTCKey(),
        correctCount: finalCorrectCount,
        totalQuestions,
        baseXp: xp.baseXp,
        streakMultiplier: xp.streakMultiplier,
        perfectMultiplier: xp.perfectMultiplier,
        totalXp: xp.totalXp,
        seed: dailySeed ?? 0,
      };
      onComplete(result.totalXp);
      setCompletedResult(result);
      persistResult(result);
      setIsFinished(true);
      return;
    }

    setCurrentIndex((index) => index + 1);
    setSelectedOptionId("");
    setSubmitted(false);
  };

  const persistResult = (result: DailyChallengeResult) => {
    const entry: LeaderboardEntry = {
      id: `${result.dateKey}-${result.totalXp}-${result.correctCount}`,
      dateKey: result.dateKey,
      playerName: "You",
      correctCount: result.correctCount,
      totalQuestions: result.totalQuestions,
      totalXp: result.totalXp,
      completedAt: new Date().toISOString(),
    };

    const updated = [...leaderboard, entry]
      .sort((a, b) => b.totalXp - a.totalXp)
      .slice(0, 30);
    setLeaderboard(updated);
    window.localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
    window.localStorage.setItem(
      `${DAILY_RESULT_PREFIX}.${result.dateKey}`,
      JSON.stringify(result),
    );
  };

  const handleShareResult = async () => {
    if (!completedResult) return;
    const summary =
      `ChronoQuest Daily Challenge (${completedResult.dateKey})\n` +
      `Score: ${completedResult.correctCount}/${completedResult.totalQuestions}\n` +
      `XP: ${completedResult.totalXp} (Base ${completedResult.baseXp}, ` +
      `Streak x${completedResult.streakMultiplier.toFixed(2)}, ` +
      `Perfect x${completedResult.perfectMultiplier.toFixed(2)})`;

    if (navigator.share) {
      await navigator.share({
        title: "ChronoQuest Daily Challenge",
        text: summary,
      });
      setShareStatus("shared");
      return;
    }

    await navigator.clipboard.writeText(summary);
    setShareStatus("copied");
  };

  if (isCompletedToday && completedResult) {
    return (
      <section className="mx-auto mt-6 w-full max-w-5xl rounded-3xl border border-emerald-400/40 bg-emerald-900/25 p-6 shadow-[0_14px_60px_rgba(16,185,129,0.12)] sm:p-8">
        <h3 className="text-lg font-semibold text-emerald-100">
          Daily Challenge Complete
        </h3>
        <ResultCard
          result={completedResult}
          shareStatus={shareStatus}
          onShare={handleShareResult}
        />
        <Leaderboard board={todayLeaderboard} />
      </section>
    );
  }

  if (challengeQuestions === null || !currentQuestion) {
    return (
      <section className="mx-auto mt-6 w-full max-w-5xl rounded-3xl border border-violet-400/30 bg-slate-900/80 p-6 shadow-[0_14px_60px_rgba(139,92,246,0.18)] backdrop-blur-xl sm:p-8">
        <h3 className="text-lg font-semibold text-violet-100">Daily Challenge</h3>
        <p className="mt-2 text-sm text-slate-300">
          Preparing your daily challenge...
        </p>
      </section>
    );
  }

  if (isFinished) {
    return (
      <section className="mx-auto mt-6 w-full max-w-5xl rounded-3xl border border-indigo-400/40 bg-indigo-900/25 p-6 shadow-[0_14px_60px_rgba(99,102,241,0.14)] sm:p-8">
        <h3 className="text-lg font-semibold text-indigo-100">Daily Challenge Complete</h3>
        {completedResult && (
          <>
            <ResultCard
              result={completedResult}
              shareStatus={shareStatus}
              onShare={handleShareResult}
            />
            <Leaderboard board={todayLeaderboard} />
          </>
        )}
      </section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto mt-6 w-full max-w-5xl rounded-3xl border border-violet-400/30 bg-slate-900/80 p-6 shadow-[0_14px_60px_rgba(139,92,246,0.18)] backdrop-blur-xl sm:p-8"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-violet-100">Daily Challenge</h3>
        <span className="rounded-full border border-slate-600 bg-slate-800/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
          Question {currentIndex + 1}/5
        </span>
      </div>
      <p className="text-xs uppercase tracking-[0.14em] text-violet-300">
        Daily Seed {dailySeed ?? "----"} - streak bonus x
        {Math.min(1 + projectedStreak * 0.05, 1.5).toFixed(2)}
      </p>

      <p className="mt-3 text-slate-100">{currentQuestion.prompt}</p>

      <div className="mt-4 grid gap-2">
        {currentQuestion.options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const isCorrectOption = option.id === currentQuestion.correctOptionId;
          const showCorrectState = submitted && isCorrectOption;
          const showIncorrectState = submitted && isSelected && !isCorrectOption;

          return (
            <motion.button
              key={option.id}
              type="button"
              whileHover={!submitted ? { scale: 1.01 } : undefined}
              whileTap={!submitted ? { scale: 0.985 } : undefined}
              animate={
                showIncorrectState
                  ? { x: [0, -6, 6, -4, 4, 0] }
                  : showCorrectState
                    ? { scale: [1, 1.03, 1] }
                    : undefined
              }
              transition={{ duration: 0.35 }}
              disabled={submitted}
              onClick={() => setSelectedOptionId(option.id)}
              className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                showCorrectState
                  ? "border-emerald-400 bg-emerald-500/15 text-emerald-100"
                  : showIncorrectState
                    ? "border-rose-400 bg-rose-500/15 text-rose-100"
                    : isSelected
                      ? "border-violet-300 bg-violet-500/20 text-violet-100"
                      : "border-slate-600 bg-slate-800/60 text-slate-100 hover:border-violet-300 hover:bg-violet-500/10"
              }`}
            >
              {option.label}
            </motion.button>
          );
        })}
      </div>

      {submitted && (
        <div className="mt-3 space-y-2">
          <p
            className={`text-xs font-semibold uppercase tracking-[0.12em] ${
              isCorrect ? "text-emerald-300" : "text-rose-300"
            }`}
          >
            {isCorrect ? "Perfect strike: +30 base XP banked" : "No base XP this round"}
          </p>
          <p className="text-sm text-slate-200">{currentQuestion.explanation}</p>
        </div>
      )}

      <div className="mt-4 flex items-center gap-3">
        <motion.button
          type="button"
          whileHover={!selectedOptionId || submitted ? undefined : { scale: 1.03 }}
          whileTap={!selectedOptionId || submitted ? undefined : { scale: 0.97 }}
          onClick={handleSubmit}
          disabled={!selectedOptionId || submitted}
          className="rounded-lg bg-linear-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-violet-900/40 transition-colors hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Check
        </motion.button>
        <motion.button
          type="button"
          whileHover={submitted ? { scale: 1.03 } : undefined}
          whileTap={submitted ? { scale: 0.97 } : undefined}
          onClick={handleNext}
          disabled={!submitted}
          className="rounded-lg border border-slate-500 bg-slate-800/70 px-4 py-2 text-sm font-semibold text-slate-100 transition-colors hover:border-slate-300 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLastQuestion ? "Finish Challenge" : "Next Question"}
        </motion.button>
      </div>
    </motion.section>
  );
}

function ResultCard({
  result,
  shareStatus,
  onShare,
}: {
  result: DailyChallengeResult;
  shareStatus: "idle" | "shared" | "copied";
  onShare: () => Promise<void>;
}) {
  return (
    <div className="mt-4 rounded-2xl border border-indigo-300/40 bg-slate-900/65 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-300">
        Daily Summary
      </p>
      <p className="mt-2 text-sm text-slate-200">
        Score {result.correctCount}/{result.totalQuestions} - Total XP{" "}
        <span className="font-bold text-amber-200">{result.totalXp}</span>
      </p>
      <p className="mt-2 text-xs text-slate-400">
        Base {result.baseXp} XP x Streak {result.streakMultiplier.toFixed(2)} x
        Perfect {result.perfectMultiplier.toFixed(2)}
      </p>
      <motion.button
        type="button"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onShare}
        className="mt-3 rounded-lg bg-linear-to-r from-fuchsia-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white"
      >
        Share Result
      </motion.button>
      <AnimatePresence>
        {shareStatus !== "idle" && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300"
          >
            {shareStatus === "shared" ? "Shared successfully" : "Copied to clipboard"}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function Leaderboard({ board }: { board: LeaderboardEntry[] }) {
  return (
    <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
        Local Leaderboard
      </p>
      <div className="mt-3 space-y-2">
        {board.length === 0 ? (
          <p className="text-sm text-slate-400">No entries yet for today.</p>
        ) : (
          board.map((entry, index) => (
            <div
              key={`${entry.id}-${index}`}
              className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm"
            >
              <p className="text-slate-200">
                #{index + 1} {entry.playerName} - {entry.correctCount}/
                {entry.totalQuestions}
              </p>
              <p className="font-semibold text-amber-200">{entry.totalXp} XP</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
