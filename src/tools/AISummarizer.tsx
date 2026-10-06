import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import { summarizeText } from '../lib/api/aiProvider';
import { saveHistoryItem } from '../lib/history';
import { soundEngine } from '../lib/audioSynth';
import type { AISummarizeMode, SummarizeResult } from '../types';
import {
  Sparkles,
  Copy,
  Check,
  AlertCircle,
  RotateCcw,
  Zap,
  Clock,
  FileText,
  Cpu,
  Download,
  Gauge,
  Tag,
} from 'lucide-react';

interface PresetTemplate {
  name: string;
  badge: string;
  text: string;
}

const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    name: 'AI Agentic Frontier',
    badge: 'Intelligence',
    text: `Autonomous AI coding and reasoning agents represent a paradigm shift from static conversational chat models. Modern agentic architectures operate through persistent loops of perception, tool calling, multi-step sub-delegation, and verification against runtime environments. By giving agents access to terminal shells, file systems, compilers, and specialized subagents, they transition from passive text generators to proactive collaborators capable of diagnosing failures, writing tests, and executing complex software engineering workflows without continuous micromanagement.`,
  },
  {
    name: 'Quantum Computing Brief',
    badge: 'Physics',
    text: `Quantum computing leverages quantum mechanical principles—principally superposition and entanglement—to process complex information exponentially faster than classical computers for specific problem classes. While classical bits exist deterministically as 0 or 1, quantum bits (qubits) can exist in linear combinations of both states. This allows quantum algorithms such as Shor's algorithm for prime factorization and Grover's algorithm for unstructured database search to solve high-complexity mathematical and cryptographic puzzles that remain intractable for standard silicon supercomputers.`,
  },
  {
    name: 'Stoic Philosophy on Control',
    badge: 'Philosophy',
    text: `The central tenet of Epictetus and Marcus Aurelius's Stoic philosophy is the dichotomy of control: distinguishing between what is within our internal power (our thoughts, reactions, choices, and virtues) and what lies outside our power (external events, other people's actions, fortune, and health). True tranquility and resilience (ataraxia) arise not from attempting to control the chaotic outside world, but from mastering one's own perception and responding with reason, equanimity, and dignity.`,
  },
  {
    name: 'Strategic Product Architecture',
    badge: 'Product',
    text: `High-growth digital products achieve lasting retention through ruthless simplicity and frictionless feedback loops. Cluttered user interfaces, redundant search modals, and non-deterministic navigation fatigue users. By adopting minimalist dark obsidian aesthetics, zero-latency micro-interactions, explicit direct actions (e.g. playing videos or reading books directly rather than dumping users into secondary search lists), and local-first reliability, the product builds immediate user trust.`,
  },
];

