import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import { buildSearchOperatorQuery, createGoogleSearchUrl } from '../lib/searchLinks';
import { saveHistoryItem } from '../lib/history';
import { soundEngine } from '../lib/audioSynth';
import {
  Copy,
  Check,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Search,
  Terminal,
  FileCode,
  Globe,
  HelpCircle,
  X,
} from 'lucide-react';

interface ResearchPreset {
  name: string;
  badge: string;
  topic: string;
  filetype?: string;
  site?: string;
  exactPhrase?: string;
  excludeTerms?: string;
}

const RESEARCH_PRESETS: ResearchPreset[] = [
  {
    name: 'Academic Papers & Theses',
    badge: '.EDU & .AC.UK',
    topic: 'deep learning transformers',
    filetype: 'pdf',
    site: 'edu',
  },
  {
    name: 'ArXiv Open Preprints',
    badge: 'ARXIV.ORG',
    topic: 'quantum error correction',
    site: 'arxiv.org/abs',
  },
  {
    name: 'Public Domain Texts & PDFs',
    badge: 'OPEN ACCESS',
    topic: 'renaissance literature',
    filetype: 'pdf',
    exactPhrase: 'public domain',
  },
  {
    name: 'Government Reports & Policy',
    badge: '.GOV',
    topic: 'renewable energy infrastructure',
    filetype: 'pdf',
    site: 'gov',
  },
  {
    name: 'GitHub Architecture & Specs',
    badge: 'GITHUB',
    topic: 'distributed systems raft consensus',
    site: 'github.com',
    exactPhrase: 'architecture',
  },
  {
    name: 'Free EPUB Books',
    badge: '.EPUB',
    topic: 'philosophy classics',
    filetype: 'epub',
  },
];

