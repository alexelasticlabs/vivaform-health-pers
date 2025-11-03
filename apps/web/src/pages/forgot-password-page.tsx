import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';
import { forgotPassword, requestTempPassword } from '../api/password';
import { VivaFormLogo } from '../components/viva-form-logo';

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
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMGJjZDQiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6bTAgMzZjMC02LjYyNyA1LjM3My0xMiAxMi0xMnMxMiA1LjM3MyAxMiAxMi01LjM3MyAxMi0xMiAxMi0xMi01LjM3My0xMi0xMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
        </div>

        <section className="mx-auto w-full max-w-md px-6">
          <div className="relative rounded-3xl border border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl p-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-6">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Check Your Email
              </h1>
              <p className="text-muted-foreground mb-6">
                If this email exists, we've sent instructions to your inbox.
              </p>
              {method === 'link' ? (
                <p className="text-sm text-muted-foreground mb-6">
                  The link is valid for <strong>60 minutes</strong>.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground mb-6">
                  The temporary password is valid for <strong>15 minutes</strong> and can be used once.
                </p>
              )}
              <Link
                to="/login"
                className="w-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/30 active:scale-[0.98] text-center"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMGJjZDQiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6bTAgMzZjMC02LjYyNyA1LjM3My0xMiAxMi0xMnMxMiA1LjM3MyAxMiAxMi01LjM3MyAxMi0xMiAxMi0xMi01LjM3My0xMi0xMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
      </div>

      <section className="mx-auto w-full max-w-md px-6">
        <div className="relative rounded-3xl border border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <VivaFormLogo size="lg" />
            <h1 className="mt-6 text-3xl font-bold tracking-tight">Reset your password</h1>
            <p className="mt-2 text-muted-foreground">Choose a recovery method below</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Recovery method selector */}
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-primary" style={{ borderColor: method === 'link' ? 'hsl(var(--primary))' : 'hsl(var(--border))' }}>
                <input
                  type="radio"
                  name="method"
                  value="link"
                  checked={method === 'link'}
                  onChange={() => setMethod('link')}
                  className="mt-1 accent-primary"
                />
                <div className="flex-1 text-left">
                  <div className="font-semibold text-foreground">Reset via secure link <span className="text-xs text-primary">(recommended)</span></div>
                  <div className="text-sm text-muted-foreground mt-1">
                    You will receive a one-time link valid for 60 minutes.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-primary" style={{ borderColor: method === 'temp' ? 'hsl(var(--primary))' : 'hsl(var(--border))' }}>
                <input
                  type="radio"
                  name="method"
                  value="temp"
                  checked={method === 'temp'}
                  onChange={() => setMethod('temp')}
                  className="mt-1 accent-primary"
                />
                <div className="flex-1 text-left">
                  <div className="font-semibold text-foreground">Get a temporary password</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    A one-time password valid for 15 minutes. You'll be asked to set a new password after login.
                  </div>
                </div>
              </label>
            </div>

            {/* Email input */}
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              {isLoading ? (method === 'link' ? 'Sending link...' : 'Sending password...') : (method === 'link' ? 'Send reset link' : 'Send temporary password')}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Remember your password?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
