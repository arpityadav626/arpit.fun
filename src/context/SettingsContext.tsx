import React, { useEffect, useState, useCallback } from 'react';
import type { ToolId, AIProvider } from '../types';
import { soundEngine } from '../lib/audioSynth';
import { SettingsContext } from './settingsContextCore';
export { useSettings } from './settingsContextCore';

const SETTINGS_KEY = 'webhub_settings_v1';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check if user previously saved persistent keys
  const [persistKeys, setPersistKeysState] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return Boolean(parsed.persistKeys);
      }
    } catch {
      // Ignore
    }
    return false; // Default: Keep in memory only for safety
  });

  const [tmdbApiKey, setTmdbApiKeyState] = useState<string>(() => {
    if (persistKeys) {
      try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) return JSON.parse(stored).tmdbApiKey || '';
      } catch {
        // Ignore
      }
    }
    return '';
  });

  const [aiApiKey, setAiApiKeyState] = useState<string>(() => {
    if (persistKeys) {
      try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) return JSON.parse(stored).aiApiKey || '';
      } catch {
        // Ignore
      }
    }
    return '';
  });

  const [aiProvider, setAiProviderState] = useState<AIProvider>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const prov = JSON.parse(stored).aiProvider;
        if (prov === 'gemini' || prov === 'groq') return prov;
      }
    } catch {
      // Ignore
    }
    return 'gemini';
  });

  const [activeTool, setActiveTool] = useState<ToolId>('film');
  const [viewMode, setViewMode] = useState<'bento' | 'focus'>('bento');

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [addToolModalOpen, setAddToolModalOpen] = useState(false);
  const [manageModalOpen, setManageModalOpen] = useState(false);

  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('webhub_sound_enabled');
      if (stored !== null) return stored === 'true';
    } catch {
      // Ignore
    }
    return true; // Default: ON everywhere!
  });

  // Sync sound engine state immediately on mount and changes
  useEffect(() => {
    soundEngine.setEnabled(soundEnabled);
  }, [soundEnabled]);

  const [reducedMotion, setReducedMotionState] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('webhub_reduced_motion');
      if (stored !== null) return stored === 'true';
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      }
    } catch {
      // Ignore
    }
    return false;
  });
  const [aiOrbActive, setAiOrbActive] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  const setReducedMotion = (reduced: boolean) => {
    setReducedMotionState(reduced);
    try {
      localStorage.setItem('webhub_reduced_motion', String(reduced));
    } catch {
      // Ignore
    }
  };

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    soundEngine.setEnabled(enabled);
    try {
      localStorage.setItem('webhub_sound_enabled', String(enabled));
    } catch {
      // Ignore
    }
    if (enabled) {
      soundEngine.playChime(440, 'sine', 0.2);
    }
  };

  // Sync to localStorage only if user explicitly consented to persist keys
  const setPersistKeys = (persist: boolean) => {
    setPersistKeysState(persist);
    try {
      if (persist) {
        localStorage.setItem(
          SETTINGS_KEY,
          JSON.stringify({
            persistKeys: true,
            tmdbApiKey,
            aiApiKey,
            aiProvider,
          })
        );
      } else {
        localStorage.removeItem(SETTINGS_KEY);
      }
    } catch {
      // Ignore
    }
  };

  const setTmdbApiKey = (key: string) => {
    setTmdbApiKeyState(key);
    if (persistKeys) {
      try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        const parsed = stored ? JSON.parse(stored) : {};
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...parsed, tmdbApiKey: key }));
      } catch {
        // Ignore
      }
    }
  };

  const setAiApiKey = (key: string) => {
    setAiApiKeyState(key);
    if (persistKeys) {
      try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        const parsed = stored ? JSON.parse(stored) : {};
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...parsed, aiApiKey: key }));
      } catch {
        // Ignore
      }
    }
  };

  const setAiProvider = (prov: AIProvider) => {
    setAiProviderState(prov);
    if (persistKeys) {
      try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        const parsed = stored ? JSON.parse(stored) : {};
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...parsed, aiProvider: prov }));
      } catch {
        // Ignore
      }
    }
  };

  const clearAllKeys = () => {
    setTmdbApiKeyState('');
    setAiApiKeyState('');
    try {
      localStorage.removeItem(SETTINGS_KEY);
    } catch {
      // Ignore
    }
    showToast('All API keys cleared from session & storage.');
  };

  // Global keyboard shortcuts (Ctrl+K, Cmd+K, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
        setHistoryDrawerOpen(false);
        setSettingsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        tmdbApiKey,
        setTmdbApiKey,
        aiApiKey,
        setAiApiKey,
        aiProvider,
        setAiProvider,
        persistKeys,
        setPersistKeys,
        clearAllKeys,
        activeTool,
        setActiveTool,
        viewMode,
        setViewMode,
        commandPaletteOpen,
        setCommandPaletteOpen,
        historyDrawerOpen,
        setHistoryDrawerOpen,
        settingsModalOpen,
        setSettingsModalOpen,
        addToolModalOpen,
        setAddToolModalOpen,
        manageModalOpen,
        setManageModalOpen,
        soundEnabled,
        setSoundEnabled,
        reducedMotion,
        setReducedMotion,
        aiOrbActive,
        setAiOrbActive,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
