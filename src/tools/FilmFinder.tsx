import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import { searchTmdb, getTmdbPosterUrl } from '../lib/api/tmdb';
import { saveHistoryItem } from '../lib/history';
import { soundEngine } from '../lib/audioSynth';
import {
  VERIFIED_CINEMA_MEDIA,
  getJustWatchSearchUrl,
  type CinemaMediaItem,
} from '../lib/cinemaMedia';
import { ALL_FILM_PLATFORMS } from '../lib/searchLinks';
import type { TmdbMediaItem } from '../types';
import {
  Search,
  ExternalLink,
  Star,
  Film,
  Play,
  Flame,
  Tv,
  Sparkles,
  X,
  Globe,
} from 'lucide-react';

const FILM_CATEGORIES = [
  'All',
  'Free & Ad-Supported',
  'Premium & Subscription',
  'Cinephile & Arthouse',
  'Public Domain & Archives',
  'Anime & Animation',
  'Indian & Regional',
  'Meta Search & Databases',
] as const;

export const FilmFinder: React.FC = () => {
  const { tmdbApiKey } = useSettings();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<TmdbMediaItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTheaterMedia, setActiveTheaterMedia] = useState<CinemaMediaItem | null>(null);

  // View & Category Filters
  const [filmViewTab, setFilmViewTab] = useState<'omniverse' | 'theatrical'>('omniverse');
  const [platformCategory, setPlatformCategory] = useState<string>('All');
  const [platformTierFilter, setPlatformTierFilter] = useState<'All' | 'Free' | 'Paid'>('All');
  const [selectedCuratedCategory, setSelectedCuratedCategory] = useState<string>('All');

  // Filter verified media items for curated theater
  const filteredCinema = useMemo(() => {
    if (selectedCuratedCategory === 'All') return VERIFIED_CINEMA_MEDIA;
    return VERIFIED_CINEMA_MEDIA.filter((item) => item.category === selectedCuratedCategory);
  }, [selectedCuratedCategory]);

  // Exact or closest match from verified catalog
  const matchedVerifiedMovie = useMemo(() => {
    if (!query.trim()) return null;
    const lower = query.trim().toLowerCase();
    return (
      VERIFIED_CINEMA_MEDIA.find(
        (m) => m.title.toLowerCase().includes(lower) || lower.includes(m.title.toLowerCase())
      ) || null
    );
  }, [query]);

  // Filter all 54+ global film platforms
  const filteredPlatforms = useMemo(() => {
    return ALL_FILM_PLATFORMS.filter((p) => {
      const matchCat = platformCategory === 'All' || p.category === platformCategory;
      let matchTier = true;
      if (platformTierFilter === 'Free') {
        matchTier =
          p.tier.includes('Free') ||
          p.tier.includes('Library') ||
          p.tier.includes('Public Domain');
      } else if (platformTierFilter === 'Paid') {
        matchTier = p.tier.includes('Subscription') || p.tier.includes('Paid');
      }
      return matchCat && matchTier;
    });
  }, [platformCategory, platformTierFilter]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    setError(null);
    setHasSearched(true);
    saveHistoryItem('film', 'Cinema & Video Omniverse', cleanQuery);
    soundEngine.playSearchPulse();

    // If user has a TMDb API key configured, query TMDb
    if (tmdbApiKey.trim()) {
      setLoading(true);
      try {
        const items = await searchTmdb(cleanQuery, tmdbApiKey);
        setResults(items);
        if (items.length === 0) {
          setError('No direct TMDb records found. Instant streaming platform deep-links ready below.');
        }
      } catch {
        setError('TMDb query unavailable. Instant streaming platform deep-links ready below.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    } else {
      setResults([]);
    }
  };

  const quickPicks = [
    'Interstellar',
    'Dune: Part Two',
    'Oppenheimer',
    'Spirited Away',
    'RRR',
    'The Dark Knight',
    'Night of the Living Dead',
  ];

  return (
    <div className="relative flex flex-col h-full space-y-6 text-zinc-100">
      {/* 1. Header & Official Platforms Showcase */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-md backdrop-blur-md"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm text-white">
                Global Cinema & Video Streaming Omniverse
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                {ALL_FILM_PLATFORMS.length}+ Global Platforms
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              1-click deep search across Free FAST, Global Premium, Anime, Arthouse, Indian Cinema & Public Archives
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <motion.a
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            href="https://www.youtube.com/feed/storefront?bp=kgECCOgH"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => soundEngine.playKeyClick()}
            className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold font-mono transition-all inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>YouTube Free</span>
            <ExternalLink className="w-3 h-3 text-white/80" />
          </motion.a>

          <a
            href="https://www.justwatch.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-zinc-700/60 text-xs font-mono text-cyan-300 hover:text-white transition-all inline-flex items-center gap-1.5"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>JustWatch Guide</span>
          </a>
        </div>
      </motion.div>

      {/* 2. Interactive Search Bar */}
      <form onSubmit={handleSearch} className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!e.target.value.trim()) {
              setHasSearched(false);
              setResults([]);
            }
          }}
          placeholder={`Search any movie, anime, director, or series across all ${ALL_FILM_PLATFORMS.length}+ platforms...`}
          className="w-full pl-11 pr-32 py-3.5 text-sm rounded-2xl bg-zinc-900/90 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition-all shadow-inner font-sans"
        />
        <Search className="w-4 h-4 text-zinc-500 absolute left-4 pointer-events-none" />

        <div className="absolute right-2 flex items-center gap-1.5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            type="submit"
            disabled={loading || !query.trim()}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            {loading ? (
              <span className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </>
            )}
          </motion.button>
        </div>
      </form>

      {/* Quick Suggestion Pills */}
      {!hasSearched && (
        <div className="flex items-center gap-2 flex-wrap text-xs text-zinc-500">
          <span className="flex items-center gap-1 text-zinc-400">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Trending Worldwide:
          </span>
          {quickPicks.map((pick) => (
            <motion.button
              key={pick}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setQuery(pick);
                soundEngine.playKeyClick();
              }}
              className="px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all cursor-pointer"
            >
              {pick}
            </motion.button>
          ))}
        </div>
      )}

      {/* Error Notice */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between"
        >
          <span>{error}</span>
        </motion.div>
      )}

      {/* In-App 4K Cinema Theater Mode */}
      <AnimatePresence>
        {activeTheaterMedia && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="p-5 rounded-3xl bg-zinc-950/95 border border-rose-500/40 shadow-[0_20px_80px_rgba(244,63,94,0.25)] space-y-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="font-mono text-xs uppercase tracking-wider text-rose-400 font-bold">
                  In-App 4K Cinema Theater
                </span>
                <span className="text-zinc-600">•</span>
                <span className="font-semibold text-sm text-white">
                  {activeTheaterMedia.title} ({activeTheaterMedia.year})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={activeTheaterMedia.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 transition-colors"
                >
                  <span>YouTube App</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={() => setActiveTheaterMedia(null)}
                  className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Close Theater Mode"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Embedded 16:9 4K Video Player */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-2xl">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeTheaterMedia.youtubeVideoId}?autoplay=1&rel=0&modestbranding=1`}
                title={activeTheaterMedia.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Info and links */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-400 pt-1">
              <p className="line-clamp-2 max-w-2xl leading-relaxed">
                {activeTheaterMedia.description}
              </p>
              {activeTheaterMedia.freeWatchUrl && (
                <a
                  href={activeTheaterMedia.freeWatchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-cyan-300 font-medium whitespace-nowrap flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>Streaming Availability</span>
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Search Results Mode (When User Has Searched) */}
      {hasSearched && query.trim() && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Top Direct Action Card for the searched title */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="p-5 rounded-3xl bg-gradient-to-r from-zinc-900/90 via-zinc-900/70 to-rose-950/20 border border-rose-500/30 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500 text-white uppercase tracking-wider">
                  {matchedVerifiedMovie ? 'Verified Cinema Match' : 'Omniverse Search Ready'}
                </span>
                <span className="text-xs text-zinc-400">
                  Searching {ALL_FILM_PLATFORMS.length}+ Global Platforms
                </span>
              </div>
              <h4 className="text-lg font-bold text-white tracking-tight">
                "{matchedVerifiedMovie ? matchedVerifiedMovie.title : query.trim()}"
              </h4>
              <p className="text-xs text-zinc-400">
                {matchedVerifiedMovie
                  ? `${matchedVerifiedMovie.quality} • ${matchedVerifiedMovie.badge} • ${matchedVerifiedMovie.year}`
                  : 'Launch direct 1-click searches across all free FAST channels, subscription services, and film databases'}
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {matchedVerifiedMovie ? (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => {
                    soundEngine.playKeyClick();
                    setActiveTheaterMedia(matchedVerifiedMovie);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-all shadow-[0_0_20px_rgba(244,63,94,0.4)] inline-flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Watch in 4K Theater ▶</span>
                </motion.button>
              ) : (
                <motion.a
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  href={`https://duckduckgo.com/?q=!yt+${encodeURIComponent(query + ' official trailer')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => soundEngine.playKeyClick()}
                  className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-all shadow-[0_0_20px_rgba(244,63,94,0.4)] inline-flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>YouTube Official Stream ▶</span>
                </motion.a>
              )}

              {/* Where to Stream Legal Guide */}
              <a
                href={getJustWatchSearchUrl(matchedVerifiedMovie ? matchedVerifiedMovie.title : query)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => soundEngine.playKeyClick()}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-zinc-200 hover:text-white text-xs font-medium transition-all inline-flex items-center gap-1.5"
              >
                <Tv className="w-3.5 h-3.5 text-cyan-400" />
                <span>JustWatch Stream Guide</span>
              </a>
            </div>
          </motion.div>

          {/* TMDb Live Matches (If TMDb key is active and returned results) */}
          {results.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">
                Official TMDb Cast & Database ({results.length} Matches)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[420px] overflow-y-auto pr-1">
                {results.map((item, idx) => {
                  const title = item.title || item.name || 'Untitled';
                  const releaseDate = item.release_date || item.first_air_date || '';
                  const year = releaseDate ? releaseDate.split('-')[0] : '';
                  const poster = getTmdbPosterUrl(item.poster_path, 'w342');

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.04 }}
                      whileHover={{ y: -3 }}
                      className="group flex flex-col justify-between p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-rose-500/40 transition-all space-y-3 shadow-md"
                    >
                      <div className="flex gap-3">
                        {poster ? (
                          <img
                            src={poster}
                            alt={title}
                            className="w-16 h-24 object-cover rounded-xl bg-zinc-800 shrink-0 shadow-sm"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-16 h-24 rounded-xl bg-zinc-800 shrink-0 flex items-center justify-center text-zinc-600 text-[10px]">
                            No Poster
                          </div>
                        )}

                        <div className="flex flex-col justify-between overflow-hidden">
                          <div>
                            <h4 className="font-semibold text-sm text-white truncate">{title}</h4>
                            <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                              {year && <span>{year}</span>}
                              {item.vote_average ? (
                                <span className="flex items-center gap-1 text-amber-400 font-mono">
                                  <Star className="w-3 h-3 fill-current" />
                                  {item.vote_average.toFixed(1)}
                                </span>
                              ) : null}
                            </div>
                            {item.overview && (
                              <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1.5 leading-relaxed">
                                {item.overview}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                        <motion.a
                          whileTap={{ scale: 0.95 }}
                          href={`https://duckduckgo.com/?q=!yt+${encodeURIComponent(title + ' ' + year + ' official trailer')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[11px] font-semibold inline-flex items-center gap-1.5 transition-all"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Watch Trailer</span>
                        </motion.a>

                        <a
                          href={getJustWatchSearchUrl(title)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-white transition-colors"
                          title="Where to Stream (JustWatch)"
                        >
                          <Tv className="w-3.5 h-3.5 text-cyan-400" />
                        </a>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Deep Omniverse Search Across ALL 54+ Platforms */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
                  <Globe className="w-4 h-4 text-rose-400" />
                  <span>Deep Search Across {filteredPlatforms.length} Global Platforms</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  1-Click direct search dispatched for <span className="text-rose-300 font-mono">"{query.trim()}"</span>
                </p>
              </div>

              {/* Tier Filter Toggle */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
                {(['All', 'Free', 'Paid'] as const).map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setPlatformTierFilter(tier)}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-mono text-[11px] ${
                      platformTierFilter === tier
                        ? 'bg-rose-500 text-white font-bold shadow-xs'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {tier === 'All' ? 'All Tiers' : tier === 'Free' ? 'Free / FAST 🟢' : 'Subscription 💳'}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
              {FILM_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    soundEngine.playKeyClick();
                    setPlatformCategory(cat);
                  }}
                  className={`px-3 py-1 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    platformCategory === cat
                      ? 'bg-rose-500 text-white font-bold shadow-xs'
                      : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Staggered Omniverse Platform Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[560px] overflow-y-auto pr-1">
              {filteredPlatforms.map((platform) => (
                <motion.div
                  key={platform.id}
                  whileHover={{ y: -3 }}
                  className="group flex flex-col justify-between p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 hover:border-rose-500/40 hover:bg-zinc-850/80 transition-all space-y-3 shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/60 truncate">
                        {platform.category}
                      </span>
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md border font-semibold shrink-0 ${
                          platform.tier.includes('Free') || platform.tier.includes('Public')
                            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                            : platform.tier.includes('Library')
                            ? 'bg-purple-950/40 text-purple-300 border-purple-800/40'
                            : 'bg-rose-950/40 text-rose-300 border-rose-800/40'
                        }`}
                      >
                        {platform.badge}
                      </span>
                    </div>

                    <h4 className="font-semibold text-sm text-white group-hover:text-rose-300 transition-colors flex items-center gap-1.5">
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
                      href={platform.getUrl(query)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => soundEngine.playKeyClick()}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-200 hover:text-white border border-rose-500/30 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <span>Search on {platform.name.split(' ')[0]}</span>
                      <ExternalLink className="w-3 h-3" />
                    </motion.a>

                    <a
                      href={platform.directHomeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                      title={`Visit ${platform.name} Homepage`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Browse Mode: Tab Switcher (When user hasn't searched) */}
      {!hasSearched && (
        <div className="space-y-5">
          {/* View Switcher: Omniverse vs Curated In-App Theater */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playKeyClick();
                  setFilmViewTab('omniverse');
                }}
                className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                  filmViewTab === 'omniverse'
                    ? 'bg-rose-500 text-white font-bold shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Global Streaming Omniverse ({ALL_FILM_PLATFORMS.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playKeyClick();
                  setFilmViewTab('theatrical');
                }}
                className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                  filmViewTab === 'theatrical'
                    ? 'bg-rose-500 text-white font-bold shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>In-App 4K Cinema Theater</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{filteredPlatforms.length} services indexed</span>
            </div>
          </div>

          {/* TAB A: Global Streaming Omniverse */}
          {filmViewTab === 'omniverse' && (
            <div className="space-y-4">
              {/* Category Pills & Tier Toggle */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
                  {FILM_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        soundEngine.playKeyClick();
                        setPlatformCategory(cat);
                      }}
                      className={`px-3 py-1 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                        platformCategory === cat
                          ? 'bg-rose-500 text-white font-bold shadow-xs'
                          : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs shrink-0 self-start md:self-auto">
                  {(['All', 'Free', 'Paid'] as const).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setPlatformTierFilter(tier)}
                      className={`px-2.5 py-0.5 rounded-lg transition-all cursor-pointer font-mono text-[11px] ${
                        platformTierFilter === tier
                          ? 'bg-rose-500 text-white font-bold shadow-xs'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {tier === 'All' ? 'All' : tier === 'Free' ? 'Free / FAST 🟢' : 'Paid 💳'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Platform Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[580px] overflow-y-auto pr-1">
                <AnimatePresence mode="popLayout">
                  {filteredPlatforms.map((platform, idx) => (
                    <motion.div
                      key={platform.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25, delay: idx * 0.02 }}
                      whileHover={{ y: -3 }}
                      className="group flex flex-col justify-between p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-rose-500/50 hover:bg-zinc-850/80 transition-all space-y-3 shadow-md"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/60 truncate">
                            {platform.category}
                          </span>
                          <span
                            className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md border font-semibold shrink-0 ${
                              platform.tier.includes('Free') || platform.tier.includes('Public')
                                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                                : platform.tier.includes('Library')
                                ? 'bg-purple-950/40 text-purple-300 border-purple-800/40'
                                : 'bg-rose-950/40 text-rose-300 border-rose-800/40'
                            }`}
                          >
                            {platform.badge}
                          </span>
                        </div>

                        <h4 className="font-semibold text-sm text-white group-hover:text-rose-300 transition-colors flex items-center gap-1.5">
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
                          href={platform.directHomeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => soundEngine.playKeyClick()}
                          className="flex-1 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-rose-500 text-zinc-200 hover:text-white border border-zinc-700/60 hover:border-rose-500/30 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-all shadow-xs"
                        >
                          <span>Explore Platform</span>
                          <ExternalLink className="w-3 h-3" />
                        </motion.a>

                        <a
                          href={platform.getUrl('top rated movies')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                          title="Search Top Rated Catalog"
                        >
                          <Search className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* TAB B: Curated Theatrical Releases (In-App 4K Player) */}
          {filmViewTab === 'theatrical' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rose-400" />
                  <h3 className="text-sm font-semibold text-white tracking-tight">
                    Curated Cinema & In-App 4K YouTube Streams
                  </h3>
                </div>

                {/* Category Filter Chips with Smooth Hover */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
                  {['All', 'Sci-Fi', 'Action', 'Drama', 'Classic', 'Documentary', 'Animation'].map(
                    (cat) => (
                      <motion.button
                        key={cat}
                        type="button"
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          soundEngine.playKeyClick();
                          setSelectedCuratedCategory(cat);
                        }}
                        className={`px-3 py-1 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                          selectedCuratedCategory === cat
                            ? 'bg-rose-500 text-white font-bold shadow-xs'
                            : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800'
                        }`}
                      >
                        {cat}
                      </motion.button>
                    )
                  )}
                </div>
              </div>

              {/* Staggered Animated Cinema Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[580px] overflow-y-auto pr-1">
                <AnimatePresence mode="popLayout">
                  {filteredCinema.map((movie, idx) => (
                    <motion.div
                      key={movie.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.32, delay: idx * 0.035 }}
                      whileHover={{ y: -4, scale: 1.012 }}
                      className="group relative flex flex-col justify-between p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-rose-500/50 hover:bg-zinc-850/80 transition-all space-y-3 shadow-lg hover:shadow-[0_8px_30px_rgba(244,63,94,0.12)]"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-semibold text-sm text-white group-hover:text-rose-300 transition-colors leading-tight">
                              {movie.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1 font-mono">
                              <span>{movie.year}</span>
                              <span>•</span>
                              <span className="text-cyan-400">{movie.category}</span>
                              {movie.rating && (
                                <span className="flex items-center gap-1 text-amber-400">
                                  <Star className="w-3 h-3 fill-current" />
                                  {movie.rating}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quality & Duration Badges */}
                        <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                          <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-[10px] font-mono text-zinc-300 border border-zinc-700/60">
                            {movie.quality}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-rose-950/40 text-[10px] font-mono text-rose-300 border border-rose-800/40">
                            {movie.badge}
                          </span>
                          {movie.duration && (
                            <span className="text-[10px] font-mono text-zinc-500">
                              {movie.duration}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                          {movie.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.96 }}
                          type="button"
                          onClick={() => {
                            soundEngine.playKeyClick();
                            setActiveTheaterMedia(movie);
                          }}
                          className="flex-1 px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>In-App 4K Player</span>
                        </motion.button>

                        <a
                          href={movie.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => soundEngine.playKeyClick()}
                          className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                          title="Open directly on YouTube"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        {movie.freeWatchUrl && (
                          <a
                            href={movie.freeWatchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-cyan-400 hover:text-white transition-colors cursor-pointer"
                            title={movie.freePlatform || 'Stream Guide (JustWatch)'}
                          >
                            <Tv className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
