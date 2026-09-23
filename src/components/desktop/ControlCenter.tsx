import React from 'react';
import { 
  Cloud, 
  Wifi, 
  Volume2, 
  Palette, 
  Image as ImageIcon, 
  Github, 
  RefreshCw,
  Moon,
  Sun,
  ShieldCheck,
  X
} from 'lucide-react';
import { DesktopSettings, GoogleUserProfile, SyncState } from '../../types/desktop';
import { DEFAULT_WALLPAPERS } from '../../services/defaultApps';
import { isGoogleAuthenticated } from '../../services/googleAuth';

interface ControlCenterProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DesktopSettings;
  userProfile: GoogleUserProfile | null;
  syncState: SyncState;
  onUpdateSettings: (newSettings: Partial<DesktopSettings>) => void;
  onTriggerSync: () => Promise<void>;
  onOpenSettings: () => void;
  taskbarPosition: 'bottom' | 'top';
}

export const ControlCenter: React.FC<ControlCenterProps> = ({
  isOpen,
  onClose,
  settings,
  userProfile,
  syncState,
  onUpdateSettings,
  onTriggerSync,
  onOpenSettings,
  taskbarPosition,
}) => {
  if (!isOpen) return null;

  const cycleWallpaper = () => {
    const currentIndex = DEFAULT_WALLPAPERS.findIndex((w) => w.url === settings.wallpaper);
    const nextIndex = (currentIndex + 1) % DEFAULT_WALLPAPERS.length;
    onUpdateSettings({ wallpaper: DEFAULT_WALLPAPERS[nextIndex].url });
  };

  const cycleTheme = () => {
    const themes: ('dark' | 'light' | 'cyber' | 'glass')[] = ['dark', 'light', 'cyber', 'glass'];
    const curIdx = themes.indexOf(settings.theme);
    const nextTheme = themes[(curIdx + 1) % themes.length];
    onUpdateSettings({ theme: nextTheme });
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`fixed ${
        taskbarPosition === 'top' ? 'top-14' : 'bottom-14'
      } right-4 w-80 bg-slate-900/90 backdrop-blur-2xl border border-slate-700/60 rounded-3xl z-[99999] shadow-2xl p-4 text-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <span className="text-xs font-bold text-white tracking-wider uppercase">
          Quick Control Center
        </span>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid of Quick Action Tiles */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Wifi / Online */}
        <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/50 flex flex-col justify-between">
          <Wifi className="w-5 h-5 text-emerald-400 mb-2" />
          <div>
            <div className="font-semibold text-white">Network</div>
            <div className="text-[10px] text-emerald-400">Connected</div>
          </div>
        </div>

        {/* Theme Cycler */}
        <button
          onClick={cycleTheme}
          className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/50 flex flex-col justify-between text-left transition"
        >
          <Palette className="w-5 h-5 text-purple-400 mb-2" />
          <div>
            <div className="font-semibold text-white capitalize">{settings.theme} Theme</div>
            <div className="text-[10px] text-slate-400">Tap to cycle</div>
          </div>
        </button>

        {/* Wallpaper Cycler */}
        <button
          onClick={cycleWallpaper}
          className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/50 flex flex-col justify-between text-left transition"
        >
          <ImageIcon className="w-5 h-5 text-sky-400 mb-2" />
          <div>
            <div className="font-semibold text-white">Wallpaper</div>
            <div className="text-[10px] text-slate-400">Next background</div>
          </div>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
          className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/50 flex flex-col justify-between text-left transition"
        >
          <Volume2 className={`w-5 h-5 mb-2 ${settings.soundEnabled ? 'text-blue-400' : 'text-slate-500'}`} />
          <div>
            <div className="font-semibold text-white">System Audio</div>
            <div className="text-[10px] text-slate-400">{settings.soundEnabled ? 'Enabled' : 'Muted'}</div>
          </div>
        </button>
      </div>

      {/* Cloud Sync Status Card */}
      <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-semibold text-white">
            <Cloud className="w-4 h-4 text-blue-400" />
            Google Cloud Storage
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
            isGoogleAuthenticated() ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
          }`}>
            {isGoogleAuthenticated() ? 'Connected' : 'Offline Mode'}
          </span>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          {isGoogleAuthenticated()
            ? `Syncs Desktop settings to Google Sheets & files to Google Drive.`
            : `Running serverlessly in local browser cache. Sign in to enable Google Drive & Sheets cloud persistence.`}
        </p>

        {isGoogleAuthenticated() && (
          <button
            onClick={onTriggerSync}
            disabled={syncState === 'syncing'}
            className="w-full flex items-center justify-center gap-2 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncState === 'syncing' ? 'animate-spin' : ''}`} />
            {syncState === 'syncing' ? 'Syncing...' : 'Sync Cloud Now'}
          </button>
        )}
      </div>

      {/* GitHub Deploy Quick Link */}
      <button
        onClick={() => {
          onOpenSettings();
          onClose();
        }}
        className="w-full flex items-center justify-between p-3 bg-slate-800/80 hover:bg-slate-800 rounded-2xl border border-slate-700/50 text-xs transition"
      >
        <div className="flex items-center gap-2.5">
          <Github className="w-4 h-4 text-slate-300" />
          <span className="font-semibold text-white">GitHub Pages Guide</span>
        </div>
        <span className="text-[10px] text-blue-400">View</span>
      </button>
    </div>
  );
};
