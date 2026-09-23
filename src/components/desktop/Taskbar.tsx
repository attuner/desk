import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Search, 
  Volume2, 
  VolumeX, 
  Wifi, 
  Cloud, 
  CloudCheck, 
  RefreshCw, 
  Sliders, 
  Layers
} from 'lucide-react';
import { DesktopApp, WindowState, SyncState } from '../../types/desktop';
import { AppIconRenderer } from './AppIconRenderer';
import { isGoogleAuthenticated } from '../../services/googleAuth';

interface TaskbarProps {
  pinnedApps: DesktopApp[];
  openWindows: WindowState[];
  activeWindowId: string | null;
  syncState: SyncState;
  onToggleStartMenu: () => void;
  isStartMenuOpen: boolean;
  onToggleControlCenter: () => void;
  isControlCenterOpen: boolean;
  onAppClick: (app: DesktopApp) => void;
  onWindowClick: (windowId: string) => void;
  onTriggerSync: () => Promise<void>;
  taskbarPosition: 'bottom' | 'top';
}

export const Taskbar: React.FC<TaskbarProps> = ({
  pinnedApps,
  openWindows,
  activeWindowId,
  syncState,
  onToggleStartMenu,
  isStartMenuOpen,
  onToggleControlCenter,
  isControlCenterOpen,
  onAppClick,
  onWindowClick,
  onTriggerSync,
  taskbarPosition,
}) => {
  const [time, setTime] = useState(new Date());
  const [volumeMuted, setVolumeMuted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={`fixed ${
        taskbarPosition === 'top' ? 'top-0' : 'bottom-0'
      } left-0 w-full h-12 bg-slate-900/85 backdrop-blur-xl border-t border-slate-700/50 z-[9999] flex items-center justify-between px-3 select-none text-slate-200 shadow-2xl`}
    >
      {/* Left: Start Button & Quick Launch */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onToggleStartMenu}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition duration-150 ${
            isStartMenuOpen
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-400/50'
              : 'hover:bg-slate-800 text-slate-200'
          }`}
        >
          <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold tracking-wider">Start</span>
        </button>

        {/* Separator */}
        <div className="h-6 w-[1px] bg-slate-800 mx-1" />

        {/* Pinned & Running App Icons */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-[55vw]">
          {pinnedApps.map((app) => {
            const runningWindow = openWindows.find((w) => w.appId === app.id);
            const isOpen = !!runningWindow;
            const isActive = runningWindow && runningWindow.id === activeWindowId && !runningWindow.isMinimized;

            return (
              <button
                key={app.id}
                onClick={() => {
                  if (isOpen && runningWindow) {
                    onWindowClick(runningWindow.id);
                  } else {
                    onAppClick(app);
                  }
                }}
                title={app.name}
                className={`relative p-2 rounded-xl flex items-center justify-center transition group ${
                  isActive
                    ? 'bg-blue-600/30 text-white shadow-sm'
                    : isOpen
                    ? 'bg-slate-800/80 text-slate-200 hover:bg-slate-800'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <AppIconRenderer name={app.icon} size={19} />

                {/* Running status indicator dot */}
                {isOpen && (
                  <span
                    className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-full transition ${
                      isActive ? 'bg-blue-400 w-3' : 'bg-slate-400'
                    }`}
                  />
                )}
              </button>
            );
          })}

          {/* Any open unpinned windows */}
          {openWindows
            .filter((w) => !pinnedApps.some((p) => p.id === w.appId))
            .map((win) => {
              const isActive = win.id === activeWindowId && !win.isMinimized;
              return (
                <button
                  key={win.id}
                  onClick={() => onWindowClick(win.id)}
                  title={win.title}
                  className={`relative p-2 rounded-xl flex items-center justify-center transition ${
                    isActive
                      ? 'bg-blue-600/30 text-white'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <AppIconRenderer name={win.icon} size={19} />
                  <span
                    className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-full ${
                      isActive ? 'bg-blue-400 w-3' : 'bg-slate-400'
                    }`}
                  />
                </button>
              );
            })}
        </div>
      </div>

      {/* Right: System Tray */}
      <div className="flex items-center gap-2">
        {/* Google Cloud Sync Status indicator */}
        <button
          onClick={onTriggerSync}
          title={
            isGoogleAuthenticated()
              ? `Google Drive & Sheets: ${syncState === 'syncing' ? 'Syncing...' : 'Synced'}`
              : 'Google Workspace: Offline / Guest Mode (Click to sync)'
          }
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs transition border ${
            isGoogleAuthenticated()
              ? syncState === 'syncing'
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
              : 'bg-slate-800 text-slate-400 border-slate-700/60 hover:bg-slate-700'
          }`}
        >
          <Cloud className={`w-3.5 h-3.5 ${syncState === 'syncing' ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline text-[11px] font-medium">
            {isGoogleAuthenticated()
              ? syncState === 'syncing'
                ? 'Syncing'
                : 'Cloud Synced'
              : 'Guest / Local'}
          </span>
        </button>

        {/* Volume */}
        <button
          onClick={() => setVolumeMuted(!volumeMuted)}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title={volumeMuted ? 'Unmute' : 'Mute'}
        >
          {volumeMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Wifi */}
        <div className="p-1.5 text-slate-400" title="Online">
          <Wifi className="w-4 h-4 text-emerald-400" />
        </div>

        {/* Control Center toggle */}
        <button
          onClick={onToggleControlCenter}
          className={`p-1.5 rounded-xl transition ${
            isControlCenterOpen
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Control Center"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Clock & Date */}
        <div className="flex flex-col items-end px-2 py-0.5 rounded-lg text-right font-mono text-[11px] leading-tight">
          <span className="font-semibold text-slate-100">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="text-[10px] text-slate-400">
            {time.toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  );
};
