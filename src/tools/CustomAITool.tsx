import React, { useState } from 'react';
import type { ToolDefinition } from '../types';
import { useSettings } from '../context/SettingsContext';
import { executeCustomPromptTool, type CustomPromptExecutionResult } from '../lib/api/aiProvider';
import { saveHistoryItem } from '../lib/history';
import { soundEngine } from '../lib/audioSynth';
import {
  Sparkles,
  Copy,
  Check,
  AlertCircle,
  Pencil,
  Trash2,
} from 'lucide-react';

interface CustomAIToolProps {
  tool: ToolDefinition;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const CustomAITool: React.FC<CustomAIToolProps> = ({ tool, onEdit, onDelete }) => {
  const { aiApiKey, aiProvider, showToast } = useSettings();
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CustomPromptExecutionResult | null>(null);
  const [copied, setCopied] = useState(false);

  const targetProvider: 'gemini' | 'groq' = aiProvider === 'groq' ? 'groq' : 'gemini';

  const handleExecute = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = inputVal.trim();
    if (!clean) return;

    setError(null);
    setLoading(true);
    soundEngine.playAiAction();

    try {
      const res = await executeCustomPromptTool(
        tool.promptTemplate || 'Analyze the provided text.',
        clean,
        aiApiKey,
        targetProvider
      );
      setResult(res);
      if (res.isAvailable) {
        saveHistoryItem(tool.id, tool.name, clean.slice(0, 35) + '...');
        showToast(`${tool.name} executed`);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to process custom tool request.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.output) return;
    navigator.clipboard.writeText(result.output);
    setCopied(true);
    showToast('Result copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Top Bar with Description & Actions */}
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <p className="line-clamp-1">{tool.tagline || 'Custom AI prompt model'}</p>
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="text-zinc-500 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="text-zinc-500 hover:text-rose-400 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          )}
        </div>
      </div>

      {/* Input Textarea */}
      <div className="relative">
        <textarea
          rows={5}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder={tool.inputLabel || 'Enter input text to analyze...'}
          className="w-full p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-hidden focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all resize-none leading-relaxed"
        />

        <div className="flex justify-end mt-2">
          <button
            type="button"
            disabled={loading || !inputVal.trim()}
            onClick={handleExecute}
            className="px-4 py-2 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed font-medium text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            <span>{loading ? 'Processing...' : 'Run Tool'}</span>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Output Card */}
      {result && (
        <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Output</span>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap font-sans">
            {result.output}
          </p>
        </div>
      )}
    </div>
  );
};
