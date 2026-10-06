import type { AISummarizeMode, SummarizeResult } from '../../types';
import { summarizeOffline } from '../offlineSummarizer';

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
    finishReason?: string;
  }>;
  error?: {
    code: number;
    message: string;
    status: string;
  };
}

interface GroqResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message: string;
    type?: string;
  };
}

const buildPromptForMode = (text: string, mode: AISummarizeMode): string => {
  switch (mode) {
    case 'concise':
      return `Analyze the following text and provide a concise 2-3 sentence executive summary. Follow it with 3 distinct bullet points highlighting key facts.\n\nText to analyze:\n"""\n${text}\n"""`;
    case 'bullets':
      return `Extract 5 to 7 high-impact, actionable bullet points summarizing the core findings and arguments in the following text. Format each bullet starting with "- ".\n\nText to analyze:\n"""\n${text}\n"""`;
    case 'explain':
      return `Explain the following text in plain, intuitive language that anyone can understand without technical jargon. Highlight why it matters.\n\nText to analyze:\n"""\n${text}\n"""`;
    case 'deep':
      return `Provide an editorial analysis of the following text: 1. Central Thesis, 2. Key Evidence/Points, 3. Practical Implications.\n\nText to analyze:\n"""\n${text}\n"""`;
  }
};

/**
 * Call Google Gemini API (gemini-2.5-flash or gemini-1.5-flash) directly from the browser.
 */
async function callGemini(text: string, mode: AISummarizeMode, apiKey: string): Promise<SummarizeResult> {
  const prompt = buildPromptForMode(text, mode);
  const model = 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data: GeminiResponse = await res.json();

    if (!res.ok || data.error) {
      const msg = data.error?.message || `HTTP ${res.status}`;
      if (res.status === 400 && msg.includes('API_KEY_INVALID')) {
        throw new Error('Invalid Gemini API key. Please verify your Google AI Studio key.');
      }
      if (res.status === 429) {
        throw new Error('Gemini API quota exceeded or rate limited. Please try again shortly.');
      }
      throw new Error(`Gemini API Error: ${msg}`);
    }

    const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!outputText) {
      throw new Error('Gemini returned an empty response. Try simplifying the text.');
    }

    return parseAiOutput(outputText, 'Google Gemini (gemini-1.5-flash)', text);
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new Error('Gemini request timed out after 15 seconds.');
      }
      throw err;
    }
    throw new Error('Unknown error while calling Gemini API.');
  }
}

/**
 * Call Groq Cloud API directly from the browser.
 */
async function callGroq(text: string, mode: AISummarizeMode, apiKey: string): Promise<SummarizeResult> {
  const prompt = buildPromptForMode(text, mode);
  const url = 'https://api.groq.com/openai/v1/chat/completions';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are an objective editorial summarizer and research analyst. Provide clear, concise, accurate summaries.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 1024,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data: GroqResponse = await res.json();

    if (!res.ok || data.error) {
      const msg = data.error?.message || `HTTP ${res.status}`;
      if (res.status === 401) {
        throw new Error('Invalid Groq API key. Please check your credentials in Settings.');
      }
      if (res.status === 429) {
        throw new Error('Groq rate limit exceeded. Please wait a moment.');
      }
      throw new Error(`Groq API Error: ${msg}`);
    }

    const outputText = data.choices?.[0]?.message?.content || '';
    if (!outputText) {
      throw new Error('Groq returned an empty response.');
    }

    return parseAiOutput(outputText, 'Groq (Llama 3.3 70B)', text);
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new Error('Groq request timed out after 15 seconds.');
      }
      throw err;
    }
    throw new Error('Unknown error while calling Groq API.');
  }
}

function parseAiOutput(output: string, providerName: string, originalText: string): SummarizeResult {
  const lines = output.split('\n').map((l) => l.trim()).filter(Boolean);
  const bullets: string[] = [];

  for (const line of lines) {
    if (line.startsWith('- ') || line.startsWith('• ') || line.startsWith('* ') || /^\d+\.\s/.test(line)) {
      bullets.push(line.replace(/^[-•*]\s+|\d+\.\s+/, ''));
    }
  }

  const wordCount = originalText.trim().split(/\s+/).length;
  const readingTimeMin = Math.max(1, Math.round(wordCount / 200));

  return {
    summary: output,
    keyPoints: bullets.length > 0 ? bullets : undefined,
    readingTimeMin,
    provider: providerName,
    isOfflineHeuristic: false,
  };
}

/**
 * Unified Summarization Dispatcher:
 * Uses configured provider when key is provided, otherwise falls back to the in-browser
 * extractive algorithm with full transparency.
 */
export async function summarizeText(
  text: string,
  mode: AISummarizeMode,
  apiKey: string,
  provider: 'gemini' | 'groq'
): Promise<SummarizeResult> {
  const cleanKey = apiKey.trim();

  // If no user API key is provided, use our built-in offline token ranker
  if (!cleanKey) {
    return summarizeOffline(text, mode);
  }

  if (provider === 'gemini') {
    return callGemini(text, mode, cleanKey);
  } else {
    return callGroq(text, mode, cleanKey);
  }
}

export interface CustomPromptExecutionResult {
  output: string;
  provider: string;
  isAvailable: boolean;
}

/**
 * Executes a user-defined prompt tool using the real connected cloud AI provider.
 * If no key is configured, honestly reports unavailable state.
 */
export async function executeCustomPromptTool(
  promptTemplate: string,
  userInput: string,
  apiKey: string,
  provider: 'gemini' | 'groq'
): Promise<CustomPromptExecutionResult> {
  const cleanKey = apiKey.trim();
  const cleanInput = userInput.trim();

  if (!cleanKey) {
    return {
      output:
        'A connected cloud AI provider is required to execute custom generative prompt tools. Please open Settings and enter a free Google Gemini or Groq API key.',
      provider: 'No Provider Connected',
      isAvailable: false,
    };
  }

  const combinedPrompt = `${promptTemplate.trim()}\n\nUser input to process:\n"""\n${cleanInput}\n"""`;

  if (provider === 'gemini') {
    const model = 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(cleanKey)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: combinedPrompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1500 },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data: GeminiResponse = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error?.message || `HTTP ${res.status}`);
      }
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return {
        output: text,
        provider: 'Google Gemini (gemini-1.5-flash)',
        isAvailable: true,
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof Error) throw err;
      throw new Error('Failed to execute custom prompt with Gemini.');
    }
  } else {
    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cleanKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: promptTemplate.trim() },
            { role: 'user', content: cleanInput },
          ],
          temperature: 0.3,
          max_tokens: 1500,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data: GroqResponse = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error?.message || `HTTP ${res.status}`);
      }
      const text = data.choices?.[0]?.message?.content || '';
      return {
        output: text,
        provider: 'Groq Cloud (llama-3.3-70b)',
        isAvailable: true,
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof Error) throw err;
      throw new Error('Failed to execute custom prompt with Groq.');
    }
  }
}

