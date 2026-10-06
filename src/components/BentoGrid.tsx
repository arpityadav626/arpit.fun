import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import { ToolCard } from './ToolCard';
import { ToolSpiral } from './ToolSpiral';
import { AddToolModal } from './AddToolModal';
import { ToolCatalogManager } from './ToolCatalogManager';
import { FilmFinder } from '../tools/FilmFinder';
import { BookFinder } from '../tools/BookFinder';
import { MusicFinder } from '../tools/MusicFinder';
import { AISummarizer } from '../tools/AISummarizer';
import { SearchOperators } from '../tools/SearchOperators';
import { CustomAITool } from '../tools/CustomAITool';
import { getToolCatalog, removeCustomTool } from '../lib/toolCatalog';
import { soundEngine } from '../lib/audioSynth';
import type { ToolDefinition } from '../types';
import {
  Film,
  BookOpen,
  Music,
  Bot,
  SearchCode,
  Sparkles,
  Plus,
  SlidersHorizontal,
  AlertCircle,
  ArrowLeft,
  Layers,
  ChevronRight,
} from 'lucide-react';

export const BentoGrid: React.FC = () => {
  const { viewMode, setViewMode, activeTool, setActiveTool, showToast, reducedMotion } = useSettings();
  const [catalog, setCatalog] = useState<ToolDefinition[]>(() => getToolCatalog());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [toolToEdit, setToolToEdit] = useState<ToolDefinition | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setCatalog(getToolCatalog());
    };
    window.addEventListener('webhub:catalog_updated', handleUpdate);
    return () => window.removeEventListener('webhub:catalog_updated', handleUpdate);
  }, []);

  const handleOpenAddModal = () => {
    setToolToEdit(null);
    setIsAddModalOpen(true);
  };

  const handleEditTool = (tool: ToolDefinition) => {
    setToolToEdit(tool);
    setIsAddModalOpen(true);
  };

  const handleDeleteTool = (tool: ToolDefinition) => {
    if (window.confirm(`Delete custom tool "${tool.name}"?`)) {
      try {
        removeCustomTool(tool.id);
        showToast(`Removed "${tool.name}"`);
        if (activeTool === tool.id) {
          setActiveTool('ai');
        }
      } catch (err: unknown) {
        if (err instanceof Error) alert(err.message);
      }
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

  const enabledTools = catalog.filter((t) => t.enabled);
  const currentFocusedTool = catalog.find((t) => t.id === activeTool) || catalog[0];

  // Extract unique categories
  const categories = ['All', ...Array.from(new Set(catalog.map((t) => t.category)))];

  const filteredTools = catalog.filter((t) => {
    if (!t.enabled) return false;
    if (selectedCategory === 'All') return true;
    return t.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {viewMode === 'focus' ? (
          // ===================== FOCUS MODE =====================
          <motion.div
            key="focus-view"
            initial={reducedMotion ? {} : { opacity: 0, y: 15 }}
            animate={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            exit={reducedMotion ? {} : { opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="max-w-4xl mx-auto space-y-5"
          >
            {/* Top Navigation & Breadcrumbs Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-white/80 dark:bg-zinc-950/80 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl shadow-xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playKeyClick();
                    setViewMode('bento');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Spiral</span>
                </button>

                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                  <span className="hidden sm:inline">WEB HUB</span>
                  <ChevronRight className="hidden sm:inline w-3 h-3 text-zinc-600" />
                  <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-cyan-600 dark:text-cyan-400 text-[11px]">
                    {currentFocusedTool?.category || 'TOOL'}
                  </span>
                </div>
              </div>

              {/* Tools Switcher Ribbon */}
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1">
                {catalog.map((t, idx) => {
                  const Icon = getToolIcon(t.id);
                  const isActive = activeTool === t.id;

                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        if (!t.enabled) {
                          showToast(`${t.name} is disabled. Enable in Catalog Manager.`);
                          return;
                        }
                        soundEngine.playKeyClick();
                        setActiveTool(t.id);
                      }}
                      title={`${t.name}: ${t.tagline}`}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                        !t.enabled
                          ? 'opacity-40 text-zinc-500 hover:opacity-70'
                          : isActive
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-xs ring-1 ring-cyan-400/50'
                          : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                      }`}
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-mono ${
                          isActive ? 'bg-cyan-400 text-zinc-950 font-bold' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400 dark:text-cyan-600' : ''}`} />
                      <span className="hidden md:inline">{t.name}</span>
                    </button>
                  );
                })}

                <div className="flex items-center gap-1 pl-2 border-l border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={handleOpenAddModal}
                    title="Add Custom AI Tool"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-cyan-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsManageModalOpen(true)}
                    title="Manage Catalog"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Focused Workspace Body */}
            <div className="rounded-3xl bg-white/80 dark:bg-zinc-950/80 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl p-5 sm:p-7 shadow-xl">
              {currentFocusedTool && !currentFocusedTool.enabled ? (
                <div className="p-8 text-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                  <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">
                    {currentFocusedTool.name} is Disabled
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                    This tool is currently deactivated in your catalog. You can re-enable it in Catalog Manager.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsManageModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-cyan-400 border border-cyan-500/30 transition-colors"
                  >
                    Open Catalog Manager
                  </button>
                </div>
              ) : activeTool === 'film' ? (
                <FilmFinder />
              ) : activeTool === 'books' ? (
                <BookFinder />
              ) : activeTool === 'music' ? (
                <MusicFinder />
              ) : activeTool === 'ai' ? (
                <AISummarizer />
              ) : activeTool === 'operators' ? (
                <SearchOperators />
              ) : currentFocusedTool && !currentFocusedTool.isBuiltIn ? (
                <CustomAITool
                  tool={currentFocusedTool}
                  onEdit={() => handleEditTool(currentFocusedTool)}
                  onDelete={() => handleDeleteTool(currentFocusedTool)}
                />
              ) : (
                <AISummarizer />
              )}
            </div>
          </motion.div>
        ) : (
          // ===================== BENTO MODE =====================
          <motion.div
            key="bento-view"
            initial={reducedMotion ? {} : { opacity: 0, y: 15 }}
            animate={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            exit={reducedMotion ? {} : { opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-8 max-w-7xl mx-auto"
          >
            {/* 1. Signature Spiral Navigation Hero */}
            <ToolSpiral
              onOpenAddModal={handleOpenAddModal}
              onOpenManageModal={() => setIsManageModalOpen(true)}
            />

            {/* 2. Bento Grid Section */}
            <div className="space-y-4">
              {/* Category Filter and Quick Actions Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  <span className="font-mono uppercase tracking-wider text-zinc-500 text-[11px] font-semibold flex items-center gap-1.5 mr-2">
                    <Layers className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Catalog</span>
                  </span>

                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        soundEngine.playKeyClick();
                        setSelectedCategory(cat);
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold shadow-xs'
                          : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900/60 dark:hover:bg-zinc-850 text-zinc-600 dark:text-zinc-400 border border-zinc-200/80 dark:border-zinc-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-zinc-400">
                    Showing {filteredTools.length} of {enabledTools.length} active
                  </span>
                  <button
                    type="button"
                    onClick={handleOpenAddModal}
                    className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 text-xs font-medium cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Custom Tool</span>
                  </button>
                </div>
              </div>

              {/* Responsive Bento Grid of Functional Micro-Tools */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Film Finder Card */}
                {filteredTools.some((t) => t.id === 'film') && (
                  <ToolCard
                    id="film"
                    title="Film & Series Finder"
                    category="Media"
                    badge="TMDb & Streams"
                    className="lg:col-span-6 min-h-[460px]"
                  >
                    <FilmFinder />
                  </ToolCard>
                )}

                {/* AI Summarizer Card */}
                {filteredTools.some((t) => t.id === 'ai') && (
                  <ToolCard
                    id="ai"
                    title="AI Summarizer & Explainer"
                    category="Intelligence"
                    badge="Gemini / Groq / Offline"
                    className="lg:col-span-6 min-h-[460px]"
                  >
                    <AISummarizer />
                  </ToolCard>
                )}

                {/* Books & Research Finder Card */}
                {filteredTools.some((t) => t.id === 'books') && (
                  <ToolCard
                    id="books"
                    title="Books & Research Finder"
                    category="Research"
                    badge="Open Library & Gutenberg"
                    className="lg:col-span-6 min-h-[440px]"
                  >
                    <BookFinder />
                  </ToolCard>
                )}

                {/* Music Search Card */}
                {filteredTools.some((t) => t.id === 'music') && (
                  <ToolCard
                    id="music"
                    title="Music & Soundtrack Search"
                    category="Audio"
                    badge="Multi-Platform"
                    className="lg:col-span-6 min-h-[440px]"
                  >
                    <MusicFinder />
                  </ToolCard>
                )}

                {/* Search Operators Card */}
                {filteredTools.some((t) => t.id === 'operators') && (
                  <ToolCard
                    id="operators"
                    title="Search Operator Builder"
                    category="Discovery"
                    badge="Boolean & Formats"
                    className="lg:col-span-12"
                  >
                    <SearchOperators />
                  </ToolCard>
                )}

                {/* Custom User-Added Prompt Tools */}
                {filteredTools
                  .filter((t) => !t.isBuiltIn)
                  .map((custom) => (
                    <ToolCard
                      key={custom.id}
                      id={custom.id}
                      title={custom.name}
                      category={custom.category}
                      badge={custom.badge || 'Custom AI'}
                      className="lg:col-span-6 min-h-[440px]"
                    >
                      <CustomAITool
                        tool={custom}
                        onEdit={() => handleEditTool(custom)}
                        onDelete={() => handleDeleteTool(custom)}
                      />
                    </ToolCard>
                  ))}

                {/* Create Custom AI Tool Card Slot */}
                <div
                  onClick={handleOpenAddModal}
                  className="lg:col-span-6 min-h-[220px] rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-cyan-500/60 bg-zinc-50/50 dark:bg-zinc-950/40 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group shadow-xs"
                >
                  <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 group-hover:bg-cyan-500/10 text-zinc-400 group-hover:text-cyan-500 border border-zinc-200 dark:border-zinc-800 group-hover:border-cyan-500/30 transition-colors mb-3 shadow-xs">
                    <Plus className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-cyan-500 transition-colors">
                    Add Custom AI Prompt Tool
                  </h4>
                  <p className="text-xs text-zinc-500 max-w-xs mt-1.5 leading-relaxed">
                    Create a customized prompt tool. It will automatically be positioned as a new node on the animated spiral.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Modals */}
      <AddToolModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        toolToEdit={toolToEdit}
      />
      <ToolCatalogManager
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        onOpenAddModal={handleOpenAddModal}
        onEditTool={handleEditTool}
      />
    </div>
  );
};
