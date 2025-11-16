/**
 * Admin Layout V2
 * Professional admin interface with improved navigation and branding
 */

import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  Users,
  Apple,
  CreditCard,
  MessageSquare,
  Settings,
  FileText,
  ToggleLeft,
  FileSearch,
  Eye,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/dashboard-utils';
import { useUserStore } from '@/store/user-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
}

export const AdminLayoutV2: React.FC = () => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.profile);
  const logout = useUserStore((state) => state.logout);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      path: '/app/admin',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      id: 'users',
      label: 'Users',
      path: '/app/admin/users',
      icon: <Users className="h-5 w-5" />,
    },
    {
      id: 'foods',
      label: 'Food Items',
      path: '/app/admin/foods',
      icon: <Apple className="h-5 w-5" />,
    },
    {
      id: 'subscriptions',
      label: 'Subscriptions',
      path: '/app/admin/subscriptions',
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      id: 'articles',
      label: 'Articles',
      path: '/app/admin/articles',
      icon: <FileText className="h-5 w-5" />,
    },
    {
      id: 'support',
      label: 'Support',
      path: '/app/admin/support',
      icon: <MessageSquare className="h-5 w-5" />,
      badge: 3,
    },
    {
      id: 'feature-toggles',
      label: 'Feature Toggles',
      path: '/app/admin/feature-toggles',
      icon: <ToggleLeft className="h-5 w-5" />,
    },
    {
      id: 'audit-logs',
      label: 'Audit Logs',
      path: '/app/admin/audit-logs',
      icon: <FileSearch className="h-5 w-5" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      path: '/app/admin/settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleViewAsUser = () => {
    navigate('/app');
  };

  const userInitials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'AD';

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-purple-500/20 bg-slate-900/95 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          {/* Left side */}
          <div className="flex items-center gap-4">
            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-400 hover:text-white md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Desktop sidebar toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden text-slate-400 hover:text-white md:flex"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Logo and title */}
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-purple-400" />
              <div className="hidden md:block">
                <h1 className="text-lg font-bold text-white">Admin Dashboard</h1>
                <p className="text-xs text-slate-400">Vivaform Health</p>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Search (desktop) */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-64 border-slate-700 bg-slate-800 pl-9 text-sm text-white placeholder:text-slate-500 focus:border-purple-500"
              />
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative text-slate-400 hover:text-white">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
            </Button>

            {/* View as user */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewAsUser}
              className="hidden border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white md:flex"
            >
              <Eye className="mr-2 h-4 w-4" />
              View as User
            </Button>

            {/* User menu */}
            <div className="flex items-center gap-3">
              <div className="hidden text-right md:block">
                <div className="text-sm font-semibold text-white">{user?.name || 'Admin'}</div>
                <div className="text-xs text-slate-400">{user?.email}</div>
              </div>

              <button className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-purple-500 bg-purple-900 font-bold text-white transition-all hover:bg-purple-800">
                {userInitials}
              </button>
            </div>

            {/* Logout */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hidden text-slate-400 hover:text-red-400 md:flex"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 top-16 z-40 flex flex-col border-r border-slate-800 bg-slate-900 transition-all duration-300',
            sidebarOpen ? 'w-64' : 'w-0 md:w-20',
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          )}
        >
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.id === 'overview'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={cn('flex-shrink-0', isActive && 'text-white')}>{item.icon}</span>
                    <span
                      className={cn(
                        'flex-1 truncate transition-opacity',
                        !sidebarOpen && 'md:opacity-0'
                      )}
                    >
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Sidebar footer */}
          <div className="border-t border-slate-800 p-4">
            <div className="rounded-lg bg-purple-900/30 p-3">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-purple-400">
                <Shield className="h-4 w-4" />
                <span className={cn('transition-opacity', !sidebarOpen && 'md:opacity-0')}>
                  Security Status
                </span>
              </div>
              <div
                className={cn(
                  'text-xs text-slate-400 transition-opacity',
                  !sidebarOpen && 'md:opacity-0'
                )}
              >
                All systems operational
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main
          className={cn(
            'min-h-[calc(100vh-4rem)] flex-1 transition-all duration-300',
            sidebarOpen ? 'md:ml-64' : 'md:ml-20'
          )}
        >
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};
