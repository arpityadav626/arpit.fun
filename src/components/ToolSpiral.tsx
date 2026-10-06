import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ToolDefinition } from '../types';
import { getToolCatalog, removeCustomTool } from '../lib/toolCatalog';
import { useSettings } from '../context/SettingsContext';
import { soundEngine } from '../lib/audioSynth';
import { getSpiralPosition } from '../lib/spiralMath';
import { ToolFocusModal } from './ToolFocusModal';
import { AddToolModal } from './AddToolModal';
import { ToolCatalogManager } from './ToolCatalogManager';
import {
  Sparkles,
  Film,
  BookOpen,
  Music,
  Bot,
  SearchCode,
  ArrowRight,
  Compass,
} from 'lucide-react';

export interface ToolSpiralProps {
  className?: string;
  onOpenAddModal?: () => void;
  onOpenManageModal?: () => void;
}

export const ToolSpiral: React.FC<ToolSpiralProps> = ({
  className = '',
  onOpenAddModal: propsOnOpenAddModal,
  onOpenManageModal: propsOnOpenManageModal,
}) => {
  const {
    activeTool,
    setActiveTool,
    showToast,
    reducedMotion,
    addToolModalOpen,
    setAddToolModalOpen,
    manageModalOpen,
    setManageModalOpen,
  } = useSettings();
  const [catalog, setCatalog] = useState<ToolDefinition[]>(() => getToolCatalog());
  const [hoveredToolId, setHoveredToolId] = useState<string | null>(null);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [focusedTool, setFocusedTool] = useState<ToolDefinition | null>(null);
  const [toolToEdit, setToolToEdit] = useState<ToolDefinition | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Sync catalog updates
  useEffect(() => {
    const handleUpdate = () => {
      setCatalog(getToolCatalog());
    };
    window.addEventListener('webhub:catalog_updated', handleUpdate);
    return () => window.removeEventListener('webhub:catalog_updated', handleUpdate);
  }, []);

  const handleSelectNode = (tool: ToolDefinition) => {
    if (!tool.enabled) {
      showToast(`${tool.name} is disabled. Enable in Catalog Manager.`);
      return;
    }
    soundEngine.playSearchPulse();
    setActiveTool(tool.id);
    setFocusedTool(tool);
    setIsFocusModalOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    let nextIndex = currentIndex;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % catalog.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + catalog.length) % catalog.length;
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelectNode(catalog[currentIndex]);
      return;
    } else {
      return;
    }

    const nextTool = catalog[nextIndex];
    if (nextTool) {
      setActiveTool(nextTool.id);
      const nextBtn = containerRef.current?.querySelector<HTMLButtonElement>(
        `button[data-node-id="${nextTool.id}"]`
      );
      nextBtn?.focus();
    }
  };

  const getToolIcon = (id: string) => {
    switch (id) {
      case 'film':
        return Film;
      case 'books':
        return BookOpen;
      case 'music':
        return Music;
      case 'ai':
        return Bot;
      case 'operators':
        return SearchCode;
      default:
        return Sparkles;
    }
  };

  // Generate SVG path matching the multi-turn Archimedean spiral formula
  const spiralPathData = useMemo(() => {
    const total = catalog.length;
    if (total <= 1) return '';
    const points: string[] = [];
    const steps = 300;
    const turns = total <= 5 ? 1.25 : total <= 8 ? 1.6 : 2.1;
    const angleSpan = turns * 2 * Math.PI;
    const startAngle = -Math.PI / 2;
    const startRadius = 18;
    const maxRadius = 42;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const angle = startAngle + t * angleSpan;
      const radius = startRadius + t * (maxRadius - startRadius);
      const x = 500 + Math.cos(angle) * (radius * 10);
      const y = 500 + Math.sin(angle) * (radius * 10);

      if (i === 0) {
        points.push(`M ${x.toFixed(2)} ${y.toFixed(2)}`);
      } else {
        points.push(`L ${x.toFixed(2)} ${y.toFixed(2)}`);
      }
    }
    return points.join(' ');
  }, [catalog.length]);

  const handleOpenAddModal = () => {
    setToolToEdit(null);
    if (propsOnOpenAddModal) {
      propsOnOpenAddModal();
    } else {
      setAddToolModalOpen(true);
    }
  };

  const handleOpenManageModal = () => {
    if (propsOnOpenManageModal) {
      propsOnOpenManageModal();
    } else {
      setManageModalOpen(true);
    }
  };

  const handleEditTool = (tool: ToolDefinition) => {
    setToolToEdit(tool);
    if (propsOnOpenAddModal) {
      propsOnOpenAddModal();
    } else {
      setAddToolModalOpen(true);
    }
  };

  const handleDeleteTool = (tool: ToolDefinition) => {
    if (window.confirm(`Delete custom AI tool "${tool.name}"?`)) {
      try {
        removeCustomTool(tool.id);
        showToast(`Removed "${tool.name}" from catalog and spiral`);
        if (focusedTool?.id === tool.id) {
          setIsFocusModalOpen(false);
        }
      } catch (err: unknown) {
        if (err instanceof Error) alert(err.message);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full flex-1 flex flex-col items-center justify-center select-none ${className}`}
    >
      {/* Immersive Spiral Canvas Container */}
      <div className="relative w-full max-w-4xl lg:max-w-5xl aspect-square flex items-center justify-center my-auto p-2 sm:p-6">
        {/* SVG Spiral Path & Concentric Guide Rings */}
        <svg
          viewBox="0 0 1000 1000"
          className="absolute inset-0 w-full h-full pointer-events-none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="spiralVectorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.85" />
              <stop offset="40%" stopColor="#06b6d4" stopOpacity="0.45" />
              <stop offset="85%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.08" />
            </linearGradient>
            <radialGradient id="spiralCoreAtmosphere" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.28" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Central atmosphere halo */}
          <circle cx="500" cy="500" r="190" fill="url(#spiralCoreAtmosphere)" />

          {/* Concentric Guide Orbit Circles */}
          <circle
            cx="500"
            cy="500"
            r="180"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-zinc-300/40 dark:text-zinc-800/40"
            strokeDasharray="4 6"
          />
          <circle
            cx="500"
            cy="500"
            r="300"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-zinc-300/30 dark:text-zinc-800/30"
            strokeDasharray="4 6"
          />
          <circle
            cx="500"
            cy="500"
            r="420"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-zinc-300/20 dark:text-zinc-800/20"
            strokeDasharray="4 6"
          />

          {/* Continuous Archimedean Spiral Path passing smoothly through every node */}
          {spiralPathData && (
            <path
              d={spiralPathData}
              fill="none"
              stroke="url(#spiralVectorGrad)"
              strokeWidth="2.2"
              strokeDasharray="6 6"
              className="transition-all duration-700"
            />
          )}
        </svg>

        {/* Central Core Emblem / Web Hub Origin Disc */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-auto">
          <div
            onClick={handleOpenManageModal}
            title="Web Hub Core • Click to open Catalog Manager"
            className="group relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-zinc-200/90 dark:border-zinc-800/90 bg-white/95 dark:bg-[#09090b]/95 shadow-2xl flex flex-col items-center justify-center p-2 text-center select-none backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/60 hover:scale-105 cursor-pointer"
          >
            {/* Rotating Decorative Compass Ticks */}
            <div
              className={`absolute inset-0 rounded-full border border-dashed border-cyan-500/25 pointer-events-none ${
                reducedMotion ? '' : 'animate-[spin_40s_linear_infinite]'
              }`}
            />

            <div className="w-2 h-2 rounded-full bg-cyan-400 mb-1 shadow-[0_0_10px_#22d3ee] animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] font-extrabold text-zinc-900 dark:text-zinc-100">
              WEB HUB
            </span>
            <span className="font-mono text-[8px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mt-0.5">
              AI COMMAND
            </span>
            <Compass className="w-3 h-3 text-cyan-500 mt-1 opacity-70 group-hover:rotate-45 transition-transform duration-300" />
          </div>
        </div>

        {/* Dynamic Spiral Nodes */}
        <div
          role="tablist"
          aria-label="AI Tools Spiral Navigation"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <AnimatePresence>
            {catalog.map((tool, index) => {
              const pos = getSpiralPosition(index, catalog.length);
              const isSelected = activeTool === tool.id;
              const isHovered = hoveredToolId === tool.id;
              const Icon = getToolIcon(tool.id);

              return (
                <motion.div
                  key={tool.id}
                  layout={!reducedMotion}
                  initial={reducedMotion ? {} : { opacity: 0, scale: 0.7 }}
                  animate={reducedMotion ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
                  exit={reducedMotion ? {} : { opacity: 0, scale: 0.5 }}
                  transition={{
                    type: 'spring',
                    stiffness: 320,
                    damping: 24,
                    delay: reducedMotion ? 0 : index * 0.04,
                  }}
                  style={{
                    position: 'absolute',
                    left: pos.left,
                    top: pos.top,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className="z-20 pointer-events-auto"
                >
                  <motion.button
                    type="button"
                    data-node-id={tool.id}
                    role="tab"
                    aria-selected={isSelected}
                    aria-label={`${tool.name}: ${tool.tagline}`}
                    tabIndex={0}
                    whileHover={reducedMotion ? {} : { scale: 1.08 }}
                    whileTap={reducedMotion ? {} : { scale: 0.95 }}
                    onClick={() => handleSelectNode(tool)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onMouseEnter={() => {
                      setHoveredToolId(tool.id);
                      soundEngine.playKeyClick();
                    }}
                    onMouseLeave={() => setHoveredToolId(null)}
                    className={`group relative flex items-center gap-2.5 px-3.5 py-2 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 whitespace-nowrap ${
                      !tool.enabled
                        ? 'bg-zinc-100/60 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-850 text-zinc-400 dark:text-zinc-600 opacity-60'
                        : isSelected
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-2 border-cyan-400 shadow-[0_0_24px_rgba(34,211,238,0.35)] ring-1 ring-cyan-400'
                        : 'bg-white/95 dark:bg-[#0c0c0e]/90 text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white border border-zinc-200/90 dark:border-zinc-800 hover:border-cyan-400/60 shadow-lg'
                    }`}
                  >
                    {/* Index Badge (01, 02, ...) */}
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono font-bold shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-cyan-400 text-zinc-950'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:text-cyan-500'
                      }`}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    {/* Tool Icon */}
                    <Icon
                      className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                        isSelected
                          ? 'text-cyan-400 dark:text-cyan-600'
                          : 'text-zinc-500 dark:text-zinc-400 group-hover:text-cyan-400'
                      }`}
                    />

                    {/* Tool Full Name */}
                    <span className="font-sans text-xs sm:text-[13px] tracking-tight font-medium">
                      {tool.name}
                    </span>

                    {/* Custom Tool Badge */}
                    {!tool.isBuiltIn && (
                      <span className="text-[8px] font-mono uppercase px-1 py-0.2 rounded bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                        AI
                      </span>
                    )}

                    {!tool.enabled && (
                      <span className="text-[9px] font-mono text-zinc-400">OFF</span>
                    )}
                  </motion.button>

                  {/* Rich Editorial Hover Tooltip */}
                  {isHovered && (
                    <motion.div
                      role="tooltip"
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 sm:w-64 p-3 rounded-2xl bg-white/95 dark:bg-[#0c0c0e]/95 border border-zinc-200 dark:border-zinc-800 shadow-2xl z-40 pointer-events-none text-left backdrop-blur-md"
                    >
                      <div className="flex items-center justify-between pb-1.5 border-b border-zinc-100 dark:border-zinc-900 text-[10px] font-mono text-zinc-500">
                        <span className="uppercase tracking-wider">{tool.category}</span>
                        <span className={tool.enabled ? 'text-emerald-500 font-semibold' : 'text-amber-500'}>
                          {tool.enabled ? 'READY • READY' : 'DISABLED'}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mt-1.5 truncate">
                        {tool.name}
                      </h4>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {tool.tagline}
                      </p>
                      <div className="mt-2 pt-1.5 border-t border-zinc-100 dark:border-zinc-900 text-[10px] text-cyan-600 dark:text-cyan-400 font-mono flex items-center justify-between">
                        <span className="flex items-center gap-1 font-semibold">
                          <span>Launch Model</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </span>
                        <span className="text-zinc-400">↵ Return</span>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating or Embedded Model Workspace Modal */}
      <ToolFocusModal
        isOpen={isFocusModalOpen}
        onClose={() => setIsFocusModalOpen(false)}
        tool={focusedTool}
        allTools={catalog}
        onSelectTool={(t) => {
          setActiveTool(t.id);
          setFocusedTool(t);
        }}
        onOpenAddModal={handleOpenAddModal}
        onOpenManageModal={handleOpenManageModal}
        onEditCustomTool={handleEditTool}
        onDeleteCustomTool={handleDeleteTool}
      />

      {/* Add Custom AI Tool Modal */}
      <AddToolModal
        isOpen={addToolModalOpen}
        onClose={() => setAddToolModalOpen(false)}
        toolToEdit={toolToEdit}
      />

      {/* Catalog Manager Modal */}
      <ToolCatalogManager
        isOpen={manageModalOpen}
        onClose={() => setManageModalOpen(false)}
        onOpenAddModal={handleOpenAddModal}
        onEditTool={handleEditTool}
      />
    </div>
  );
};
