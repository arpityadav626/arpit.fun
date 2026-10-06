import React, { useState } from 'react';
import type { ToolDefinition } from '../types';
import { addCustomTool, updateTool } from '../lib/toolCatalog';
import { useSettings } from '../context/SettingsContext';
import {
  X,
  Sparkles,
  Check,
  AlertCircle,
  Eye,
  Layers,
  FileCode2,
} from 'lucide-react';

interface AddToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolToEdit?: ToolDefinition | null;
}

interface ModalContentProps {
  onClose: () => void;
  toolToEdit?: ToolDefinition | null;
}

const AddToolModalContent: React.FC<ModalContentProps> = ({ onClose, toolToEdit }) => {
  const { showToast, setActiveTool, setViewMode } = useSettings();

  const [name, setName] = useState(toolToEdit?.name || '');
  const [tagline, setTagline] = useState(toolToEdit?.tagline || '');
  const [category, setCategory] = useState(toolToEdit?.category || 'Intelligence');
  const [inputLabel, setInputLabel] = useState(toolToEdit?.inputLabel || 'Input text to process');
  const [promptTemplate, setPromptTemplate] = useState(toolToEdit?.promptTemplate || '');
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const categories = ['Intelligence', 'Research', 'Code', 'Writing', 'Media', 'Discovery', 'Custom'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanTagline = tagline.trim();
    const cleanPrompt = promptTemplate.trim();
    const cleanLabel = inputLabel.trim() || 'Input Text';

    if (!cleanName) {
      setError('Please provide a Tool Name.');
      return;
    }
    if (!cleanTagline) {
      setError('Please describe the Tool Purpose / Tagline.');
      return;
    }
    if (!cleanPrompt) {
      setError('Please provide the Instruction Prompt template.');
      return;
    }

    try {
      if (toolToEdit) {
        updateTool(toolToEdit.id, {
          name: cleanName,
          tagline: cleanTagline,
          description: cleanTagline,
          category,
          inputLabel: cleanLabel,
          promptTemplate: cleanPrompt,
        });
        showToast(`Tool "${cleanName}" updated`);
      } else {
        const created = addCustomTool({
          name: cleanName,
          tagline: cleanTagline,
          category,
          inputLabel: cleanLabel,
          promptTemplate: cleanPrompt,
        });
        showToast(`Tool "${cleanName}" added to Catalog and Spiral`);
        setActiveTool(created.id);
        setViewMode('focus');
      }
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to save tool.');
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-tool-heading"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl p-6 text-zinc-100 flex flex-col space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 id="add-tool-heading" className="font-semibold text-base">
                {toolToEdit ? 'Edit Custom AI Tool' : 'Add Custom AI Tool'}
              </h3>
              <p className="text-xs text-zinc-400">
                Configure a prompt template to automatically add it as a new spiral node
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Tool Name */}
          <div className="space-y-1">
            <label className="font-medium text-zinc-300 flex items-center gap-1.5">
              <span>Tool Name</span>
              <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Code Reviewer, Logic Simplifier, Meeting Digests..."
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>

          {/* Tagline / Purpose */}
          <div className="space-y-1">
            <label className="font-medium text-zinc-300 flex items-center gap-1.5">
              <span>Short Purpose</span>
              <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Scans source code and points out bugs and performance trade-offs"
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>

          {/* Category & Input Label Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-medium text-zinc-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-zinc-400" />
                <span>Category</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/50 font-sans"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-medium text-zinc-300 flex items-center gap-1.5">
                <span>Input Field Label</span>
              </label>
              <input
                type="text"
                value={inputLabel}
                onChange={(e) => setInputLabel(e.target.value)}
                placeholder="e.g. Paste code snippet, Enter text..."
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
          </div>

          {/* Instruction Prompt Template */}
          <div className="space-y-1">
            <label className="font-medium text-zinc-300 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Instruction Prompt Template</span>
                <span className="text-cyan-400">*</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">Appended with user text at runtime</span>
            </label>
            <textarea
              rows={4}
              value={promptTemplate}
              onChange={(e) => setPromptTemplate(e.target.value)}
              placeholder="e.g. You are a senior software architect. Analyze the provided code for security flaws, algorithmic complexity, and readability. Give 3 actionable recommendations."
              className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/50 font-mono text-[11px] leading-relaxed resize-none"
            />
          </div>

          {/* Live Preview Toggle & Card */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-[11px] text-zinc-400 hover:text-zinc-200 inline-flex items-center gap-1 font-mono transition-colors"
            >
              <Eye className="w-3 h-3 text-cyan-400" />
              <span>{showPreview ? 'Hide Live Preview' : 'Show Live Preview'}</span>
            </button>

            {showPreview && (
              <div className="mt-2 p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-1.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-100">{name || 'Tool Name Preview'}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 font-mono">
                    {category} • Custom AI
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">{tagline || 'Purpose preview will show here...'}</p>
                <div className="pt-1.5 border-t border-zinc-800 text-[10px] font-mono text-zinc-500 truncate">
                  Prompt: {promptTemplate || 'Instruction prompt will be dispatched to connected AI'}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-900">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{toolToEdit ? 'Save Changes' : 'Add to Catalog & Spiral'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const AddToolModal: React.FC<AddToolModalProps> = ({ isOpen, onClose, toolToEdit }) => {
  if (!isOpen) return null;

  return (
    <AddToolModalContent
      key={toolToEdit?.id || 'new_tool'}
      onClose={onClose}
      toolToEdit={toolToEdit}
    />
  );
};
