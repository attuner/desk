import React, { useState } from 'react';
import { 
  Search, 
  Power, 
  Settings as SettingsIcon, 
  LogOut, 
  LogIn, 
  Layers, 
  Code2, 
  Github,
  Cloud,
  User as UserIcon
} from 'lucide-react';
import { DesktopApp, GoogleUserProfile } from '../../types/desktop';
import { AppIconRenderer } from './AppIconRenderer';
import { isGoogleAuthenticated } from '../../services/googleAuth';

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  apps: DesktopApp[];
  userProfile: GoogleUserProfile | null;
  onLaunchApp: (app: DesktopApp) => void;
  onOpenSettings: () => void;
  onSignInGoogle: () => void;
  onSignOutGoogle: () => void;
  onLockScreen: () => void;
  taskbarPosition: 'bottom' | 'top';
}

export const StartMenu: React.FC<StartMenuProps> = ({
  isOpen,
  onClose,
  apps,
  userProfile,
  onLaunchApp,
  onOpenSettings,
  onSignInGoogle,
  onSignOutGoogle,
  onLockScreen,
  taskbarPosition,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredApps = apps.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`fixed ${
        taskbarPosition === 'top' ? 'top-14' : 'bottom-14'
      } left-4 w-96 max-h-[580px] bg-slate-900/90 backdrop-blur-2xl border border-slate-700/60 rounded-3xl z-[99999] shadow-2xl flex flex-col overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-150`}
    >
      {/* Top Search Bar */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/40">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search applications, tools, files..."
            autoFocus
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-2xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* Main Apps Grid / List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Pinned section when not searching */}
        {!searchQuery && (
          <div>
            <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-2 px-1">
              Pinned Applications
            </div>
            <div className="grid grid-cols-4 gap-2">
              {apps.slice(0, 8).map((app) => (
                <button
                  key={app.id}
                  onClick={() => {
                    onLaunchApp(app);
                    onClose();
                  }}
                  className="flex flex-col items-center p-2.5 rounded-2xl hover:bg-slate-800/80 transition group text-center"
                >
                  <div className="w-11 h-11 rounded-2xl bg-slate-800 group-hover:bg-blue-600/20 group-hover:text-blue-400 text-slate-300 flex items-center justify-center transition mb-1.5 shadow-inner">
                    <AppIconRenderer name={app.icon} size={22} />
                  </div>
                  <span className="text-[11px] font-medium text-slate-200 truncate w-full">
                    {app.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* All Apps List */}
        <div>
          <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-2 px-1">
            {searchQuery ? 'Search Results' : 'All Applications'}
          </div>
          <div className="space-y-1">
            {filteredApps.map((app) => (
              <button
                key={app.id}
                onClick={() => {
                  onLaunchApp(app);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 transition text-left group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 group-hover:bg-blue-600/20 text-slate-300 group-hover:text-blue-400 flex items-center justify-center shrink-0">
                    <AppIconRenderer name={app.icon} size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                      <span>{app.name}</span>
                      {app.isCustom && (
                        <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1 rounded">
                          Custom
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{app.category}</div>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition">
                  Open
                </span>
              </button>
            ))}

            {filteredApps.length === 0 && (
              <div className="p-6 text-center text-slate-500 text-xs">
                No apps found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Profile & Power Controls Footer */}
      <div className="p-3.5 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between">
        {/* User Card */}
        {isGoogleAuthenticated() && userProfile ? (
          <div className="flex items-center gap-2.5 min-w-0">
            {userProfile.photoURL ? (
              <img src={userProfile.photoURL} alt="" className="w-8 h-8 rounded-full border border-slate-700" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                {userProfile.displayName?.[0] || 'U'}
              </div>
            )}
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate max-w-[150px]">
                {userProfile.displayName || 'Google User'}
              </div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                <Cloud className="w-2.5 h-2.5" /> Drive & Sheets Active
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => {
              onSignInGoogle();
              onClose();
            }}
            className="flex items-center gap-2 text-xs text-slate-300 hover:text-white"
          >
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-white">Sign In</div>
              <div className="text-[10px] text-slate-400">Connect Google Account</div>
            </div>
          </button>
        )}

        {/* Quick Power Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              onOpenSettings();
              onClose();
            }}
            title="System Settings"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              onLockScreen();
              onClose();
            }}
            title="Lock Desktop"
            className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
          >
            <Power className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
