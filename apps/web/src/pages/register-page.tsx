import { FormEvent, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { extractErrorMessage, login, registerUser } from "../api";
import { useUserStore } from "../store/user-store";

export const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();
  const setAuth = useUserStore((state) => state.setAuth);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/app");
    }
  }, [isAuthenticated, navigate]);

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth(data.user, data.tokens);
      toast.success("Your account is ready. Welcome to VivaForm!");
      navigate("/app");
    },
    onError: (error) => toast.error(extractErrorMessage(error))
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: async () => {
      try {
        await loginMutation.mutateAsync({ email, password });
      } catch (error) {
        console.error(error);
      }
    },
    onError: (error) => toast.error(extractErrorMessage(error))
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!agreed) {
      toast.error("Please accept the privacy policy to continue");
      return;
    }

    registerMutation.mutate({ email, password });
  };

  const isSubmitting = registerMutation.isPending || loginMutation.isPending;

  return (
    <section className="mx-auto flex max-w-md flex-col gap-6 px-6 py-16">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Create your VivaForm account</h1>
        <p className="mt-2 text-sm text-muted-foreground">We will keep your quiz data and personalise the dashboard instantly.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        <label className="flex items-start gap-3 text-sm text-muted-foreground">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-border"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
          />
          <span>I agree to the terms and confirm data processing under the privacy policy.</span>
        </label>
        <button
          type="submit"
          className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? "Creating account…" : "Sign up"}
        </button>
      </form>
    </section>
  );
};