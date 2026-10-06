import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import { soundEngine } from '../lib/audioSynth';
import {
  Search,
  Sun,
  Moon,
  Settings,
  History,
  Volume2,
  VolumeX,
  Plus,
  SlidersHorizontal,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    setCommandPaletteOpen,
    setHistoryDrawerOpen,
    setSettingsModalOpen,
    setAddToolModalOpen,
    setManageModalOpen,
    soundEnabled,
    setSoundEnabled,
  } = useSettings();

  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3.5 backdrop-blur-xl bg-white/70 dark:bg-[#070709]/80 border-b border-zinc-200/80 dark:border-zinc-850/80 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand & Editorial Identifier */}
        <div className="flex items-center gap-3">
          <div className="flex items-center select-none cursor-pointer">
            <span className="font-mono text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              WEB<span className="text-cyan-400">HUB</span>
            </span>
            <span className="ml-2.5 px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
              AI Command
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Spiral Engine</span>
          </div>
        </div>

        {/* Right: Quick Command Palette Trigger & System Controls */}
        <div className="flex items-center gap-2">
          {/* Add Custom AI Tool Button */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playKeyClick();
              setAddToolModalOpen(true);
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Create user-defined custom AI prompt tool"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add AI Tool</span>
          </button>

          {/* Manage Catalog Button */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playKeyClick();
              setManageModalOpen(true);
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Reorder, enable, or disable spiral tools"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Catalog</span>
          </button>

          {/* Command Palette Trigger */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playKeyClick();
              setCommandPaletteOpen(true);
            }}
            aria-label="Open Command Palette (Ctrl+K or Cmd+K)"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Search className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden lg:inline">Command</span>
            <kbd className="px-1.5 py-0.2 text-[10px] rounded bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold border border-zinc-200 dark:border-zinc-700">
              ⌘K
            </kbd>
          </button>

          {/* Search History Button */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playKeyClick();
              setHistoryDrawerOpen(true);
            }}
            aria-label="Search History"
            title="Recent Search History"
            className="p-2 rounded-full text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <History className="w-4 h-4" />
          </button>

          {/* Opt-in Sound Mute / Unmute Control */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            aria-label={soundEnabled ? 'Mute Audio Feedback' : 'Enable Subtle Audio Feedback'}
            title={soundEnabled ? 'Audio: Enabled (Click to mute)' : 'Audio: Muted (Click to enable)'}
            className={`p-2 rounded-full transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-cyan-500/10 text-cyan-500 ring-1 ring-cyan-500/30'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playKeyClick();
              toggleTheme();
            }}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="p-2 rounded-full text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Settings Modal Trigger */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playKeyClick();
              setSettingsModalOpen(true);
            }}
            aria-label="Settings"
            title="Settings & API Keys"
            className="p-2 rounded-full text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
