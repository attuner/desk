import { DesktopApp, DesktopSettings, DriveItem } from '../types/desktop';
import { BUILT_IN_APPS, DEFAULT_WALLPAPERS } from './defaultApps';
import { 
  loadDesktopDataFromSheets, 
  syncDesktopDataToSheets 
} from './googleSheetsService';
import { isGoogleAuthenticated } from './googleAuth';

const SETTINGS_KEY = 'webdesktop_settings_v1';
const CUSTOM_APPS_KEY = 'webdesktop_custom_apps_v1';
const LOCAL_FILES_KEY = 'webdesktop_local_files_v1';

export const INITIAL_SETTINGS: DesktopSettings = {
  wallpaper: DEFAULT_WALLPAPERS[0].url,
  theme: 'dark',
  taskbarPosition: 'bottom',
  iconGridSize: 'medium',
  autoSyncGoogle: true,
  soundEnabled: true,
  installedApps: BUILT_IN_APPS,
};

const INITIAL_LOCAL_FILES: DriveItem[] = [
  {
    id: 'local-file-welcome',
    name: 'Welcome to WebDesktop.md',
    mimeType: 'text/markdown',
    isFolder: false,
    modifiedTime: new Date().toISOString(),
    size: '1.2 KB',
    content: `# Welcome to WebDesktop OS 🖥️

A serverless desktop operating system running directly in your modern web browser!

## Key Features
1. **Google Drive Storage**:
   - Files are stored in your secure \`WebDesktop_Storage\` folder on Google Drive.
   - Access files anywhere you sign in with your Google Account.

2. **Google Sheets Backend**:
   - Settings, wallpapers, and custom installed apps are synchronized to a Google Spreadsheet.

3. **Frontend Code Installer (App Studio)**:
   - Paste or write HTML, CSS, and JavaScript.
   - Test in an interactive sandbox.
   - Install as a first-class Desktop Application with 1-click!

4. **App Manager / Store**:
   - Install pre-packaged apps from the App Store or import JSON packages.
   - Uninstall, inspect source code, or launch anytime.

5. **Deploy to GitHub Pages**:
   - This app is 100% serverless and client-side.
   - You can deploy it directly onto GitHub Pages! Check the **Settings -> GitHub Deploy** tab for details.
`,
  },
  {
    id: 'local-file-deploy',
    name: 'Deploy_To_GitHub.md',
    mimeType: 'text/markdown',
    isFolder: false,
    modifiedTime: new Date().toISOString(),
    size: '800 B',
    content: `# Deploying to GitHub Pages 🚀

Because this desktop operates entirely client-side (serverless), you can host it on GitHub Pages for free:

1. Fork or push this repository to GitHub.
2. Under Repository **Settings > Pages**, choose Branch: \`gh-pages\` or \`main\` (/docs).
3. If using Google Drive and Sheets backend:
   - The current Google OAuth client ID is provisioned for this applet.
   - When deploying to your custom GitHub Pages URL, configure your own OAuth Client ID in Google Cloud Console with your GitHub Pages URL as an authorized JavaScript origin!
`,
  },
  {
    id: 'local-folder-projects',
    name: 'My Projects',
    mimeType: 'application/vnd.google-apps.folder',
    isFolder: true,
    modifiedTime: new Date().toISOString(),
  },
];

export function getLocalSettings(): DesktopSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return INITIAL_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...INITIAL_SETTINGS, ...parsed };
  } catch {
    return INITIAL_SETTINGS;
  }
}

export function saveLocalSettings(settings: DesktopSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
}

export function getLocalCustomApps(): DesktopApp[] {
  try {
    const raw = localStorage.getItem(CUSTOM_APPS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLocalCustomApps(apps: DesktopApp[]): void {
  try {
    localStorage.setItem(CUSTOM_APPS_KEY, JSON.stringify(apps));
  } catch (e) {
    console.error('Failed to save custom apps to localStorage', e);
  }
}

export function getAllApps(customApps: DesktopApp[]): DesktopApp[] {
  return [...BUILT_IN_APPS, ...customApps];
}

export function getLocalFiles(): DriveItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_FILES_KEY);
    if (!raw) {
      saveLocalFiles(INITIAL_LOCAL_FILES);
      return INITIAL_LOCAL_FILES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_LOCAL_FILES;
  }
}

export function saveLocalFiles(files: DriveItem[]): void {
  try {
    localStorage.setItem(LOCAL_FILES_KEY, JSON.stringify(files));
  } catch (e) {
    console.error('Failed to save local files', e);
  }
}

/**
 * Sync desktop configuration and custom apps with Google Sheets.
 */
export async function syncWithGoogleSheets(
  currentSettings: DesktopSettings,
  currentCustomApps: DesktopApp[]
): Promise<{ success: boolean; spreadsheetId?: string; error?: string }> {
  if (!isGoogleAuthenticated()) {
    return { success: false, error: 'User is not signed in to Google.' };
  }

  try {
    const spreadsheetId = await syncDesktopDataToSheets(currentSettings, currentCustomApps);
    return { success: true, spreadsheetId };
  } catch (err: any) {
    console.error('Sync failed:', err);
    return { success: false, error: err?.message || 'Sync error' };
  }
}

/**
 * Pull latest settings and custom apps from Google Sheets.
 */
export async function fetchFromGoogleSheets(): Promise<{
  settings?: Partial<DesktopSettings>;
  customApps?: DesktopApp[];
  spreadsheetId?: string;
  error?: string;
}> {
  if (!isGoogleAuthenticated()) {
    return { error: 'Not authenticated' };
  }

  try {
    const result = await loadDesktopDataFromSheets();
    if (result) {
      return {
        settings: result.settings,
        customApps: result.apps,
        spreadsheetId: result.spreadsheetId,
      };
    }
    return { error: 'No data found' };
  } catch (err: any) {
    return { error: err?.message || 'Failed to fetch from Google Sheets' };
  }
}
