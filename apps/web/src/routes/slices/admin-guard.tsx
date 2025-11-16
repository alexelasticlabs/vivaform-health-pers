﻿import React from 'react';
import { useUserStore } from '@/store/user-store';
import { Navigate, Outlet } from 'react-router-dom';

export const AdminGuard = () => {
  const profile = useUserStore((s) => s.profile);

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  if (profile.role !== 'ADMIN') {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
};
