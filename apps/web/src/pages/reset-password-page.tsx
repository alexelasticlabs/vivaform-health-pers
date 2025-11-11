import { useState, useMemo, type FormEvent } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, ArrowRight } from 'lucide-react';
import { resetPassword } from '../api';
import { VivaFormLogo } from '../components/viva-form-logo';
import { AuthLayout } from '../components/auth/auth-layout';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Password strength calculator
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { score, label: 'Fair', color: 'bg-yellow-500' };
    if (score <= 4) return { score, label: 'Good', color: 'bg-blue-500' };
    return { score, label: 'Strong', color: 'bg-green-500' };
  }, [password]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!password || !token) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long 🔒');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({ token, newPassword: password });
      toast.success('Password updated ✅ You can log in now.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Invalid or expired reset token';
      toast.error(message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout>
        <div className="w-full rounded-3xl border border-white/20 dark:border-neutral-700/50 bg-white/80 dark:bg-neutral-900/70 backdrop-blur-lg shadow-xl p-6 sm:p-8 text-center space-y-6">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Invalid Link
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            The password reset link is invalid or missing.
          </p>
          <Link
            to="/forgot-password"
            className="group inline-flex w-full h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-md transition-all hover:shadow-lg hover:scale-105 active:translate-y-[1px]"
          >
            Request new link
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="w-full rounded-3xl border border-white/20 dark:border-neutral-700/50 bg-white/80 dark:bg-neutral-900/70 backdrop-blur-lg shadow-xl p-6 sm:p-8 space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-6 flex justify-center">
            <VivaFormLogo size="sm" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Create New Password</h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              New Password
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 pl-11 pr-12 border border-neutral-200 dark:border-neutral-700 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 text-foreground focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500/50 transition-all"
                placeholder="Enter your password"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-3 space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-1.5 flex-1 rounded-full transition-all ${
                        level <= passwordStrength.score
                          ? passwordStrength.color
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Strength: <span className="font-medium text-foreground">{passwordStrength.label}</span>
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500">
                <Lock size={18} />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-12 pl-11 pr-12 border border-neutral-200 dark:border-neutral-700 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 text-foreground focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500/50 transition-all"
                placeholder="Re-enter your password"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-md transition-all hover:shadow-lg hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              'Updating password...'
            ) : (
              <>
                Update Password
                <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200/60 dark:border-neutral-700/60"></div>
          </div>
        </div>

        <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
          Remember your password?{' '}
          <Link to="/login" className="font-semibold text-emerald-600 hover:underline dark:text-emerald-400">
            Log in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
