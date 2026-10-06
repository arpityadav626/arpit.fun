import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import { searchTmdb, getTmdbPosterUrl } from '../lib/api/tmdb';
import { saveHistoryItem } from '../lib/history';
import { soundEngine } from '../lib/audioSynth';
import {
  VERIFIED_CINEMA_MEDIA,
  FREE_STREAMING_PLATFORMS,
  getYouTubeSearchUrl,
  getArchiveOrgSearchUrl,
  getJustWatchSearchUrl,
  type CinemaMediaItem,
} from '../lib/cinemaMedia';
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
} from 'lucide-react';

export const FilmFinder: React.FC = () => {
  const { tmdbApiKey } = useSettings();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<TmdbMediaItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTheaterMedia, setActiveTheaterMedia] = useState<CinemaMediaItem | null>(null);

  // Filter verified media items
  const filteredCinema = useMemo(() => {
    if (selectedCategory === 'All') return VERIFIED_CINEMA_MEDIA;
    return VERIFIED_CINEMA_MEDIA.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

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

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    setError(null);
    setHasSearched(true);
    saveHistoryItem('film', 'Cinema & YouTube Hub', cleanQuery);
    soundEngine.playSearchPulse();

    // If user has a TMDb API key configured, query TMDb
    if (tmdbApiKey.trim()) {
      setLoading(true);
      try {
        const items = await searchTmdb(cleanQuery, tmdbApiKey);
        setResults(items);
        if (items.length === 0) {
          setError('No direct TMDb records found. Instant YouTube & Free streaming channels ready below.');
        }
      } catch {
        setError('TMDb query unavailable. Direct YouTube & Streaming channels ready below.');
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
    'Across the Spider-Verse',
    'The Batman',
    'Blade Runner 2049',
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
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-white">
                YouTube Cinema & Free Streaming Hub
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                Verified & Legal
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Official 4K YouTube trailers, free public domain classics & JustWatch streaming guides
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
            <span>YouTube Free Movies</span>
            <ExternalLink className="w-3 h-3 text-white/80" />
          </motion.a>

          <a
            href="https://archive.org/details/moviesandfilms"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-zinc-700/60 text-xs font-mono text-zinc-300 hover:text-white transition-all inline-flex items-center gap-1.5"
          >
            <span>Archive.org Cinema</span>
            <ExternalLink className="w-3 h-3 text-zinc-500" />
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
          placeholder="Search any movie, trailer, documentary, or director (e.g. Interstellar, Dune, Nolan)..."
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
            Trending Cinema:
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

      {/* 3. Real-Time Search Results Card (When User Has Searched) */}
      {hasSearched && query.trim() && (
        <div className="space-y-4 animate-in fade-in duration-200">
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
                  {matchedVerifiedMovie ? 'Official Cinema Match' : 'Direct YouTube Stream'}
                </span>
                <span className="text-xs text-zinc-400">Direct Official Video</span>
              </div>
              <h4 className="text-lg font-bold text-white tracking-tight">
                "{matchedVerifiedMovie ? matchedVerifiedMovie.title : query.trim()}"
              </h4>
              <p className="text-xs text-zinc-400">
                {matchedVerifiedMovie
                  ? `${matchedVerifiedMovie.quality} • ${matchedVerifiedMovie.badge} • ${matchedVerifiedMovie.year}`
                  : 'Watch verified official trailers and explore free streaming availability'}
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* In-App 4K Theater Button if matched, or direct video */}
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
                  <span>Watch on YouTube Directly ▶</span>
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
                <span>Where to Stream (JustWatch)</span>
              </a>

              {/* Archive.org Free Stream Search */}
              <a
                href={getArchiveOrgSearchUrl(query)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-mono transition-colors inline-flex items-center gap-1"
              >
                <span>Archive.org 🏛️</span>
              </a>
            </div>
          </motion.div>

          {/* TMDb Live Matches (If TMDb key is active and returned results) */}
          {results.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">
                Official TMDb Cast & Database ({results.length} Matches)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[500px] overflow-y-auto pr-1">
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
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
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

          {/* Quick Legal Discovery Grid */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block">
              Direct Streaming & Discovery Channels
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <a
                href={getYouTubeSearchUrl(query)}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-rose-500/40 hover:bg-zinc-850/80 transition-all cursor-pointer"
              >
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                    YouTube Official Channels
                  </h4>
                  <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                    Studio trailers, teasers, and full clips
                  </p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-rose-400 transition-colors shrink-0 ml-2" />
              </a>

              <a
                href={getJustWatchSearchUrl(query)}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-cyan-500/40 hover:bg-zinc-850/80 transition-all cursor-pointer"
              >
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                    JustWatch Streaming Guide
                  </h4>
                  <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                    Find verified Netflix, Prime, Disney+ & Free streams
                  </p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-cyan-400 transition-colors shrink-0 ml-2" />
              </a>

              <a
                href={`https://www.imdb.com/find/?q=${encodeURIComponent(query)}&s=tt`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-amber-500/40 hover:bg-zinc-850/80 transition-all cursor-pointer"
              >
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                    IMDb Database
                  </h4>
                  <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                    Full cast, ratings, reviews and trivia
                  </p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400 transition-colors shrink-0 ml-2" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 4. Verified Cinema Releases & YouTube Showcases (When user hasn't searched) */}
      {!hasSearched && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Curated Cinema & Official YouTube Streams
              </h3>
            </div>

            {/* Category Filter Chips with Smooth Hover */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
              {['All', 'Sci-Fi', 'Action', 'Drama', 'Classic', 'Documentary', 'Animation'].map(
                (cat) => (
                  <motion.button
                    key={cat}
                    type="button"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      soundEngine.playKeyClick();
                      setSelectedCategory(cat);
                    }}
                    className={`px-3 py-1 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                      selectedCategory === cat
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
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

          {/* Legal Free Streaming Platforms Spotlight */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-950/30 via-zinc-900/80 to-zinc-900 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                <h4 className="text-xs font-mono font-bold text-rose-300 uppercase tracking-wider">
                  Free Legal Streaming Gateways
                </h4>
              </div>
              <p className="text-xs text-zinc-300">
                Official free movies on YouTube, Archive.org public domain cinema, and Open Culture
              </p>
            </div>

            <motion.a
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              href="https://www.youtube.com/feed/storefront?bp=kgECCOgH"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundEngine.playKeyClick()}
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs inline-flex items-center gap-2 transition-transform cursor-pointer shrink-0 shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Explore Free YouTube Cinema ➔</span>
            </motion.a>
          </motion.div>

          {/* Quick Platform Directory */}
          <div className="pt-4 border-t border-zinc-850">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-2.5">
              Verified Free & Legal Movie Platforms
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {FREE_STREAMING_PLATFORMS.map((platform) => (
                <a
                  key={platform.name}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition-all flex items-center justify-between group"
                >
                  <div>
                    <span className="font-semibold text-white block group-hover:text-rose-300 transition-colors">
                      {platform.name}
                    </span>
                    <span className="text-[11px] text-zinc-500 line-clamp-1">
                      {platform.description}
                    </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-600 group-hover:text-rose-400 transition-colors shrink-0 ml-2" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
