import { type FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createActivityLog, extractErrorMessage } from "@/api";

export type CreateActivityFormState = {
  date?: string;
  type?: string;
  steps?: number;
  durationMin?: number;
  calories?: number;
  note?: string;
};

const defaultState: CreateActivityFormState = {
  type: 'Walk',
  steps: 3000,
  durationMin: 30,
};

export const AddActivityForm = ({ date }: { date: string }) => {
  const [form, setForm] = useState<CreateActivityFormState>({ ...defaultState, date });
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: createActivityLog,
    onSuccess: async () => {
      toast.success("Activity logged");
      await queryClient.invalidateQueries({ queryKey: ["dashboard-v2", form.date?.slice(0,10)] });
    },
    onError: (error) => toast.error(extractErrorMessage(error))
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutate(form);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 text-sm">
      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <label className="grid gap-1">
          <span className="font-medium">Type</span>
          <select
            className="rounded-2xl border border-border bg-background px-3 py-2"
            value={form.type ?? ''}
            onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
          >
            {['Walk','Run','Workout','Cycling','Yoga','Other'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          <span className="font-medium">Date</span>
          <input
            type="date"
            className="rounded-2xl border border-border bg-background px-3 py-2"
            value={form.date?.slice(0, 10) ?? ""}
            onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
          />
        </label>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <label className="grid gap-1">
          <span className="font-medium">Steps</span>
          <input
            type="number"
            min={0}
            step={100}
            className="rounded-2xl border border-border bg-background px-3 py-2"
            value={form.steps ?? 0}
            onChange={(e) => setForm((prev) => ({ ...prev, steps: Number(e.target.value) }))}
            placeholder="e.g. 3000"
          />
        </label>
        <label className="grid gap-1">
          <span className="font-medium">Duration (min)</span>
          <input
            type="number"
            min={0}
            step={5}
            className="rounded-2xl border border-border bg-background px-3 py-2"
            value={form.durationMin ?? 0}
            onChange={(e) => setForm((prev) => ({ ...prev, durationMin: Number(e.target.value) }))}
            placeholder="e.g. 30"
          />
        </label>
        <label className="grid gap-1">
          <span className="font-medium">Calories burned</span>
          <input
            type="number"
            min={0}
            step={10}
            className="rounded-2xl border border-border bg-background px-3 py-2"
            value={form.calories ?? 0}
            onChange={(e) => setForm((prev) => ({ ...prev, calories: Number(e.target.value) }))}
            placeholder="optional"
          />
        </label>
      </div>

      <label className="grid gap-1">
        <span className="font-medium">Notes</span>
        <input
          type="text"
          className="rounded-2xl border border-border bg-background px-3 py-2"
          value={form.note ?? ''}
          onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
          placeholder="e.g. evening walk"
        />
      </label>

      <button
        type="submit"
        className="mt-2 w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        aria-busy={isPending}
      >
        {isPending ? "Saving…" : "Log activity"}
      </button>
    </form>
  );
};
