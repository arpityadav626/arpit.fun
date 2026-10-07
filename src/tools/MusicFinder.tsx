import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ALL_MUSIC_PLATFORMS } from '../lib/searchLinks';
import { saveHistoryItem } from '../lib/history';
import { soundEngine } from '../lib/audioSynth';
import {
  Search,
  ExternalLink,
  Play,
  Radio,
  Music2,
  Headphones,
  Volume2,
  X,
  Globe,
  Sparkles,
} from 'lucide-react';

interface AmbientStation {
  id: string;
  name: string;
  category: 'Lo-Fi & Study' | 'Cinematic OST' | 'Synthwave' | 'Classical & Piano' | 'Space Ambient';
  description: string;
  youtubeVideoId: string;
  youtubeWatchUrl: string;
  spotifyUrl: string;
  badge: string;
  color: string;
}

const AMBIENT_STATIONS: AmbientStation[] = [
  {
    id: 'lofi-girl',
    name: 'Lofi Girl - Relax & Study 24/7',
    category: 'Lo-Fi & Study',
    description: 'The world-famous chilled beats livestream for deep concentration and study.',
    youtubeVideoId: 'jfKfPfyJRdk',
    youtubeWatchUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    spotifyUrl: 'https://open.spotify.com/playlist/0vvXsWCC9xrXsKd4FyS8kM',
    badge: 'LIVE 24/7',
    color: 'from-amber-500/20 to-orange-500/10 border-orange-500/30 text-amber-300',
  },
  {
    id: 'synthwave-nightride',
    name: 'Nightride FM - Synthwave & Retrowave',
    category: 'Synthwave',
    description: 'High-octane neon synth, 80s outrun, and cyberpunk electronic radio.',
    youtubeVideoId: '4xDzrJKXOOY',
    youtubeWatchUrl: 'https://www.youtube.com/watch?v=4xDzrJKXOOY',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXdLEN7aqioXM',
    badge: 'LIVE 24/7',
    color: 'from-pink-500/20 to-violet-500/10 border-pink-500/30 text-pink-300',
  },
  {
    id: 'hans-zimmer-ost',
    name: 'Hans Zimmer - Epic Cinematic Suite',
    category: 'Cinematic OST',
    description: 'Interstellar, Inception, Dune, and Gladiator recorded with live orchestral power.',
    youtubeVideoId: 'IqiTJK_uz3o',
    youtubeWatchUrl: 'https://www.youtube.com/watch?v=IqiTJK_uz3o',
    spotifyUrl: 'https://open.spotify.com/artist/0YC192cP3KPCRWx8zr8MfZ',
    badge: 'STUDIO 4K',
    color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-300',
  },
  {
    id: 'ludovico-einaudi',
    name: 'Ludovico Einaudi - Experiencing Piano',
    category: 'Classical & Piano',
    description: 'Minimalist contemporary piano masterpieces including Nuvole Bianche and Experience.',
    youtubeVideoId: 'kciu3Vn7RjE',
    youtubeWatchUrl: 'https://www.youtube.com/watch?v=kciu3Vn7RjE',
    spotifyUrl: 'https://open.spotify.com/artist/2uFUBdaVGtyMqNrqgsjA78',
    badge: 'PIANO MASTER',
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300',
  },
  {
    id: 'cyberpunk-ambient',
    name: 'Night City Cyberpunk Ambience',
    category: 'Synthwave',
    description: 'Rain, holographic streetscapes, and dark synthesizer textures.',
    youtubeVideoId: 'syln_eOcx7Q',
    youtubeWatchUrl: 'https://www.youtube.com/watch?v=syln_eOcx7Q',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX9uKNf5jGX6m',
    badge: 'AMBIENT',
    color: 'from-violet-500/20 to-purple-500/10 border-violet-500/30 text-violet-300',
  },
  {
    id: 'deep-space-drone',
    name: 'Interstellar Deep Space Drone',
    category: 'Space Ambient',
    description: 'Sub-bass cosmic resonance and harmonic sleep frequencies from the edge of the universe.',
    youtubeVideoId: '2r1TjV1hP0Q',
    youtubeWatchUrl: 'https://www.youtube.com/watch?v=2r1TjV1hP0Q',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX1n9whJavhk0',
    badge: 'COSMIC FOCUS',
    color: 'from-indigo-500/20 to-blue-500/10 border-indigo-500/30 text-indigo-300',
  },
  {
    id: 'jazz-cafe',
    name: 'Rainy Coffee Shop Warm Jazz',
    category: 'Lo-Fi & Study',
    description: 'Soft Rhodes piano, gentle brush drums, and soothing rain for creative flow.',
    youtubeVideoId: 'Dx5qFachd3A',
    youtubeWatchUrl: 'https://www.youtube.com/watch?v=Dx5qFachd3A',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXbITWG1ZJKYt',
    badge: 'WARM JAZZ',
    color: 'from-amber-600/20 to-yellow-500/10 border-amber-600/30 text-amber-200',
  },
];

