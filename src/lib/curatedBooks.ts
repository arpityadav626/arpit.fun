/**
 * Curated 100% Legal Public Domain Classics & Research Masterpieces
 * Direct access to Project Gutenberg and Open Library readers.
 */

export interface CuratedBook {
  id: number;
  title: string;
  author: string;
  year: number;
  category: 'Sci-Fi & Horror' | 'Philosophy' | 'Mystery' | 'Classic Literature' | 'Drama';
  description: string;
  coverUrl: string;
  gutenbergUrl: string;
  readOnlineUrl: string;
  epubUrl: string;
}

export const CURATED_CLASSIC_BOOKS: CuratedBook[] = [
  {
    id: 84,
    title: 'Frankenstein; Or, The Modern Prometheus',
    author: 'Mary Wollstonecraft Shelley',
    year: 1818,
    category: 'Sci-Fi & Horror',
    description: 'The definitive science fiction masterpiece exploring humanity, ambition, and the boundaries of creation.',
    coverUrl: 'https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg',
    gutenbergUrl: 'https://www.gutenberg.org/ebooks/84',
    readOnlineUrl: 'https://www.gutenberg.org/files/84/84-h/84-h.htm',
    epubUrl: 'https://www.gutenberg.org/ebooks/84.epub3.images',
  },
  {
    id: 1342,
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    year: 1813,
    category: 'Classic Literature',
    description: 'A sharp, witty exploration of social manners, perception, and enduring love in Regency England.',
    coverUrl: 'https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg',
    gutenbergUrl: 'https://www.gutenberg.org/ebooks/1342',
    readOnlineUrl: 'https://www.gutenberg.org/files/1342/1342-h/1342-h.htm',
    epubUrl: 'https://www.gutenberg.org/ebooks/1342.epub3.images',
  },
  {
    id: 64317,
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    year: 1925,
    category: 'Classic Literature',
    description: 'An iconic portrait of Jazz Age glamour, obsession, and the haunting mirage of the American dream.',
    coverUrl: 'https://www.gutenberg.org/cache/epub/64317/pg64317.cover.medium.jpg',
    gutenbergUrl: 'https://www.gutenberg.org/ebooks/64317',
    readOnlineUrl: 'https://www.gutenberg.org/files/64317/64317-h/64317-h.htm',
    epubUrl: 'https://www.gutenberg.org/ebooks/64317.epub3.images',
  },
  {
    id: 2680,
    title: 'Meditations',
    author: 'Marcus Aurelius',
    year: 180,
    category: 'Philosophy',
    description: 'Timeless Stoic reflections on duty, inner tranquility, resilience, and living according to nature.',
    coverUrl: 'https://www.gutenberg.org/cache/epub/2680/pg2680.cover.medium.jpg',
    gutenbergUrl: 'https://www.gutenberg.org/ebooks/2680',
    readOnlineUrl: 'https://www.gutenberg.org/files/2680/2680-h/2680-h.htm',
    epubUrl: 'https://www.gutenberg.org/ebooks/2680.epub3.images',
  },
  {
    id: 1661,
    title: 'The Adventures of Sherlock Holmes',
    author: 'Arthur Conan Doyle',
    year: 1892,
    category: 'Mystery',
    description: 'Twelve quintessential investigative puzzles solved through supreme deductive reasoning.',
    coverUrl: 'https://www.gutenberg.org/cache/epub/1661/pg1661.cover.medium.jpg',
    gutenbergUrl: 'https://www.gutenberg.org/ebooks/1661',
    readOnlineUrl: 'https://www.gutenberg.org/files/1661/1661-h/1661-h.htm',
    epubUrl: 'https://www.gutenberg.org/ebooks/1661.epub3.images',
  },
  {
    id: 174,
    title: 'The Picture of Dorian Gray',
    author: 'Oscar Wilde',
    year: 1890,
    category: 'Drama',
    description: 'A Gothic philosophical tale of aestheticism, moral decay, and the consequences of eternal youth.',
    coverUrl: 'https://www.gutenberg.org/cache/epub/174/pg174.cover.medium.jpg',
    gutenbergUrl: 'https://www.gutenberg.org/ebooks/174',
    readOnlineUrl: 'https://www.gutenberg.org/files/174/174-h/174-h.htm',
    epubUrl: 'https://www.gutenberg.org/ebooks/174.epub3.images',
  },
  {
    id: 5200,
    title: 'Metamorphosis',
    author: 'Franz Kafka',
    year: 1915,
    category: 'Drama',
    description: 'Gregor Samsa wakes to find himself transformed into a monstrous insect in this seminal existential allegory.',
    coverUrl: 'https://www.gutenberg.org/cache/epub/5200/pg5200.cover.medium.jpg',
    gutenbergUrl: 'https://www.gutenberg.org/ebooks/5200',
    readOnlineUrl: 'https://www.gutenberg.org/files/5200/5200-h/5200-h.htm',
    epubUrl: 'https://www.gutenberg.org/ebooks/5200.epub3.images',
  },
  {
    id: 345,
    title: 'Dracula',
    author: 'Bram Stoker',
    year: 1897,
    category: 'Sci-Fi & Horror',
    description: 'The foundational vampire epistolary novel set between the fog of Victorian London and Transylvania.',
    coverUrl: 'https://www.gutenberg.org/cache/epub/345/pg345.cover.medium.jpg',
    gutenbergUrl: 'https://www.gutenberg.org/ebooks/345',
    readOnlineUrl: 'https://www.gutenberg.org/files/345/345-h/345-h.htm',
    epubUrl: 'https://www.gutenberg.org/ebooks/345.epub3.images',
  },
  {
    id: 35,
    title: 'The Time Machine',
    author: 'H. G. Wells',
    year: 1895,
    category: 'Sci-Fi & Horror',
    description: 'The pioneering voyage through four dimensions into Earth’s dying future and the split of humankind.',
    coverUrl: 'https://www.gutenberg.org/cache/epub/35/pg35.cover.medium.jpg',
    gutenbergUrl: 'https://www.gutenberg.org/ebooks/35',
    readOnlineUrl: 'https://www.gutenberg.org/files/35/35-h/35-h.htm',
    epubUrl: 'https://www.gutenberg.org/ebooks/35.epub3.images',
  },
  {
    id: 4363,
    title: 'Beyond Good and Evil',
    author: 'Friedrich Nietzsche',
    year: 1886,
    category: 'Philosophy',
    description: 'A critique of traditional morality, dogmatic philosophy, and the psychology of the will to power.',
    coverUrl: 'https://www.gutenberg.org/cache/epub/4363/pg4363.cover.medium.jpg',
    gutenbergUrl: 'https://www.gutenberg.org/ebooks/4363',
    readOnlineUrl: 'https://www.gutenberg.org/files/4363/4363-h/4363-h.htm',
    epubUrl: 'https://www.gutenberg.org/ebooks/4363.epub3.images',
  },
  {
    id: 11,
    title: "Alice's Adventures in Wonderland",
    author: 'Lewis Carroll',
    year: 1865,
    category: 'Classic Literature',
    description: 'A masterwork of nonsense literature, logical paradoxes, and fantastical subterranean imagination.',
    coverUrl: 'https://www.gutenberg.org/cache/epub/11/pg11.cover.medium.jpg',
    gutenbergUrl: 'https://www.gutenberg.org/ebooks/11',
    readOnlineUrl: 'https://www.gutenberg.org/files/11/11-h/11-h.htm',
    epubUrl: 'https://www.gutenberg.org/ebooks/11.epub3.images',
  },
  {
    id: 2554,
    title: 'Crime and Punishment',
    author: 'Fyodor Dostoevsky',
    year: 1866,
    category: 'Philosophy',
    description: 'Raskolnikov’s psychological torment and moral redemption in the feverish streets of Saint Petersburg.',
    coverUrl: 'https://www.gutenberg.org/cache/epub/2554/pg2554.cover.medium.jpg',
    gutenbergUrl: 'https://www.gutenberg.org/ebooks/2554',
    readOnlineUrl: 'https://www.gutenberg.org/files/2554/2554-h/2554-h.htm',
    epubUrl: 'https://www.gutenberg.org/ebooks/2554.epub3.images',
  },
];
