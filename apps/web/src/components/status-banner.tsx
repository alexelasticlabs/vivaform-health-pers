import React from 'react';
import { useOfflineStore } from '@/store/offline-store';

// Показывает статус сети и деградацию backend
export const StatusBanner: React.FC = () => {
  const offline = useOfflineStore(s => s.offline);
  const backendDown = useOfflineStore(s => s.backendDown);
  const error5xxCount = useOfflineStore(s => s.error5xxCount);

  if (!offline && !backendDown) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 w-[92%] max-w-lg">
      <div className={`rounded-2xl px-4 py-3 shadow-xl text-sm font-medium flex items-center gap-2 backdrop-blur-md border
        ${offline ? 'bg-amber-100/90 text-amber-900 border-amber-300 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700/60' : ''}
        ${backendDown ? 'bg-rose-100/90 text-rose-900 border-rose-300 dark:bg-rose-900/30 dark:text-rose-200 dark:border-rose-700/60' : ''}`}
      >
        {offline && <span>⚠️ Нет ответа от сервера. Проверяем соединение…</span>}
        {backendDown && !offline && <span>🛠️ Сервер испытывает трудности (5xx ×{error5xxCount}). Функционал может работать нестабильно.</span>}
      </div>
    </div>
  );
};