const MUSIC_CATEGORIES = [
  'All',
  'Global Streaming',
  'Indie & Artist Direct',
  'Live Radio & Ambient',
  'Lyrics & Community',
  'Free & Open Archives',
  'Indian & Regional Music',
] as const;

export const MusicFinder: React.FC = () => {
  const [query, setQuery] = useState('');
  const [musicViewTab, setMusicViewTab] = useState<'omniverse' | 'ambient'>('omniverse');
  const [selectedMusicCategory, setSelectedMusicCategory] = useState<string>('All');
  const [selectedStationCategory, setSelectedStationCategory] = useState<string>('All');
  const [activeStation, setActiveStation] = useState<AmbientStation | null>(null);

  // Filter 38+ Global Music Platforms
  const filteredMusicPlatforms = useMemo(() => {
    if (selectedMusicCategory === 'All') return ALL_MUSIC_PLATFORMS;
    return ALL_MUSIC_PLATFORMS.filter((p) => p.category === selectedMusicCategory);
  }, [selectedMusicCategory]);

  // Filter Ambient Radio Stations
  const filteredStations = useMemo(() => {
    if (selectedStationCategory === 'All') return AMBIENT_STATIONS;
    return AMBIENT_STATIONS.filter((s) => s.category === selectedStationCategory);
  }, [selectedStationCategory]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = query.trim();
    if (!clean) return;
    setMusicViewTab('omniverse');
    saveHistoryItem('music', 'Global Audio Omniverse', clean);
    soundEngine.playSearchPulse();
  };

  const quickGenres = [
    'Hans Zimmer',
    'A.R. Rahman',
    'Lofi Girl Beats',
    'Daft Punk',
    'Ludovico Einaudi',
    'Interstellar OST',
  ];

  const ambientCategories = [
    'All',
    'Lo-Fi & Study',
    'Cinematic OST',
    'Synthwave',
    'Classical & Piano',
    'Space Ambient',
  ];

  return (
    <div className="relative flex flex-col h-full space-y-5 text-zinc-100">
      {/* 1. Header with Equalizer Visualizer */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-md backdrop-blur-md"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-white tracking-wide">
                Global Music, Hi-Res & Audio Omniverse
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-violet-500/15 text-violet-300 border border-violet-500/30 font-semibold inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                {ALL_MUSIC_PLATFORMS.length}+ Global Platforms
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              1-click deep audio search across Hi-Res FLAC, Indie Direct, 3D Globe Radio, Lyrics, Free Archives & Indian Streaming.
            </p>
          </div>
        </div>

        {/* Animated Equalizer Wave */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-zinc-800 self-start sm:self-auto">
          <Volume2 className="w-3.5 h-3.5 text-violet-400 mr-1" />
          {[40, 75, 55, 90, 60, 80, 45, 95].map((h, i) => (
            <span
              key={i}
              className="w-1 bg-violet-400/80 rounded-full animate-pulse"
              style={{
                height: `${h}%`,
                minHeight: '6px',
                maxHeight: '18px',
                animationDelay: `${i * 120}ms`,
                animationDuration: '900ms',
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* 2. Search Input Bar */}
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        onSubmit={handleSearchSubmit}
        className="relative flex items-center"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.trim()) setMusicViewTab('omniverse');
          }}
          placeholder={`Search any artist, song, soundtrack, or composer across ${ALL_MUSIC_PLATFORMS.length}+ audio platforms...`}
          className="w-full pl-11 pr-28 py-3 text-sm rounded-2xl bg-zinc-900/90 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-violet-400 focus:ring-1 focus:ring-violet-400 transition-all shadow-inner"
        />
        <Search className="w-4 h-4 text-zinc-500 absolute left-4 pointer-events-none" />

        <button
          type="submit"
          disabled={!query.trim()}
          className="absolute right-2 px-4 py-1.5 text-xs font-semibold rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
        >
          <Music2 className="w-3.5 h-3.5 text-violet-600" />
          <span>Dispatch Search</span>
        </button>
      </motion.form>

      {/* Quick Picks */}
      <div className="flex items-center gap-2 text-xs text-zinc-500 flex-wrap">
        <span className="flex items-center gap-1 text-zinc-400">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          Trending Worldwide:
        </span>
        {quickGenres.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => {
              setQuery(g);
              setMusicViewTab('omniverse');
              saveHistoryItem('music', 'Global Audio Omniverse', g);
              soundEngine.playKeyClick();
            }}
            className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all cursor-pointer font-mono"
          >
            {g}
          </button>
        ))}
      </div>

      {/* 3. In-App Live Ambient Player */}
      <AnimatePresence>
        {activeStation && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="p-5 rounded-3xl bg-zinc-950/95 border border-violet-500/40 shadow-[0_20px_80px_rgba(168,85,247,0.25)] space-y-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="font-mono text-xs uppercase tracking-wider text-violet-400 font-bold">
                  Now Playing In-App Live
                </span>
                <span className="text-zinc-600">•</span>
                <span className="font-semibold text-sm text-white">
                  {activeStation.name}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={activeStation.youtubeWatchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 transition-colors"
                >
                  <span>YouTube App</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={activeStation.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 transition-colors"
                >
                  <span>Spotify</span>
                  <Headphones className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={() => setActiveStation(null)}
                  className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Close Player"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Embedded 16:9 Audio/Video Stream */}
            <div className="relative aspect-video max-h-[360px] w-full rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-2xl mx-auto">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeStation.youtubeVideoId}?autoplay=1&rel=0&modestbranding=1`}
                title={activeStation.name}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Quick Station Switcher Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              <span className="text-zinc-500 font-mono text-[11px] shrink-0">Switch:</span>
              {AMBIENT_STATIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playKeyClick();
                    setActiveStation(s);
                  }}
                  className={`px-3 py-1 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    activeStation.id === s.id
                      ? 'bg-violet-500 text-white font-bold shadow-xs'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {s.name.split('-')[0].trim()}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Tab Switcher: Global Audio Omniverse vs Curated Radios */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs">
          <button
            type="button"
            onClick={() => {
              soundEngine.playKeyClick();
              setMusicViewTab('omniverse');
            }}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              musicViewTab === 'omniverse'
                ? 'bg-violet-600 text-white font-bold shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Global Audio Omniverse ({ALL_MUSIC_PLATFORMS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playKeyClick();
              setMusicViewTab('ambient');
            }}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              musicViewTab === 'ambient'
                ? 'bg-violet-600 text-white font-bold shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>24/7 Live Radios & Ambient ({AMBIENT_STATIONS.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          <span>{filteredMusicPlatforms.length} audio services indexed</span>
        </div>
      </div>

      {/* 5. TAB A: Global Audio Omniverse (38+ Platforms) */}
      {musicViewTab === 'omniverse' && (
        <div className="space-y-4">
          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
            {MUSIC_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  soundEngine.playKeyClick();
                  setSelectedMusicCategory(cat);
                }}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  selectedMusicCategory === cat
                    ? 'bg-violet-600 text-white font-bold shadow-xs'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Active Search Banner if Query Present */}
          {query.trim() && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-violet-950/30 border border-violet-500/30 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2">
                <Music2 className="w-4 h-4 text-violet-400 shrink-0" />
                <span className="text-zinc-300">
                  Ready to dispatch deep search for{' '}
                  <span className="text-white font-bold font-mono">"{query.trim()}"</span> across all platforms:
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

          {/* Staggered Omniverse Music Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[580px] overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {filteredMusicPlatforms.map((platform, idx) => (
                <motion.div
                  key={platform.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: idx * 0.02 }}
                  whileHover={{ y: -3 }}
                  className="group flex flex-col justify-between p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-violet-500/50 hover:bg-zinc-850/80 transition-all space-y-3 shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/60 truncate">
                        {platform.category}
                      </span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-violet-950/40 text-violet-300 border border-violet-800/40 font-semibold shrink-0">
                        {platform.badge}
                      </span>
                    </div>

                    <h4 className="font-semibold text-sm text-white group-hover:text-violet-300 transition-colors flex items-center gap-1.5">
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
                      className="flex-1 px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600 text-violet-200 hover:text-white border border-violet-500/30 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
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

      {/* 6. TAB B: Curated 24/7 Live Ambient Radios */}
      {musicViewTab === 'ambient' && (
        <div className="space-y-4">
          {/* Ambient Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {ambientCategories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  soundEngine.playKeyClick();
                  setSelectedStationCategory(c);
                }}
                className={`px-3 py-1 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  selectedStationCategory === c
                    ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40 font-medium'
                    : 'bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[560px] overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {filteredStations.map((station, idx) => (
                <motion.div
                  key={station.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: idx * 0.03 }}
                  className="group flex flex-col justify-between p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-violet-500/50 hover:bg-zinc-850/80 transition-all shadow-md relative overflow-hidden space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-violet-500/10 text-violet-300 border border-violet-500/20">
                        {station.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase bg-red-500/15 text-red-400 border border-red-500/20">
                        {station.badge}
                      </span>
                    </div>

                    <h4 className="font-semibold text-sm text-white group-hover:text-violet-300 transition-colors">
                      {station.name}
                    </h4>
                    <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                      {station.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      type="button"
                      onClick={() => {
                        soundEngine.playKeyClick();
                        setActiveStation(station);
                      }}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Listen In-App ▶</span>
                    </motion.button>

                    <a
                      href={station.youtubeWatchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => soundEngine.playKeyClick()}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      title="Open on YouTube"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <a
                      href={station.spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => soundEngine.playKeyClick()}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-400 hover:text-white transition-colors cursor-pointer"
                      title="Open in Spotify"
                    >
                      <Headphones className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};
