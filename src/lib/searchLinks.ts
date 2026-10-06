/**
 * Clean URL encoder and legitimate discovery search links.
 * All queries are strictly sanitized and encoded with encodeURIComponent.
 * Never includes piracy, torrent, or unauthorized download platforms.
 */

export const encodeQuery = (query: string): string => encodeURIComponent(query.trim());

// 1. Film & Series Discovery Links
export const getFilmSearchLinks = (titleOrQuery: string) => {
  const q = encodeQuery(titleOrQuery);
  return [
    {
      label: 'YouTube (Official Trailers & Clips)',
      url: `https://www.youtube.com/results?search_query=${encodeQuery(titleOrQuery + ' official trailer')}`,
      category: 'Video',
      note: 'Studio trailers, teasers, 4K clips, and interviews',
      badge: 'YouTube',
      isPrimary: true,
    },
    {
      label: 'JustWatch (Where to Stream)',
      url: `https://www.justwatch.com/us/search?q=${q}`,
      category: 'Streaming Guide',
      note: 'Search verified streaming providers in your region',
      badge: 'Aggregator',
    },
    {
      label: 'Internet Archive Cinema',
      url: `https://archive.org/details/moviesandfilms?query=${q}`,
      category: 'Public Domain',
      note: 'Free streaming public domain feature films & classics',
      badge: 'Archive.org',
    },
    {
      label: 'IMDb Database',
      url: `https://www.imdb.com/find/?q=${q}&s=tt`,
      category: 'Database',
      note: 'Full cast, technical specs, user trivia & ratings',
      badge: 'Database',
    },
    {
      label: 'Rotten Tomatoes',
      url: `https://www.rottentomatoes.com/search?search=${q}`,
      category: 'Reviews',
      note: 'Tomatometer score and certified critics',
      badge: 'Critic Score',
    },
    {
      label: 'Google Search',
      url: `https://www.google.com/search?q=${encodeQuery(titleOrQuery + ' movie series cast review')}`,
      category: 'General',
      note: 'Cast, showtimes, critical consensus',
      badge: 'Overview',
    },
    {
      label: 'IMDb',
      url: `https://www.imdb.com/find/?q=${q}&s=tt`,
      category: 'Database',
      note: 'Full cast, technical specs, user trivia',
      badge: 'Database',
    },
    {
      label: 'Rotten Tomatoes',
      url: `https://www.rottentomatoes.com/search?search=${q}`,
      category: 'Reviews',
      note: 'Tomatometer score and certified critics',
      badge: 'Critic Score',
    },
    {
      label: 'Letterboxd',
      url: `https://letterboxd.com/search/films/${q}/`,
      category: 'Community',
      note: 'Cinephile reviews, lists, and ratings',
      badge: 'Film Diary',
    },
  ];
};

// 2. Books & Research Scholarly Links
export const getAcademicSearchLinks = (topicOrTitle: string) => {
  const q = encodeQuery(topicOrTitle);
  return [
    {
      label: 'Google Scholar',
      url: `https://scholar.google.com/scholar?q=${q}`,
      description: 'Peer-reviewed papers, theses, citations, and abstracts',
      badge: 'Scholarly',
    },
    {
      label: 'arXiv Repository',
      url: `https://arxiv.org/search/?query=${q}&searchtype=all&source=header`,
      description: 'Open-access preprints in physics, math, computer science, quantitative biology',
      badge: 'Preprint',
    },
    {
      label: 'Project Gutenberg',
      url: `https://www.gutenberg.org/ebooks/search/?query=${q}`,
      description: 'Over 70,000 free public domain eBooks to read online or download lawfully',
      badge: 'Public Domain',
    },
    {
      label: 'Open Library',
      url: `https://openlibrary.org/search?q=${q}`,
      description: 'Universal editable book catalog and lending library records',
      badge: 'Catalog',
    },
    {
      label: 'PubMed (Biomedical)',
      url: `https://pubmed.ncbi.nlm.nih.gov/?term=${q}`,
      description: 'Biomedical literature, MEDLINE, life science journals',
      badge: 'Medicine',
    },
    {
      label: 'Internet Archive Books',
      url: `https://archive.org/search?query=${q}&and%5B%5D=mediatype%3A%22texts%22`,
      description: 'Digitized historical books, primary documents, and archives',
      badge: 'Archive',
    },
  ];
};

// 3. Music & Soundtrack Discovery Links
export const getMusicSearchLinks = (trackOrArtist: string) => {
  const q = encodeQuery(trackOrArtist);
  return [
    {
      platform: 'YouTube',
      url: `https://www.youtube.com/results?search_query=${q}`,
      color: '#FF0000',
      description: 'Official audio, music videos, live performances',
    },
    {
      platform: 'Spotify',
      url: `https://open.spotify.com/search/${q}`,
      color: '#1DB954',
      description: 'Official studio tracks, artist profile, albums',
    },
    {
      platform: 'YouTube Music',
      url: `https://music.youtube.com/search?q=${q}`,
      color: '#FF0000',
      description: 'Album releases, user mixes, soundtrack cuts',
    },
    {
      platform: 'Apple Music',
      url: `https://music.apple.com/us/search?term=${q}`,
      color: '#FA2D48',
      description: 'Lossless catalog, liner notes, composer credits',
    },
    {
      platform: 'SoundCloud',
      url: `https://soundcloud.com/search?q=${q}`,
      color: '#FF5500',
      description: 'Indie tracks, unofficial remixes, creator uploads',
    },
    {
      platform: 'Bandcamp',
      url: `https://bandcamp.com/search?q=${q}`,
      color: '#629aa9',
      description: 'Independent artists, physical vinyl, direct support',
    },
  ];
};

// 4. Advanced Search Operator Query Generator
export interface OperatorParams {
  topic: string;
  exactPhrase?: string;
  filetype?: string;
  site?: string;
  excludeTerms?: string;
  inTitle?: string;
  publicDomainOnly?: boolean;
}

export const buildSearchOperatorQuery = (params: OperatorParams): string => {
  const parts: string[] = [];

  const main = params.topic.trim();
  if (main) {
    parts.push(main);
  }

  if (params.exactPhrase && params.exactPhrase.trim()) {
    parts.push(`"${params.exactPhrase.trim()}"`);
  }

  if (params.filetype && params.filetype.trim()) {
    parts.push(`filetype:${params.filetype.trim().toLowerCase()}`);
  }

  if (params.site && params.site.trim()) {
    parts.push(`site:${params.site.trim().toLowerCase()}`);
  }

  if (params.inTitle && params.inTitle.trim()) {
    parts.push(`intitle:"${params.inTitle.trim()}"`);
  }

  if (params.excludeTerms && params.excludeTerms.trim()) {
    const rawExcludes = params.excludeTerms.split(/[, ]+/).filter(Boolean);
    rawExcludes.forEach((term) => {
      const clean = term.startsWith('-') ? term : `-${term}`;
      parts.push(clean);
    });
  }

  if (params.publicDomainOnly) {
    parts.push('("public domain" OR "creative commons" OR "open access")');
  }

  return parts.join(' ');
};

export const createGoogleSearchUrl = (query: string): string => {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
};
