import React from 'react';
import type { ToolId } from '../types';
import { useSettings } from '../context/SettingsContext';
import { Maximize2 } from 'lucide-react';

interface ToolCardProps {
  id: ToolId;
  title: string;
  badge: string;
  category: string;
  className?: string;
  children: React.ReactNode;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  id,
  title,
  badge,
  category,
  className = '',
  children,
}) => {
  const { setActiveTool, setViewMode } = useSettings();

  const handleFocus = () => {
    setActiveTool(id);
    setViewMode('focus');
  };

  return (
    <section
      aria-label={title}
      className={`group relative rounded-2xl bg-white/70 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700/80 transition-all duration-300 flex flex-col p-4 sm:p-5 ${className}`}
    >
      {/* Subtle top card glow */}
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Card Header Toolbar */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-zinc-100 dark:border-zinc-900 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
            {category}
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
            {badge}
          </span>
        </div>

        <button
          type="button"
          onClick={handleFocus}
          title="Maximize into Focus Mode"
          className="p-1 rounded-lg text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-center gap-1 text-[11px]"
        >
          <span className="hidden sm:inline">Focus</span>
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tool Content Container */}
      <div className="flex-1 min-h-0 flex flex-col">{children}</div>
    </section>
  );
};
