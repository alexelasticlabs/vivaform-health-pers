import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchDailyDashboard } from "../../api";
import type { DailyDashboardResponse } from "@vivaform/shared";
import { AddNutritionFormWithAutocomplete } from "../../components/dashboard/add-nutrition-form-enhanced";
import { AddWaterForm } from "../../components/dashboard/add-water-form";
import { AddWeightForm } from "../../components/dashboard/add-weight-form";

const formatNumber = (value: number, options?: Intl.NumberFormatOptions) =>
  new Intl.NumberFormat("en-US", options).format(value);

const buildSummaryCards = (data?: DailyDashboardResponse) => {
  if (!data) {
    return [
      { title: "Calories", value: "—", subtitle: "no data" },
      { title: "Protein", value: "—", subtitle: "no data" },
      { title: "Water", value: "—", subtitle: "no data" }
    ];
  }

  return [
    {
      title: "Calories",
      value: `${formatNumber(data.nutrition.summary.calories)} kcal`,
      subtitle: `as of ${new Date(data.date).toLocaleDateString("en-US")}`
    },
    {
      title: "Protein",
      value: `${formatNumber(data.nutrition.summary.protein, { maximumFractionDigits: 1 })} g`,
      subtitle: "total for the day"
    },
    {
      title: "Water",
      value: `${formatNumber(data.water.totalMl)} ml`,
      subtitle: "accumulated"
    }
  ];
};

