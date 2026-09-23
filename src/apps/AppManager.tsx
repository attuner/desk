import React, { useState } from 'react';
import { 
  Package, 
  Trash2, 
  Play, 
  Edit3, 
  Download, 
  Upload, 
  ShoppingBag, 
  Check, 
  Search, 
  Layers, 
  AlertCircle,
  ExternalLink,
  Code2
} from 'lucide-react';
import { DesktopApp } from '../types/desktop';
import { APP_STORE_CATALOG } from '../services/defaultApps';
import { AppIconRenderer } from '../components/desktop/AppIconRenderer';
import { ConfirmationModal } from '../components/desktop/ConfirmationModal';

interface AppManagerProps {
  installedApps: DesktopApp[];
  onLaunchApp: (appId: string) => void;
  onInstallApp: (app: DesktopApp) => void;
  onUninstallApp: (appId: string) => void;
  onEditAppInStudio: (app: DesktopApp) => void;
}

export const AppManager: React.FC<AppManagerProps> = ({
  installedApps,
  onLaunchApp,
  onInstallApp,
  onUninstallApp,
  onEditAppInStudio,
}) => {
  const [activeTab, setActiveTab] = useState<'installed' | 'store' | 'import'>('installed');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Confirmation Modal state for uninstallation (workspace safety requirement)
  const [appToUninstall, setAppToUninstall] = useState<DesktopApp | null>(null);

  // Import JSON package state
  const [jsonInput, setJsonInput] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const categories = ['All', 'Productivity', 'Utilities', 'Development', 'Games', 'Media', 'System'];

  const filteredInstalled = installedApps.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || app.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleExportApp = (app: DesktopApp) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(app, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${app.name.toLowerCase().replace(/\s+/g, '-')}.desktopapp.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = () => {
    setImportError(null);
    setImportSuccess(false);

    try {
      const parsed = JSON.parse(jsonInput);
      if (!parsed.name || (!parsed.code && !parsed.id)) {
        throw new Error('Invalid app package: "name" and code/id are required.');
      }

      const importedApp: DesktopApp = {
        id: `custom-app-${Date.now()}`,
        name: parsed.name,
        icon: parsed.icon || 'Code2',
        category: parsed.category || 'Utilities',
        description: parsed.description || 'Imported package',
        code: parsed.code || '',
        defaultWidth: Number(parsed.defaultWidth) || 680,
        defaultHeight: Number(parsed.defaultHeight) || 480,
        resizable: true,
        isCustom: true,
        showOnDesktop: true,
        version: parsed.version || '1.0.0',
        author: parsed.author || 'Imported',
      };

      onInstallApp(importedApp);
      setImportSuccess(true);
      setJsonInput('');
      setTimeout(() => setImportSuccess(false), 4000);
    } catch (err: any) {
      setImportError(err.message || 'Invalid JSON syntax');
    }
  };

  const isAppInstalled = (appId: string) => {
    return installedApps.some((a) => a.id === appId);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none overflow-hidden">
      {/* Top Navbar */}
      <div className="flex items-center justify-between px-5 py-3 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-purple-600/20 text-purple-400 rounded-xl">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">App Center</h2>
            <p className="text-[11px] text-slate-400">Manage, install, and uninstall desktop applications</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('installed')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'installed'
                ? 'bg-purple-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Installed ({installedApps.length})
          </button>
          <button
            onClick={() => setActiveTab('store')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'store'
                ? 'bg-purple-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            App Store ({APP_STORE_CATALOG.length})
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'import'
                ? 'bg-purple-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Import Package
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Search & Category Filter bar (for Installed & Store tabs) */}
        {activeTab !== 'import' && (
          <div className="flex items-center justify-between px-5 py-2.5 bg-slate-900/60 border-b border-slate-800 gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search apps by title or description..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-slate-800 text-white font-medium'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 1: Installed Apps */}
        {activeTab === 'installed' && (
          <div className="flex-1 overflow-y-auto p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredInstalled.map((app) => (
                <div
                  key={app.id}
                  className="flex items-start justify-between p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition shadow-sm group"
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0 mr-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center text-purple-400 shrink-0 shadow-inner">
                      <AppIconRenderer name={app.icon} size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white truncate">{app.name}</h4>
                        {app.isCustom && (
                          <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded font-mono">
                            Custom
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.2 rounded">
                          {app.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {app.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500 font-mono">
                        <span>v{app.version || '1.0.0'}</span>
                        <span>•</span>
                        <span>{app.author || 'System'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      onClick={() => onLaunchApp(app.id)}
                      className="flex items-center justify-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-medium transition shadow"
                    >
                      <Play className="w-3 h-3" /> Launch
                    </button>

                    {app.isCustom && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEditAppInStudio(app)}
                          title="Edit Code in Studio"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleExportApp(app)}
                          title="Export App JSON Package"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setAppToUninstall(app)}
                          title="Uninstall App"
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredInstalled.length === 0 && (
              <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-xs">
                <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                No applications found matching your criteria.
              </div>
            )}
          </div>
        )}

        {/* Tab 2: App Store Catalog */}
        {activeTab === 'store' && (
          <div className="flex-1 overflow-y-auto p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {APP_STORE_CATALOG.map((app) => {
                const installed = isAppInstalled(app.id);
                return (
                  <div
                    key={app.id}
                    className="flex items-start justify-between p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-purple-500/40 transition shadow-sm"
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0 mr-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                        <AppIconRenderer name={app.icon} size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white truncate">{app.name}</h4>
                          <span className="text-[10px] text-purple-300 bg-purple-500/20 px-1.5 py-0.2 rounded">
                            {app.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {app.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500 font-mono">
                          <span>v{app.version}</span>
                          <span>•</span>
                          <span>{app.author}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col gap-1.5">
                      {installed ? (
                        <div className="flex items-center gap-1.5">
                          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                            <Check className="w-3 h-3" /> Installed
                          </span>
                          <button
                            onClick={() => onLaunchApp(app.id)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs"
                          >
                            Open
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            onInstallApp({
                              ...app,
                              isCustom: true,
                              showOnDesktop: true,
                              createdAt: new Date().toISOString(),
                            });
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow transition active:scale-95"
                        >
                          <Download className="w-3.5 h-3.5" /> Get App
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Import Package */}
        {activeTab === 'import' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full space-y-4">
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Upload className="w-4 h-4 text-purple-400" />
                Install from JSON Package
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Paste raw application package JSON or export data from another WebDesktop instance to install it directly to your system.
              </p>

              {importError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {importError}
                </div>
              )}

              {importSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  Application installed successfully! Check the Installed tab or your desktop.
                </div>
              )}

              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='Paste {"name": "My App", "code": "...", "icon": "Gamepad2"} here...'
                rows={8}
                className="w-full p-3 bg-slate-950 font-mono text-xs text-purple-200 border border-slate-800 rounded-xl outline-none focus:border-purple-500 resize-none"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setJsonInput('')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
                >
                  Clear
                </button>
                <button
                  onClick={handleImportJson}
                  disabled={!jsonInput.trim()}
                  className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow transition"
                >
                  <Download className="w-4 h-4" /> Install Application
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Uninstallation Confirmation Dialog (Workspace safety compliance) */}
      <ConfirmationModal
        isOpen={appToUninstall !== null}
        title="Uninstall Application"
        message={`Are you sure you want to uninstall "${appToUninstall?.name}" from your desktop? This will remove its shortcut, files, and settings.`}
        confirmLabel="Uninstall App"
        confirmVariant="danger"
        onConfirm={() => {
          if (appToUninstall) {
            onUninstallApp(appToUninstall.id);
            setAppToUninstall(null);
          }
        }}
        onCancel={() => setAppToUninstall(null)}
      />
    </div>
  );
};
