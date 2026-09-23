/**
 * Google Sheets API Service
 * Stores Desktop settings, preferences, and custom installed apps in a spreadsheet.
 */
import { getAccessToken } from './googleAuth';
import { DesktopApp, DesktopSettings } from '../types/desktop';

const SPREADSHEET_TITLE = 'WebDesktop_Settings_DB';
let cachedSpreadsheetId: string | null = null;

async function sheetsFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google Sheets requires active sign-in.');
  }

  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google Sheets API error (${res.status}): ${errorText}`);
  }

  return res;
}

/**
 * Finds or creates the WebDesktop_Settings_DB spreadsheet.
 */
export async function getOrCreateSettingsSpreadsheet(): Promise<string> {
  if (cachedSpreadsheetId) return cachedSpreadsheetId;

  const token = await getAccessToken();
  // Search in Drive for this sheet
  const query = encodeURIComponent(
    `name = '${SPREADSHEET_TITLE}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`
  );
  
  const driveRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (driveRes.ok) {
    const data = await driveRes.json();
    if (data.files && data.files.length > 0) {
      cachedSpreadsheetId = data.files[0].id;
      return cachedSpreadsheetId!;
    }
  }

  // Create new spreadsheet with 'Settings' and 'InstalledApps' sheets
  const createRes = await sheetsFetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      properties: {
        title: SPREADSHEET_TITLE,
      },
      sheets: [
        {
          properties: {
            title: 'Settings',
            gridProperties: { rowCount: 50, columnCount: 5 },
          },
        },
        {
          properties: {
            title: 'InstalledApps',
            gridProperties: { rowCount: 100, columnCount: 10 },
          },
        },
      ],
    }),
  });

  const createdData = await createRes.json();
  const spreadsheetId = createdData.spreadsheetId;
  cachedSpreadsheetId = spreadsheetId;

  // Initialize header rows
  await initializeSheetHeaders(spreadsheetId);

  return spreadsheetId;
}

/**
 * Initializes headers in the Google Sheet.
 */
async function initializeSheetHeaders(spreadsheetId: string) {
  // Settings headers
  await sheetsFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Settings!A1:C1?valueInputOption=RAW`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        values: [['Key', 'Value', 'LastUpdated']],
      }),
    }
  );

  // InstalledApps headers
  await sheetsFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/InstalledApps!A1:I1?valueInputOption=RAW`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        values: [[
          'AppId',
          'Name',
          'Icon',
          'Category',
          'Description',
          'Width',
          'Height',
          'CreatedAt',
          'CodeSnippet'
        ]],
      }),
    }
  );
}

/**
 * Reads settings and installed apps from Google Sheets.
 */
export async function loadDesktopDataFromSheets(): Promise<{
  settings: Partial<DesktopSettings>;
  apps: DesktopApp[];
  spreadsheetId: string;
} | null> {
  try {
    const spreadsheetId = await getOrCreateSettingsSpreadsheet();

    // Fetch settings sheet
    const settingsRes = await sheetsFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Settings!A2:C20`
    );
    const settingsData = await settingsRes.json();
    const settingsRows: string[][] = settingsData.values || [];

    const loadedSettings: any = {};
    for (const row of settingsRows) {
      if (row[0] && row[1]) {
        try {
          loadedSettings[row[0]] = JSON.parse(row[1]);
        } catch {
          loadedSettings[row[0]] = row[1];
        }
      }
    }

    // Fetch installed apps sheet
    const appsRes = await sheetsFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/InstalledApps!A2:I100`
    );
    const appsData = await appsRes.json();
    const appsRows: string[][] = appsData.values || [];

    const loadedApps: DesktopApp[] = appsRows.map((row) => ({
      id: row[0] || `app-${Date.now()}`,
      name: row[1] || 'Custom App',
      icon: row[2] || 'Terminal',
      category: (row[3] as any) || 'Development',
      description: row[4] || '',
      defaultWidth: Number(row[5]) || 700,
      defaultHeight: Number(row[6]) || 500,
      createdAt: row[7] || new Date().toISOString(),
      code: row[8] ? decodeURIComponent(row[8]) : '',
      isCustom: true,
      showOnDesktop: true,
      pinnedToTaskbar: false,
      resizable: true,
    }));

    return {
      settings: loadedSettings,
      apps: loadedApps,
      spreadsheetId,
    };
  } catch (error) {
    console.error('Error loading data from Google Sheets:', error);
    return null;
  }
}

/**
 * Saves desktop settings and custom installed apps to Google Sheets.
 */
export async function syncDesktopDataToSheets(
  settings: DesktopSettings,
  customApps: DesktopApp[]
): Promise<string> {
  const spreadsheetId = await getOrCreateSettingsSpreadsheet();
  const now = new Date().toISOString();

  // Prepare settings rows
  const settingsRows = [
    ['wallpaper', JSON.stringify(settings.wallpaper), now],
    ['theme', JSON.stringify(settings.theme), now],
    ['taskbarPosition', JSON.stringify(settings.taskbarPosition), now],
    ['iconGridSize', JSON.stringify(settings.iconGridSize), now],
    ['soundEnabled', JSON.stringify(settings.soundEnabled), now],
    ['lastSyncedAt', JSON.stringify(now), now],
  ];

  // Update Settings sheet
  await sheetsFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Settings!A2:C${settingsRows.length + 1}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: settingsRows }),
    }
  );

  // Clear existing InstalledApps data rows (from row 2 down)
  try {
    await sheetsFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/InstalledApps!A2:I100:clear`,
      { method: 'POST' }
    );
  } catch (e) {
    // ignore clear error if empty
  }

  // Write custom apps if any
  if (customApps.length > 0) {
    const appsRows = customApps.map((app) => [
      app.id,
      app.name,
      app.icon,
      app.category,
      app.description,
      app.defaultWidth.toString(),
      app.defaultHeight.toString(),
      app.createdAt || now,
      app.code ? encodeURIComponent(app.code) : '',
    ]);

    await sheetsFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/InstalledApps!A2:I${appsRows.length + 1}?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: appsRows }),
      }
    );
  }

  return spreadsheetId;
}

/**
 * Reads raw row values from both sheets for visual inspector.
 */
export async function getRawSheetsData(): Promise<{
  settingsRows: string[][];
  appsRows: string[][];
  spreadsheetId: string | null;
}> {
  try {
    const spreadsheetId = await getOrCreateSettingsSpreadsheet();
    const settingsRes = await sheetsFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Settings!A1:C25`
    );
    const settingsData = await settingsRes.json();

    const appsRes = await sheetsFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/InstalledApps!A1:I50`
    );
    const appsData = await appsRes.json();

    return {
      settingsRows: settingsData.values || [],
      appsRows: appsData.values || [],
      spreadsheetId,
    };
  } catch (error) {
    return {
      settingsRows: [],
      appsRows: [],
      spreadsheetId: cachedSpreadsheetId,
    };
  }
}
