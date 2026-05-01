"use client";

import { useMemo, useState } from "react";

type QuizCardProps = {
  onQuizComplete: (xpReward: number) => void;
};

const quizQuestion = {
  prompt:
    "After the Kalinga War, which major shift defined Ashoka's leadership?",
  choices: [
    {
      id: "a",
      label: "He expanded military campaigns toward Central Asia.",
    },
    {
      id: "b",
      label: "He embraced Dhamma and promoted ethical governance.",
      isCorrect: true,
    },
    {
      id: "c",
      label: "He abdicated the throne and dissolved the empire.",
    },
  ],
};

export function QuizCard({ onQuizComplete }: QuizCardProps) {
  const [selectedChoice, setSelectedChoice] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const chosenOption = useMemo(
    () => quizQuestion.choices.find((choice) => choice.id === selectedChoice),
    [selectedChoice],
  );

  const isCorrect = Boolean(chosenOption?.isCorrect);

  const handleSubmit = () => {
    if (!selectedChoice || isSubmitted) return;

    setIsSubmitted(true);
    onQuizComplete(isCorrect ? 40 : 20);
  };

  const handleReset = () => {
    setSelectedChoice("");
    setIsSubmitted(false);
  };

  return (
    <section className="mx-auto mt-6 w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h3 className="text-lg font-semibold text-slate-900">Quick Quiz</h3>
      <p className="mt-3 text-slate-700">{quizQuestion.prompt}</p>

      <div className="mt-5 grid gap-3">
        {quizQuestion.choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            disabled={isSubmitted}
            onClick={() => setSelectedChoice(choice.id)}
            className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
              selectedChoice === choice.id
                ? "border-indigo-500 bg-indigo-50 text-indigo-900"
                : "border-slate-300 text-slate-800 hover:border-slate-900 hover:bg-slate-50"
            } ${isSubmitted ? "cursor-not-allowed opacity-80" : ""}`}
          >
            {choice.label}
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedChoice || isSubmitted}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Submit Answer
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          Reset Quiz
        </button>
      </div>

      {isSubmitted && (
        <p className="mt-4 text-sm font-medium text-slate-700">
          {isCorrect
            ? "Correct! +40 XP awarded."
            : "Good try. +20 XP for completing the quiz."}
        </p>
      )}
    </section>
  );
}
