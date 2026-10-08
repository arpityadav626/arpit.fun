import type { TmdbMediaItem } from '../../types';

export interface TmdbSearchResponse {
  page: number;
  results: TmdbMediaItem[];
  total_results: number;
  total_pages: number;
}

export async function searchTmdb(query: string, apiKey: string): Promise<TmdbMediaItem[]> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    throw new Error('NO_API_KEY');
  }

  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return [];
  }

  // Support both v3 API keys and v4 Read Access tokens
  const isBearerToken = cleanKey.length > 50 || cleanKey.startsWith('ey');
  const url = isBearerToken
    ? `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(trimmedQuery)}&include_adult=false&language=en-US&page=1`
    : `https://api.themoviedb.org/3/search/multi?api_key=${encodeURIComponent(cleanKey)}&query=${encodeURIComponent(trimmedQuery)}&include_adult=false&language=en-US&page=1`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (isBearerToken) {
    headers.Authorization = `Bearer ${cleanKey}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 401) {
      throw new Error('Invalid TMDb API key or token. Please check your credentials in Settings.');
    }

    if (response.status === 429) {
      throw new Error('TMDb API rate limit exceeded. Please wait a few moments.');
    }

    if (!response.ok) {
      throw new Error(`TMDb API error: HTTP ${response.status} ${response.statusText}`);
    }

    const data: TmdbSearchResponse = await response.json();
    // Filter to movies and tv series only
    return (data.results || []).filter(
      (item) => item.media_type === 'movie' || item.media_type === 'tv'
    );
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new Error('TMDb request timed out. Please check your network connection.');
      }
      throw err;
    }
    throw new Error('An unknown error occurred while contacting TMDb.');
  }
}

export const getTmdbPosterUrl = (
  path: string | null,
  size: 'w342' | 'w500' | 'w780' | 'original' = 'w780'
): string | null => {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};
