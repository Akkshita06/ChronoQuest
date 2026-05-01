"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ProgressState } from "@/types/progress";

const STORAGE_KEY = "chronoquest.progress";

const initialProgress: ProgressState = {
  xp: 0,
  level: 0,
  streak: 0,
  lastDailyChallengeDate: null,
};

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function getPreviousDayKey() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split("T")[0];
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressState>(initialProgress);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const rawProgress = window.localStorage.getItem(STORAGE_KEY);
      if (rawProgress) {
        const parsed = JSON.parse(rawProgress) as Partial<ProgressState>;
        const xp = Number(parsed.xp ?? 0);
        const safeXp = Number.isFinite(xp) && xp > 0 ? Math.floor(xp) : 0;
        setProgress({
          xp: safeXp,
          level: Math.floor(safeXp / 100),
          streak: Number(parsed.streak ?? 0) || 0,
          lastDailyChallengeDate:
            parsed.lastDailyChallengeDate ??
            ((parsed as { lastActiveDate?: string | null }).lastActiveDate ?? null),
        });
      }
    } catch {
      setProgress(initialProgress);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const awardXp = useCallback((xpAmount: number) => {
    if (xpAmount <= 0) return;

    setProgress((currentProgress) => {
      const nextXp = currentProgress.xp + xpAmount;

      return {
        xp: nextXp,
        level: Math.floor(nextXp / 100),
        streak: currentProgress.streak,
        lastDailyChallengeDate: currentProgress.lastDailyChallengeDate,
      };
    });
  }, []);

  const completeDailyChallenge = useCallback((xpAmount: number) => {
    setProgress((currentProgress) => {
      const today = getTodayKey();
      const previousDay = getPreviousDayKey();
      const isSameDay = currentProgress.lastDailyChallengeDate === today;
      const isConsecutiveDay = currentProgress.lastDailyChallengeDate === previousDay;
      const nextXp = currentProgress.xp + Math.max(0, xpAmount);

      return {
        xp: nextXp,
        level: Math.floor(nextXp / 100),
        streak: isSameDay ? currentProgress.streak : isConsecutiveDay ? currentProgress.streak + 1 : 1,
        lastDailyChallengeDate: today,
      };
    });
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress, isLoaded]);

  const xpToNextLevel = useMemo(() => 100 - (progress.xp % 100 || 100), [progress.xp]);
  const levelProgressPercent = useMemo(() => progress.xp % 100, [progress.xp]);
  const isDailyChallengeCompletedToday = useMemo(
    () => progress.lastDailyChallengeDate === getTodayKey(),
    [progress.lastDailyChallengeDate],
  );

  return {
    progress,
    isLoaded,
    awardXp,
    completeDailyChallenge,
    xpToNextLevel,
    levelProgressPercent,
    isDailyChallengeCompletedToday,
  };
}
