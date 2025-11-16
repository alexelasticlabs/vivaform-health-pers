/**
 * Admin Login Page
 * Separate, professional login portal for admin users
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Shield, AlertTriangle, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { login } from '@/api/auth';
import { useUserStore } from '@/store/user-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/dashboard-utils';
import { toast } from 'sonner';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const setAuth = useUserStore((state) => state.setAuth);

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      const { user, tokens } = data;

      // Verify admin role
      if (user.role !== 'ADMIN') {
        toast.error('Access Denied: Admin privileges required');
        return;
      }

      // Set authentication
      setAuth(user, tokens.accessToken);

      // Navigate to admin dashboard
      toast.success(`Welcome back, ${user.name || 'Admin'}!`);
      navigate('/app/admin');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Invalid credentials';
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    loginMutation.mutate({ email, password, rememberMe });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 animate-pulse rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 animate-pulse rounded-full bg-blue-500/10 blur-3xl delay-1000" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-pink-500/5 blur-3xl delay-500" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo and branding */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 animate-pulse rounded-full bg-purple-500/30 blur-xl" />
                <Shield className="relative h-20 w-20 text-purple-400" />
              </div>
            </div>

            <h1 className="mb-2 text-4xl font-bold text-white">Admin Portal</h1>
            <p className="text-sm text-slate-400">Restricted access • Authorized personnel only</p>
          </div>

          {/* Login form card */}
          <div className="rounded-2xl border border-purple-500/20 bg-slate-800/50 p-8 shadow-2xl backdrop-blur-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email field */}
              <div>
                <label htmlFor="admin-email" className="mb-2 block text-sm font-medium text-slate-300">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <Input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@vivaform.com"
                    className="border-slate-600 bg-slate-700/50 pl-10 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500"
                    disabled={loginMutation.isPending}
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label htmlFor="admin-password" className="mb-2 block text-sm font-medium text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <Input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="border-slate-600 bg-slate-700/50 pl-10 pr-10 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500"
                    disabled={loginMutation.isPending}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-slate-800"
                    disabled={loginMutation.isPending}
                  />
                  <span className="text-sm text-slate-300">Remember me</span>
                </label>

                <a href="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300">
                  Forgot password?
                </a>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30 transition-all hover:from-purple-700 hover:to-purple-800 hover:shadow-purple-500/50 disabled:opacity-50"
              >
                {loginMutation.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Access Admin Panel
                  </>
                )}
              </Button>
            </form>

            {/* Security notice */}
            <div className="mt-6 flex items-start gap-3 rounded-lg bg-amber-500/10 p-4">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-400" />
              <div className="text-xs text-amber-200">
                <p className="mb-1 font-semibold">Security Notice</p>
                <p>All admin actions are logged and monitored. Unauthorized access attempts will be reported.</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-slate-300"
            >
              ← Back to Main Site
            </a>
          </div>

          {/* Version info */}
          <div className="mt-4 text-center text-xs text-slate-600">Admin Portal v2.0 • Secure Connection</div>
        </div>
      </div>
    </div>
  );
};
