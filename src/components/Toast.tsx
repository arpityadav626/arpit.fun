import React, { useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { CheckCircle2 } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage, showToast } = useSettings();

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        showToast('');
      }, 2600);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, showToast]);

  if (!toastMessage) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/95 dark:bg-zinc-100/95 text-white dark:text-zinc-950 border border-zinc-700 dark:border-zinc-300 shadow-2xl backdrop-blur-md text-xs font-medium font-sans">
        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 dark:text-cyan-600 shrink-0" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};
