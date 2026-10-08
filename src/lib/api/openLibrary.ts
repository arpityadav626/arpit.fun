import type { OpenLibraryDoc } from '../../types';

export interface OpenLibrarySearchResponse {
  numFound: number;
  start: number;
  docs: OpenLibraryDoc[];
}

export async function searchOpenLibrary(query: string): Promise<OpenLibraryDoc[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(
    trimmed
  )}&limit=12&fields=key,title,author_name,first_publish_year,edition_count,cover_i,isbn,subject`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Open Library error: HTTP ${response.status}`);
    }

    const data: OpenLibrarySearchResponse = await response.json();
    return data.docs || [];
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new Error('Open Library search request timed out. Please retry.');
      }
      throw err;
    }
    throw new Error('Failed to fetch from Open Library.');
  }
}

export const getOpenLibraryCoverUrl = (coverId?: number): string | null => {
  if (!coverId || coverId <= 0) return null;
  return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
};
