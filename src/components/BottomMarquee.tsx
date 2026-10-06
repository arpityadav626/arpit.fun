import React from 'react';

export const BottomMarquee: React.FC = () => {
  return (
    <aside
      aria-label="System status ticker"
      className="hidden md:flex fixed bottom-5 left-5 sm:bottom-8 sm:left-8 z-30 items-center pointer-events-auto select-none"
    >
      <div className="group relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950/80 dark:bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-md shadow-lg text-[10px] font-mono tracking-wider uppercase text-zinc-400 overflow-hidden max-w-[280px]">
        {/* Pulsing Green status indicator */}
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />

        {/* Marquee ticker text */}
        <div className="overflow-hidden whitespace-nowrap flex">
          <div className="flex animate-[marquee_20s_linear_infinite] group-hover:[animation-play-state:paused] gap-4">
            <span>WEB HUB</span>
            <span>•</span>
            <span>CLIENT-FIRST CORE</span>
            <span>•</span>
            <span>LOCAL PRIVACY</span>
            <span>•</span>
            <span>VERIFIED DISCOVERY</span>
            <span>•</span>
            <span>2026 EDITION</span>
            <span>•</span>
            <span>WEB HUB</span>
            <span>•</span>
            <span>CLIENT-FIRST CORE</span>
            <span>•</span>
            <span>LOCAL PRIVACY</span>
            <span>•</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