export const DashboardPage = () => {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [activeForm, setActiveForm] = useState<"nutrition" | "water" | "weight" | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard", selectedDate],
    queryFn: () => fetchDailyDashboard(selectedDate),
    staleTime: 30_000
  });

  const summaryCards = useMemo(() => buildSummaryCards(data), [data]);

  const nutritionCount = data?.nutrition.entries.length ?? 0;
  const waterCount = data?.water.entries.length ?? 0;
  const recommendationsCount = data?.recommendations.length ?? 0;

  const defaultNutritionDate = `${selectedDate}T08:00`;
  const defaultWaterDate = `${selectedDate}T10:00`;

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-3xl border border-border bg-background p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Your day with VivaForm</h1>
          <p className="text-sm text-muted-foreground">See nutrition, hydration, weight, and recommendation insights for the selected date.</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </div>
      </section>

      {isError ? (
        <div className="rounded-3xl border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
          We could not load your dashboard data. Please refresh the page or try again later.
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((card) => (
          <article key={card.title} className="rounded-3xl border border-border bg-background p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">{card.title}</p>
            <p className="mt-3 text-2xl font-semibold">{card.value}</p>
            <p className="text-xs text-muted-foreground">{card.subtitle}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <article className="rounded-3xl border border-border bg-background p-6 shadow-sm">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Meal log</h2>
              <p className="text-xs text-muted-foreground">
                {nutritionCount} {nutritionCount === 1 ? "entry" : "entries"} on {new Date(selectedDate).toLocaleDateString("en-US")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveForm((prev) => (prev === "nutrition" ? null : "nutrition"))}
              className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
            >
              {activeForm === "nutrition" ? "Hide form" : "Add meal"}
            </button>
          </header>
          {activeForm === "nutrition" ? (
            <div className="mt-4 rounded-3xl border border-border bg-background/80 p-4">
              <AddNutritionFormWithAutocomplete date={defaultNutritionDate} />
            </div>
          ) : null}
          <div className="mt-4 space-y-3 text-sm">
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-16 rounded-2xl bg-muted/60" />
                <div className="h-16 rounded-2xl bg-muted/60" />
              </div>
            ) : data && data.nutrition.entries.length > 0 ? (
              data.nutrition.entries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3">
                  <div>
                    <p className="font-medium">{entry.mealType}</p>
                    <p className="text-xs text-muted-foreground">{entry.food}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{entry.calories} kcal</p>
                    <p className="text-xs text-muted-foreground">
                      P:{entry.protein} / F:{entry.fat} / C:{entry.carbs}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-2xl bg-muted/40 px-4 py-6 text-center text-xs text-muted-foreground">
                No meals logged yet. Add a meal to unlock daily analytics.
              </p>
            )}
          </div>
        </article>
        <article className="rounded-3xl border border-border bg-background p-6 shadow-sm">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Hydration</h2>
              <p className="text-xs text-muted-foreground">
                {waterCount} {waterCount === 1 ? "entry" : "entries"} logged today
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveForm((prev) => (prev === "water" ? null : "water"))}
              className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
            >
              {activeForm === "water" ? "Hide form" : "Add water"}
            </button>
          </header>
          {activeForm === "water" ? (
            <div className="mt-4 rounded-3xl border border-border bg-background/80 p-4">
              <AddWaterForm date={defaultWaterDate} />
            </div>
          ) : null}
          <p className="mt-4 text-sm text-muted-foreground">
            Consumed {formatNumber(data?.water.totalMl ?? 0)} ml of water
          </p>
          <div className="mt-4 space-y-3 text-sm">
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-14 rounded-2xl bg-muted/40" />
                <div className="h-14 rounded-2xl bg-muted/40" />
              </div>
            ) : data && data.water.entries.length > 0 ? (
              data.water.entries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between rounded-2xl bg-muted/40 px-4 py-3">
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="font-semibold">{entry.amountMl} ml</span>
                </div>
              ))
            ) : (
              <p className="rounded-2xl bg-muted/20 px-4 py-6 text-center text-xs text-muted-foreground">
                No water logs for the selected date yet.
              </p>
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <article className="rounded-3xl border border-border bg-background p-6 shadow-sm">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold">Weight</h2>
            <button
              type="button"
              onClick={() => setActiveForm((prev) => (prev === "weight" ? null : "weight"))}
              className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
            >
              {activeForm === "weight" ? "Hide form" : "Update weight"}
            </button>
          </header>
          {activeForm === "weight" ? (
            <div className="mt-4 rounded-3xl border border-border bg-background/80 p-4">
              <AddWeightForm date={selectedDate} />
            </div>
          ) : null}
          {isLoading ? (
            <div className="mt-4 h-24 animate-pulse rounded-2xl bg-muted/40" />
          ) : data?.weight.latest ? (
            <div className="mt-4 space-y-3 text-sm">
              <p className="text-2xl font-semibold">{data.weight.latest.weightKg} kg</p>
              <p className="text-xs text-muted-foreground">
                Last updated {new Date(data.weight.latest.date).toLocaleDateString("en-US")}
              </p>
              <div className="rounded-2xl bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
                Change over period: {data.weight.progress.delta} kg
              </div>
            </div>
          ) : (
            <p className="mt-4 rounded-2xl bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
              Add your first weight entry to start tracking progress.
            </p>
          )}
        </article>
        <article className="rounded-3xl border border-border bg-background p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Personal recommendations</h2>
          <p className="text-xs text-muted-foreground">
            {recommendationsCount ? `${recommendationsCount} active ${recommendationsCount === 1 ? "tip" : "tips"}` : "No active tips yet"}
          </p>
          <div className="mt-4 space-y-3 text-sm">
            {isLoading ? (
              <div className="space-y-3">
                <div className="h-16 animate-pulse rounded-2xl bg-muted/40" />
                <div className="h-16 animate-pulse rounded-2xl bg-muted/40" />
              </div>
            ) : data && data.recommendations.length > 0 ? (
              data.recommendations.map((item) => (
                <div key={item.id} className="rounded-2xl bg-muted/30 px-4 py-3">
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.body}</p>
                </div>
              ))
            ) : (
              <p className="rounded-2xl bg-muted/20 px-4 py-6 text-center text-xs text-muted-foreground">
                Recommendations will appear once we have more nutrition and activity data.
              </p>
            )}
          </div>
        </article>
      </section>
    </div>
  );
};