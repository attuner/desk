import React, { useState, useEffect } from 'react';
import { 
  Table2, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  Database, 
  AlertCircle, 
  Layers, 
  Settings as SettingsIcon
} from 'lucide-react';
import { getRawSheetsData } from '../services/googleSheetsService';
import { isGoogleAuthenticated } from '../services/googleAuth';

interface GoogleSheetsViewerProps {
  onTriggerSync: () => Promise<void>;
  onOpenSignIn: () => void;
  isSyncing: boolean;
  lastSyncedAt?: string;
}

export const GoogleSheetsViewer: React.FC<GoogleSheetsViewerProps> = ({
  onTriggerSync,
  onOpenSignIn,
  isSyncing,
  lastSyncedAt,
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'apps'>('settings');
  const [settingsRows, setSettingsRows] = useState<string[][]>([]);
  const [appsRows, setAppsRows] = useState<string[][]>([]);
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!isGoogleAuthenticated()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getRawSheetsData();
      setSettingsRows(data.settingsRows);
      setAppsRows(data.appsRows);
      setSpreadsheetId(data.spreadsheetId);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch Sheets database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isSyncing]);

  const handleManualSync = async () => {
    await onTriggerSync();
    await loadData();
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-xl">
            <Table2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Google Sheets Database Backend</h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium">
                Live Cloud Sync
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Desktop configuration, state, and custom frontend apps stored serverlessly in Google Sheets
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {spreadsheetId && (
            <a
              href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              Open in Google Sheets
            </a>
          )}
          <button
            onClick={handleManualSync}
            disabled={isSyncing || loading || !isGoogleAuthenticated()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow transition active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing || loading ? 'animate-spin' : ''}`} />
            Sync Now
          </button>
        </div>
      </div>

      {/* Auth Banner if not authenticated */}
      {!isGoogleAuthenticated() && (
        <div className="m-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="font-semibold text-white">Sign in to sync with Google Sheets</p>
              <p className="text-slate-400 mt-0.5">
                Connect your Google account to persist desktop settings and installed apps in your personal Google Sheets spreadsheet.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenSignIn}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold shadow transition whitespace-nowrap"
          >
            Sign in with Google
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center justify-between px-5 py-2 bg-slate-900/60 border-b border-slate-800 text-xs">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
              activeTab === 'settings'
                ? 'bg-slate-800 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <SettingsIcon className="w-3.5 h-3.5 text-blue-400" />
            Sheet: Settings ({Math.max(0, settingsRows.length - 1)})
          </button>
          <button
            onClick={() => setActiveTab('apps')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
              activeTab === 'apps'
                ? 'bg-slate-800 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            Sheet: InstalledApps ({Math.max(0, appsRows.length - 1)})
          </button>
        </div>

        {lastSyncedAt && (
          <span className="text-[11px] text-slate-500 font-mono">
            Last Synced: {new Date(lastSyncedAt).toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Error View */}
      {error && (
        <div className="m-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table Data View */}
      <div className="flex-1 overflow-auto p-4 font-mono text-xs">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-xs gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
            Loading spreadsheet data...
          </div>
        ) : activeTab === 'settings' ? (
          <div className="border border-slate-800 rounded-xl overflow-hidden shadow">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-300 border-b border-slate-800 text-[11px]">
                  <th className="p-3 font-semibold">Row #</th>
                  <th className="p-3 font-semibold">Setting Key (Col A)</th>
                  <th className="p-3 font-semibold">JSON Value (Col B)</th>
                  <th className="p-3 font-semibold">Last Updated (Col C)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/60">
                {settingsRows.length <= 1 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-500">
                      No settings rows found in Google Sheet. Click "Sync Now" to initialize.
                    </td>
                  </tr>
                ) : (
                  settingsRows.slice(1).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40 transition">
                      <td className="p-3 text-slate-500">{idx + 2}</td>
                      <td className="p-3 font-bold text-blue-400">{row[0]}</td>
                      <td className="p-3 text-slate-300 break-all max-w-md">{row[1]}</td>
                      <td className="p-3 text-slate-500 text-[11px]">{row[2]}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border border-slate-800 rounded-xl overflow-hidden shadow">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-300 border-b border-slate-800 text-[11px]">
                  <th className="p-3 font-semibold">Row #</th>
                  <th className="p-3 font-semibold">App ID</th>
                  <th className="p-3 font-semibold">App Name</th>
                  <th className="p-3 font-semibold">Category</th>
                  <th className="p-3 font-semibold">Icon</th>
                  <th className="p-3 font-semibold">Dimensions</th>
                  <th className="p-3 font-semibold">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/60">
                {appsRows.length <= 1 ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-slate-500">
                      No custom apps saved in Google Sheets yet. Install an app using App Studio!
                    </td>
                  </tr>
                ) : (
                  appsRows.slice(1).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40 transition">
                      <td className="p-3 text-slate-500">{idx + 2}</td>
                      <td className="p-3 text-purple-400">{row[0]}</td>
                      <td className="p-3 font-bold text-white">{row[1]}</td>
                      <td className="p-3 text-slate-300">{row[3]}</td>
                      <td className="p-3 text-slate-400">{row[2]}</td>
                      <td className="p-3 text-slate-400">{row[5]}x{row[6]}</td>
                      <td className="p-3 text-slate-500 text-[11px]">{row[7]}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
