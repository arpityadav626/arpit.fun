import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchOpenLibrary, getOpenLibraryCoverUrl } from '../lib/api/openLibrary';
import { searchGutendex } from '../lib/api/gutendex';
import { CURATED_CLASSIC_BOOKS, type CuratedBook } from '../lib/curatedBooks';
import { ALL_BOOK_PLATFORMS } from '../lib/searchLinks';
import { saveHistoryItem } from '../lib/history';
import { soundEngine } from '../lib/audioSynth';
import type { OpenLibraryDoc, GutendexBook } from '../types';
import {
  Search,
  ExternalLink,
  BookOpen,
  Download,
  Sparkles,
  Library,
  BookMarked,
  Layers,
  ArrowRight,
  X,
  Globe,
  Flame,
} from 'lucide-react';

const BOOK_CATEGORIES = [
  'All',
  'Free & Public Domain',
  'Commercial & Retail',
  'Library Card (Free)',
  'Academic & Research',
  'Community & Reviews',
  'Indian & Regional',
] as const;

export const BookFinder: React.FC = () => {
  const [query, setQuery] = useState('');
  const [bookViewTab, setBookViewTab] = useState<'omniverse' | 'curated' | 'gutendex' | 'openlibrary'>('omniverse');
  const [selectedBookCategory, setSelectedBookCategory] = useState<string>('All');
  const [selectedBookTier, setSelectedBookTier] = useState<'All' | 'Free' | 'Paid' | 'Library'>('All');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeReadingUrl, setActiveReadingUrl] = useState<{
    url: string;
    title: string;
    author: string;
    epubUrl?: string;
  } | null>(null);

  const [openLibraryDocs, setOpenLibraryDocs] = useState<OpenLibraryDoc[]>([]);
  const [gutendexBooks, setGutendexBooks] = useState<GutendexBook[]>([]);

  // Filter curated classic books
  const filteredCurated = useMemo(() => {
    if (selectedGenre === 'All') return CURATED_CLASSIC_BOOKS;
    return CURATED_CLASSIC_BOOKS.filter((b) => b.category === selectedGenre);
  }, [selectedGenre]);

  // Filter 42+ Global Book Platforms
  const filteredBookPlatforms = useMemo(() => {
    return ALL_BOOK_PLATFORMS.filter((p) => {
      const matchCat =
        selectedBookCategory === 'All' || p.category === selectedBookCategory;
      let matchTier = true;
      if (selectedBookTier === 'Free') {
        matchTier =
          p.tier.includes('Free') ||
          p.tier.includes('Open Access') ||
          p.tier.includes('Public Domain');
      } else if (selectedBookTier === 'Paid') {
        matchTier = p.tier.includes('Commercial') || p.tier.includes('Paid');
      } else if (selectedBookTier === 'Library') {
        matchTier = p.tier.includes('Library Card');
      }
      return matchCat && matchTier;
    });
  }, [selectedBookCategory, selectedBookTier]);

  const handleSearch = async (e?: React.FormEvent, overrideTab?: 'omniverse' | 'curated' | 'gutendex' | 'openlibrary') => {
    if (e) e.preventDefault();
    const clean = query.trim();
    if (!clean) return;

    const targetTab = overrideTab || bookViewTab;
    setError(null);
    saveHistoryItem('books', 'Global Book Omniverse', clean);
    soundEngine.playSearchPulse();

    if (targetTab === 'openlibrary') {
      setLoading(true);
      try {
        const docs = await searchOpenLibrary(clean);
        setOpenLibraryDocs(docs);
        if (docs.length === 0) {
          setError('No books found on Open Library matching this query.');
        }
      } catch {
        setError('Failed to fetch Open Library records.');
      } finally {
        setLoading(false);
      }
    } else if (targetTab === 'gutendex') {
      setLoading(true);
      try {
        const books = await searchGutendex(clean);
        setGutendexBooks(books);
        if (books.length === 0) {
          setError('No public-domain works found on Project Gutenberg.');
        }
      } catch {
        setError('Failed to fetch Gutenberg records.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleTabChange = (tab: 'omniverse' | 'curated' | 'gutendex' | 'openlibrary') => {
    setBookViewTab(tab);
    soundEngine.playKeyClick();
    if ((tab === 'gutendex' || tab === 'openlibrary') && query.trim()) {
      handleSearch(undefined, tab);
    }
  };

  const quickPicks = [
    'Frankenstein',
    'Atomic Habits',
    'Meditations',
    'Dune',
    'Sapiens',
    'Sherlock Holmes',
    'Bhagavad Gita',
  ];

  const genres = ['All', 'Sci-Fi & Horror', 'Philosophy', 'Mystery', 'Classic Literature', 'Drama'];

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
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
            <Library className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-white tracking-wide">
                Global Books, Literature & Research Omniverse
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {ALL_BOOK_PLATFORMS.length}+ Global Platforms
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              1-click deep book search across Free Public Domain, Kindle, Google Books, Libraries, Academic Preprints & Reviews.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs flex-wrap">
          <a
            href="https://www.gutenberg.org"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => soundEngine.playKeyClick()}
            className="px-2.5 py-1 rounded-lg bg-zinc-800/70 border border-zinc-700/60 text-zinc-300 hover:text-white hover:border-emerald-500/40 transition-colors flex items-center gap-1.5"
          >
            <span>Gutenberg</span>
            <ExternalLink className="w-3 h-3 text-zinc-500" />
          </a>
          <a
            href="https://openlibrary.org"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => soundEngine.playKeyClick()}
            className="px-2.5 py-1 rounded-lg bg-zinc-800/70 border border-zinc-700/60 text-zinc-300 hover:text-white hover:border-cyan-500/40 transition-colors flex items-center gap-1.5"
          >
            <span>Open Library</span>
            <ExternalLink className="w-3 h-3 text-zinc-500" />
          </a>
          <a
            href="https://www.goodreads.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => soundEngine.playKeyClick()}
            className="px-2.5 py-1 rounded-lg bg-zinc-800/70 border border-zinc-700/60 text-amber-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span>Goodreads</span>
            <ExternalLink className="w-3 h-3 text-zinc-500" />
          </a>
        </div>
      </motion.div>

      {/* 2. Interactive Search Form */}
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        onSubmit={(e) => handleSearch(e)}
        className="relative flex items-center"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search any book, author, philosophy, or ISBN across ${ALL_BOOK_PLATFORMS.length}+ global book platforms...`}
          className="w-full pl-11 pr-28 py-3.5 text-sm rounded-2xl bg-zinc-900/90 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all shadow-inner font-sans"
        />
        <Search className="w-4 h-4 text-zinc-500 absolute left-4 pointer-events-none" />

        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-2 px-4 py-2 text-xs font-semibold rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          {loading ? (
            <span className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Search Books</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </motion.form>

      {/* Quick Picks */}
      <div className="flex items-center gap-2 text-xs text-zinc-500 flex-wrap">
        <span className="flex items-center gap-1 text-zinc-400">
          <Flame className="w-3.5 h-3.5 text-emerald-400" />
          Popular Titles:
        </span>
        {quickPicks.map((pick) => (
          <button
            key={pick}
            type="button"
            onClick={() => {
              setQuery(pick);
              soundEngine.playKeyClick();
            }}
            className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all cursor-pointer font-mono"
          >
            {pick}
          </button>
        ))}
      </div>

      {/* 3. In-App Reading View */}
      <AnimatePresence>
        {activeReadingUrl && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="p-5 rounded-3xl bg-zinc-950/95 border border-emerald-500/40 shadow-[0_20px_80px_rgba(16,185,129,0.25)] space-y-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-bold">
                  In-App Book Reader
                </span>
                <span className="text-zinc-600">•</span>
                <span className="font-semibold text-sm text-white">
                  {activeReadingUrl.title}
                </span>
                <span className="text-xs text-zinc-400 hidden sm:inline">
                  by {activeReadingUrl.author}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {activeReadingUrl.epubUrl && (
                  <a
                    href={activeReadingUrl.epubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-zinc-300 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>EPUB</span>
                  </a>
                )}
                <a
                  href={activeReadingUrl.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 transition-colors"
                >
                  <span>Open Full Screen</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => setActiveReadingUrl(null)}
                  className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Close Reader"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Embedded Clean HTML Reader Frame */}
            <div className="relative h-[480px] w-full rounded-2xl overflow-hidden bg-white/95 border border-zinc-800 shadow-2xl">
              <iframe
                src={activeReadingUrl.url}
                title={activeReadingUrl.title}
                className="w-full h-full border-0"
                sandbox="allow-same-origin allow-scripts"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Segmented Tab Switcher */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs">
          <button
            type="button"
            onClick={() => handleTabChange('omniverse')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              bookViewTab === 'omniverse'
                ? 'bg-emerald-500 text-black font-bold shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Global Book Omniverse ({ALL_BOOK_PLATFORMS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('curated')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              bookViewTab === 'curated'
                ? 'bg-emerald-500 text-black font-bold shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Free Classics ({CURATED_CLASSIC_BOOKS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('gutendex')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              bookViewTab === 'gutendex'
                ? 'bg-white text-zinc-950 font-bold shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>Live Gutenberg API</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('openlibrary')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              bookViewTab === 'openlibrary'
                ? 'bg-white text-zinc-950 font-bold shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Open Library Archive</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{filteredBookPlatforms.length} book platforms indexed</span>
        </div>
      </div>

      {/* 5. Error Notice */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. TAB A: Global Books Omniverse (42+ Platforms) */}
      {bookViewTab === 'omniverse' && (
        <div className="space-y-4">
          {/* Category & Tier Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
              {BOOK_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    soundEngine.playKeyClick();
                    setSelectedBookCategory(cat);
                  }}
                  className={`px-3 py-1 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    selectedBookCategory === cat
                      ? 'bg-emerald-500 text-black font-bold shadow-xs'
                      : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs shrink-0 self-start md:self-auto">
              {(['All', 'Free', 'Paid', 'Library'] as const).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setSelectedBookTier(tier)}
                  className={`px-2.5 py-0.5 rounded-lg transition-all cursor-pointer font-mono text-[11px] ${
                    selectedBookTier === tier
                      ? 'bg-emerald-500 text-black font-bold shadow-xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {tier === 'All'
                    ? 'All'
                    : tier === 'Free'
                    ? 'Free 🟢'
                    : tier === 'Paid'
                    ? 'Commercial 💳'
                    : 'Library 🏛️'}
                </button>
              ))}
            </div>
          </div>

          {/* Active Search Banner if Query Present */}
          {query.trim() && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-zinc-300">
                  Ready to dispatch 1-click deep search for{' '}
                  <span className="text-white font-bold font-mono">"{query.trim()}"</span> across all 42+ book platforms:
                </span>
              </div>
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-zinc-400 hover:text-white text-xs underline cursor-pointer"
              >
                Clear
              </button>
            </motion.div>
          )}

          {/* Staggered Omniverse Book Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[580px] overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {filteredBookPlatforms.map((platform, idx) => (
                <motion.div
                  key={platform.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: idx * 0.02 }}
                  whileHover={{ y: -3 }}
                  className="group flex flex-col justify-between p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-emerald-500/50 hover:bg-zinc-850/80 transition-all space-y-3 shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/60 truncate">
                        {platform.category}
                      </span>
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md border font-semibold shrink-0 ${
                          platform.tier.includes('Free') || platform.tier.includes('Open')
                            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                            : platform.tier.includes('Library')
                            ? 'bg-purple-950/40 text-purple-300 border-purple-800/40'
                            : 'bg-amber-950/40 text-amber-300 border-amber-800/40'
                        }`}
                      >
                        {platform.badge}
                      </span>
                    </div>

                    <h4 className="font-semibold text-sm text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: platform.color }}
                      />
                      <span className="truncate">{platform.name}</span>
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                      {platform.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                    <motion.a
                      whileTap={{ scale: 0.96 }}
                      href={query.trim() ? platform.getUrl(query) : platform.directHomeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => soundEngine.playKeyClick()}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-200 hover:text-black border border-emerald-500/30 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <span>
                        {query.trim()
                          ? `Search on ${platform.name.split(' ')[0]}`
                          : `Explore ${platform.name.split(' ')[0]}`}
                      </span>
                      <ExternalLink className="w-3 h-3" />
                    </motion.a>

                    <a
                      href={platform.directHomeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      title={`Visit ${platform.name} Homepage`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* 7. TAB B: Curated Free Classics */}
      {bookViewTab === 'curated' && (
        <div className="space-y-4">
          {/* Genre Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {genres.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => {
                  soundEngine.playKeyClick();
                  setSelectedGenre(g);
                }}
                className={`px-3 py-1 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  selectedGenre === g
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-medium'
                    : 'bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Grid of Curated Books */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[540px] overflow-y-auto pr-1"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.04 },
              },
            }}
          >
            {filteredCurated.map((book: CuratedBook) => (
              <motion.div
                key={book.id}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="group flex flex-col justify-between p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-emerald-500/50 hover:bg-zinc-850/80 transition-all shadow-md relative overflow-hidden"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {book.category} • {book.year}
                    </span>
                    <a
                      href={book.gutenbergUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-500 hover:text-emerald-400 transition-colors p-1"
                      title="View on Gutenberg"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <h4 className="font-semibold text-sm text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                    {book.title}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 font-medium">{book.author}</p>
                  <p className="text-xs text-zinc-500 line-clamp-2 mt-2 leading-relaxed">
                    {book.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={() => {
                      soundEngine.playKeyClick();
                      setActiveReadingUrl({
                        url: book.readOnlineUrl,
                        title: book.title,
                        author: book.author,
                        epubUrl: book.epubUrl,
                      });
                    }}
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Read In-App ▶</span>
                  </motion.button>

                  <a
                    href={book.readOnlineUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => soundEngine.playKeyClick()}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Open reader in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={book.epubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => soundEngine.playKeyClick()}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-400 hover:text-white transition-colors cursor-pointer"
                    title="Download EPUB file"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* 8. TAB C: Live Gutenberg API Search */}
      {bookViewTab === 'gutendex' && (
        <div className="space-y-3">
          {gutendexBooks.length === 0 && !loading && (
            <div className="p-8 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800/60">
              <BookOpen className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-xs text-zinc-400">Search over 70,000 public-domain books on Project Gutenberg.</p>
            </div>
          )}

          {gutendexBooks.length > 0 && (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[500px] overflow-y-auto pr-1"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
              }}
            >
              {gutendexBooks.map((book) => {
                const author = book.authors && book.authors.length > 0 ? book.authors[0].name : 'Unknown Author';
                const readUrl =
                  book.formats['text/html'] ||
                  book.formats['text/plain; charset=utf-8'] ||
                  `https://www.gutenberg.org/ebooks/${book.id}`;
                const epubUrl = book.formats['application/epub+zip'];

                return (
                  <motion.div
                    key={book.id}
                    variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                    className="group flex flex-col justify-between p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-emerald-500/40 hover:bg-zinc-850/80 transition-all shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
                        <span className="text-emerald-400 font-mono text-[10px] uppercase">
                          Gutenberg #{book.id}
                        </span>
                        <a
                          href={`https://www.gutenberg.org/ebooks/${book.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-500 group-hover:text-emerald-400 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      <h4 className="font-medium text-sm text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                        {book.title}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1">{author}</p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        type="button"
                        onClick={() => {
                          soundEngine.playKeyClick();
                          setActiveReadingUrl({
                            url: readUrl,
                            title: book.title,
                            author: author,
                            epubUrl: epubUrl,
                          });
                        }}
                        className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Read In-App ▶</span>
                      </motion.button>

                      <a
                        href={readUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => soundEngine.playKeyClick()}
                        className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        title="Open reader in new tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      {epubUrl && (
                        <a
                          href={epubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => soundEngine.playKeyClick()}
                          className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-400 hover:text-white transition-colors cursor-pointer"
                          title="Download EPUB file"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      )}

      {/* 9. TAB D: Open Library Results */}
      {bookViewTab === 'openlibrary' && (
        <div className="space-y-3">
          {openLibraryDocs.length === 0 && !loading && (
            <div className="p-8 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800/60">
              <Library className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-xs text-zinc-400">Search millions of records across the Open Library universal catalog.</p>
            </div>
          )}

          {openLibraryDocs.length > 0 && (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[500px] overflow-y-auto pr-1"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
              }}
            >
              {openLibraryDocs.map((doc, idx) => {
                const author = doc.author_name ? doc.author_name.slice(0, 2).join(', ') : 'Unknown Author';
                const year = doc.first_publish_year || '';
                const coverUrl = getOpenLibraryCoverUrl(doc.cover_i);

                return (
                  <motion.a
                    key={doc.key || idx}
                    href={`https://openlibrary.org${doc.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                    className="group flex flex-col justify-between p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-cyan-500/40 hover:bg-zinc-850/80 transition-all shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
                        <span>{year ? `Published ${year}` : 'Archive Record'}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-cyan-400 transition-colors" />
                      </div>

                      <h4 className="font-medium text-sm text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                        {doc.title}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1">{author}</p>
                    </div>

                    {coverUrl && (
                      <div className="my-2 h-20 w-14 overflow-hidden rounded-md border border-zinc-800 shrink-0">
                        <img
                          src={coverUrl}
                          alt={doc.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      </div>
                    )}

                    <span className="text-[11px] text-cyan-400 mt-2 font-medium flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" /> View on Open Library
                    </span>
                  </motion.a>
                );
              })}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};
