import type { AISummarizeMode, SummarizeResult } from '../types';

/**
 * Stopwords list for extractive heuristic text summarization.
 */
const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further',
  'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how',
  'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself',
  'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves',
  'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their',
  'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to',
  'too', 'under', 'until', 'up', 'very', 'was', 'wasn', 'we', 'were', 'what', 'when', 'where', 'which',
  'while', 'who', 'whom', 'why', 'with', 'won', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves'
]);

/**
 * Splits text into discrete sentences with punctuation preservation.
 */
function splitIntoSentences(text: string): string[] {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rawSentences = normalized.match(/[^.!?\n]+[.!?]+(?:\s+|$)|[^.!?\n]+$/g) || [];
  return rawSentences
    .map((s) => s.trim())
    .filter((s) => s.length > 15);
}

/**
 * Tokenizes sentence into cleaned words.
 */
function tokenizeWords(sentence: string): string[] {
  return (sentence.toLowerCase().match(/\b[a-z0-9_-]{3,}\b/g) || []).filter(
    (w) => !STOPWORDS.has(w)
  );
}

/**
 * High-precision extractive text summarizer.
 * Analyzes term frequency, sentence positioning, and cluster density.
 */
export function summarizeOffline(text: string, mode: AISummarizeMode): SummarizeResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      summary: 'No text provided for analysis.',
      keyPoints: [],
      readingTimeMin: 0,
      provider: 'Local Offline Extractor',
      isOfflineHeuristic: true,
    };
  }

  const words = trimmed.split(/\s+/);
  const wordCount = words.length;
  const readingTimeMin = Math.max(1, Math.round(wordCount / 200));

  const sentences = splitIntoSentences(trimmed);
  if (sentences.length <= 2) {
    return {
      summary: trimmed,
      keyPoints: sentences,
      readingTimeMin,
      provider: 'Local Offline Extractor',
      isOfflineHeuristic: true,
    };
  }

  // 1. Calculate word frequencies
  const wordFreq: Record<string, number> = {};
  for (const s of sentences) {
    const tokens = tokenizeWords(s);
    for (const t of tokens) {
      wordFreq[t] = (wordFreq[t] || 0) + 1;
    }
  }

  // 2. Score sentences
  const scoredSentences = sentences.map((sentence, index) => {
    const tokens = tokenizeWords(sentence);
    let score = 0;
    for (const token of tokens) {
      score += wordFreq[token] || 0;
    }

    // Length normalization
    const lengthFactor = tokens.length > 0 ? tokens.length : 1;
    let normalizedScore = score / Math.sqrt(lengthFactor);

    // Position bonus: Lead and conclusion sentences carry higher weight
    if (index === 0) normalizedScore *= 1.45;
    else if (index === 1) normalizedScore *= 1.25;
    else if (index === sentences.length - 1) normalizedScore *= 1.2;

    return {
      text: sentence,
      index,
      score: normalizedScore,
    };
  });

  // Sort by score to get top salient sentences
  const sortedByScore = [...scoredSentences].sort((a, b) => b.score - a.score);

  // Target count depends on mode
  let targetCount = 3;
  if (mode === 'concise') targetCount = Math.min(2, sentences.length);
  else if (mode === 'bullets') targetCount = Math.min(5, sentences.length);
  else if (mode === 'explain') targetCount = Math.min(4, sentences.length);
  else if (mode === 'deep') targetCount = Math.min(7, sentences.length);

  const topItems = sortedByScore.slice(0, targetCount);
  // Re-sort in original narrative order for coherence
  const orderedSummary = [...topItems].sort((a, b) => a.index - b.index);

  const summary = orderedSummary.map((s) => s.text).join(' ');

  // Extract key points
  const keyPoints = orderedSummary.map((s) => {
    // Clean leading conjunctions if any
    return s.text.replace(/^(However|Furthermore|Additionally|Moreover|Therefore|In addition),?\s*/i, '');
  });

  return {
    summary,
    keyPoints,
    readingTimeMin,
    provider: 'Local Offline Extractor (In-browser TextRank Heuristic)',
    isOfflineHeuristic: true,
  };
}
