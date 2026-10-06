import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { BackgroundCanvas } from './components/BackgroundCanvas';
import { ThreeCardsSpiral } from './components/ThreeCardsSpiral';
import { EditorialListView } from './components/EditorialListView';
import { CleanMinimalOverlay } from './components/CleanMinimalOverlay';
import { ToolFocusModal } from './components/ToolFocusModal';
import { AddToolModal } from './components/AddToolModal';
import { ToolCatalogManager } from './components/ToolCatalogManager';
import { CommandPalette } from './components/CommandPalette';
import { SearchHistoryDrawer } from './components/SearchHistoryDrawer';
import { SettingsModal } from './components/SettingsModal';
import { Toast } from './components/Toast';
import { getToolCatalog, removeCustomTool } from './lib/toolCatalog';
import type { ToolDefinition } from './types';

const WebHubExperience: React.FC = () => {
  const {
    activeTool,
    setActiveTool,
    addToolModalOpen,
    setAddToolModalOpen,
    manageModalOpen,
    setManageModalOpen,
    showToast,
  } = useSettings();

  const [catalog, setCatalog] = useState<ToolDefinition[]>(() => getToolCatalog());
  const [currentView, setCurrentView] = useState<'spiral' | 'list'>('spiral');
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [focusedTool, setFocusedTool] = useState<ToolDefinition | null>(null);
  const [toolToEdit, setToolToEdit] = useState<ToolDefinition | null>(null);

  // Sync catalog updates
  useEffect(() => {
    const handleUpdate = () => {
      setCatalog(getToolCatalog());
    };
    window.addEventListener('webhub:catalog_updated', handleUpdate);
    return () => window.removeEventListener('webhub:catalog_updated', handleUpdate);
  }, []);

  const handleSelectTool = (tool: ToolDefinition) => {
    setActiveTool(tool.id);
    setFocusedTool(tool);
    setIsFocusModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setToolToEdit(null);
    setAddToolModalOpen(true);
  };

  const handleEditTool = (tool: ToolDefinition) => {
    setToolToEdit(tool);
    setAddToolModalOpen(true);
  };

  const handleDeleteTool = (tool: ToolDefinition) => {
    if (window.confirm(`Delete custom AI tool "${tool.name}"?`)) {
      try {
        removeCustomTool(tool.id);
        showToast(`Removed "${tool.name}" from catalog and spiral`);
        if (focusedTool?.id === tool.id) {
          setIsFocusModalOpen(false);
        }
      } catch (err: unknown) {
        if (err instanceof Error) alert(err.message);
      }
    }
  };

  return (
    <div className="relative w-screen h-screen min-h-screen bg-[#070709] text-zinc-100 overflow-hidden font-sans select-none">
      {/* Background Subtle Grid Texture */}
      <BackgroundCanvas />

      {/* Main Full-Screen 3D Spiral or List Experience */}
      <main className="relative w-full h-full z-10 flex items-center justify-center">
        {currentView === 'spiral' ? (
          <ThreeCardsSpiral onSelectTool={handleSelectTool} />
        ) : (
          <EditorialListView catalog={catalog} onSelectTool={handleSelectTool} />
        )}
      </main>

      {/* Ultra-Clean pacomepertant-style 4-corner Minimalist Overlay */}
      <CleanMinimalOverlay
        currentView={currentView}
        onViewChange={setCurrentView}
        catalog={catalog}
        onSelectTool={handleSelectTool}
      />

      {/* Interactive Tool Focus Modal */}
      <ToolFocusModal
        isOpen={isFocusModalOpen}
        onClose={() => setIsFocusModalOpen(false)}
        tool={focusedTool || catalog.find((t) => t.id === activeTool) || catalog[0]}
        allTools={catalog}
        onSelectTool={(t) => {
          setActiveTool(t.id);
          setFocusedTool(t);
        }}
        onOpenAddModal={handleOpenAddModal}
        onOpenManageModal={() => setManageModalOpen(true)}
        onEditCustomTool={handleEditTool}
        onDeleteCustomTool={handleDeleteTool}
      />

      {/* Add Custom AI Tool Modal */}
      <AddToolModal
        isOpen={addToolModalOpen}
        onClose={() => setAddToolModalOpen(false)}
        toolToEdit={toolToEdit}
      />

      {/* Tool Catalog Manager Modal */}
      <ToolCatalogManager
        isOpen={manageModalOpen}
        onClose={() => setManageModalOpen(false)}
        onOpenAddModal={handleOpenAddModal}
        onEditTool={handleEditTool}
      />

      {/* Global Command Palette (⌘K) */}
      <CommandPalette />

      {/* Search History Drawer */}
      <SearchHistoryDrawer />

      {/* API Settings Modal */}
      <SettingsModal />

      {/* Toast Notification Layer */}
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <WebHubExperience />
      </SettingsProvider>
    </ThemeProvider>
  );
}
