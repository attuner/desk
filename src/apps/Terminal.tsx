import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, CornerDownLeft } from 'lucide-react';
import { DesktopApp } from '../types/desktop';
import { APP_STORE_CATALOG } from '../services/defaultApps';
import { isGoogleAuthenticated } from '../services/googleAuth';
import { listDriveFiles } from '../services/googleDriveService';

interface TerminalProps {
  installedApps: DesktopApp[];
  userDisplayName?: string | null;
  onInstallApp: (app: DesktopApp) => void;
  onUninstallApp: (appId: string) => void;
  onTriggerSync: () => Promise<void>;
  onChangeTheme: (theme: any) => void;
}

interface CommandHistoryItem {
  id: string;
  type: 'input' | 'output' | 'error';
  text: string;
}

export const Terminal: React.FC<TerminalProps> = ({
  installedApps,
  userDisplayName,
  onInstallApp,
  onUninstallApp,
  onTriggerSync,
  onChangeTheme,
}) => {
  const [history, setHistory] = useState<CommandHistoryItem[]>([
    {
      id: 'init-1',
      type: 'output',
      text: 'WebDesktop OS Terminal [Version 1.0.0]\n(c) 2026 WebDesktop. Serverless Client-Side Environment.\nType "help" to view available system commands.\n',
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = async (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    const newHistory: CommandHistoryItem[] = [
      ...history,
      { id: `in-${Date.now()}`, type: 'input', text: trimmed },
    ];

    const parts = trimmed.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case 'help':
        newHistory.push({
          id: `out-${Date.now()}`,
          type: 'output',
          text: `Available Commands:
  help                  Show this manual
  apps                  List all installed desktop applications
  store                 List available apps in App Store catalog
  install <name>        Install an app from App Store (e.g. install snake)
  uninstall <appId>     Uninstall custom application
  drive ls              List files in Google Drive folder
  sheets sync           Trigger sync with Google Sheets backend
  theme <dark|light>    Switch desktop theme
  neofetch              Display system banner and hardware info
  whoami                Show authenticated user identity
  clear                 Clear terminal window
  date                  Display current local time and date`,
        });
        break;

      case 'clear':
        setHistory([]);
        return;

      case 'apps':
        const appList = installedApps
          .map((a) => `• [${a.id}] ${a.name} (${a.category}) ${a.isCustom ? '[Custom]' : '[Built-in]'}`)
          .join('\n');
        newHistory.push({ id: `out-${Date.now()}`, type: 'output', text: appList });
        break;

      case 'store':
        const catalogList = APP_STORE_CATALOG.map(
          (a) => `• ${a.name} [id: ${a.id}] - ${a.description}`
        ).join('\n');
        newHistory.push({
          id: `out-${Date.now()}`,
          type: 'output',
          text: `App Store Catalog:\n${catalogList}\n\nType: install <name> to install.`,
        });
        break;

      case 'install':
        if (!args[0]) {
          newHistory.push({ id: `err-${Date.now()}`, type: 'error', text: 'Usage: install <name or id>' });
          break;
        }
        const target = APP_STORE_CATALOG.find(
          (a) =>
            a.name.toLowerCase().includes(args[0].toLowerCase()) ||
            a.id.toLowerCase().includes(args[0].toLowerCase())
        );
        if (target) {
          onInstallApp({
            ...target,
            isCustom: true,
            showOnDesktop: true,
            createdAt: new Date().toISOString(),
          });
          newHistory.push({
            id: `out-${Date.now()}`,
            type: 'output',
            text: `Successfully installed "${target.name}"! Icon added to Desktop.`,
          });
        } else {
          newHistory.push({
            id: `err-${Date.now()}`,
            type: 'error',
            text: `App matching "${args[0]}" not found in store catalog. Type "store" to list apps.`,
          });
        }
        break;

      case 'uninstall':
        if (!args[0]) {
          newHistory.push({ id: `err-${Date.now()}`, type: 'error', text: 'Usage: uninstall <appId>' });
          break;
        }
        const toRemove = installedApps.find((a) => a.id === args[0]);
        if (!toRemove) {
          newHistory.push({ id: `err-${Date.now()}`, type: 'error', text: `App ID "${args[0]}" not found.` });
        } else if (!toRemove.isCustom) {
          newHistory.push({ id: `err-${Date.now()}`, type: 'error', text: `Cannot uninstall built-in app.` });
        } else {
          onUninstallApp(toRemove.id);
          newHistory.push({ id: `out-${Date.now()}`, type: 'output', text: `Uninstalled ${toRemove.name}.` });
        }
        break;

      case 'whoami':
        newHistory.push({
          id: `out-${Date.now()}`,
          type: 'output',
          text: isGoogleAuthenticated()
            ? `Google Account: ${userDisplayName || 'User'} (Connected to Drive & Sheets)`
            : 'Guest User (Local Storage Mode)',
        });
        break;

      case 'sheets':
        if (args[0] === 'sync') {
          if (!isGoogleAuthenticated()) {
            newHistory.push({ id: `err-${Date.now()}`, type: 'error', text: 'Google authentication required for Sheets sync.' });
          } else {
            newHistory.push({ id: `out-${Date.now()}`, type: 'output', text: 'Synchronizing with Google Sheets database...' });
            await onTriggerSync();
            newHistory.push({ id: `out-${Date.now()}`, type: 'output', text: 'Google Sheets synchronization complete!' });
          }
        } else {
          newHistory.push({ id: `err-${Date.now()}`, type: 'error', text: 'Usage: sheets sync' });
        }
        break;

      case 'drive':
        if (args[0] === 'ls') {
          if (!isGoogleAuthenticated()) {
            newHistory.push({ id: `err-${Date.now()}`, type: 'error', text: 'Google authentication required for Drive.' });
          } else {
            try {
              const files = await listDriveFiles();
              const list = files.map((f) => `${f.isFolder ? '[DIR]' : '[FILE]'} ${f.name} (${f.size || '0 B'})`).join('\n');
              newHistory.push({ id: `out-${Date.now()}`, type: 'output', text: list || 'No files found in WebDesktop_Storage.' });
            } catch (e: any) {
              newHistory.push({ id: `err-${Date.now()}`, type: 'error', text: `Drive error: ${e.message}` });
            }
          }
        } else {
          newHistory.push({ id: `err-${Date.now()}`, type: 'error', text: 'Usage: drive ls' });
        }
        break;

      case 'theme':
        if (args[0] === 'light' || args[0] === 'dark' || args[0] === 'cyber') {
          onChangeTheme(args[0]);
          newHistory.push({ id: `out-${Date.now()}`, type: 'output', text: `Theme switched to ${args[0]}.` });
        } else {
          newHistory.push({ id: `err-${Date.now()}`, type: 'error', text: 'Usage: theme <dark|light|cyber>' });
        }
        break;

      case 'date':
        newHistory.push({ id: `out-${Date.now()}`, type: 'output', text: new Date().toString() });
        break;

      case 'neofetch':
        newHistory.push({
          id: `out-${Date.now()}`,
          type: 'output',
          text: `
      _..--""--.._         OS: WebDesktop OS (Serverless)
     /   _    _   \\        Kernel: Browser Runtime / React 19
    |  (o)  (o)  |        Host: GitHub Pages / AI Studio
    |     __     |        Backend: Google Drive & Google Sheets
     \\   \\__/   /         Shell: WebShell v1.0.0
      \`'--..__.-'\`          Memory: Client Browser Heap
                           Auth: Firebase OAuth 2.0
                           Installed Apps: ${installedApps.length}`,
        });
        break;

      default:
        newHistory.push({
          id: `err-${Date.now()}`,
          type: 'error',
          text: `Command not found: "${cmd}". Type "help" for a list of available commands.`,
        });
        break;
    }

    setHistory(newHistory);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 font-mono text-xs text-emerald-400 p-4 select-text overflow-hidden">
      <div className="flex-1 overflow-y-auto space-y-2 leading-relaxed">
        {history.map((item) => (
          <div key={item.id}>
            {item.type === 'input' ? (
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-emerald-500 font-bold">user@webdesktop:~$</span>
                <span>{item.text}</span>
              </div>
            ) : item.type === 'error' ? (
              <pre className="text-red-400 whitespace-pre-wrap font-mono">{item.text}</pre>
            ) : (
              <pre className="text-slate-300 whitespace-pre-wrap font-mono">{item.text}</pre>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-slate-900 mt-2">
        <span className="text-emerald-500 font-bold shrink-0">user@webdesktop:~$</span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleCommand(inputVal);
              setInputVal('');
            }
          }}
          autoFocus
          className="flex-1 bg-transparent text-emerald-300 outline-none border-none font-mono text-xs"
          placeholder="Type command..."
        />
        <CornerDownLeft className="w-3.5 h-3.5 text-slate-600 shrink-0" />
      </div>
    </div>
  );
};
