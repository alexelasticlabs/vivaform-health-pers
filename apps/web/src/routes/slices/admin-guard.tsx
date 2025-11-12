import React from 'react';
import { useUserStore } from '@/store/user-store';
import { Navigate } from 'react-router-dom';

const AdminLazy = React.lazy(() => import('@/pages/admin-page').then(m => ({ default: m.AdminPage })));

export const AdminGuard = () => {
  const profile = useUserStore((s) => s.profile);
  if (!profile) {
    return <Navigate to="/login" replace />;
  }
  if (profile.role !== 'ADMIN') {
    return <Navigate to="/app" replace />;
  }
  return (
    <React.Suspense fallback={<div className="p-4">Loading...</div>}>
      <AdminLazy />
    </React.Suspense>
  );
};

