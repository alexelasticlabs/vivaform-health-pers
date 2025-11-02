import { FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createWaterEntry, extractErrorMessage } from "../../api";
import type { CreateWaterEntryPayload } from "@vivaform/shared";

const defaultState: CreateWaterEntryPayload = {
  amountMl: 250
};

export const AddWaterForm = ({ date }: { date: string }) => {
  const [form, setForm] = useState<CreateWaterEntryPayload>({ ...defaultState, date });
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: createWaterEntry,
    onSuccess: () => {
      toast.success("Water log saved");
      setForm({ ...defaultState, date });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error))
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutate(form);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 text-sm">
      <label className="grid gap-1">
        <span className="font-medium">Amount, ml</span>
        <input
          type="number"
          min={50}
          step={50}
          className="rounded-2xl border border-border bg-background px-3 py-2"
          value={form.amountMl}
          onChange={(event) => setForm((prev) => ({ ...prev, amountMl: Number(event.target.value) }))}
          required
        />
      </label>
      <label className="grid gap-1">
        <span className="font-medium">Date & time</span>
        <input
          type="datetime-local"
          className="rounded-2xl border border-border bg-background px-3 py-2"
          value={form.date ?? ""}
          onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
        />
      </label>
      <button
        type="submit"
        className="mt-2 w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        aria-busy={isPending}
      >
        {isPending ? "Logging…" : "Save hydration"}
      </button>
    </form>
  );
};