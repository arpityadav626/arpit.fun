import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';
import { getStoredHistory } from '../lib/history';
import { getToolCatalog } from '../lib/toolCatalog';
import {
  Search,
  Film,
  BookOpen,
  Music,
  Bot,
  SearchCode,
  Settings,
  History,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface PaletteItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Tools' | 'Custom Tools' | 'Recent Searches' | 'Actions';
  icon: React.FC<{ className?: string }>;
  onSelect: () => void;
}

export const CommandPalette: React.FC = () => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setActiveTool,
    setViewMode,
    setSettingsModalOpen,
    setHistoryDrawerOpen,
    showToast,
  } = useSettings();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  if (!commandPaletteOpen) return null;

  const historyItems = getStoredHistory().slice(0, 4);

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

  const catalog = getToolCatalog();
  const toolItems: PaletteItem[] = catalog
    .filter((t) => t.enabled)
    .map((tool) => ({
      id: `tool-${tool.id}`,
      title: tool.name,
      subtitle: tool.tagline,
      category: tool.isBuiltIn ? 'Tools' : 'Custom Tools',
      icon: getToolIcon(tool.id),
      onSelect: () => {
        setActiveTool(tool.id);
        window.dispatchEvent(new CustomEvent('webhub:center_tool', { detail: { toolId: tool.id } }));
        setViewMode('focus');
        setCommandPaletteOpen(false);
      },
    }));

  const actionItems: PaletteItem[] = [
    {
      id: 'action-settings',
      title: 'Configure API Keys & Settings',
      subtitle: 'TMDb key, Gemini/Groq keys, storage preferences',
      category: 'Actions',
      icon: Settings,
      onSelect: () => {
        setCommandPaletteOpen(false);
        setSettingsModalOpen(true);
      },
    },
    {
      id: 'action-history',
      title: 'View Full Search History',
      subtitle: 'Inspect local query logs and rerun searches',
      category: 'Actions',
      icon: History,
      onSelect: () => {
        setCommandPaletteOpen(false);
        setHistoryDrawerOpen(true);
      },
    },
  ];

  const recentItems: PaletteItem[] = historyItems.map((h) => ({
    id: `recent-${h.id}`,
    title: h.query,
    subtitle: `Searched in ${h.toolName}`,
    category: 'Recent Searches',
    icon: History,
    onSelect: () => {
      setActiveTool(h.toolId);
      setViewMode('focus');
      setCommandPaletteOpen(false);
      showToast(`Reopened ${h.query}`);
    },
  }));

  const allItems: PaletteItem[] = [...toolItems, ...recentItems, ...actionItems];

  const filteredItems = allItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].onSelect();
      }
    } else if (e.key === 'Escape') {
      setCommandPaletteOpen(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 backdrop-blur-md bg-black/60 animate-in fade-in duration-200"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl bg-zinc-900 border border-zinc-700/80 shadow-2xl text-zinc-100 overflow-hidden flex flex-col max-h-[70vh]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-800 gap-3">
          <Search className="w-4 h-4 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a tool name, query, or command..."
            className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-hidden font-sans"
          />
          <kbd className="px-2 py-0.5 text-[10px] rounded bg-zinc-800 text-zinc-400 font-mono border border-zinc-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              No matching tools or commands found for "{searchQuery}".
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={item.onSelect}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-zinc-800 text-white shadow-xs'
                      : 'text-zinc-300 hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg border ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-zinc-100 truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-2" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span className="flex items-center gap-1 text-cyan-400">
            <Sparkles className="w-3 h-3" /> Web Hub Command Core
          </span>
        </div>
      </div>
    </div>
  );
};
