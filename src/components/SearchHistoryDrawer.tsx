import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { getStoredHistory, removeHistoryItem, clearAllHistory, formatRelativeTime } from '../lib/history';
import type { SearchHistoryItem } from '../types';
import { History, X, Trash2, ArrowUpRight, Clock, Search, ShieldCheck } from 'lucide-react';

export const SearchHistoryDrawer: React.FC = () => {
  const {
    historyDrawerOpen,
    setHistoryDrawerOpen,
    setActiveTool,
    setViewMode,
    showToast,
  } = useSettings();

  const [items, setItems] = useState<SearchHistoryItem[]>(() => getStoredHistory());

  useEffect(() => {
    const handleUpdate = () => {
      setItems(getStoredHistory());
    };
    window.addEventListener('webhub:history_updated', handleUpdate);
    return () => window.removeEventListener('webhub:history_updated', handleUpdate);
  }, []);

  if (!historyDrawerOpen) return null;

  const handleReopen = (item: SearchHistoryItem) => {
    setActiveTool(item.toolId);
    setViewMode('focus');
    setHistoryDrawerOpen(false);
    showToast(`Switched to ${item.toolName} for "${item.query}"`);
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeHistoryItem(id);
    showToast('Entry removed from history');
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all stored search history? This cannot be undone.')) {
      clearAllHistory();
      showToast('All search history cleared');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search History"
      className="fixed inset-0 z-50 flex justify-end backdrop-blur-xs bg-black/50 animate-in fade-in duration-200"
      onClick={() => setHistoryDrawerOpen(false)}
    >
      <div
        className="w-full max-w-md h-full bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl p-5 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                Search History
              </h3>
              <p className="text-[11px] text-zinc-400">
                Stored exclusively in your local browser storage
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setHistoryDrawerOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2 pr-1">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-zinc-400">
              <Search className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-xs">No search history recorded yet.</p>
              <span className="text-[11px] text-zinc-500 mt-1">
                Your searches across tools will be listed here.
              </span>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                onClick={() => handleReopen(item)}
                className="group p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-cyan-500/40 transition-all cursor-pointer flex items-center justify-between text-xs"
              >
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {item.query}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400">
                    <span className="font-mono text-cyan-600 dark:text-cyan-400">{item.toolName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {formatRelativeTime(item.timestamp)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleDeleteItem(item.id, e)}
                    title="Remove from history"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="p-1.5 text-zinc-400 group-hover:text-cyan-400 transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-[11px] text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Zero telemetry transmitted</span>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-medium inline-flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Clear All ({items.length})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
