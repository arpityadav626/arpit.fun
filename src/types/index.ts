export type BuiltInToolId = 'film' | 'books' | 'music' | 'ai' | 'operators';
export type ToolId = BuiltInToolId | string;

export interface ToolDefinition {
  id: string;
  name: string;
  tagline: string;
  category: string;
  description: string;
  badge: string;
  isBuiltIn: boolean;
  enabled: boolean;
  requiresKey?: boolean;
  inputLabel?: string;
  promptTemplate?: string;
  order: number;
}

export interface SearchHistoryItem {
  id: string;
  toolId: ToolId;
  toolName: string;
  query: string;
  timestamp: number;
}

export type AIProvider = 'gemini' | 'groq' | 'offline';

export interface AppSettings {
  tmdbApiKey: string;
  aiApiKey: string;
  aiProvider: 'gemini' | 'groq';
  persistKeys: boolean;
  ambientSound: boolean;
  reducedMotion: boolean;
}

export interface TmdbMediaItem {
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
}

export interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  edition_count?: number;
  cover_i?: number;
  isbn?: string[];
  subject?: string[];
}

export interface GutendexBook {
  id: number;
  title: string;
  authors: Array<{ name: string; birth_year?: number; death_year?: number }>;
  subjects: string[];
  languages: string[];
  download_count: number;
  formats: {
    'text/html'?: string;
    'application/epub+zip'?: string;
    'text/plain; charset=us-ascii'?: string;
    'text/plain; charset=utf-8'?: string;
    'image/jpeg'?: string;
  };
}

export type AISummarizeMode = 'concise' | 'bullets' | 'explain' | 'deep';

export interface SummarizeResult {
  summary: string;
  keyPoints?: string[];
  readingTimeMin: number;
  provider: string;
  isOfflineHeuristic: boolean;
}