export const SearchOperators: React.FC = () => {
  const { showToast } = useSettings();

  const [topic, setTopic] = useState('');
  const [exactPhrase, setExactPhrase] = useState('');
  const [filetype, setFiletype] = useState('');
  const [site, setSite] = useState('');
  const [inTitle, setInTitle] = useState('');
  const [excludeTerms, setExcludeTerms] = useState('');
  const [copied, setCopied] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const commonFiletypes = ['pdf', 'epub', 'docx', 'csv', 'json', 'xlsx'];
  const commonDomains = ['edu', 'gov', 'org', 'arxiv.org', 'nih.gov', 'github.com'];

  const compiledQuery = useMemo(() => {
    return buildSearchOperatorQuery({
      topic,
      exactPhrase,
      filetype,
      site,
      excludeTerms,
      inTitle,
      publicDomainOnly: false,
    });
  }, [topic, exactPhrase, filetype, site, excludeTerms, inTitle]);

  const handleCopy = () => {
    if (!compiledQuery.trim()) return;
    navigator.clipboard.writeText(compiledQuery);
    setCopied(true);
    soundEngine.playKeyClick();
    showToast('Search query copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecuteGoogle = () => {
    if (!compiledQuery.trim()) return;
    saveHistoryItem('operators', 'Search Operator Builder', compiledQuery);
    soundEngine.playSearchPulse();
    const url = createGoogleSearchUrl(compiledQuery);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleExecuteDuckDuckGo = () => {
    if (!compiledQuery.trim()) return;
    saveHistoryItem('operators', 'Search Operator Builder', compiledQuery);
    soundEngine.playSearchPulse();
    const url = `https://duckduckgo.com/?q=${encodeURIComponent(compiledQuery)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleExecuteBing = () => {
    if (!compiledQuery.trim()) return;
    saveHistoryItem('operators', 'Search Operator Builder', compiledQuery);
    soundEngine.playSearchPulse();
    const url = `https://www.bing.com/search?q=${encodeURIComponent(compiledQuery)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleApplyPreset = (preset: ResearchPreset) => {
    setTopic(preset.topic);
    setFiletype(preset.filetype || '');
    setSite(preset.site || '');
    setExactPhrase(preset.exactPhrase || '');
    setExcludeTerms(preset.excludeTerms || '');
    setInTitle('');
    soundEngine.playKeyClick();
  };

  const handleReset = () => {
    setTopic('');
    setExactPhrase('');
    setFiletype('');
    setSite('');
    setInTitle('');
    setExcludeTerms('');
    soundEngine.playKeyClick();
  };

  // Active filters list for token chips
  const activeTokens = useMemo(() => {
    const tokens: Array<{ id: string; label: string; clear: () => void }> = [];
    if (topic.trim()) tokens.push({ id: 'topic', label: `topic:${topic}`, clear: () => setTopic('') });
    if (exactPhrase.trim()) tokens.push({ id: 'phrase', label: `"${exactPhrase}"`, clear: () => setExactPhrase('') });
    if (filetype.trim()) tokens.push({ id: 'filetype', label: `filetype:${filetype}`, clear: () => setFiletype('') });
    if (site.trim()) tokens.push({ id: 'site', label: `site:${site}`, clear: () => setSite('') });
    if (inTitle.trim()) tokens.push({ id: 'intitle', label: `intitle:${inTitle}`, clear: () => setInTitle('') });
    if (excludeTerms.trim()) tokens.push({ id: 'exclude', label: `-${excludeTerms}`, clear: () => setExcludeTerms('') });
    return tokens;
  }, [topic, exactPhrase, filetype, site, inTitle, excludeTerms]);

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
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
              Surgical Search Operator & Research Studio
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Boolean Engine
              </span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Construct high-precision queries with filetype, site domain, exact match, and negation filters.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              soundEngine.playKeyClick();
              setShowGuide(!showGuide);
            }}
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>{showGuide ? 'Hide Guide' : 'Dorking Guide'}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </motion.div>

      {/* Operator Cheat Sheet Drawer */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-2xl bg-zinc-900/90 border border-amber-500/30 text-xs space-y-2 overflow-hidden"
          >
            <h4 className="font-semibold text-amber-300 uppercase tracking-wider text-[11px] font-mono">
              Google & DuckDuckGo Advanced Boolean Operators Guide
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1 text-zinc-300">
              <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800">
                <code className="text-amber-400 font-mono font-bold">site:edu</code>
                <p className="text-[11px] text-zinc-400 mt-1">Limits results to academic or specified top-level domains.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800">
                <code className="text-amber-400 font-mono font-bold">filetype:pdf</code>
                <p className="text-[11px] text-zinc-400 mt-1">Finds direct downloadable documents (PDF, EPUB, CSV, JSON).</p>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800">
                <code className="text-amber-400 font-mono font-bold">"exact phrase"</code>
                <p className="text-[11px] text-zinc-400 mt-1">Enforces verbatim match with zero word substitutions.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800">
                <code className="text-amber-400 font-mono font-bold">-term</code>
                <p className="text-[11px] text-zinc-400 mt-1">Excludes commercial noise, paywalls, or unwanted keywords.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800">
                <code className="text-amber-400 font-mono font-bold">intitle:"report"</code>
                <p className="text-[11px] text-zinc-400 mt-1">Restricts search to pages containing the keyword in their title.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800">
                <code className="text-amber-400 font-mono font-bold">(A OR B)</code>
                <p className="text-[11px] text-zinc-400 mt-1">Boolean disjunction for combining related domains or terms.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Research Presets */}
      <div className="space-y-1.5">
        <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">
          1-Click Research Recipes & Dork Presets:
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          {RESEARCH_PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/40 hover:bg-zinc-850 text-zinc-300 hover:text-white transition-all whitespace-nowrap cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
        {/* Main Topic */}
        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-zinc-300 font-medium flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span>Topic / Core Keywords</span>
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. quantum algorithms, clean energy transition, neural radiance fields..."
            className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-sans"
          />
        </div>

        {/* Exact Phrase */}
        <div className="space-y-1.5">
          <label className="text-zinc-300 font-medium">Exact Phrase Match ("...")</label>
          <input
            type="text"
            value={exactPhrase}
            onChange={(e) => setExactPhrase(e.target.value)}
            placeholder='e.g. "phase transition" or "benchmark results"'
            className="w-full px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-amber-400 transition-all font-mono text-xs"
          />
        </div>

        {/* Exclude Terms */}
        <div className="space-y-1.5">
          <label className="text-zinc-300 font-medium">Exclude Negative Terms (-...)</label>
          <input
            type="text"
            value={excludeTerms}
            onChange={(e) => setExcludeTerms(e.target.value)}
            placeholder="e.g. tutorial, beginner, reddit, quora"
            className="w-full px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-amber-400 transition-all font-mono text-xs"
          />
        </div>

        {/* Filetype Quick Selector */}
        <div className="space-y-1.5">
          <label className="text-zinc-300 font-medium flex items-center gap-1.5">
            <FileCode className="w-3.5 h-3.5 text-amber-400" />
            <span>Format Restriction (filetype:)</span>
          </label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {commonFiletypes.map((ft) => (
              <button
                key={ft}
                type="button"
                onClick={() => {
                  soundEngine.playKeyClick();
                  setFiletype(filetype === ft ? '' : ft);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  filetype === ft
                    ? 'bg-amber-400 text-zinc-950 font-bold shadow-xs'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                .{ft}
              </button>
            ))}
          </div>
        </div>

        {/* Site / Domain Selector */}
        <div className="space-y-1.5">
          <label className="text-zinc-300 font-medium flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>Domain Scope (site:)</span>
          </label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {commonDomains.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  soundEngine.playKeyClick();
                  setSite(site === d ? '' : d);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  site === d
                    ? 'bg-amber-400 text-zinc-950 font-bold shadow-xs'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Filter Token Chips */}
      {activeTokens.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-[11px] font-mono text-zinc-500 uppercase">Active Filters:</span>
          {activeTokens.map((tok) => (
            <span
              key={tok.id}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30"
            >
              <span>{tok.label}</span>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playKeyClick();
                  tok.clear();
                }}
                className="hover:text-white cursor-pointer ml-0.5"
                title="Remove filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 4. Live Query Generator & Multi-Engine Dispatchers */}
      {compiledQuery ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-3xl bg-zinc-900/90 border border-amber-500/30 space-y-4 shadow-xl"
        >
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase text-amber-400 font-semibold">
                Constructed Precision Query
              </span>
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-400 font-mono">{compiledQuery.split(' ').length} parameters</span>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer text-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Query'}</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-black/70 border border-zinc-800 text-sm font-mono text-amber-300 break-all select-all leading-relaxed">
            {compiledQuery}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleExecuteGoogle}
              className="py-2.5 px-3 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Google Search</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleExecuteDuckDuckGo}
              className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 hover:text-white font-medium text-xs transition-all border border-zinc-700 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>DuckDuckGo</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleExecuteBing}
              className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 hover:text-white font-medium text-xs transition-all border border-zinc-700 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Bing</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="p-6 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800/60 text-xs text-zinc-500">
          Enter a topic or select a 1-click research recipe above to generate your precision search query.
        </div>
      )}
    </div>
  );
};
