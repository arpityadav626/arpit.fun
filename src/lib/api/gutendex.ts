import type { GutendexBook } from '../../types';

export interface GutendexResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GutendexBook[];
}

export async function searchGutendex(query: string): Promise<GutendexBook[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const url = `https://gutendex.com/books/?search=${encodeURIComponent(trimmed)}`;

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
      throw new Error(`Gutendex error: HTTP ${response.status}`);
    }

    const data: GutendexResponse = await response.json();
    return data.results.slice(0, 10);
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new Error('Project Gutenberg search timed out.');
      }
      throw err;
    }
    throw new Error('Failed to reach Project Gutenberg catalog.');
  }
}
