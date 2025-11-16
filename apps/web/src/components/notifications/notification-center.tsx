/**
 * Notification Center Component
 * Real-time notifications with action buttons
 */

import React, { useState } from 'react';
import { Bell, X, Check, Trash2, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '@/lib/dashboard-utils';
import { formatTimeAgo } from '@/lib/dashboard-utils';
import { Button } from '@/components/ui/button';
import type { Notification } from '@/types/notifications.types';

interface NotificationCenterProps {
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'achievement',
      title: '🏆 Achievement Unlocked!',
      message: "You've completed a 7-day logging streak!",
      priority: 'high',
      read: false,
      actionUrl: '/app/achievements',
      actionLabel: 'View Achievement',
      createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 min ago
    },
    {
      id: '2',
      type: 'info',
      title: '💧 Water Reminder',
      message: "You haven't logged water in 3 hours. Stay hydrated!",
      priority: 'medium',
      read: false,
      actionLabel: 'Log Water',
      icon: '💧',
      createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    },
    {
      id: '3',
      type: 'success',
      title: '🎯 Goal Progress',
      message: "You're 80% to your weekly calorie goal!",
      priority: 'medium',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (notification: Notification) => {
    if (notification.icon) return notification.icon;

    switch (notification.type) {
      case 'success':
        return '✅';
      case 'info':
        return 'ℹ️';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'achievement':
        return '🏆';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'border-l-emerald-500 bg-emerald-50 dark:bg-emerald-950/20';
      case 'info':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20';
      case 'warning':
        return 'border-l-amber-500 bg-amber-50 dark:bg-amber-950/20';
      case 'error':
        return 'border-l-red-500 bg-red-50 dark:bg-red-950/20';
      case 'achievement':
        return 'border-l-purple-500 bg-purple-50 dark:bg-purple-950/20';
      default:
        return 'border-l-slate-500 bg-slate-50 dark:bg-slate-950/20';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        {unreadCount > 0 && (
          <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Panel */}
          <div className="absolute right-0 top-12 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {unreadCount} unread
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => {}}>
                  <SettingsIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Notifications list */}
            <div className="max-h-[500px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="mx-auto mb-3 h-12 w-12 text-slate-300 dark:text-slate-700" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'group relative border-l-4 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50',
                        getNotificationColor(notification.type),
                        !notification.read && 'bg-opacity-100',
                        notification.read && 'opacity-60'
                      )}
                    >
                      {/* Unread indicator */}
                      {!notification.read && (
                        <div className="absolute left-2 top-4 h-2 w-2 rounded-full bg-blue-500" />
                      )}

                      {/* Content */}
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className="flex-shrink-0 text-2xl">{getNotificationIcon(notification)}</div>

                        {/* Text */}
                        <div className="flex-1">
                          <h4 className="mb-1 font-semibold text-slate-900 dark:text-white">
                            {notification.title}
                          </h4>
                          <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                              {formatTimeAgo(notification.createdAt)}
                            </span>

                            {/* Action button */}
                            {notification.actionLabel && (
                              <Button variant="ghost" size="sm" className="h-7 text-xs">
                                {notification.actionLabel}
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="rounded p-1 hover:bg-slate-200 dark:hover:bg-slate-700"
                              title="Mark as read"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="rounded p-1 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/30"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-slate-200 p-3 dark:border-slate-800">
                <button
                  onClick={clearAll}
                  className="w-full rounded-lg py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
