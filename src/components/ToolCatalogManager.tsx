import React, { useState, useEffect } from 'react';
import type { ToolDefinition } from '../types';
import {
  getToolCatalog,
  toggleToolEnabled,
  removeCustomTool,
  reorderCatalog,
} from '../lib/toolCatalog';
import { useSettings } from '../context/SettingsContext';
import {
  X,
  Layers,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  Plus,
  Shield,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

interface ToolCatalogManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddModal: () => void;
  onEditTool: (tool: ToolDefinition) => void;
}

export const ToolCatalogManager: React.FC<ToolCatalogManagerProps> = ({
  isOpen,
  onClose,
  onOpenAddModal,
  onEditTool,
}) => {
  const { showToast } = useSettings();
  const [tools, setTools] = useState<ToolDefinition[]>(() => getToolCatalog());

  useEffect(() => {
    const handleUpdate = () => {
      setTools(getToolCatalog());
    };
    window.addEventListener('webhub:catalog_updated', handleUpdate);
    return () => window.removeEventListener('webhub:catalog_updated', handleUpdate);
  }, []);

  if (!isOpen) return null;

  const handleToggle = (id: string, name: string, currentEnabled: boolean) => {
    toggleToolEnabled(id);
    showToast(`${name} ${currentEnabled ? 'disabled' : 'enabled'}`);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete custom tool "${name}"?`)) {
      try {
        removeCustomTool(id);
        showToast(`Removed "${name}" from catalog and spiral`);
      } catch (err: unknown) {
        if (err instanceof Error) alert(err.message);
      }
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= tools.length) return;

    const ids = tools.map((t) => t.id);
    const temp = ids[index];
    ids[index] = ids[targetIndex];
    ids[targetIndex] = temp;

    reorderCatalog(ids);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="manage-catalog-heading"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl p-6 text-zinc-100 flex flex-col space-y-4 max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 id="manage-catalog-heading" className="font-semibold text-base">
                Tool Catalog & Spiral Nodes
              </h3>
              <p className="text-xs text-zinc-400">
                Reorder, enable/disable, and manage tools appearing on the spiral
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAddModal();
              }}
              className="px-2.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-xs transition-colors flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add AI Tool</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List of tools */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 py-1">
          {tools.map((tool, idx) => (
            <div
              key={tool.id}
              className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 text-xs ${
                tool.enabled
                  ? 'bg-zinc-900/70 border-zinc-800'
                  : 'bg-zinc-900/20 border-zinc-900 opacity-60'
              }`}
            >
              {/* Left Info */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    className="p-0.5 text-zinc-500 hover:text-zinc-200 disabled:opacity-20"
                    title="Move up in spiral order"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === tools.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    className="p-0.5 text-zinc-500 hover:text-zinc-200 disabled:opacity-20"
                    title="Move down in spiral order"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-100 truncate">{tool.name}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                        tool.isBuiltIn
                          ? 'bg-zinc-800 text-zinc-400'
                          : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      }`}
                    >
                      {tool.isBuiltIn ? 'Core' : 'Custom'}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      #{idx + 1}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 truncate mt-0.5">{tool.tagline}</p>
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Enable/Disable Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggle(tool.id, tool.name, tool.enabled)}
                  title={tool.enabled ? 'Click to disable tool' : 'Click to enable tool'}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                  {tool.enabled ? (
                    <ToggleRight className="w-5 h-5 text-cyan-400" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-zinc-600" />
                  )}
                </button>

                {/* Edit & Delete for Custom Tools */}
                {!tool.isBuiltIn && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onEditTool(tool);
                      }}
                      title="Edit custom tool"
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(tool.id, tool.name)}
                      title="Delete custom tool"
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}

                {tool.isBuiltIn && (
                  <span
                    title="Core built-in tool"
                    className="p-1.5 text-zinc-600 cursor-default"
                  >
                    <Shield className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-500">
          <span>Changes are saved to browser storage immediately.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 transition-colors font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
