import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, Lock, Key, ArrowRight } from 'lucide-react';
import { forgotPassword, requestTempPassword } from '../api/password';
import { VivaFormLogo } from '../components/viva-form-logo';
import { AuthLayout } from '../components/auth/auth-layout';

type RecoveryMethod = 'link' | 'temp';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [method, setMethod] = useState<RecoveryMethod>('link');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address 📧');
      return;
    }

    setIsLoading(true);
    try {
      if (method === 'link') {
        await forgotPassword({ email });
      } else {
        await requestTempPassword({ email });
      }
      setIsSubmitted(true);
      toast.success('Check your inbox ✉️');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <AuthLayout>
          <div className="relative rounded-3xl border border-white/20 dark:border-neutral-700/50 bg-white/80 dark:bg-neutral-900/70 backdrop-blur-lg shadow-xl p-6 sm:p-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/25">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                Check Your Email
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                If this email exists, we've sent instructions to your inbox.
              </p>
              {method === 'link' ? (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                  The link is valid for <strong className="text-neutral-900 dark:text-white">60 minutes</strong>.
                </p>
              ) : (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                  The temporary password is valid for <strong className="text-neutral-900 dark:text-white">15 minutes</strong> and can be used once.
                </p>
              )}
              <Link
                to="/login"
                className="group w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-base font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-105 active:translate-y-[1px] text-center flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                Back to Login
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
        <div className="relative rounded-3xl border border-white/20 dark:border-neutral-700/50 bg-white/80 dark:bg-neutral-900/70 backdrop-blur-lg shadow-xl p-6 sm:p-8">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <VivaFormLogo size="sm" />
            <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Reset your password 🔒
            </h1>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Choose a recovery method below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Recovery method selector */}
            <div className="space-y-3">
              {/* Link recovery option (recommended) */}
              <label 
                className={`
                  relative flex items-start gap-3 p-4 rounded-2xl cursor-pointer transition-all
                  ${method === 'link' 
                    ? 'ring-2 ring-emerald-500/70 shadow-md bg-white/80 dark:bg-neutral-800/70' 
                    : 'border border-neutral-200 dark:border-neutral-700 bg-white/50 dark:bg-neutral-800/50 hover:bg-white/70 dark:hover:bg-neutral-800/60'
                  }
                `}
              >
                <input
                  type="radio"
                  name="method"
                  value="link"
                  checked={method === 'link'}
                  onChange={() => setMethod('link')}
                  className="sr-only"
                  aria-describedby="link-method-description"
                />
                <div className={`
                  mt-0.5 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all
                  ${method === 'link' 
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25' 
                    : 'bg-neutral-100 dark:bg-neutral-700'
                  }
                `}>
                  <Lock className={`w-5 h-5 ${method === 'link' ? 'text-white' : 'text-neutral-500 dark:text-neutral-400'}`} />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-neutral-900 dark:text-white">Reset via secure link</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                      recommended
                    </span>
                  </div>
                  <p id="link-method-description" className="text-sm text-neutral-600 dark:text-neutral-400">
                    You will receive a one-time link valid for 60 minutes.
                  </p>
                </div>
              </label>

              {/* Temp password option */}
              <label 
                className={`
                  relative flex items-start gap-3 p-4 rounded-2xl cursor-pointer transition-all
                  ${method === 'temp' 
                    ? 'ring-2 ring-emerald-500/70 shadow-md bg-white/80 dark:bg-neutral-800/70' 
                    : 'border border-neutral-200 dark:border-neutral-700 bg-white/50 dark:bg-neutral-800/50 hover:bg-white/70 dark:hover:bg-neutral-800/60'
                  }
                `}
              >
                <input
                  type="radio"
                  name="method"
                  value="temp"
                  checked={method === 'temp'}
                  onChange={() => setMethod('temp')}
                  className="sr-only"
                  aria-describedby="temp-method-description"
                />
                <div className={`
                  mt-0.5 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all
                  ${method === 'temp' 
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25' 
                    : 'bg-neutral-100 dark:bg-neutral-700'
                  }
                `}>
                  <Key className={`w-5 h-5 ${method === 'temp' ? 'text-white' : 'text-neutral-500 dark:text-neutral-400'}`} />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-neutral-900 dark:text-white mb-1">Get a temporary password</div>
                  <p id="temp-method-description" className="text-sm text-neutral-600 dark:text-neutral-400">
                    A one-time password valid for 15 minutes. You'll be asked to set a new password after login.
                  </p>
                </div>
              </label>
            </div>

            {/* Email input with icon */}
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
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full h-12 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 pl-11 pr-4 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none transition-all focus:border-emerald-500/50 dark:focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/70"
                  required
                />
              </div>
            </div>

            {/* Submit button with gradient and animation */}
            <button
              type="submit"
              disabled={isLoading}
              className="group w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-base font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-105 active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 flex items-center justify-center gap-2"
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {method === 'link' ? 'Sending link...' : 'Sending password...'}
                </>
              ) : (
                <>
                  {method === 'link' ? 'Send reset link' : 'Send temporary password'}
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
            Remember your password?{' '}
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
}
