/**
 * Curated Legal Cinema, YouTube Streaming & Media Catalog
 * 100% legal, high-definition official releases, YouTube cinema & public domain archives.
 */

export interface CinemaMediaItem {
  id: string;
  title: string;
  year: string;
  director?: string;
  category: 'Sci-Fi' | 'Drama' | 'Action' | 'Classic' | 'Documentary' | 'Animation';
  rating: number;
  quality: string;
  badge: string;
  youtubeVideoId: string;
  youtubeUrl: string;
  freeWatchUrl?: string;
  freePlatform?: string;
  description: string;
  duration?: string;
}

export const VERIFIED_CINEMA_MEDIA: CinemaMediaItem[] = [
  {
    id: 'interstellar-2014',
    title: 'Interstellar (IMAX Edition)',
    year: '2014',
    director: 'Christopher Nolan',
    category: 'Sci-Fi',
    rating: 8.7,
    quality: '4K Ultra HD',
    badge: 'Official IMAX Trailer',
    youtubeVideoId: 'zSWdZVtXT7E',
    youtubeUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    freeWatchUrl: 'https://www.justwatch.com/us/movie/interstellar',
    freePlatform: 'JustWatch Stream Guide',
    description: 'When Earth faces ecological collapse, a team of explorers undertakes the most important mission in human history: traveling beyond our galaxy.',
    duration: '2h 49m',
  },
  {
    id: 'dune-part-two-2024',
    title: 'Dune: Part Two',
    year: '2024',
    director: 'Denis Villeneuve',
    category: 'Sci-Fi',
    rating: 8.6,
    quality: '4K HDR',
    badge: 'Official WB Trailer',
    youtubeVideoId: 'Way9Dexny3w',
    youtubeUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    freeWatchUrl: 'https://www.justwatch.com/us/movie/dune-part-two',
    freePlatform: 'Where to Watch',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    duration: '2h 46m',
  },
  {
    id: 'oppenheimer-2023',
    title: 'Oppenheimer',
    year: '2023',
    director: 'Christopher Nolan',
    category: 'Drama',
    rating: 8.9,
    quality: '4K UHD',
    badge: 'Universal Official Trailer',
    youtubeVideoId: 'uYPbbksJxIg',
    youtubeUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    freeWatchUrl: 'https://www.justwatch.com/us/movie/oppenheimer',
    freePlatform: 'Streaming Guide',
    description: 'The story of J. Robert Oppenheimer’s role in the development of the atomic bomb during World War II.',
    duration: '3h 00m',
  },
  {
    id: 'spider-man-spiderverse',
    title: 'Across the Spider-Verse',
    year: '2023',
    director: 'Joaquim Dos Santos',
    category: 'Animation',
    rating: 8.7,
    quality: '4K HDR',
    badge: 'Sony Official Trailer',
    youtubeVideoId: 'cqGjhVJWtEg',
    youtubeUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
    freeWatchUrl: 'https://www.justwatch.com/us/movie/spider-man-across-the-spider-verse',
    freePlatform: 'Where to Stream',
    description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
    duration: '2h 20m',
  },
  {
    id: 'the-batman-2022',
    title: 'The Batman',
    year: '2022',
    director: 'Matt Reeves',
    category: 'Action',
    rating: 7.9,
    quality: '4K UHD',
    badge: 'Official 4K Trailer',
    youtubeVideoId: 'mqqft2x_Aa4',
    youtubeUrl: 'https://www.youtube.com/watch?v=mqqft2x_Aa4',
    freeWatchUrl: 'https://www.justwatch.com/us/movie/the-batman',
    freePlatform: 'Streaming Guide',
    description: 'In his second year of fighting crime, Batman uncovers corruption in Gotham City while pursuing the serial killer known as the Riddler.',
    duration: '2h 56m',
  },
  {
    id: 'blade-runner-2049',
    title: 'Blade Runner 2049',
    year: '2017',
    director: 'Denis Villeneuve',
    category: 'Sci-Fi',
    rating: 8.0,
    quality: '4K HDR',
    badge: 'Warner Bros Trailer',
    youtubeVideoId: 'gCcx85zbxz4',
    youtubeUrl: 'https://www.youtube.com/watch?v=gCcx85zbxz4',
    freeWatchUrl: 'https://www.justwatch.com/us/movie/blade-runner-2049',
    freePlatform: 'Where to Watch',
    description: 'Young Blade Runner K unearths a long-buried secret that leads him to track down former Blade Runner Rick Deckard.',
    duration: '2h 44m',
  },
  {
    id: 'night-of-the-living-dead',
    title: 'Night of the Living Dead',
    year: '1968',
    director: 'George A. Romero',
    category: 'Classic',
    rating: 7.8,
    quality: '1080p Remaster',
    badge: 'Free Full Movie (Public Domain)',
    youtubeVideoId: '0vgSj2sWf7Y',
    youtubeUrl: 'https://www.youtube.com/watch?v=0vgSj2sWf7Y',
    freeWatchUrl: 'https://archive.org/details/night_of_the_living_dead',
    freePlatform: 'Archive.org Free Full Movie',
    description: 'A ragtag group of Pennsylvanians barricade themselves in an old farmhouse to remain safe from a horde of flesh-eating ghouls.',
    duration: '1h 36m',
  },
  {
    id: 'cosmos-space-odyssey',
    title: 'Cosmic Journey (Deep Space 4K)',
    year: '2024',
    category: 'Documentary',
    rating: 9.1,
    quality: '4K 60FPS',
    badge: 'Full Free Documentary',
    youtubeVideoId: 'GoW8Tf7ETiM',
    youtubeUrl: 'https://www.youtube.com/watch?v=GoW8Tf7ETiM',
    freeWatchUrl: 'https://www.youtube.com/watch?v=GoW8Tf7ETiM',
    freePlatform: 'Free on YouTube',
    description: 'A breathtaking 4K journey through the solar system, neighboring star systems, and outer boundaries of the observable cosmos.',
    duration: '1h 12m',
  },
  {
    id: 'inception-2010',
    title: 'Inception',
    year: '2010',
    director: 'Christopher Nolan',
    category: 'Sci-Fi',
    rating: 8.8,
    quality: '4K UHD',
    badge: 'WB Official Trailer',
    youtubeVideoId: 'YoHD9XEInc0',
    youtubeUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
    freeWatchUrl: 'https://www.justwatch.com/us/movie/inception',
    freePlatform: 'JustWatch Guide',
    description: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.',
    duration: '2h 28m',
  },
];

