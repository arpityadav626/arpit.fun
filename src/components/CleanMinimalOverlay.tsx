import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import { soundEngine } from '../lib/audioSynth';
import type { ToolDefinition } from '../types';
import {
  Volume2,
  VolumeX,
  X,
  Settings,
} from 'lucide-react';

interface CleanMinimalOverlayProps {
  currentView: 'spiral' | 'list';
  onViewChange: (view: 'spiral' | 'list') => void;
  catalog: ToolDefinition[];
  onSelectTool: (tool: ToolDefinition) => void;
}

export const CleanMinimalOverlay: React.FC<CleanMinimalOverlayProps> = ({
  currentView,
  onViewChange,
  catalog: _catalog,
  onSelectTool: _onSelectTool,
}) => {
  const {
    soundEnabled,
    setSoundEnabled,
    setSettingsModalOpen,
    reducedMotion,
  } = useSettings();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleToggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  return (
    <>
      {/* 1. Top-Left: Signature 3D Orb with Smile Reflection & Hover Tag Badge */}
      <div className="fixed top-5 left-5 sm:top-8 sm:left-8 z-30 flex items-center gap-3 select-none pointer-events-auto">
        <div
          onClick={() => {
            soundEngine.playKeyClick();
            onViewChange('spiral');
          }}
          title="AI Hub • 3D Spiral"
          className="group relative flex items-center cursor-pointer"
        >
          {/* 3D Glossy Sphere with Smile Reflection */}
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden shadow-[0_0_25px_rgba(34,211,238,0.35)] transition-transform duration-300 group-hover:scale-105 active:scale-95 bg-radial from-zinc-800 to-zinc-950 border border-white/20">
            {/* Top green/cyan crescent glow */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-emerald-400 via-cyan-400 to-transparent opacity-85 rounded-t-full" />
            {/* Smile reflection curve */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 40 40" className="w-6 h-6 text-white drop-shadow-xs">
                <path
                  d="M 10 22 Q 20 32 30 22"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            {/* Specular sheen */}
            <div className="absolute top-1 left-2.5 w-4 h-2 bg-white/60 rounded-full blur-[0.6px]" />
          </div>

          {/* Hover Pop-out Tag Badge */}
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out translate-x-1 group-hover:translate-x-3 -rotate-3 scale-90 group-hover:scale-100 pointer-events-none hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#21ffc0] text-zinc-950 font-medium text-xs shadow-lg">
            <span>AI HUB</span>
            <span className="font-bold">✲</span>
          </div>
        </div>
      </div>

      {/* 2. Top-Center: Minimalist Mode Switcher (spiral • list) */}
      <nav
        aria-label="View Switcher"
        className="fixed top-6 sm:top-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-5 select-none pointer-events-auto"
      >
        <div className="flex justify-end min-w-[56px]">
          <button
            type="button"
            onClick={() => {
              soundEngine.playKeyClick();
              onViewChange('spiral');
            }}
            className={`group relative overflow-hidden font-sans text-sm sm:text-[15px] font-medium tracking-tight transition-opacity duration-200 cursor-pointer ${
              currentView === 'spiral'
                ? 'text-white font-semibold opacity-100'
                : 'text-zinc-400 opacity-40 hover:opacity-85'
            }`}
          >
            <span className="block transition-transform duration-300 ease-out group-hover:translate-y-full">
              spiral
            </span>
            <span className="absolute top-0 left-0 transition-transform duration-300 ease-out -translate-y-full group-hover:translate-y-0 text-white font-semibold">
              spiral
            </span>
          </button>
        </div>

        <span className="w-1.5 h-1.5 rounded-full bg-white opacity-60" />

        <div className="flex justify-start min-w-[56px]">
          <button
            type="button"
            onClick={() => {
              soundEngine.playKeyClick();
              onViewChange('list');
            }}
            className={`group relative overflow-hidden font-sans text-sm sm:text-[15px] font-medium tracking-tight transition-opacity duration-200 cursor-pointer ${
              currentView === 'list'
                ? 'text-white font-semibold opacity-100'
                : 'text-zinc-400 opacity-40 hover:opacity-85'
            }`}
          >
            <span className="block transition-transform duration-300 ease-out group-hover:translate-y-full">
              list
            </span>
            <span className="absolute top-0 left-0 transition-transform duration-300 ease-out -translate-y-full group-hover:translate-y-0 text-white font-semibold">
              list
            </span>
          </button>
        </div>
      </nav>

      {/* 3. Top-Right: Sleek Pill Menu Button (menu •) */}
      <div className="fixed top-5 right-5 sm:top-8 sm:right-8 z-30 select-none pointer-events-auto">
        <button
          type="button"
          onClick={() => {
            soundEngine.playKeyClick();
            setIsMenuOpen(true);
          }}
          className="group relative flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-white text-zinc-950 hover:bg-zinc-100 font-medium text-xs sm:text-sm transition-all duration-200 shadow-xl cursor-pointer active:scale-95"
        >
          <span>menu</span>
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-950 opacity-90" />
        </button>
      </div>

      {/* 4. Bottom-Right: Floating Circular Sound Toggle Button */}
      <div className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-30 select-none pointer-events-auto">
        <button
          type="button"
          onClick={handleToggleSound}
          aria-label={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
          title={soundEnabled ? 'Audio: On' : 'Audio: Muted'}
          className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white text-zinc-950 shadow-2xl flex items-center justify-center transition-transform hover:scale-105 active:scale-90 cursor-pointer"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-zinc-950" />
          ) : (
            <VolumeX className="w-4 h-4 text-zinc-400" />
          )}
        </button>
      </div>

      {/* 5. Minimalist Pure Menu Drawer - Only Genuine Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
            className="fixed inset-0 z-50 flex items-center justify-end backdrop-blur-xl bg-black/70 animate-in fade-in duration-200"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div
              initial={reducedMotion ? {} : { x: '100%' }}
              animate={reducedMotion ? {} : { x: 0 }}
              exit={reducedMotion ? {} : { x: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              className="relative w-full max-w-sm sm:max-w-md h-full bg-[#09090c]/98 border-l border-zinc-800/80 p-8 sm:p-12 flex flex-col justify-between shadow-[0_0_60px_rgba(0,0,0,0.9)] text-zinc-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-6 border-b border-zinc-850">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold tracking-tight text-white">
                    AI<span className="text-cyan-400">HUB</span>
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Close Menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Primary Navigation - Pure, Calm & Focused */}
              <div className="flex flex-col space-y-8 my-auto py-10">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onViewChange('spiral');
                  }}
                  className="group flex items-center justify-between text-left text-3xl sm:text-4xl font-medium tracking-tight text-zinc-300 hover:text-white transition-all cursor-pointer"
                >
                  <span className="group-hover:translate-x-2 transition-transform">
                    3D Spiral
                  </span>
                  <span className="text-xs font-mono text-zinc-600 group-hover:text-cyan-400 transition-colors">
                    [01]
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onViewChange('list');
                  }}
                  className="group flex items-center justify-between text-left text-3xl sm:text-4xl font-medium tracking-tight text-zinc-300 hover:text-white transition-all cursor-pointer"
                >
                  <span className="group-hover:translate-x-2 transition-transform">
                    Tools Catalog
                  </span>
                  <span className="text-xs font-mono text-zinc-600 group-hover:text-cyan-400 transition-colors">
                    [02]
                  </span>
                </button>
              </div>

              {/* Minimal Clean Footer */}
              <div className="pt-6 border-t border-zinc-850 flex items-center justify-between text-xs font-mono text-zinc-500">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setSettingsModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-cyan-400" />
                  <span>API Settings</span>
                </button>

                <span className="text-zinc-600">AI HUB • 2026</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
