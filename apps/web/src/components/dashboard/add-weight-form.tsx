import { type FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createWeightEntry, extractErrorMessage } from "@/api";
import type { CreateWeightEntryPayload } from "@vivaform/shared";

const defaultState: CreateWeightEntryPayload = {
  weightKg: 70
};

export const AddWeightForm = ({ date }: { date: string }) => {
  const [form, setForm] = useState<CreateWeightEntryPayload>({ ...defaultState, date });
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: createWeightEntry,
    onSuccess: async () => {
      toast.success("Weight updated");
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
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
          <span className="font-medium">Weight (kg)</span>
          <input
            type="number"
            min={30}
            max={300}
            step={0.1}
            className="rounded-2xl border border-border bg-background px-3 py-2"
            value={form.weightKg}
            onChange={(event) => setForm((prev) => ({ ...prev, weightKg: Number(event.target.value) }))}
            required
          />
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
      <label className="grid gap-1">
        <span className="font-medium">Notes</span>
        <input
          type="text"
          className="rounded-2xl border border-border bg-background px-3 py-2"
          value={form.note ?? ""}
          onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
          placeholder="e.g. workout, energy levels"
        />
      </label>
      <button
        type="submit"
        className="mt-2 w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        aria-busy={isPending}
      >
        {isPending ? "Saving…" : "Save weight"}
      </button>
    </form>
  );
};