export const FREE_STREAMING_PLATFORMS = [
  {
    name: 'YouTube Free Movies',
    description: 'Officially licensed free movies and shows with ads',
    url: 'https://www.youtube.com/feed/storefront?bp=kgECCOgH',
    badge: 'Official YouTube',
  },
  {
    name: 'Internet Archive Cinema',
    description: 'Thousands of historic, classic & public domain feature films',
    url: 'https://archive.org/details/moviesandfilms',
    badge: 'Public Domain',
  },
  {
    name: 'Open Culture Movies',
    description: 'Curated collection of 1,150+ free classic movies online',
    url: 'https://www.openculture.com/freemoviesonline',
    badge: 'Curated Classics',
  },
  {
    name: 'JustWatch Stream Guide',
    description: 'Check verified streaming availability across all providers',
    url: 'https://www.justwatch.com/',
    badge: 'Global Aggregator',
  },
  {
    name: 'IMDb What to Watch',
    description: 'Ratings, cast filmographies, trivia and official teasers',
    url: 'https://www.imdb.com/what-to-watch/',
    badge: 'Database',
  },
];

export const getYouTubeSearchUrl = (query: string): string => {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query.trim() + ' official trailer')}`;
};

export const getArchiveOrgSearchUrl = (query: string): string => {
  return `https://archive.org/details/moviesandfilms?query=${encodeURIComponent(query.trim())}`;
};

export const getJustWatchSearchUrl = (query: string): string => {
  return `https://www.justwatch.com/us/search?q=${encodeURIComponent(query.trim())}`;
};
