import type { SearchHistoryItem, ToolId } from '../types';

const HISTORY_STORAGE_KEY = 'webhub_search_history_v1';
const MAX_HISTORY_ITEMS = 40;

export function getStoredHistory(): SearchHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.slice(0, MAX_HISTORY_ITEMS);
    }
    return [];
  } catch {
    return [];
  }
}

export function saveHistoryItem(toolId: ToolId, toolName: string, query: string): SearchHistoryItem[] {
  const trimmed = query.trim();
  if (!trimmed) return getStoredHistory();

  const current = getStoredHistory();
  // Filter out immediate identical duplicate for the same tool to avoid clutter
  const filtered = current.filter(
    (item) => !(item.toolId === toolId && item.query.toLowerCase() === trimmed.toLowerCase())
  );

  const newItem: SearchHistoryItem = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    toolId,
    toolName,
    query: trimmed,
    timestamp: Date.now(),
  };

  const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);

  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Could not save search history to localStorage:', e);
  }

  // Dispatch custom storage event for in-tab reactivity
  window.dispatchEvent(new CustomEvent('webhub:history_updated', { detail: updated }));
  return updated;
}

export function removeHistoryItem(id: string): SearchHistoryItem[] {
  const current = getStoredHistory();
  const updated = current.filter((item) => item.id !== id);

  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Could not remove history item:', e);
  }

  window.dispatchEvent(new CustomEvent('webhub:history_updated', { detail: updated }));
  return updated;
}

export function clearAllHistory(): void {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear history:', e);
  }

  window.dispatchEvent(new CustomEvent('webhub:history_updated', { detail: [] }));
}

export function formatRelativeTime(ts: number, referenceNow: number = Date.now()): string {
  const diffSec = Math.floor((referenceNow - ts) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

