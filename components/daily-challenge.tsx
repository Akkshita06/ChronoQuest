"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { QuizQuestion } from "@/types/quiz";

type DailyChallengeProps = {
  questions: QuizQuestion[];
  onComplete: (xpReward: number) => void;
  isCompletedToday: boolean;
};

function shuffleQuestions(items: QuizQuestion[]) {
  const cloned = [...items];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[randomIndex]] = [cloned[randomIndex], cloned[i]];
  }
  return cloned;
}

export function DailyChallenge({
  questions,
  onComplete,
  isCompletedToday,
}: DailyChallengeProps) {
  const challengeQuestions = useMemo(
    () => shuffleQuestions(questions).slice(0, 5),
    [questions],
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = challengeQuestions[currentIndex];
  const isLastQuestion = currentIndex === challengeQuestions.length - 1;
  const isCorrect = selectedOptionId === currentQuestion?.correctOptionId;

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
      const xpReward = finalCorrectCount * 30;
      onComplete(xpReward);
      setIsFinished(true);
      return;
    }

    setCurrentIndex((index) => index + 1);
    setSelectedOptionId("");
    setSubmitted(false);
  };

  if (isCompletedToday) {
    return (
      <section className="mx-auto mt-6 w-full max-w-5xl rounded-3xl border border-emerald-400/40 bg-emerald-900/25 p-6 shadow-[0_14px_60px_rgba(16,185,129,0.12)] sm:p-8">
        <h3 className="text-lg font-semibold text-emerald-100">Daily Challenge</h3>
        <p className="mt-2 text-sm text-emerald-200">
          You already completed today&apos;s 5-question challenge. Come back tomorrow
          to extend your streak.
        </p>
      </section>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  if (isFinished) {
    return (
      <section className="mx-auto mt-6 w-full max-w-5xl rounded-3xl border border-indigo-400/40 bg-indigo-900/25 p-6 shadow-[0_14px_60px_rgba(99,102,241,0.14)] sm:p-8">
        <h3 className="text-lg font-semibold text-indigo-100">Daily Challenge Complete</h3>
        <p className="mt-2 text-sm text-indigo-200">
          Score: {correctCount}/5 correct. You earned {correctCount * 30} XP.
        </p>
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

      <p className="text-slate-100">{currentQuestion.prompt}</p>

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
        <p className="mt-3 text-sm text-slate-200">{currentQuestion.explanation}</p>
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
