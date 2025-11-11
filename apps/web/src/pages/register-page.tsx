import { type FormEvent, useEffect, useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, Check, Mail, Lock, ArrowRight } from "lucide-react";

import { extractErrorMessage, login, registerUser, submitQuiz } from "../api";
import { useUserStore } from "../store/user-store";
import { useQuizStore } from "../store/quiz-store";
import { logQuizSubmitSuccess, logQuizSubmitError } from "../lib/analytics";
import { VivaFormLogo } from "../components/viva-form-logo";
import { AuthLayout } from "../components/auth/auth-layout";

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
    <AuthLayout>
        {/* Semi-transparent glass card */}
        <div className="relative rounded-3xl border border-white/20 dark:border-neutral-700/50 bg-white/80 dark:bg-neutral-900/70 backdrop-blur-lg shadow-xl p-6 sm:p-8">
          {/* Logo and friendly greeting */}
          <div className="flex flex-col items-center text-center mb-6">
            <VivaFormLogo size="sm" />
            <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Join VivaForm
            </h1>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Start your personalized journey today 🌿
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="your@email.com"
                  className="w-full h-12 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 pl-11 pr-4 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none transition-all focus:border-emerald-500/50 dark:focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/70"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Enter your password"
                  className="w-full h-12 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 pl-11 pr-12 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none transition-all focus:border-emerald-500/50 dark:focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/70"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded-lg p-0.5"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {/* Password strength indicator */}
              {password && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          i < passwordStrength.score ? passwordStrength.color : "bg-neutral-200 dark:bg-neutral-700"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Password strength: <span className="font-medium">{passwordStrength.label}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Terms checkbox with proper alignment */}
            <label className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-0.5">
                <input
                  type="checkbox"
                  className="peer h-4 w-4 shrink-0 cursor-pointer rounded border-2 border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-emerald-600 transition-all checked:border-emerald-600 checked:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                  checked={agreed}
                  onChange={(event) => setAgreed(event.target.checked)}
                />
                {agreed && (
                  <Check 
                    size={12} 
                    className="absolute pointer-events-none text-white" 
                    strokeWidth={3}
                  />
                )}
              </div>
              <span className="leading-relaxed">
                I agree to the{" "}
                <Link 
                  to="/privacy" 
                  className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline focus-visible:outline-none focus-visible:underline" 
                  target="_blank"
                >
                  Privacy Policy
                </Link>
                {" "}and{" "}
                <Link 
                  to="/terms" 
                  className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline focus-visible:outline-none focus-visible:underline" 
                  target="_blank"
                >
                  Terms of Service
                </Link>
              </span>
            </label>

            {/* Animated gradient button */}
            <button
              type="submit"
              className="group w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 text-base font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-105 active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 flex items-center justify-center gap-2"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating your account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200/60 dark:border-neutral-700/60"></div>
            </div>
          </div>

          {/* Login link */}
          <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
            Already have an account?{" "}
            <Link 
              to="/login" 
              className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded-sm"
            >
              Log in
            </Link>
          </div>
        </div>
    </AuthLayout>
  );
};