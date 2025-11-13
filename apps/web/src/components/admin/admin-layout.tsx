import { type ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  Users,
  Package,
  HeadphonesIcon,
  Settings,
  FileText,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
  badge?: number;
};

const navigation: NavItem[] = [
  { label: 'Overview', href: '/app/admin', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Users', href: '/app/admin/users', icon: <Users className="h-4 w-4" /> },
  { label: 'Subscriptions', href: '/app/admin/subscriptions', icon: <CreditCard className="h-4 w-4" /> },
  { label: 'Food Items', href: '/app/admin/foods', icon: <Package className="h-4 w-4" /> },
  { label: 'Articles', href: '/app/admin/articles', icon: <FileText className="h-4 w-4" /> },
  { label: 'Support', href: '/app/admin/support', icon: <HeadphonesIcon className="h-4 w-4" /> },
  { label: 'Settings', href: '/app/admin/settings', icon: <Settings className="h-4 w-4" /> },
];

function Breadcrumbs() {
  const location = useLocation();
  const paths = location.pathname.split('/').filter(Boolean);

  const breadcrumbs = paths.map((path, index) => {
    const href = '/' + paths.slice(0, index + 1).join('/');
    const label = path.charAt(0).toUpperCase() + path.slice(1);
    return { href, label };
  });

  return (
    <nav className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
      <Link to="/app" className="hover:text-neutral-900 dark:hover:text-neutral-100 flex items-center gap-1">
        <Home className="h-3.5 w-3.5" />
        Home
      </Link>
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center gap-2">
          <span>/</span>
          {index === breadcrumbs.length - 1 ? (
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              {crumb.label}
            </span>
          ) : (
            <Link
              to={crumb.href}
              className="hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}

export function AdminLayout() {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-red-600" />
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/app"
              className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 flex items-center gap-1"
            >
              ← Back to App
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto flex gap-6 p-4">
        {/* Sidebar Navigation */}
        <aside className={cn(
          "shrink-0 transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-64"
        )}>
          <nav className="sticky top-20 space-y-1 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-2 flex items-center justify-end border-b border-neutral-200 pb-2 dark:border-neutral-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="h-8 w-8 p-0"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </div>
            {navigation.map((item) => {
              const isActive = location.pathname === item.href ||
                (item.href !== '/app/admin' && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100'
                      : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                  )}
                >
                  <div className="shrink-0">{item.icon}</div>
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.badge !== undefined && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="mb-4">
            <Breadcrumbs />
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

