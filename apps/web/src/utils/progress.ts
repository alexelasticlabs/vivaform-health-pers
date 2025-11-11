import type { WeightEntry } from "@vivaform/shared";
import type { WeightProgressResponse } from "../api";

export const buildTrend = (entries: WeightEntry[]) =>
  entries.map((entry, index) => {
    const previous = index === 0 ? null : entries[index - 1];
    const diff = previous ? Number((entry.weightKg - previous.weightKg).toFixed(1)) : null;
    return {
      id: entry.id,
      date: entry.date,
      weightKg: entry.weightKg,
      diff
    };
  });

export type ProgressState = {
  latest: WeightEntry | null;
  start: WeightEntry | null;
  delta: number;
};

export const deriveProgress = (
  history: WeightEntry[],
  progress?: WeightProgressResponse | null
): ProgressState => {
  if (!history.length || !progress) {
    return { latest: null, start: null, delta: 0 };
    }

  return {
    latest: history[history.length - 1] ?? null,
    start: history[0] ?? null,
    delta: progress.delta
  };
};
