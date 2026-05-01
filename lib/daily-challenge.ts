import type { QuizQuestion } from "@/types/quiz";

export type DailyChallengeResult = {
  dateKey: string;
  correctCount: number;
  totalQuestions: number;
  baseXp: number;
  streakMultiplier: number;
  perfectMultiplier: number;
  totalXp: number;
  seed: number;
};

export type LeaderboardEntry = {
  id: string;
  dateKey: string;
  playerName: string;
  correctCount: number;
  totalQuestions: number;
  totalXp: number;
  completedAt: string;
};

function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number) {
  let t = seed + 0x6d2b79f5;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export function getTodayUTCKey() {
  return new Date().toISOString().split("T")[0];
}

export function selectDailyQuestions(
  allQuestions: QuizQuestion[],
  dateKey: string,
  count = 5,
) {
  const sorted = [...allQuestions].sort((a, b) => a.id.localeCompare(b.id));
  const seed = hashString(`chronoquest:${dateKey}`);
  const random = seededRandom(seed);
  const pool = [...sorted];

  for (let i = pool.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(random() * (i + 1));
    [pool[i], pool[randomIndex]] = [pool[randomIndex], pool[i]];
  }

  return {
    seed,
    questions: pool.slice(0, Math.min(count, pool.length)),
  };
}

export function calculateDailyChallengeXp({
  correctCount,
  streak,
  totalQuestions,
}: {
  correctCount: number;
  streak: number;
  totalQuestions: number;
}) {
  const baseXp = correctCount * 30;
  const streakMultiplier = Math.min(1 + streak * 0.05, 1.5);
  const perfectMultiplier = correctCount === totalQuestions ? 1.5 : 1;
  const totalXp = Math.floor(baseXp * streakMultiplier * perfectMultiplier);

  return {
    baseXp,
    streakMultiplier,
    perfectMultiplier,
    totalXp,
  };
}
