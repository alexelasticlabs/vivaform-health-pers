import { type FormEvent, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight, Mail } from "lucide-react";

import { extractErrorMessage, login } from "@/api";
import { useUserStore } from "@/store/user-store";
import { VivaFormLogo } from "@/components/viva-form-logo";
import { AuthLayout } from "@/components/auth/auth-layout";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    const saved = localStorage.getItem('rememberMe');
    return saved === 'true';
  });
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();
  const setAuth = useUserStore((state) => state.setAuth);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/app");
    }
  }, [isAuthenticated, navigate]);

  const { mutate, isPending } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // Persist remember flag for future sessions
      try { localStorage.setItem('rememberMe', rememberMe ? 'true' : 'false'); } catch {}

      // If remember me is on, ensure persisted snapshot is migrated to localStorage immediately
      if (rememberMe) {
        try {
          const KEY = 'vivaform-auth';
          const snap = sessionStorage.getItem(KEY) ?? localStorage.getItem(KEY);
          if (snap) {
            localStorage.setItem(KEY, snap);
            // optional: cleanup session copy to avoid confusion
            try { sessionStorage.removeItem(KEY); } catch {}
          }
        } catch {}
      }

      setAuth(data.user, data.tokens.accessToken);

      // Check if user must change password (after temp password login)
      const mustChange = (data as any)?.user?.mustChangePassword;
      if (mustChange) {
        toast.info("Please set a new password to continue 🔒");
        navigate("/force-change-password");
        return;
      }
      
      toast.success("Welcome back! 🎉");
      navigate("/app");
    },
    onError: (error) => {
      const message = extractErrorMessage(error);
      // Friendly error messages
      if (message.toLowerCase().includes("password")) {
        setPasswordError("Incorrect password — try again or reset it");
        toast.error("Incorrect password — try again or reset it 🔑");
      } else if (message.toLowerCase().includes("email") || message.toLowerCase().includes("not found")) {
        setEmailError("That email doesn't seem right");
        toast.error("That email doesn't seem right 🤔");
      } else {
        toast.error(message);
      }
    }
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Clear previous errors
    setEmailError("");
    setPasswordError("");
    
    // Client-side validation
    if (!email.trim()) {
      setEmailError("Please enter your email address");
      toast.error("Please enter your email address");
      return;
    }
    
    if (!password) {
      setPasswordError("Please enter your password");
      toast.error("Please enter your password");
      return;
    }
    
    mutate({ email, password });
  };

  return (
    <AuthLayout maxWidthClassName="max-w-[560px]">
      {/* Login Card */}
      <div className="rounded-3xl border border-white/20 dark:border-neutral-700/50 bg-white/80 p-6 shadow-xl backdrop-blur-lg dark:bg-neutral-900/70 sm:p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex justify-center">
            <VivaFormLogo size="sm" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Continue your healthy journey 🌿
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
              Email
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Mail size={18} />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="your@email.com"
                aria-invalid={!!emailError}
                aria-describedby={emailError ? "email-error" : undefined}
                className={`h-12 w-full rounded-2xl border pl-11 pr-4 text-sm shadow-sm outline-none transition-all focus:ring-2 ${
                  emailError
                    ? "border-rose-500/70 bg-rose-50 focus:ring-rose-500/70 dark:bg-rose-950/20 dark:border-rose-400/70"
                    : "border-border bg-neutral-50 focus:ring-emerald-500/70 dark:bg-neutral-800/60"
                }`}
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (emailError) setEmailError("");
                }}
                required
                disabled={isPending}
              />
            </div>
            {emailError && (
              <p id="email-error" className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">
                {emailError}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-foreground">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                aria-invalid={!!passwordError}
                aria-describedby={passwordError ? "password-error" : undefined}
                className={`h-12 w-full rounded-2xl border px-4 pr-12 text-sm shadow-sm outline-none transition-all focus:ring-2 ${
                  passwordError
                    ? "border-rose-500/70 bg-rose-50 focus:ring-rose-500/70 dark:bg-rose-950/20 dark:border-rose-400/70"
                    : "border-border bg-neutral-50 focus:ring-emerald-500/70 dark:bg-neutral-800/60"
                }`}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (passwordError) setPasswordError("");
                }}
                required
                disabled={isPending}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70 focus-visible:ring-offset-2 rounded"
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={isPending}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passwordError && (
              <p id="password-error" className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">
                {passwordError}
              </p>
            )}
          </div>

          {/* Remember Me and Forgot Password */}
          <div className="mt-2 flex items-center justify-between text-sm">
            <label className="flex cursor-pointer items-center gap-2 text-muted-foreground">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border accent-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70 focus-visible:ring-offset-2"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isPending}
              />
              <span>Remember me</span>
            </label>
            <Link
              to="/forgot-password"
              className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70 focus-visible:ring-offset-2 rounded dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="group mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-base font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
            aria-busy={isPending}
          >
            {isPending ? (
              <>
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Logging in...
              </>
            ) : (
              <>
                Log in
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200/60 dark:border-neutral-700/60" />
          </div>
        </div>

        {/* Sign up link */}
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            to="/quiz"
            className="font-semibold text-emerald-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70 focus-visible:ring-offset-2 rounded dark:text-emerald-400"
          >
            Get started
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};
