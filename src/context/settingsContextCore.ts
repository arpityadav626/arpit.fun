import { createContext, useContext } from 'react';
import type { ToolId, AIProvider } from '../types';

export interface SettingsContextType {
  tmdbApiKey: string;
  setTmdbApiKey: (key: string) => void;
  aiApiKey: string;
  setAiApiKey: (key: string) => void;
  aiProvider: AIProvider;
  setAiProvider: (provider: AIProvider) => void;
  persistKeys: boolean;
  setPersistKeys: (persist: boolean) => void;
  clearAllKeys: () => void;

  // View state
  activeTool: ToolId;
  setActiveTool: (tool: ToolId) => void;
  viewMode: 'bento' | 'focus';
  setViewMode: (mode: 'bento' | 'focus') => void;

  // Modals & Panels
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  historyDrawerOpen: boolean;
  setHistoryDrawerOpen: (open: boolean) => void;
  settingsModalOpen: boolean;
  setSettingsModalOpen: (open: boolean) => void;
  addToolModalOpen: boolean;
  setAddToolModalOpen: (open: boolean) => void;
  manageModalOpen: boolean;
  setManageModalOpen: (open: boolean) => void;

  // Sensory & Motion
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (reduced: boolean) => void;
  aiOrbActive: boolean;
  setAiOrbActive: (active: boolean) => void;

  // Toast notifications
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
