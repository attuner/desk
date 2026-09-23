import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  Palette, 
  Cloud, 
  Github, 
  Check, 
  Copy, 
  ExternalLink, 
  LogOut, 
  RefreshCw,
  Sliders,
  Database,
  ShieldCheck,
  Download
} from 'lucide-react';
import { DesktopSettings, GoogleUserProfile, DesktopApp } from '../types/desktop';
import { DEFAULT_WALLPAPERS } from '../services/defaultApps';
import { isGoogleAuthenticated } from '../services/googleAuth';

interface SystemSettingsProps {
  settings: DesktopSettings;
  userProfile: GoogleUserProfile | null;
  onUpdateSettings: (newSettings: Partial<DesktopSettings>) => void;
  onSignInGoogle: () => void;
  onSignOutGoogle: () => void;
  onTriggerSync: () => Promise<void>;
  installedApps: DesktopApp[];
  isSyncing: boolean;
}

export const SystemSettings: React.FC<SystemSettingsProps> = ({
  settings,
  userProfile,
  onUpdateSettings,
  onSignInGoogle,
  onSignOutGoogle,
  onTriggerSync,
  installedApps,
  isSyncing,
}) => {
  const [activeTab, setActiveTab] = useState<'wallpapers' | 'appearance' | 'account' | 'github'>('wallpapers');
  const [customWallUrl, setCustomWallUrl] = useState('');
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(id);
    setTimeout(() => setCopiedStep(null), 2500);
  };

  const handleExportBackup = () => {
    const backup = {
      settings,
      installedApps: installedApps.filter((a) => a.isCustom),
      exportedAt: new Date().toISOString(),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `webdesktop-backup-${Date.now()}.json`;
    a.click();
    a.remove();
  };

  return (
    <div className="flex h-full bg-slate-950 text-slate-100 select-none overflow-hidden">
      {/* Sidebar Tabs */}
      <div className="w-52 bg-slate-900 border-r border-slate-800 p-3 space-y-1 text-xs shrink-0 flex flex-col justify-between">
        <div className="space-y-1">
          <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Settings
          </div>
          <button
            onClick={() => setActiveTab('wallpapers')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition ${
              activeTab === 'wallpapers'
                ? 'bg-blue-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-sky-400" />
            Wallpapers
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition ${
              activeTab === 'appearance'
                ? 'bg-blue-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-4 h-4 text-purple-400" />
            Appearance
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition ${
              activeTab === 'account'
                ? 'bg-blue-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cloud className="w-4 h-4 text-emerald-400" />
            Google Cloud Storage
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition ${
              activeTab === 'github'
                ? 'bg-blue-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Github className="w-4 h-4 text-slate-300" />
            GitHub Deployment
          </button>
        </div>

        {/* Quick Export System Backup */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={handleExportBackup}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export Desktop JSON
          </button>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Tab 1: Wallpapers */}
        {activeTab === 'wallpapers' && (
          <div className="space-y-5 max-w-2xl">
            <div>
              <h3 className="text-sm font-bold text-white">Desktop Wallpapers</h3>
              <p className="text-xs text-slate-400">Choose from built-in high definition backgrounds or specify a custom URL.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {DEFAULT_WALLPAPERS.map((wall) => (
                <div
                  key={wall.id}
                  onClick={() => onUpdateSettings({ wallpaper: wall.url })}
                  className={`group relative rounded-xl overflow-hidden aspect-video border-2 cursor-pointer transition shadow-md ${
                    settings.wallpaper === wall.url
                      ? 'border-blue-500 scale-[1.02]'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <img src={wall.thumbnail} alt={wall.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                    <span className="text-[11px] font-medium text-white truncate">{wall.name}</span>
                  </div>
                  {settings.wallpaper === wall.url && (
                    <div className="absolute top-2 right-2 p-1 bg-blue-600 rounded-full text-white shadow">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Custom Wallpaper URL */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
              <label className="block text-xs font-semibold text-slate-300">Custom Wallpaper Image URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customWallUrl}
                  onChange={(e) => setCustomWallUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => {
                    if (customWallUrl.trim()) {
                      onUpdateSettings({ wallpaper: customWallUrl.trim() });
                    }
                  }}
                  disabled={!customWallUrl.trim()}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Appearance */}
        {activeTab === 'appearance' && (
          <div className="space-y-5 max-w-xl text-xs">
            <div>
              <h3 className="text-sm font-bold text-white">Appearance & Layout</h3>
              <p className="text-slate-400 mt-0.5">Customize theme, taskbar position, and desktop icon size.</p>
            </div>

            <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 space-y-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-2">Theme Scheme</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'dark', label: 'Dark Obsidian', desc: 'Deep slate with blue highlights' },
                    { id: 'light', label: 'Cupertino Light', desc: 'Clean frosted glass look' },
                    { id: 'cyber', label: 'Cyberpunk Neon', desc: 'High contrast purple and green' },
                    { id: 'glass', label: 'Liquid Glass', desc: 'Ultra-translucent blur styling' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => onUpdateSettings({ theme: t.id as any })}
                      className={`p-3 rounded-xl border text-left transition ${
                        settings.theme === t.id
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold text-slate-200">{t.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-2">Taskbar Placement</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => onUpdateSettings({ taskbarPosition: 'bottom' })}
                    className={`px-4 py-2 rounded-lg border text-xs font-medium transition ${
                      settings.taskbarPosition === 'bottom'
                        ? 'border-blue-500 bg-blue-500/10 text-white'
                        : 'border-slate-800 text-slate-400'
                    }`}
                  >
                    Bottom of Screen
                  </button>
                  <button
                    onClick={() => onUpdateSettings({ taskbarPosition: 'top' })}
                    className={`px-4 py-2 rounded-lg border text-xs font-medium transition ${
                      settings.taskbarPosition === 'top'
                        ? 'border-blue-500 bg-blue-500/10 text-white'
                        : 'border-slate-800 text-slate-400'
                    }`}
                  >
                    Top of Screen
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-2">Desktop Icon Size</label>
                <div className="flex gap-2">
                  {(['small', 'medium', 'large'] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => onUpdateSettings({ iconGridSize: sz })}
                      className={`px-4 py-1.5 rounded-lg border text-xs font-medium capitalize transition ${
                        settings.iconGridSize === sz
                          ? 'border-blue-500 bg-blue-500/10 text-white'
                          : 'border-slate-800 text-slate-400'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Google Account & Workspace Cloud Storage */}
        {activeTab === 'account' && (
          <div className="space-y-5 max-w-xl text-xs">
            <div>
              <h3 className="text-sm font-bold text-white">Google Workspace Cloud Backend</h3>
              <p className="text-slate-400 mt-0.5">
                Google Drive stores your desktop files, and Google Sheets stores your desktop settings & installed apps.
              </p>
            </div>

            {isGoogleAuthenticated() && userProfile ? (
              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {userProfile.photoURL ? (
                      <img src={userProfile.photoURL} alt="" className="w-12 h-12 rounded-full border border-slate-700" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg text-white">
                        {userProfile.displayName?.[0] || 'U'}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-bold text-white">{userProfile.displayName || 'Google User'}</div>
                      <div className="text-xs text-slate-400">{userProfile.email}</div>
                    </div>
                  </div>

                  <button
                    onClick={onSignOutGoogle}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-red-400 rounded-lg text-xs font-medium transition"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Cloud className="w-4 h-4 text-sky-400" /> Google Drive Folder:
                    </span>
                    <span className="font-mono text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      WebDesktop_Storage
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-emerald-400" /> Google Sheets DB:
                    </span>
                    <span className="font-mono text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      WebDesktop_Settings_DB
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={onTriggerSync}
                    disabled={isSyncing}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    Sync Desktop State
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-4 text-center">
                <Cloud className="w-12 h-12 text-blue-400 mx-auto opacity-80" />
                <h4 className="text-sm font-bold text-white">Connect your Google Account</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Sign in with Google to enable automatic cloud synchronization with your personal Google Drive folder and Google Sheets database.
                </p>

                <div className="flex justify-center pt-2">
                  <button
                    onClick={onSignInGoogle}
                    className="gsi-material-button inline-flex items-center justify-center gap-3 px-5 py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-medium shadow-md transition"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                    <span>Sign in with Google</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: GitHub Deployment Guide */}
        {activeTab === 'github' && (
          <div className="space-y-4 max-w-2xl text-xs">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Github className="w-4 h-4 text-slate-200" />
                Serverless GitHub Pages Deployment
              </h3>
              <p className="text-slate-400 mt-0.5">
                This web desktop is 100% serverless and client-side, making it directly deployable to GitHub Pages.
              </p>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="font-semibold text-white flex items-center justify-between">
                  <span>Step 1: Build the Static Bundle</span>
                  <button
                    onClick={() => copyToClipboard('npm run build', 's1')}
                    className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                  >
                    {copiedStep === 's1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy
                  </button>
                </div>
                <pre className="p-2.5 bg-slate-950 rounded-lg text-emerald-400 font-mono text-[11px]">
                  npm run build
                </pre>
                <p className="text-slate-400 text-[11px]">
                  This compiles the React application into pure static HTML, CSS, and JS in the <code className="text-slate-300">dist/</code> directory.
                </p>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="font-semibold text-white flex items-center justify-between">
                  <span>Step 2: Deploy to GitHub Pages</span>
                  <button
                    onClick={() => copyToClipboard('git checkout -b gh-pages && git add dist -f && git commit -m "Deploy" && git push origin gh-pages', 's2')}
                    className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                  >
                    {copiedStep === 's2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy
                  </button>
                </div>
                <pre className="p-2.5 bg-slate-950 rounded-lg text-emerald-400 font-mono text-[11px] overflow-x-auto">
                  git checkout -b gh-pages
                  git add dist -f
                  git commit -m "Deploy WebDesktop OS"
                  git push origin gh-pages
                </pre>
                <p className="text-slate-400 text-[11px]">
                  Under GitHub Repository Settings &gt; Pages, select the <code className="text-slate-300">gh-pages</code> branch to serve your site.
                </p>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Google OAuth on your GitHub Pages Domain
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  When deployed on your personal URL (e.g. <code className="text-blue-300">https://username.github.io/webdesktop</code>), you can add that origin in Google Cloud Console &gt; APIs &amp; Services &gt; Credentials under <b>Authorized JavaScript origins</b> to allow Google Drive and Sheets authentication on your live site!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
