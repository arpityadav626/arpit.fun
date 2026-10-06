import type { ToolDefinition } from '../types';

const CATALOG_STORAGE_KEY = 'webhub_tool_catalog_v2';

export const BUILT_IN_TOOLS: ToolDefinition[] = [
  {
    id: 'film',
    name: 'Cinema & YouTube Hub',
    tagline: 'Official 4K trailers, public domain full movies & verified streaming',
    category: 'Media',
    description: 'Search movies and TV series with verified YouTube 4K trailers, public domain feature films, and JustWatch streaming availability.',
    badge: 'YouTube & Cinema',
    isBuiltIn: true,
    enabled: true,
    order: 0,
  },
  {
    id: 'books',
    name: 'Books & Research Finder',
    tagline: 'Project Gutenberg free classics, Open Library & EPUB downloads',
    category: 'Research',
    description: 'Explore curated public domain masterworks, Project Gutenberg free readers, and Open Library universal catalogs.',
    badge: 'Gutenberg & Open Library',
    isBuiltIn: true,
    enabled: true,
    order: 1,
  },
  {
    id: 'music',
    name: 'Soundtracks & Ambient Audio',
    tagline: '24/7 Lo-Fi stations, Hans Zimmer cinema OSTs & multi-platform music search',
    category: 'Media',
    description: 'Stream live 24/7 ambient radio stations and dispatch soundtrack queries directly across YouTube, Spotify, and SoundCloud.',
    badge: 'YouTube & Spotify',
    isBuiltIn: true,
    enabled: true,
    order: 2,
  },
  {
    id: 'ai',
    name: 'AI Summarizer & Synthesis',
    tagline: 'Executive briefs, key takeaways & plain-language explanations with Gemini/Groq',
    category: 'Intelligence',
    description: 'Synthesize research papers, articles, and complex ideas into executive briefs and actionable takeaways with local offline fallback.',
    badge: 'Generative AI',
    isBuiltIn: true,
    enabled: true,
    order: 3,
  },
  {
    id: 'operators',
    name: 'Search Operator & Research Studio',
    tagline: 'Surgical boolean dorks, academic PDF extractors & site scrapers',
    category: 'Discovery',
    description: 'Generate surgical Google & DuckDuckGo boolean queries for academic PDFs, public domain literature, and technical repositories.',
    badge: 'Boolean & Research',
    isBuiltIn: true,
    enabled: true,
    order: 4,
  },
];

export function getToolCatalog(): ToolDefinition[] {
  try {
    const raw = localStorage.getItem(CATALOG_STORAGE_KEY);
    if (!raw) return [...BUILT_IN_TOOLS];

    const saved: ToolDefinition[] = JSON.parse(raw);
    if (!Array.isArray(saved) || saved.length === 0) {
      return [...BUILT_IN_TOOLS];
    }

    // Ensure built-in tools exist and are merged with any user customizations (order, enabled)
    const result: ToolDefinition[] = [];
    const savedMap = new Map(saved.map((t) => [t.id, t]));

    // First process built-in tools with saved state if available
    for (const def of BUILT_IN_TOOLS) {
      const existing = savedMap.get(def.id);
      if (existing) {
        result.push({
          ...def,
          enabled: existing.enabled !== undefined ? existing.enabled : def.enabled,
          order: existing.order !== undefined ? existing.order : def.order,
        });
        savedMap.delete(def.id);
      } else {
        result.push({ ...def });
      }
    }

    // Add remaining custom tools
    for (const custom of savedMap.values()) {
      if (!custom.isBuiltIn) {
        result.push(custom);
      }
    }

    return result.sort((a, b) => a.order - b.order);
  } catch (err) {
    console.warn('Could not read tool catalog from storage, using defaults:', err);
    return [...BUILT_IN_TOOLS];
  }
}

function persistCatalog(catalog: ToolDefinition[]): void {
  try {
    localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(catalog));
  } catch (err) {
    console.warn('Could not save tool catalog to localStorage:', err);
  }
  window.dispatchEvent(new CustomEvent('webhub:catalog_updated', { detail: catalog }));
}

export interface NewCustomToolInput {
  name: string;
  tagline: string;
  category: string;
  inputLabel: string;
  promptTemplate: string;
}

export function addCustomTool(input: NewCustomToolInput): ToolDefinition {
  const name = input.name.trim();
  const tagline = input.tagline.trim();
  const category = input.category.trim() || 'Custom';
  const inputLabel = input.inputLabel.trim() || 'Input Text';
  const promptTemplate = input.promptTemplate.trim();

  if (!name) throw new Error('Tool Name is required.');
  if (!tagline) throw new Error('Tool Purpose / Tagline is required.');
  if (!promptTemplate) throw new Error('Instruction Prompt is required.');

  const current = getToolCatalog();
  const newTool: ToolDefinition = {
    id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name,
    tagline,
    category,
    description: tagline,
    badge: 'Custom AI',
    isBuiltIn: false,
    enabled: true,
    inputLabel,
    promptTemplate,
    order: current.length,
  };

  const updated = [...current, newTool];
  persistCatalog(updated);
  return newTool;
}

export function updateTool(id: string, updates: Partial<ToolDefinition>): ToolDefinition[] {
  const current = getToolCatalog();
  const updated = current.map((tool) => {
    if (tool.id !== id) return tool;
    return {
      ...tool,
      ...updates,
      // Built-in status cannot be changed
      isBuiltIn: tool.isBuiltIn,
    };
  });
  persistCatalog(updated);
  return updated;
}

export function toggleToolEnabled(id: string): ToolDefinition[] {
  const current = getToolCatalog();
  const updated = current.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t));
  persistCatalog(updated);
  return updated;
}

export function removeCustomTool(id: string): ToolDefinition[] {
  const current = getToolCatalog();
  const target = current.find((t) => t.id === id);
  if (target?.isBuiltIn) {
    throw new Error('Core built-in tools cannot be removed, but they can be disabled.');
  }

  const updated = current.filter((t) => t.id !== id).map((t, idx) => ({ ...t, order: idx }));
  persistCatalog(updated);
  return updated;
}

export function reorderCatalog(orderedIds: string[]): ToolDefinition[] {
  const current = getToolCatalog();
  const map = new Map(current.map((t) => [t.id, t]));
  const reordered: ToolDefinition[] = [];

  orderedIds.forEach((id, idx) => {
    const item = map.get(id);
    if (item) {
      reordered.push({ ...item, order: idx });
      map.delete(id);
    }
  });

  // Append any leftover
  map.forEach((item) => {
    reordered.push({ ...item, order: reordered.length });
  });

  persistCatalog(reordered);
  return reordered;
}

export function resetCatalogToDefaults(): ToolDefinition[] {
  try {
    localStorage.removeItem(CATALOG_STORAGE_KEY);
  } catch {
    // Ignore
  }
  const defaults = [...BUILT_IN_TOOLS];
  persistCatalog(defaults);
  return defaults;
}
