import { type FormEvent, useState, type ChangeEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MEAL_TYPES, type CreateNutritionEntryPayload } from "@vivaform/shared";

import { createNutritionEntry, extractErrorMessage } from "@/api";

const defaultState: CreateNutritionEntryPayload = {
  mealType: MEAL_TYPES[0],
  food: "",
  calories: 0,
  protein: 0,
  fat: 0,
  carbs: 0
};

export const AddNutritionForm = ({ date }: { date: string }) => {
  const [form, setForm] = useState<CreateNutritionEntryPayload>({ ...defaultState, date });
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: createNutritionEntry,
    onSuccess: async () => {
      toast.success("Meal saved");
      setForm({ ...defaultState, date });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error))
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutate(form);
  };

  const handleChange = (field: keyof CreateNutritionEntryPayload) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = event.target.type === "number" ? Number(event.target.value) : event.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 text-sm">
      <div className="grid gap-2 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="font-medium">Meal</span>
            <select
              className="rounded-2xl border border-border bg-background px-3 py-2"
              value={form.mealType}
              onChange={handleChange("mealType")}
            >
              {MEAL_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
        </label>
        <label className="grid gap-1">
          <span className="font-medium">Date & time</span>
          <input
            type="datetime-local"
            className="rounded-2xl border border-border bg-background px-3 py-2"
            value={form.date ?? ""}
            onChange={handleChange("date")}
          />
        </label>
      </div>
      <label className="grid gap-1">
        <span className="font-medium">What did you eat?</span>
        <input
          type="text"
          required
          className="rounded-2xl border border-border bg-background px-3 py-2"
          value={form.food}
          onChange={handleChange("food")}
          placeholder="e.g. oatmeal with berries"
        />
      </label>
      <div className="grid gap-2 sm:grid-cols-4">
        <label className="grid gap-1">
          <span className="font-medium">Calories</span>
          <input
            type="number"
            min={0}
            className="rounded-2xl border border-border bg-background px-3 py-2"
            value={form.calories}
            onChange={handleChange("calories")}
            required
          />
        </label>
        <label className="grid gap-1">
          <span className="font-medium">Protein (g)</span>
          <input
            type="number"
            min={0}
            step={0.1}
            className="rounded-2xl border border-border bg-background px-3 py-2"
            value={form.protein}
            onChange={handleChange("protein")}
            required
          />
        </label>
        <label className="grid gap-1">
          <span className="font-medium">Fat (g)</span>
          <input
            type="number"
            min={0}
            step={0.1}
            className="rounded-2xl border border-border bg-background px-3 py-2"
            value={form.fat}
            onChange={handleChange("fat")}
            required
          />
        </label>
        <label className="grid gap-1">
          <span className="font-medium">Carbs (g)</span>
          <input
            type="number"
            min={0}
            step={0.1}
            className="rounded-2xl border border-border bg-background px-3 py-2"
            value={form.carbs}
            onChange={handleChange("carbs")}
            required
          />
        </label>
      </div>
      <button
        type="submit"
        className="mt-2 w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        aria-busy={isPending}
      >
        {isPending ? "Saving…" : "Add meal"}
      </button>
    </form>
  );
};
