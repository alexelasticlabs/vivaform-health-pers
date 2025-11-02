import { useQuery } from "@tanstack/react-query";

import { fetchLatestRecommendations } from "../api";

export const RecommendationsPage = () => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ["recommendations", "latest"],
    queryFn: () => fetchLatestRecommendations(10),
    staleTime: 60_000
  });

  return (
    <div className="flex w-full flex-col gap-4">
      <header className="flex flex-col gap-2 rounded-3xl border border-border bg-background p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Personal recommendations</h1>
          <p className="text-sm text-muted-foreground">Tips refresh as soon as we gather more nutrition and activity data.</p>
        </div>
        <button
          type="button"
          className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground disabled:opacity-60"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          {isRefetching ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      {isError ? (
        <div className="rounded-3xl border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
          We could not load your recommendations. {(error as Error | undefined)?.message ?? "Please try again later."}
        </div>
      ) : null}

      <section className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-3xl bg-muted/40" />
            ))}
          </div>
        ) : data && data.length ? (
          data.map((item) => (
            <article key={item.id} className="rounded-3xl border border-border bg-background p-6 shadow-sm">
              <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <span className="text-xs uppercase text-muted-foreground">
                  {new Date(item.date).toLocaleDateString("en-US")}
                </span>
              </header>
              <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
            </article>
          ))
        ) : (
          <div className="rounded-3xl border border-border bg-muted/20 px-6 py-10 text-center text-sm text-muted-foreground">
            Once we have enough data about your nutrition and activity, tailored tips will appear here.
          </div>
        )}
      </section>
    </div>
  );
};