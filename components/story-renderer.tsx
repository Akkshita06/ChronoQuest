"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { QuizQuestion } from "@/types/quiz";
import type { StoryNode } from "@/types/story";

type StoryRendererProps = {
  nodes: StoryNode[];
  nodeQuestions: QuizQuestion[];
  initialNodeId?: string;
  onStoryComplete?: () => void;
  onCorrectAnswer?: (xpReward: number) => void;
};

export function StoryRenderer({
  nodes,
  nodeQuestions,
  initialNodeId = "start",
  onStoryComplete,
  onCorrectAnswer,
}: StoryRendererProps) {
  const nodeMap = useMemo(
    () =>
      nodes.reduce<Record<string, StoryNode>>((accumulator, node) => {
        accumulator[node.id] = node;
        return accumulator;
      }, {}),
    [nodes],
  );

  const fallbackId = nodes[0]?.id ?? "";
  const safeInitialNodeId = nodeMap[initialNodeId] ? initialNodeId : fallbackId;

  const [currentNodeId, setCurrentNodeId] = useState(safeInitialNodeId);
  const [path, setPath] = useState<string[]>([safeInitialNodeId]);
  const [hasAwardedCompletionXp, setHasAwardedCompletionXp] = useState(false);
  const [answeredNodeIds, setAnsweredNodeIds] = useState<string[]>([]);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string>("");
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);

  const currentNode = nodeMap[currentNodeId];
  const isTerminalNode = (currentNode?.choices.length ?? 0) === 0;
  const currentNodeQuestion = nodeQuestions.find(
    (question) => question.nodeId === currentNodeId,
  );
  const hasAnsweredCurrentNode = answeredNodeIds.includes(currentNodeId);
  const selectedOptionIsCorrect =
    selectedQuizOption === currentNodeQuestion?.correctOptionId;
  const canChooseStoryBranch =
    !currentNodeQuestion || hasAnsweredCurrentNode || isTerminalNode;

  useEffect(() => {
    if (!isTerminalNode || hasAwardedCompletionXp || !onStoryComplete) return;
    onStoryComplete();
    setHasAwardedCompletionXp(true);
  }, [isTerminalNode, hasAwardedCompletionXp, onStoryComplete]);

  const handleChoice = (choiceId: string) => {
    if (!currentNode || !canChooseStoryBranch) return;

    const nextNodeId = currentNode.nextNode[choiceId];
    if (!nextNodeId || !nodeMap[nextNodeId]) return;

    setCurrentNodeId(nextNodeId);
    setPath((previousPath) => [...previousPath, nextNodeId]);
    setSelectedQuizOption("");
    setIsQuizSubmitted(false);
  };

  const handleRestart = () => {
    setCurrentNodeId(safeInitialNodeId);
    setPath([safeInitialNodeId]);
    setHasAwardedCompletionXp(false);
    setAnsweredNodeIds([]);
    setSelectedQuizOption("");
    setIsQuizSubmitted(false);
  };

  const handleQuizSubmit = () => {
    if (!currentNodeQuestion || !selectedQuizOption || isQuizSubmitted) return;

    setIsQuizSubmitted(true);
    setAnsweredNodeIds((previous) =>
      previous.includes(currentNodeId) ? previous : [...previous, currentNodeId],
    );

    if (selectedOptionIsCorrect && onCorrectAnswer) {
      onCorrectAnswer(25);
    }
  };

  if (!currentNode) {
    return (
      <section className="mx-auto w-full max-w-3xl rounded-2xl border border-rose-400/40 bg-rose-900/30 p-6 text-rose-100">
        Unable to load story nodes. Please verify the story data format.
      </section>
    );
  }

  return (
    <motion.section
      id="start"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto mt-6 w-full max-w-5xl rounded-3xl border border-indigo-400/30 bg-slate-900/80 p-6 shadow-[0_14px_60px_rgba(99,102,241,0.2)] backdrop-blur-xl sm:p-8"
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-wide text-indigo-100">
          Ashoka: Kalinga War
        </h2>
        <span className="rounded-full border border-slate-600 bg-slate-800/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-300">
          Step {path.length}
        </span>
      </div>

      <p className="text-base leading-8 text-slate-200">{currentNode.text}</p>

      {currentNodeQuestion && !isTerminalNode && (
        <div className="mt-6 rounded-2xl border border-indigo-400/35 bg-indigo-950/35 p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-indigo-200">
            Knowledge Check
          </p>
          <p className="mt-2 text-sm text-indigo-100">{currentNodeQuestion.prompt}</p>

          <div className="mt-4 grid gap-2">
            {currentNodeQuestion.options.map((option) => {
              const isSelected = selectedQuizOption === option.id;
              const isCorrectOption = option.id === currentNodeQuestion.correctOptionId;
              const shouldHighlightCorrect = isQuizSubmitted && isCorrectOption;
              const shouldHighlightIncorrect =
                isQuizSubmitted && isSelected && !isCorrectOption;

              return (
                <motion.button
                  key={option.id}
                  type="button"
                  whileHover={isQuizSubmitted ? undefined : { scale: 1.01 }}
                  whileTap={isQuizSubmitted ? undefined : { scale: 0.985 }}
                  disabled={isQuizSubmitted}
                  onClick={() => setSelectedQuizOption(option.id)}
                  className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                    shouldHighlightCorrect
                      ? "border-emerald-400 bg-emerald-500/15 text-emerald-100"
                      : shouldHighlightIncorrect
                        ? "border-rose-400 bg-rose-500/15 text-rose-100"
                        : isSelected
                          ? "border-indigo-300 bg-indigo-500/20 text-indigo-50"
                          : "border-indigo-400/35 bg-slate-900/70 text-slate-200 hover:border-indigo-300 hover:bg-indigo-500/10"
                  } ${isQuizSubmitted ? "cursor-not-allowed" : ""}`}
                >
                  {option.label}
                </motion.button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <motion.button
              type="button"
              whileHover={!selectedQuizOption || isQuizSubmitted ? undefined : { scale: 1.03 }}
              whileTap={!selectedQuizOption || isQuizSubmitted ? undefined : { scale: 0.97 }}
              onClick={handleQuizSubmit}
              disabled={!selectedQuizOption || isQuizSubmitted}
              className="rounded-lg bg-linear-to-r from-indigo-600 to-violet-600 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-md shadow-indigo-900/40 transition-colors hover:from-indigo-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Submit Answer
            </motion.button>
            {isQuizSubmitted && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-xs font-semibold uppercase tracking-wide ${
                  selectedOptionIsCorrect ? "text-emerald-300" : "text-rose-300"
                }`}
              >
                {selectedOptionIsCorrect
                  ? "Correct! +25 XP"
                  : "Not quite. Review and continue."}
              </motion.p>
            )}
          </div>

          {isQuizSubmitted && (
            <p className="mt-3 text-sm text-indigo-100/90">
              {currentNodeQuestion.explanation}
            </p>
          )}
        </div>
      )}

      {isTerminalNode ? (
        <div className="mt-8 rounded-2xl border border-emerald-400/45 bg-emerald-900/25 p-4">
          <p className="text-sm font-medium text-emerald-100">
            Timeline complete. +60 XP awarded. Explore another path for more outcomes.
          </p>
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleRestart}
            className="mt-4 inline-flex rounded-lg bg-linear-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-900/40 transition-colors hover:from-indigo-500 hover:to-violet-500"
          >
            Restart Story
          </motion.button>
        </div>
      ) : (
        <div className="mt-8 grid gap-3">
          {currentNode.choices.map((choice) => (
            <motion.button
              key={choice.id}
              type="button"
              whileHover={canChooseStoryBranch ? { scale: 1.01, x: 2 } : undefined}
              whileTap={canChooseStoryBranch ? { scale: 0.985 } : undefined}
              onClick={() => handleChoice(choice.id)}
              disabled={!canChooseStoryBranch}
              className="w-full rounded-xl border border-slate-600 bg-slate-800/60 px-4 py-3 text-left text-sm font-medium text-slate-100 transition hover:border-indigo-300 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {choice.label}
            </motion.button>
          ))}
        </div>
      )}
    </motion.section>
  );
}
