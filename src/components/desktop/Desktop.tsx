import React, { useState, useEffect, useRef } from 'react';
import { 
  DesktopApp, 
  WindowState, 
  DesktopSettings, 
  GoogleUserProfile, 
  SyncState 
} from '../../types/desktop';
import { BUILT_IN_APPS, DEFAULT_WALLPAPERS } from '../../services/defaultApps';
import { 
  getLocalSettings, 
  saveLocalSettings, 
  getLocalCustomApps, 
  saveLocalCustomApps,
  syncWithGoogleSheets,
  fetchFromGoogleSheets
} from '../../services/desktopStorage';
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  isGoogleAuthenticated 
} from '../../services/googleAuth';
import { AppIconRenderer } from './AppIconRenderer';
import { Window } from './Window';
import { Taskbar } from './Taskbar';
import { StartMenu } from './StartMenu';
import { ControlCenter } from './ControlCenter';

// Apps
import { AppStudio } from '../../apps/AppStudio';
import { AppManager } from '../../apps/AppManager';
import { FileExplorer } from '../../apps/FileExplorer';
import { GoogleSheetsViewer } from '../../apps/GoogleSheetsViewer';
import { Notepad } from '../../apps/Notepad';
import { Terminal } from '../../apps/Terminal';
import { Calculator } from '../../apps/Calculator';
import { WebBrowser } from '../../apps/WebBrowser';
import { SystemSettings } from '../../apps/SystemSettings';
import { CustomAppRunner } from '../../apps/CustomAppRunner';

import { 
  FolderPlus, 
  FileCode, 
  Sparkles, 
  RefreshCw, 
  Settings as SettingsIcon, 
  Lock, 
  Unlock 
} from 'lucide-react';

