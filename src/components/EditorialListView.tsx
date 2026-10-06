import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { ToolDefinition } from '../types';
import { soundEngine } from '../lib/audioSynth';
import { ArrowUpRight } from 'lucide-react';

interface EditorialListViewProps {
  catalog: ToolDefinition[];
  onSelectTool: (tool: ToolDefinition) => void;
}

export const EditorialListView: React.FC<EditorialListViewProps> = ({ catalog, onSelectTool }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 z-10">
      <div className="w-full max-w-3xl flex flex-col space-y-4 my-auto py-16">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 text-xs font-mono text-zinc-500 uppercase tracking-wider">
          <span>AI TOOLS CATALOG ({catalog.length})</span>
          <span>SELECT MODEL TO LAUNCH</span>
        </div>

        <div className="flex flex-col space-y-2">
          {catalog.map((tool, index) => {
            const isHovered = hoveredId === tool.id;
            const isDimmed = hoveredId !== null && !isHovered;

            return (
              <motion.div
                key={tool.id}
                onMouseEnter={() => {
                  setHoveredId(tool.id);
                  soundEngine.playKeyClick();
                }}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => {
                  soundEngine.playSearchPulse();
                  onSelectTool(tool);
                }}
                className={`group flex items-center justify-between py-4 px-3 sm:px-5 rounded-2xl cursor-pointer transition-all duration-300 border ${
                  isHovered
                    ? 'bg-zinc-900/90 border-cyan-400/40 shadow-xl translate-x-2'
                    : isDimmed
                    ? 'opacity-30 border-transparent'
                    : 'border-transparent opacity-85 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-zinc-500 group-hover:text-cyan-400 font-bold">
                    [0{index + 1}]
                  </span>
                  <div className="flex flex-col text-left">
                    <span className="font-sans text-xl sm:text-2xl font-semibold tracking-tight text-zinc-100 group-hover:text-white">
                      {tool.name}
                    </span>
                    <span className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                      {tool.tagline}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline-block font-mono text-[10px] px-2 py-0.5 rounded-full uppercase bg-zinc-900 text-zinc-400 border border-zinc-800 group-hover:border-cyan-500/30 group-hover:text-cyan-400 transition-colors">
                    {tool.category}
                  </span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-zinc-900 group-hover:bg-cyan-500 text-zinc-400 group-hover:text-zinc-950 transition-colors shadow-xs">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
