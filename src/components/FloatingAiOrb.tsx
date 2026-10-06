import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { soundEngine } from '../lib/audioSynth';

export const FloatingAiOrb: React.FC = () => {
  const {
    aiOrbActive,
    setAiOrbActive,
    setActiveTool,
    setViewMode,
    showToast,
  } = useSettings();

  const handleToggle = () => {
    const nextState = !aiOrbActive;
    setAiOrbActive(nextState);
    if (nextState) {
      soundEngine.playAiAction();
      showToast('AI Synapse Acceleration: Engaged');
    } else {
      showToast('AI Synapse Acceleration: Standby');
    }
  };

  const handleDoubleAction = () => {
    setActiveTool('ai');
    setViewMode('focus');
    showToast('Switched to AI Summarizer Studio');
  };

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-40">
      <div className="relative group flex items-center justify-center">
        {/* Concentric Pulse Wave Ring (inspired by pacomepertant.com sound button) */}
        <span
          className={`absolute inset-0 rounded-full transition-all duration-700 pointer-events-none ${
            aiOrbActive
              ? 'bg-cyan-500/30 scale-150 animate-ping opacity-60'
              : 'bg-zinc-500/10 scale-110 opacity-0 group-hover:opacity-100'
          }`}
        />

        {/* Outer Glow Halo */}
        <div
          className={`absolute -inset-1 rounded-full blur-md transition-opacity duration-300 ${
            aiOrbActive ? 'bg-cyan-500/40 opacity-100' : 'bg-transparent opacity-0 group-hover:opacity-40'
          }`}
        />

        {/* Main Circular Button */}
        <button
          type="button"
          onClick={handleToggle}
          onDoubleClick={handleDoubleAction}
          aria-label={aiOrbActive ? 'AI Pulse Accelerated' : 'Activate AI Neural Pulse'}
          title="Click to toggle AI Neural Wave • Double-click to jump to AI Studio"
          className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl border cursor-pointer select-none active:scale-95 ${
            aiOrbActive
              ? 'bg-zinc-900 dark:bg-zinc-100 text-cyan-400 dark:text-cyan-600 border-cyan-400/80 ring-2 ring-cyan-400/40'
              : 'bg-zinc-900/90 dark:bg-zinc-100/90 text-white dark:text-zinc-900 border-zinc-700 dark:border-zinc-300 hover:scale-105'
          }`}
        >
          {/* Animated AI Waveform Equalizer (Replaces traditional audio bars with AI synaptic pulses) */}
          <div className="flex items-center gap-[3px] h-5">
            <span
              className={`w-[3px] rounded-full transition-all duration-300 ${
                aiOrbActive
                  ? 'bg-cyan-400 h-5 animate-pulse'
                  : 'bg-zinc-400 dark:bg-zinc-600 h-2 group-hover:h-3.5'
              }`}
              style={{ animationDelay: '0ms' }}
            />
            <span
              className={`w-[3px] rounded-full transition-all duration-300 ${
                aiOrbActive
                  ? 'bg-cyan-300 h-3 animate-pulse'
                  : 'bg-zinc-400 dark:bg-zinc-600 h-4 group-hover:h-5'
              }`}
              style={{ animationDelay: '120ms' }}
            />
            <span
              className={`w-[3px] rounded-full transition-all duration-300 ${
                aiOrbActive
                  ? 'bg-cyan-400 h-6 animate-pulse'
                  : 'bg-zinc-400 dark:bg-zinc-600 h-1.5 group-hover:h-4'
              }`}
              style={{ animationDelay: '240ms' }}
            />
            <span
              className={`w-[3px] rounded-full transition-all duration-300 ${
                aiOrbActive
                  ? 'bg-cyan-300 h-4 animate-pulse'
                  : 'bg-zinc-400 dark:bg-zinc-600 h-3 group-hover:h-4.5'
              }`}
              style={{ animationDelay: '360ms' }}
            />
          </div>
        </button>

        {/* Hover Label Pill */}
        <div className="absolute right-full mr-3 px-2.5 py-1 rounded-full text-[11px] font-mono whitespace-nowrap bg-zinc-900/90 dark:bg-zinc-100/90 text-zinc-100 dark:text-zinc-900 border border-zinc-700 dark:border-zinc-300 shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0">
          <span>{aiOrbActive ? 'AI Synapse: Active' : 'AI Neural Pulse'}</span>
        </div>
      </div>
    </div>
  );
};