export const Desktop: React.FC = () => {
  // Desktop settings and apps
  const [settings, setSettings] = useState<DesktopSettings>(getLocalSettings);
  const [customApps, setCustomApps] = useState<DesktopApp[]>(getLocalCustomApps);
  const [userProfile, setUserProfile] = useState<GoogleUserProfile | null>(null);
  const [syncState, setSyncState] = useState<SyncState>('idle');

  // Window manager state
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [nextZIndex, setNextZIndex] = useState(10);

  // App studio edit payload
  const [appToEditInStudio, setAppToEditInStudio] = useState<DesktopApp | null>(null);

  // Shell UI states
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [isControlCenterOpen, setIsControlCenterOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [selectedDesktopIcon, setSelectedDesktopIcon] = useState<string | null>(null);

  // Right-click context menu
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  // Combined apps list
  const allApps: DesktopApp[] = [...BUILT_IN_APPS, ...customApps];

  // Initialize auth listener
  useEffect(() => {
    initAuth(
      (user, token) => {
        setUserProfile({
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        });
        // Auto-fetch data from Google Sheets when signed in
        pullFromSheets();
      },
      () => {
        setUserProfile(null);
      }
    );
  }, []);

  // Save settings when changed locally
  const handleUpdateSettings = (partial: Partial<DesktopSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...partial };
      saveLocalSettings(updated);
      return updated;
    });
  };

  // Pull settings and custom apps from Google Sheets
  const pullFromSheets = async () => {
    setSyncState('syncing');
    try {
      const result = await fetchFromGoogleSheets();
      if (result.settings) {
        handleUpdateSettings(result.settings);
      }
      if (result.customApps && result.customApps.length > 0) {
        setCustomApps(result.customApps);
        saveLocalCustomApps(result.customApps);
      }
      setSyncState('synced');
    } catch {
      setSyncState('idle');
    }
  };

  // Sync to Google Sheets
  const handleTriggerSync = async () => {
    setSyncState('syncing');
    const res = await syncWithGoogleSheets(settings, customApps);
    if (res.success) {
      setSyncState('synced');
      handleUpdateSettings({ lastSyncedAt: new Date().toISOString() });
    } else {
      setSyncState('error');
    }
    setTimeout(() => setSyncState('idle'), 3000);
  };

  // Google OAuth Login
  const handleSignInGoogle = async () => {
    try {
      setSyncState('syncing');
      const res = await googleSignIn();
      if (res) {
        setUserProfile(res.profile);
        await pullFromSheets();
      }
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      setSyncState('error');
    }
  };

  const handleSignOutGoogle = async () => {
    await logout();
    setUserProfile(null);
    setSyncState('idle');
  };

  // Window management functions
  const openWindow = (app: DesktopApp, payload?: any) => {
    // Check if app already has an open window
    const existing = windows.find((w) => w.appId === app.id);
    if (existing) {
      // Bring to front and un-minimize
      focusWindow(existing.id);
      if (existing.isMinimized) {
        setWindows((prev) =>
          prev.map((w) => (w.id === existing.id ? { ...w, isMinimized: false, payload } : w))
        );
      }
      return;
    }

    const newZ = nextZIndex + 1;
    setNextZIndex(newZ);

    const winWidth = app.defaultWidth || 700;
    const winHeight = app.defaultHeight || 500;

    // Offset cascade
    const offset = (windows.length % 6) * 28;
    const initialX = Math.max(20, Math.min(window.innerWidth - winWidth - 40, 80 + offset));
    const initialY = Math.max(20, Math.min(window.innerHeight - winHeight - 60, 50 + offset));

    const newWindow: WindowState = {
      id: `win-${Date.now()}`,
      appId: app.id,
      title: app.name,
      icon: app.icon,
      isMinimized: false,
      isMaximized: false,
      zIndex: newZ,
      x: initialX,
      y: initialY,
      width: winWidth,
      height: winHeight,
      payload,
    };

    setWindows((prev) => [...prev, newWindow]);
    setActiveWindowId(newWindow.id);
  };

  const closeWindow = (id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
    if (activeWindowId === id) {
      const remaining = windows.filter((w) => w.id !== id);
      if (remaining.length > 0) {
        const topWin = remaining.reduce((max, w) => (w.zIndex > max.zIndex ? w : max), remaining[0]);
        setActiveWindowId(topWin.id);
      } else {
        setActiveWindowId(null);
      }
    }
  };

  const focusWindow = (id: string) => {
    const newZ = nextZIndex + 1;
    setNextZIndex(newZ);
    setActiveWindowId(id);
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, zIndex: newZ, isMinimized: false } : w))
    );
  };

  const toggleMinimizeWindow = (id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: !w.isMinimized } : w))
    );
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const toggleMaximizeWindow = (id: string) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        if (!w.isMaximized) {
          return {
            ...w,
            isMaximized: true,
            prevPosition: { x: w.x, y: w.y, width: w.width, height: w.height },
          };
        } else {
          return {
            ...w,
            isMaximized: false,
            x: w.prevPosition?.x ?? w.x,
            y: w.prevPosition?.y ?? w.y,
            width: w.prevPosition?.width ?? w.width,
            height: w.prevPosition?.height ?? w.height,
          };
        }
      })
    );
  };

  // App Studio / Manager callbacks
  const handleInstallCustomApp = (newApp: DesktopApp) => {
    setCustomApps((prev) => {
      const filtered = prev.filter((a) => a.id !== newApp.id);
      const updated = [newApp, ...filtered];
      saveLocalCustomApps(updated);
      // Trigger background sync to Google Sheets
      if (isGoogleAuthenticated()) {
        syncWithGoogleSheets(settings, updated);
      }
      return updated;
    });
    // Launch installed app
    openWindow(newApp);
  };

  const handleUninstallCustomApp = (appId: string) => {
    // Close window if open
    const win = windows.find((w) => w.appId === appId);
    if (win) closeWindow(win.id);

    setCustomApps((prev) => {
      const updated = prev.filter((a) => a.id !== appId);
      saveLocalCustomApps(updated);
      if (isGoogleAuthenticated()) {
        syncWithGoogleSheets(settings, updated);
      }
      return updated;
    });
  };

  const handleEditAppInStudio = (app: DesktopApp) => {
    setAppToEditInStudio(app);
    const studioApp = BUILT_IN_APPS.find((a) => a.id === 'app-studio')!;
    openWindow(studioApp);
  };

  // Desktop right-click context menu
  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const closePopups = () => {
    setIsStartMenuOpen(false);
    setIsControlCenterOpen(false);
    setContextMenu(null);
  };

  // Render content inside an open window
  const renderWindowContent = (win: WindowState) => {
    // Check if built-in app
    switch (win.appId) {
      case 'app-studio':
        return (
          <AppStudio
            onInstallApp={handleInstallCustomApp}
            onLaunchApp={(appId) => {
              const app = allApps.find((a) => a.id === appId);
              if (app) openWindow(app);
            }}
            initialAppToEdit={appToEditInStudio}
          />
        );

      case 'app-manager':
        return (
          <AppManager
            installedApps={allApps}
            onLaunchApp={(appId) => {
              const app = allApps.find((a) => a.id === appId);
              if (app) openWindow(app);
            }}
            onInstallApp={handleInstallCustomApp}
            onUninstallApp={handleUninstallCustomApp}
            onEditAppInStudio={handleEditAppInStudio}
          />
        );

      case 'file-explorer':
        return (
          <FileExplorer
            onOpenFileInNotepad={(file) => {
              const notepadApp = BUILT_IN_APPS.find((a) => a.id === 'notepad')!;
              openWindow(notepadApp, file);
            }}
            onOpenSignIn={handleSignInGoogle}
          />
        );

      case 'sheets-sync':
        return (
          <GoogleSheetsViewer
            onTriggerSync={handleTriggerSync}
            onOpenSignIn={handleSignInGoogle}
            isSyncing={syncState === 'syncing'}
            lastSyncedAt={settings.lastSyncedAt}
          />
        );

      case 'notepad':
        return <Notepad initialFile={win.payload} />;

      case 'terminal':
        return (
          <Terminal
            installedApps={allApps}
            userDisplayName={userProfile?.displayName}
            onInstallApp={handleInstallCustomApp}
            onUninstallApp={handleUninstallCustomApp}
            onTriggerSync={handleTriggerSync}
            onChangeTheme={(t) => handleUpdateSettings({ theme: t })}
          />
        );

      case 'calculator':
        return <Calculator />;

      case 'browser':
        return <WebBrowser />;

      case 'settings':
        return (
          <SystemSettings
            settings={settings}
            userProfile={userProfile}
            onUpdateSettings={handleUpdateSettings}
            onSignInGoogle={handleSignInGoogle}
            onSignOutGoogle={handleSignOutGoogle}
            onTriggerSync={handleTriggerSync}
            installedApps={allApps}
            isSyncing={syncState === 'syncing'}
          />
        );

      default: {
        // Custom installed app runner
        const customApp = customApps.find((a) => a.id === win.appId);
        if (customApp) {
          return <CustomAppRunner app={customApp} />;
        }
        return (
          <div className="p-6 text-center text-slate-400 text-xs">
            Application "{win.title}" could not be loaded.
          </div>
        );
      }
    }
  };

  // Lock screen view
  if (isLocked) {
    return (
      <div
        style={{ backgroundImage: `url(${settings.wallpaper})` }}
        className="fixed inset-0 bg-cover bg-center flex flex-col items-center justify-center p-6 text-white select-none z-[999999]"
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
        <div className="relative z-10 flex flex-col items-center space-y-6 max-w-sm text-center">
          <div className="w-20 h-20 rounded-full bg-slate-800/80 border-2 border-blue-500/40 flex items-center justify-center text-white shadow-2xl">
            {userProfile?.photoURL ? (
              <img src={userProfile.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <Lock className="w-8 h-8 text-blue-400" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{userProfile?.displayName || 'WebDesktop OS'}</h2>
            <p className="text-xs text-slate-300 mt-1">Desktop Session Locked</p>
          </div>
          <button
            onClick={() => setIsLocked(false)}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-semibold shadow-lg transition active:scale-95 text-xs"
          >
            <Unlock className="w-4 h-4" /> Unlock Desktop
          </button>
        </div>
      </div>
    );
  }

  // Icons displayed directly on the desktop grid
  const desktopIcons = allApps.filter((app) => app.showOnDesktop !== false);

  return (
    <div
      onClick={closePopups}
      onContextMenu={handleDesktopContextMenu}
      style={{ backgroundImage: `url(${settings.wallpaper})` }}
      className={`fixed inset-0 bg-cover bg-center overflow-hidden font-sans select-none ${
        settings.theme === 'light' ? 'theme-light' : 'theme-dark'
      }`}
    >
      {/* Subtle tint overlay to keep high contrast text readable */}
      <div className="absolute inset-0 bg-black/35 pointer-events-none" />

      {/* Desktop Grid Icons */}
      <div className="relative z-10 p-5 grid grid-flow-col grid-rows-6 auto-cols-[100px] gap-3 h-[calc(100vh-60px)]">
        {desktopIcons.map((app) => (
          <div
            key={app.id}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedDesktopIcon(app.id);
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              openWindow(app);
            }}
            className={`flex flex-col items-center justify-center p-2 rounded-2xl cursor-pointer transition text-center group ${
              selectedDesktopIcon === app.id
                ? 'bg-blue-600/35 border border-blue-400/50 shadow-lg'
                : 'hover:bg-white/10 hover:backdrop-blur-sm'
            }`}
          >
            <div className="w-13 h-13 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/15 flex items-center justify-center text-white shadow-md group-hover:scale-105 group-hover:border-blue-400/60 transition duration-150">
              <AppIconRenderer name={app.icon} size={26} />
            </div>
            <span className="text-[11px] font-medium text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] truncate w-full px-1 mt-1.5 leading-tight">
              {app.name}
            </span>
          </div>
        ))}
      </div>

      {/* Windows Layer */}
      {windows.map((win) => (
        <Window
          key={win.id}
          window={win}
          isActive={win.id === activeWindowId}
          onFocus={() => focusWindow(win.id)}
          onClose={() => closeWindow(win.id)}
          onMinimize={() => toggleMinimizeWindow(win.id)}
          onMaximize={() => toggleMaximizeWindow(win.id)}
          onUpdatePosition={(x, y) => {
            setWindows((prev) => prev.map((w) => (w.id === win.id ? { ...w, x, y } : w)));
          }}
          onUpdateSize={(width, height) => {
            setWindows((prev) => prev.map((w) => (w.id === win.id ? { ...w, width, height } : w)));
          }}
        >
          {renderWindowContent(win)}
        </Window>
      ))}

      {/* Desktop Right-Click Context Menu */}
      {contextMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-[999999] bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl shadow-2xl p-1.5 w-52 text-xs text-slate-200 animate-in fade-in duration-100"
        >
          <button
            onClick={() => {
              const filesApp = BUILT_IN_APPS.find((a) => a.id === 'file-explorer')!;
              openWindow(filesApp);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 text-left transition"
          >
            <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
            <span>Open Files & Drive</span>
          </button>

          <button
            onClick={() => {
              const studioApp = BUILT_IN_APPS.find((a) => a.id === 'app-studio')!;
              openWindow(studioApp);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 text-left transition"
          >
            <FileCode className="w-3.5 h-3.5 text-blue-400" />
            <span>Install Frontend Code</span>
          </button>

          <button
            onClick={() => {
              const managerApp = BUILT_IN_APPS.find((a) => a.id === 'app-manager')!;
              openWindow(managerApp);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 text-left transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>App Center & Store</span>
          </button>

          <div className="h-[1px] bg-slate-800 my-1" />

          <button
            onClick={() => {
              handleTriggerSync();
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 text-left transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sync Google Sheets & Drive</span>
          </button>

          <button
            onClick={() => {
              const settingsApp = BUILT_IN_APPS.find((a) => a.id === 'settings')!;
              openWindow(settingsApp);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 text-left transition"
          >
            <SettingsIcon className="w-3.5 h-3.5 text-slate-300" />
            <span>Desktop Settings</span>
          </button>
        </div>
      )}

      {/* Start Menu Popup */}
      <StartMenu
        isOpen={isStartMenuOpen}
        onClose={() => setIsStartMenuOpen(false)}
        apps={allApps}
        userProfile={userProfile}
        onLaunchApp={(app) => openWindow(app)}
        onOpenSettings={() => {
          const app = BUILT_IN_APPS.find((a) => a.id === 'settings')!;
          openWindow(app);
        }}
        onSignInGoogle={handleSignInGoogle}
        onSignOutGoogle={handleSignOutGoogle}
        onLockScreen={() => setIsLocked(true)}
        taskbarPosition={settings.taskbarPosition}
      />

      {/* Control Center Drawer */}
      <ControlCenter
        isOpen={isControlCenterOpen}
        onClose={() => setIsControlCenterOpen(false)}
        settings={settings}
        userProfile={userProfile}
        syncState={syncState}
        onUpdateSettings={handleUpdateSettings}
        onTriggerSync={handleTriggerSync}
        onOpenSettings={() => {
          const app = BUILT_IN_APPS.find((a) => a.id === 'settings')!;
          openWindow(app);
        }}
        taskbarPosition={settings.taskbarPosition}
      />

      {/* Taskbar */}
      <Taskbar
        pinnedApps={allApps.filter((a) => a.pinnedToTaskbar)}
        openWindows={windows}
        activeWindowId={activeWindowId}
        syncState={syncState}
        onToggleStartMenu={() => {
          setIsStartMenuOpen(!isStartMenuOpen);
          setIsControlCenterOpen(false);
        }}
        isStartMenuOpen={isStartMenuOpen}
        onToggleControlCenter={() => {
          setIsControlCenterOpen(!isControlCenterOpen);
          setIsStartMenuOpen(false);
        }}
        isControlCenterOpen={isControlCenterOpen}
        onAppClick={(app) => openWindow(app)}
        onWindowClick={(winId) => {
          const win = windows.find((w) => w.id === winId);
          if (win) {
            if (win.id === activeWindowId && !win.isMinimized) {
              toggleMinimizeWindow(win.id);
            } else {
              focusWindow(win.id);
            }
          }
        }}
        onTriggerSync={handleTriggerSync}
        taskbarPosition={settings.taskbarPosition}
      />
    </div>
  );
};
