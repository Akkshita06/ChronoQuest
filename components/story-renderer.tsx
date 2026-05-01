"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  const [typedText, setTypedText] = useState("");
  const [activeConsequence, setActiveConsequence] = useState<{
    tone: "war" | "peace" | "power";
    text: string;
  } | null>(null);
  const [isTransitioningNode, setIsTransitioningNode] = useState(false);

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
    const storyText = currentNode?.text ?? "";
    setTypedText("");
    let index = 0;
    const intervalId = window.setInterval(() => {
      index += 1;
      setTypedText(storyText.slice(0, index));
      if (index >= storyText.length) {
        window.clearInterval(intervalId);
      }
    }, 14);

    return () => window.clearInterval(intervalId);
  }, [currentNodeId, currentNode?.text]);

  useEffect(() => {
    if (!isTerminalNode || hasAwardedCompletionXp || !onStoryComplete) return;
    onStoryComplete();
    setHasAwardedCompletionXp(true);
  }, [isTerminalNode, hasAwardedCompletionXp, onStoryComplete]);

  const handleChoice = (choiceId: string) => {
    if (!currentNode || !canChooseStoryBranch) return;

    const selectedChoice = currentNode.choices.find((choice) => choice.id === choiceId);
    const nextNodeId = currentNode.nextNode[choiceId];
    if (!nextNodeId || !nodeMap[nextNodeId]) return;

    if (selectedChoice) {
      setActiveConsequence(selectedChoice.consequence);
    }

    setIsTransitioningNode(true);
    window.setTimeout(() => {
      setCurrentNodeId(nextNodeId);
      setPath((previousPath) => [...previousPath, nextNodeId]);
      setSelectedQuizOption("");
      setIsQuizSubmitted(false);
      setIsTransitioningNode(false);
      setActiveConsequence(null);
    }, 650);
  };

  const handleRestart = () => {
    setCurrentNodeId(safeInitialNodeId);
    setPath([safeInitialNodeId]);
    setHasAwardedCompletionXp(false);
    setAnsweredNodeIds([]);
    setSelectedQuizOption("");
    setIsQuizSubmitted(false);
    setActiveConsequence(null);
    setIsTransitioningNode(false);
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

      <AnimatePresence mode="wait">
        <motion.p
          key={currentNodeId}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="min-h-24 text-base leading-8 text-slate-200"
        >
          {typedText}
        </motion.p>
      </AnimatePresence>

      <AnimatePresence>
        {activeConsequence && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
              activeConsequence.tone === "war"
                ? "border-rose-400/70 bg-rose-500/20 text-rose-100"
                : activeConsequence.tone === "peace"
                  ? "border-emerald-400/70 bg-emerald-500/20 text-emerald-100"
                  : "border-amber-300/70 bg-amber-500/20 text-amber-100"
            }`}
          >
            {activeConsequence.text}
          </motion.div>
        )}
      </AnimatePresence>

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
                  whileHover={isQuizSubmitted ? undefined : { scale: 1.015 }}
                  whileTap={isQuizSubmitted ? undefined : { scale: 0.985 }}
                  animate={
                    shouldHighlightIncorrect
                      ? { x: [0, -6, 6, -4, 4, 0] }
                      : shouldHighlightCorrect
                        ? { scale: [1, 1.03, 1] }
                        : undefined
                  }
                  transition={{ duration: 0.35 }}
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
              whileHover={canChooseStoryBranch ? { scale: 1.015, y: -2 } : undefined}
              whileTap={canChooseStoryBranch ? { scale: 0.985 } : undefined}
              onClick={() => handleChoice(choice.id)}
              disabled={!canChooseStoryBranch || isTransitioningNode}
              className="group w-full rounded-2xl border border-slate-600 bg-slate-800/60 px-5 py-4 text-left text-sm font-medium text-slate-100 transition hover:border-indigo-300 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-xl">{choice.icon}</span>
                <div>
                  <p className="text-base font-semibold text-slate-50">{choice.label}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-400 group-hover:text-indigo-200">
                    Choose your command
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </motion.section>
  );
}