export const AISummarizer: React.FC = () => {
  const { aiApiKey, aiProvider, showToast } = useSettings();
  const [inputText, setInputText] = useState('');
  const [mode, setMode] = useState<AISummarizeMode>('concise');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SummarizeResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSummarize = async () => {
    const clean = inputText.trim();
    if (!clean) return;

    setError(null);
    setLoading(true);
    soundEngine.playAiAction();

    try {
      const targetProvider: 'gemini' | 'groq' = aiProvider === 'groq' ? 'groq' : 'gemini';
      const summaryResult = await summarizeText(clean, mode, aiApiKey, targetProvider);
      setResult(summaryResult);
      saveHistoryItem('ai', 'AI Summarizer & Synthesis', clean.slice(0, 40) + '...');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to generate summary.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const content =
      result.keyPoints && result.keyPoints.length > 0
        ? `${result.summary}\n\nKey Takeaways:\n${result.keyPoints.map((k) => `• ${k}`).join('\n')}`
        : result.summary;

    navigator.clipboard.writeText(content);
    setCopied(true);
    soundEngine.playKeyClick();
    showToast('Summary copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportMarkdown = () => {
    if (!result) return;
    const date = new Date().toISOString().split('T')[0];
    const markdownContent = `# AI Synthesis Brief
**Date:** ${date}
**Mode:** ${mode.toUpperCase()}
**Engine:** ${result.isOfflineHeuristic ? 'Offline NLP' : result.provider}
**Reading Time:** ~${result.readingTimeMin} min

## Executive Summary
${result.summary}

${
  result.keyPoints && result.keyPoints.length > 0
    ? `## Actionable Key Takeaways\n${result.keyPoints.map((k) => `- ${k}`).join('\n')}\n`
    : ''
}

---
*Generated with AI Hub Synthesis Studio*
`;

    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ai-synthesis-${date}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    soundEngine.playKeyClick();
    showToast('Exported Markdown file');
  };

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const charCount = inputText.length;
  const estimatedReadTime = Math.ceil(wordCount / 200) || 1;

  // Compression Ratio calculation
  const compressionRatio =
    result && inputText.trim()
      ? Math.max(0, Math.min(99, Math.round((1 - result.summary.length / inputText.length) * 100)))
      : null;

  // Concept entity extraction heuristic
  const extractedTags = useMemo(() => {
    if (!result) return [];
    const text = result.summary + ' ' + (result.keyPoints ? result.keyPoints.join(' ') : '');
    const words = text.match(/\b[A-Z][a-z]{3,}\b/g) || [];
    const unique = Array.from(new Set(words));
    const blacklist = new Set(['While', 'This', 'These', 'Modern', 'True', 'High', 'When', 'With', 'They']);
    return unique.filter((w) => !blacklist.has(w)).slice(0, 6);
  }, [result]);

  const modes: Array<{ id: AISummarizeMode; label: string; desc: string }> = [
    { id: 'concise', label: 'Executive Brief', desc: 'Punchy 2-3 sentence strategic essence' },
    { id: 'bullets', label: 'Key Takeaways', desc: 'Structured bullet points & actionable items' },
    { id: 'explain', label: 'Simple (ELI5)', desc: 'Plain language with crystal clarity' },
    { id: 'deep', label: 'Deep Synthesis', desc: 'Thorough analytical breakdown' },
  ];

  return (
    <div className="relative flex flex-col h-full space-y-5 text-zinc-100">
      {/* 1. Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-md backdrop-blur-md"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
              Generative Intelligence & Text Synthesis
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                {aiProvider === 'groq' ? 'Groq Llama-3' : 'Gemini 1.5'} + Offline Fallback
              </span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Condense research papers, essays, notes, and technical briefings into high-signal takeaways.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/40 border border-zinc-800">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-[11px] text-zinc-300">
              {aiApiKey.trim() ? 'Cloud AI Ready' : 'Offline Heuristic Active'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* 2. Quick Preset Templates */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>Inspiration Presets:</span>
          {inputText && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playKeyClick();
                setInputText('');
                setResult(null);
              }}
              className="hover:text-zinc-200 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Clear Text
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          {PRESET_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.name}
              type="button"
              onClick={() => {
                soundEngine.playKeyClick();
                setInputText(tmpl.text);
                setResult(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-cyan-500/40 hover:bg-zinc-850 text-zinc-300 hover:text-white transition-all whitespace-nowrap cursor-pointer flex items-center gap-2"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>{tmpl.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Synthesis Mode Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => {
              soundEngine.playKeyClick();
              setMode(m.id);
            }}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              mode === m.id
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-xs'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
            }`}
          >
            <div className="font-medium text-xs flex items-center justify-between">
              <span>{m.label}</span>
              {mode === m.id && <Zap className="w-3 h-3 text-cyan-400" />}
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5 line-clamp-1">{m.desc}</div>
          </button>
        ))}
      </div>

      {/* 4. Textarea Input */}
      <div className="relative">
        <textarea
          rows={5}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste article, research abstract, paper excerpt, meeting notes, or book passage here..."
          className="w-full p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-hidden focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all resize-none leading-relaxed shadow-inner"
        />

        <div className="flex items-center justify-between mt-2 px-1 text-xs text-zinc-500">
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{charCount} chars</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> ~{estimatedReadTime} min read
            </span>
          </div>

          <button
            type="button"
            disabled={loading || !inputText.trim()}
            onClick={handleSummarize}
            className="px-5 py-2 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed font-medium text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            <span>{loading ? 'Synthesizing...' : 'Synthesize Now'}</span>
          </button>
        </div>
      </div>

      {/* 5. Error Notice */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. Formatted Synthesis Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.35 }}
            className="p-5 rounded-3xl bg-zinc-900/90 border border-cyan-500/30 shadow-[0_15px_50px_rgba(6,182,212,0.15)] space-y-4"
          >
            {/* Result Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold">
                  {result.isOfflineHeuristic ? 'Local Extractive NLP' : `${result.provider} Generative Output`}
                </span>
                <span className="text-xs text-zinc-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {result.readingTimeMin} min read
                </span>
                {compressionRatio !== null && (
                  <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                    <Gauge className="w-3 h-3" /> {compressionRatio}% Compressed
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={handleExportMarkdown}
                  className="flex items-center gap-1 text-xs text-zinc-300 hover:text-white px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
                  title="Export Markdown File"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export .md</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs text-zinc-950 font-semibold px-3 py-1 rounded-lg bg-white hover:bg-zinc-200 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy All'}</span>
                </button>
              </div>
            </div>

            {/* Main Summary */}
            <div className="text-sm text-zinc-200 leading-relaxed font-sans">
              <p>{result.summary}</p>
            </div>

            {/* Bulleted Key Takeaways */}
            {result.keyPoints && result.keyPoints.length > 0 && (
              <div className="pt-3 border-t border-zinc-800 space-y-2">
                <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider block">
                  Actionable Key Takeaways
                </span>
                <ul className="space-y-2">
                  {result.keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-zinc-300 leading-relaxed">
                      <div className="p-0.5 rounded-full bg-cyan-500/20 text-cyan-400 mt-0.5 shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Auto-Extracted Concept Tags */}
            {extractedTags.length > 0 && (
              <div className="pt-2 border-t border-zinc-800/80 flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-1 mr-1">
                  <Tag className="w-3 h-3 text-cyan-400" /> Key Concepts:
                </span>
                {extractedTags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-zinc-800/90 text-cyan-300 border border-zinc-700/60"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
