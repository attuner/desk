export interface DesktopApp {
  id: string;
  name: string;
  icon: string; // Lucide icon name or emoji or image URL
  category: 'System' | 'Productivity' | 'Development' | 'Utilities' | 'Games' | 'Media';
  description: string;
  isCustom?: boolean;
  code?: string; // HTML/JS/CSS code bundle for custom apps
  defaultWidth: number;
  defaultHeight: number;
  minWidth?: number;
  minHeight?: number;
  resizable?: boolean;
  pinnedToTaskbar?: boolean;
  showOnDesktop?: boolean;
  version?: string;
  author?: string;
  createdAt?: string;
}

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  icon: string;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  prevPosition?: { x: number; y: number; width: number; height: number };
  payload?: any; // e.g. opened file or initial route
}

export interface WallpaperOption {
  id: string;
  name: string;
  url: string;
  thumbnail: string;
  dark: boolean;
}

export interface DesktopSettings {
  wallpaper: string; // URL or id
  theme: 'dark' | 'light' | 'cyber' | 'glass';
  taskbarPosition: 'bottom' | 'top';
  iconGridSize: 'small' | 'medium' | 'large';
  autoSyncGoogle: boolean;
  soundEnabled: boolean;
  installedApps: DesktopApp[];
  googleDriveFolderId?: string;
  googleSheetsId?: string;
  lastSyncedAt?: string;
}

export interface DriveItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: number | string;
  isFolder: boolean;
  parentId?: string;
  content?: string;
  iconUrl?: string;
  webViewLink?: string;
}

export interface GoogleUserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export type SyncState = 'idle' | 'syncing' | 'synced' | 'error' | 'unauthenticated';
