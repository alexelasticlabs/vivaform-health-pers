import { FormEvent, useEffect, useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, Check } from "lucide-react";

import { extractErrorMessage, login, registerUser } from "../api";
import { submitQuiz } from "../api/quiz";
import { useUserStore } from "../store/user-store";
import { useQuizStore } from "../store/quiz-store";
import { logQuizSubmitSuccess, logQuizSubmitError } from "../lib/analytics";
import { VivaFormLogo } from "../components/viva-form-logo";

export const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();
  const setAuth = useUserStore((state) => state.setAuth);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const { getDraft, clearDraft } = useQuizStore();

  // Password strength calculator
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "" };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) return { score, label: "Weak", color: "bg-red-500" };
    if (score <= 3) return { score, label: "Fair", color: "bg-yellow-500" };
    if (score <= 4) return { score, label: "Good", color: "bg-blue-500" };
    return { score, label: "Strong", color: "bg-green-500" };
  }, [password]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/app");
    }
  }, [isAuthenticated, navigate]);

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      setAuth(data.user, data.tokens.accessToken, data.tokens.refreshToken);
      
      // Try to submit quiz draft if exists
      try {
        const draft = getDraft();
        if (draft.answers && Object.keys(draft.answers).length > 0) {
          await submitQuiz(draft);
          
          // Log successful quiz submission with userId
          if (draft.clientId) {
            logQuizSubmitSuccess(draft.clientId, data.user.id);
          }
          
          clearDraft(); // Clear draft after successful submission
          toast.success("Welcome to VivaForm! 🎉 Your quiz has been saved.");
        } else {
          toast.success("Welcome to VivaForm! 🎉 Your healthy journey begins now.");
        }
      } catch (error) {
        // Log quiz submission error
        const draft = getDraft();
        if (draft.clientId) {
          logQuizSubmitError(draft.clientId, error instanceof Error ? error.message : 'Unknown error');
        }
        
        console.error('Failed to submit quiz draft:', error);
        toast.success("Welcome to VivaForm! 🎉");
      }
      
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
    onError: (error) => {
      const message = extractErrorMessage(error);
      // Friendly error messages
      if (message.toLowerCase().includes("already exists") || message.toLowerCase().includes("duplicate")) {
        toast.error("This email is already registered. Try logging in instead 📧");
      } else if (message.toLowerCase().includes("invalid email")) {
        toast.error("That email doesn't look quite right 🤔");
      } else {
        toast.error(message);
      }
    }
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Client-side validation
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address 📧");
      return;
    }
    
    if (!password) {
      toast.error("Please create a password");
      return;
    }
    
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long 🔒");
      return;
    }
    
    if (!agreed) {
      toast.error("Please accept the Terms & Privacy Policy to continue");
      return;
    }

    registerMutation.mutate({ email, password });
  };

  const isSubmitting = registerMutation.isPending || loginMutation.isPending;

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden py-12">
      {/* Background with blur effect */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMGJjZDQiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6bTAgMzZjMC02LjYyNyA1LjM3My0xMiAxMi0xMnMxMiA1LjM3MyAxMiAxMi01LjM3MyAxMi0xMiAxMi0xMi01LjM3My0xMi0xMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
      </div>

      <section className="mx-auto w-full max-w-md px-6">
        {/* Semi-transparent card */}
        <div className="relative rounded-3xl border border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl p-8">
          {/* Logo and greeting */}
          <div className="flex flex-col items-center text-center mb-8">
            <VivaFormLogo size="lg" />
            <h1 className="mt-6 text-3xl font-bold tracking-tight">Join VivaForm</h1>
            <p className="mt-2 text-muted-foreground">Start your personalized nutrition journey today 🥗</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 pr-12 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          
          {/* Password strength indicator */}
          {password && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all ${
                      i < passwordStrength.score ? passwordStrength.color : "bg-border"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Password strength: <span className="font-medium">{passwordStrength.label}</span>
              </p>
            </div>
          )}
        </div>
        <label className="flex items-start gap-3 text-sm text-muted-foreground">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-border"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
          />
          <span>
            I agree to the{" "}
            <Link to="/privacy" className="text-primary hover:underline" target="_blank">
              Privacy Policy
            </Link>
            {" "}and{" "}
            <Link to="/terms" className="text-primary hover:underline" target="_blank">
              Terms of Service
            </Link>
          </span>
        </label>
        <button
          type="submit"
          className="w-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? "Creating your account..." : "Create Account"}
        </button>
      </form>

      {/* Login link */}
      <div className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Log in
        </Link>
      </div>
        </div>
      </section>
    </div>
  );
};