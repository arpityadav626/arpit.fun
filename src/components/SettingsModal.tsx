import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { soundEngine } from '../lib/audioSynth';
import {
  X,
  Bot,
  Film,
  Key,
  ExternalLink,
  Volume2,
  VolumeX,
  Trash2,
  Eye,
  EyeOff,
  Check,
  ShieldCheck,
} from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    settingsModalOpen,
    setSettingsModalOpen,
    tmdbApiKey,
    setTmdbApiKey,
    aiApiKey,
    setAiApiKey,
    aiProvider,
    setAiProvider,
    persistKeys,
    setPersistKeys,
    clearAllKeys,
    soundEnabled,
    setSoundEnabled,
    showToast,
  } = useSettings();

  const [showAiKey, setShowAiKey] = useState(false);
  const [showTmdbKey, setShowTmdbKey] = useState(false);

  if (!settingsModalOpen) return null;

  const handleSaveAndClose = () => {
    soundEngine.playKeyClick();
    showToast('Settings saved');
    setSettingsModalOpen(false);
  };

  const handleClearKeys = () => {
    if (window.confirm('Remove saved API keys from this device?')) {
      clearAllKeys();
      soundEngine.playKeyClick();
      showToast('All API keys cleared');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="API Settings"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-xl bg-black/80 animate-in fade-in duration-200"
      onClick={() => setSettingsModalOpen(false)}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-[#0c0c10] border border-zinc-800/90 shadow-[0_24px_80px_rgba(0,0,0,0.9)] p-6 sm:p-8 text-zinc-100 flex flex-col space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-850">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-base tracking-tight text-white flex items-center gap-2">
                API Settings
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/60 font-normal">
                  Optional
                </span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Add keys to supercharge AI intelligence & film discovery
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSettingsModalOpen(false)}
            className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. AI Provider & Key */}
        <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>AI Engine</span>
            </div>

            {/* Provider Switcher Tabs */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-950 border border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playKeyClick();
                  setAiProvider('gemini');
                }}
                className={`px-2.5 py-1 text-xs rounded-md font-mono transition-all cursor-pointer ${
                  aiProvider === 'gemini'
                    ? 'bg-cyan-500 text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Gemini
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playKeyClick();
                  setAiProvider('groq');
                }}
                className={`px-2.5 py-1 text-xs rounded-md font-mono transition-all cursor-pointer ${
                  aiProvider === 'groq'
                    ? 'bg-cyan-500 text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Groq
              </button>
            </div>
          </div>

          <div className="relative flex items-center">
            <input
              type={showAiKey ? 'text' : 'password'}
              value={aiApiKey}
              onChange={(e) => setAiApiKey(e.target.value)}
              placeholder={
                aiProvider === 'gemini'
                  ? 'Paste your Google Gemini API key (AIzaSy...)'
                  : 'Paste your Groq Cloud API key (gsk_...)'
              }
              className="w-full pr-10 pl-3.5 py-2.5 text-xs font-mono rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/40 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowAiKey(!showAiKey)}
              className="absolute right-3 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              title={showAiKey ? 'Hide key' : 'Show key'}
            >
              {showAiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-0.5">
            <span className="text-zinc-400">
              {aiProvider === 'gemini' ? 'Google AI Studio (Free tier)' : 'Groq Fast Inference (Free tier)'}
            </span>
            <a
              href={
                aiProvider === 'gemini'
                  ? 'https://aistudio.google.com/app/apikey'
                  : 'https://console.groq.com/keys'
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1 transition-colors"
            >
              Get free key <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>

        {/* 2. TMDb Movie Database Key */}
        <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
              <Film className="w-4 h-4 text-rose-400" />
              <span>Movie Database (TMDb)</span>
            </div>

            <a
              href="https://www.themoviedb.org/settings/api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1 transition-colors"
            >
              Get TMDb key <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          <div className="relative flex items-center">
            <input
              type={showTmdbKey ? 'text' : 'password'}
              value={tmdbApiKey}
              onChange={(e) => setTmdbApiKey(e.target.value)}
              placeholder="Paste TMDb API key or Read Token..."
              className="w-full pr-10 pl-3.5 py-2.5 text-xs font-mono rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/40 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowTmdbKey(!showTmdbKey)}
              className="absolute right-3 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              title={showTmdbKey ? 'Hide key' : 'Show key'}
            >
              {showTmdbKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          <p className="text-[11px] text-zinc-400">
            Enables instant movie posters and ratings in Film Finder. (Trailers & JustWatch work without key).
          </p>
        </div>

        {/* 3. Clean Settings Toggles */}
        <div className="space-y-2.5">
          {/* Remember keys toggle */}
          <div
            onClick={() => {
              soundEngine.playKeyClick();
              setPersistKeys(!persistKeys);
            }}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900/30 border border-zinc-800/60 hover:border-zinc-700 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="text-xs font-medium text-zinc-200 block">
                  Remember keys on this browser
                </span>
                <span className="text-[11px] text-zinc-400">
                  {persistKeys ? 'Saved locally in this browser' : 'Memory only (cleared on close)'}
                </span>
              </div>
            </div>

            <div
              className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                persistKeys ? 'bg-cyan-500' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-zinc-950 shadow-md transform transition-transform duration-200 ease-in-out ${
                  persistKeys ? 'translate-x-4 bg-white' : 'translate-x-0'
                }`}
              />
            </div>
          </div>

          {/* Sound Effects toggle */}
          <div
            onClick={() => {
              setSoundEnabled(!soundEnabled);
            }}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900/30 border border-zinc-800/60 hover:border-zinc-700 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-300">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-zinc-500" />
                )}
              </div>
              <div>
                <span className="text-xs font-medium text-zinc-200 block">
                  Interactive Sound Effects
                </span>
                <span className="text-[11px] text-zinc-400">
                  {soundEnabled ? 'Subtle audio feedback enabled' : 'Muted audio feedback'}
                </span>
              </div>
            </div>

            <div
              className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                soundEnabled ? 'bg-cyan-500' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-zinc-950 shadow-md transform transition-transform duration-200 ease-in-out ${
                  soundEnabled ? 'translate-x-4 bg-white' : 'translate-x-0'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-zinc-850 flex items-center justify-between gap-3">
          {aiApiKey || tmdbApiKey ? (
            <button
              type="button"
              onClick={handleClearKeys}
              className="text-xs text-zinc-500 hover:text-rose-400 transition-colors inline-flex items-center gap-1.5 cursor-pointer py-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Keys</span>
            </button>
          ) : (
            <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Client-side only</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleSaveAndClose}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold shadow-lg transition-transform active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save & Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};
