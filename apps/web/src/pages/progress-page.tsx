import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchWeightHistory, fetchWeightProgress } from "../api";
import type { WeightEntry } from "@vivaform/shared";
import type { WeightProgressResponse } from "../api/weight";

const rangeOptions = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" }
];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short"
  });

const formatDelta = (delta: number) => {
  if (delta === 0) {
    return "0 kg";
  }
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)} kg`;
};

const buildTrend = (entries: WeightEntry[]) =>
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

type ProgressState = {
  latest: WeightEntry | null;
  start: WeightEntry | null;
  delta: number;
};

const deriveProgress = (history: WeightEntry[], progress?: WeightProgressResponse | null): ProgressState => {
  if (!history.length || !progress) {
    return { latest: null, start: null, delta: 0 };
  }

  return {
    latest: history[history.length - 1] ?? null,
    start: history[0] ?? null,
    delta: progress.delta
  };
};

export const ProgressPage = () => {
  const [range, setRange] = useState(30);

  const {
    data: history,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
    error: historyError
  } = useQuery({
    queryKey: ["weight-history", range],
    queryFn: () => fetchWeightHistory({ limit: range, to: new Date().toISOString() }),
    staleTime: 60_000
  });

  const {
    data: progress,
    isLoading: isProgressLoading,
    isError: isProgressError,
    error: progressError
  } = useQuery({
    queryKey: ["weight-progress", range],
    queryFn: () => fetchWeightProgress({ limit: range }),
    staleTime: 60_000
  });

  const trend = useMemo(() => buildTrend(history ?? []), [history]);
  const progressState = useMemo(() => deriveProgress(history ?? [], progress), [history, progress]);

  const isLoading = isHistoryLoading || isProgressLoading;
  const isError = isHistoryError || isProgressError;

  const errorMessage = (historyError as Error | undefined)?.message ?? (progressError as Error | undefined)?.message;

  return (
    <div className="flex w-full flex-col gap-6">
      <header className="flex flex-col gap-4 rounded-3xl border border-border bg-background p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Weight progress</h1>
          <p className="text-sm text-muted-foreground">Monitor weight trends and adjust your strategy with real data.</p>
        </div>
        <label className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">Range</span>
          <select
            className="rounded-2xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
            value={range}
            onChange={(event) => setRange(Number(event.target.value))}
          >
            {rangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </header>

      {isError ? (
        <div className="rounded-3xl border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
          We could not load your progress. {errorMessage ?? "Please refresh the page."}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-border bg-background p-6 shadow-sm">
          <p className="text-xs uppercase text-muted-foreground">Current weight</p>
          {isLoading ? (
            <div className="mt-3 h-8 w-24 animate-pulse rounded-lg bg-muted/60" />
          ) : progressState.latest ? (
            <>
              <p className="mt-3 text-2xl font-semibold">{progressState.latest.weightKg} kg</p>
              <p className="text-xs text-muted-foreground">Updated {formatDate(progressState.latest.date)}</p>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">No entries yet</p>
          )}
        </article>
        <article className="rounded-3xl border border-border bg-background p-6 shadow-sm">
          <p className="text-xs uppercase text-muted-foreground">Change</p>
          {isLoading ? (
            <div className="mt-3 h-8 w-24 animate-pulse rounded-lg bg-muted/60" />
          ) : progressState.start && progressState.latest ? (
            <>
              <p className={`mt-3 text-2xl font-semibold ${progressState.delta <= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                {formatDelta(progressState.delta)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(progressState.start.date)} → {formatDate(progressState.latest.date)}
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Add at least two entries</p>
          )}
        </article>
        <article className="rounded-3xl border border-border bg-background p-6 shadow-sm">
          <p className="text-xs uppercase text-muted-foreground">Starting point</p>
          {isLoading ? (
            <div className="mt-3 h-8 w-24 animate-pulse rounded-lg bg-muted/60" />
          ) : progressState.start ? (
            <>
              <p className="mt-3 text-2xl font-semibold">{progressState.start.weightKg} kg</p>
              <p className="text-xs text-muted-foreground">{formatDate(progressState.start.date)}</p>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">No data yet</p>
          )}
        </article>
      </section>

      <section className="rounded-3xl border border-border bg-background p-6 shadow-sm">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Measurement history</h2>
            <p className="text-xs text-muted-foreground">Latest {range} entries</p>
          </div>
          <span className="text-xs text-muted-foreground">
            For consistent data, weigh yourself in the morning after waking up.
          </span>
        </header>
        <div className="mt-4 space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-14 animate-pulse rounded-2xl bg-muted/40" />
              ))}
            </div>
          ) : trend.length ? (
            <ul className="divide-y divide-border/60 text-sm">
              {trend
                .slice()
                .reverse()
                .map((entry) => (
                  <li key={entry.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div>
                      <p className="font-semibold">{entry.weightKg} kg</p>
                      <p className="text-xs text-muted-foreground">{formatDate(entry.date)}</p>
                    </div>
                    {entry.diff !== null ? (
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          entry.diff < 0 ? "bg-emerald-100 text-emerald-700" : entry.diff > 0 ? "bg-rose-100 text-rose-600" : "bg-muted/40 text-muted-foreground"
                        }`}
                      >
                        {entry.diff === 0 ? "no change" : formatDelta(entry.diff)}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">first entry</span>
                    )}
                  </li>
                ))}
            </ul>
          ) : (
            <div className="rounded-3xl bg-muted/20 px-6 py-10 text-center text-sm text-muted-foreground">
              Add a few weight entries to see your progress trend.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};