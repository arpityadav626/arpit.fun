import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import { soundEngine } from '../lib/audioSynth';
import type { ToolDefinition } from '../types';
import { FilmFinder } from '../tools/FilmFinder';
import { BookFinder } from '../tools/BookFinder';
import { MusicFinder } from '../tools/MusicFinder';
import { AISummarizer } from '../tools/AISummarizer';
import { SearchOperators } from '../tools/SearchOperators';
import { CustomAITool } from '../tools/CustomAITool';
import {
  X,
  Film,
  BookOpen,
  Music,
  Bot,
  SearchCode,
  Sparkles,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';

interface ToolFocusModalProps {
  isOpen: boolean;
  onClose: () => void;
  tool: ToolDefinition | null;
  allTools: ToolDefinition[];
  onSelectTool: (tool: ToolDefinition) => void;
  onOpenAddModal: () => void;
  onOpenManageModal: () => void;
  onEditCustomTool: (tool: ToolDefinition) => void;
  onDeleteCustomTool: (tool: ToolDefinition) => void;
}

export const ToolFocusModal: React.FC<ToolFocusModalProps> = ({
  isOpen,
  onClose,
  tool,
  allTools,
  onSelectTool,
  onOpenManageModal,
  onEditCustomTool,
  onDeleteCustomTool,
}) => {
  const { reducedMotion } = useSettings();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !tool) return null;

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

  const Icon = getToolIcon(tool.id);

  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="focused-tool-title"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-10 backdrop-blur-2xl bg-black/80 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={reducedMotion ? {} : { opacity: 0, scale: 0.93, y: 25 }}
          animate={reducedMotion ? { opacity: 1, scale: 1, y: 0 } : { opacity: 1, scale: 1, y: 0 }}
          exit={reducedMotion ? {} : { opacity: 0, scale: 0.93, y: 20 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-5xl lg:max-w-6xl h-[90vh] max-h-[900px] min-h-[600px] flex flex-col rounded-3xl bg-[#09090c] border border-zinc-800/80 shadow-[0_25px_90px_rgba(0,0,0,0.95)] overflow-hidden text-zinc-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Streamlined, Minimalist Top Bar */}
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-zinc-850 bg-[#0e0e12]/80 select-none">
            {/* Left: Back & Active Tool Name */}
            <div className="flex items-center gap-3.5">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playKeyClick();
                  onClose();
                }}
                className="px-3.5 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                title="Return to 3D Spiral"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Spiral</span>
              </button>

              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 id="focused-tool-title" className="font-semibold text-sm sm:text-base tracking-tight text-white">
                  {tool.name}
                </h3>
              </div>
            </div>

            {/* Right: Clean Segmented Switcher & Close Button */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 p-1 rounded-full bg-zinc-900 border border-zinc-800">
                {allTools.map((t) => {
                  const isActive = t.id === tool.id;
                  const TIcon = getToolIcon(t.id);

                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        if (!t.enabled) return;
                        soundEngine.playKeyClick();
                        onSelectTool(t);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                      }`}
                    >
                      <TIcon className="w-3.5 h-3.5" />
                      <span>{t.name.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer ml-1"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tool Workspace Container */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8">
            {!tool.enabled ? (
              <div className="p-12 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                <h3 className="font-semibold text-base text-white">
                  {tool.name} is Disabled
                </h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  This tool is currently deactivated. You can re-enable it in Settings.
                </p>
                <button
                  type="button"
                  onClick={onOpenManageModal}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-cyan-400 border border-cyan-500/30 transition-colors"
                >
                  Manage Tools
                </button>
              </div>
            ) : tool.id === 'film' ? (
              <FilmFinder />
            ) : tool.id === 'books' ? (
              <BookFinder />
            ) : tool.id === 'music' ? (
              <MusicFinder />
            ) : tool.id === 'ai' ? (
              <AISummarizer />
            ) : tool.id === 'operators' ? (
              <SearchOperators />
            ) : !tool.isBuiltIn ? (
              <CustomAITool
                tool={tool}
                onEdit={() => onEditCustomTool(tool)}
                onDelete={() => onDeleteCustomTool(tool)}
              />
            ) : (
              <AISummarizer />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
