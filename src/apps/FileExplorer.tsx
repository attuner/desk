import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  FileText, 
  FileCode, 
  Upload, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Download, 
  Cloud, 
  HardDrive, 
  ExternalLink,
  ChevronRight,
  FolderPlus,
  FilePlus,
  AlertCircle
} from 'lucide-react';
import { DriveItem } from '../types/desktop';
import { 
  listDriveFiles, 
  createDriveFile, 
  createDriveFolder, 
  deleteDriveFile,
  readDriveFileContent 
} from '../services/googleDriveService';
import { isGoogleAuthenticated } from '../services/googleAuth';
import { getLocalFiles, saveLocalFiles } from '../services/desktopStorage';
import { ConfirmationModal } from '../components/desktop/ConfirmationModal';

interface FileExplorerProps {
  onOpenFileInNotepad: (file: { name: string; content: string; driveId?: string }) => void;
  onOpenSignIn: () => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  onOpenFileInNotepad,
  onOpenSignIn,
}) => {
  const [source, setSource] = useState<'drive' | 'local'>(
    isGoogleAuthenticated() ? 'drive' : 'local'
  );
  const [files, setFiles] = useState<DriveItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
  const [folderPath, setFolderPath] = useState<{ id?: string; name: string }[]>([
    { name: 'Root' },
  ]);

  // Modals and dialogs
  const [isNewFileDialog, setIsNewFileDialog] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState('text/plain');
  const [newFileContent, setNewFileContent] = useState('');

  const [isNewFolderDialog, setIsNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Confirmation Modal state for deletion (Workspace guidelines mandatory)
  const [itemToDelete, setItemToDelete] = useState<DriveItem | null>(null);

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);

    if (source === 'drive') {
      if (!isGoogleAuthenticated()) {
        setError('Please sign in with Google to access your Google Drive storage folder.');
        setLoading(false);
        return;
      }

      try {
        const driveItems = await listDriveFiles(currentFolderId);
        setFiles(driveItems);
      } catch (err: any) {
        setError(err.message || 'Failed to list Google Drive files');
      } finally {
        setLoading(false);
      }
    } else {
      // Local storage files
      const local = getLocalFiles();
      setFiles(local);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [source, currentFolderId]);

  const handleCreateFile = async () => {
    if (!newFileName.trim()) return;
    setLoading(true);
    try {
      if (source === 'drive') {
        await createDriveFile(
          newFileName.trim(),
          newFileContent,
          newFileType,
          currentFolderId
        );
      } else {
        const local = getLocalFiles();
        const created: DriveItem = {
          id: `local-file-${Date.now()}`,
          name: newFileName.trim(),
          mimeType: newFileType,
          isFolder: false,
          modifiedTime: new Date().toISOString(),
          size: `${Math.max(1, Math.round(newFileContent.length / 1024))} KB`,
          content: newFileContent,
        };
        saveLocalFiles([created, ...local]);
      }
      setIsNewFileDialog(false);
      setNewFileName('');
      setNewFileContent('');
      await fetchFiles();
    } catch (err: any) {
      setError(err.message || 'Failed to create file');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setLoading(true);
    try {
      if (source === 'drive') {
        await createDriveFolder(newFolderName.trim(), currentFolderId);
      } else {
        const local = getLocalFiles();
        const folder: DriveItem = {
          id: `local-folder-${Date.now()}`,
          name: newFolderName.trim(),
          mimeType: 'application/vnd.google-apps.folder',
          isFolder: true,
          modifiedTime: new Date().toISOString(),
        };
        saveLocalFiles([folder, ...local]);
      }
      setIsNewFolderDialog(false);
      setNewFolderName('');
      await fetchFiles();
    } catch (err: any) {
      setError(err.message || 'Failed to create folder');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    setLoading(true);
    try {
      if (source === 'drive') {
        await deleteDriveFile(itemToDelete.id);
      } else {
        const local = getLocalFiles().filter((f) => f.id !== itemToDelete.id);
        saveLocalFiles(local);
      }
      setItemToDelete(null);
      await fetchFiles();
    } catch (err: any) {
      setError(err.message || 'Failed to delete item');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFile = async (item: DriveItem) => {
    if (item.isFolder) {
      setCurrentFolderId(item.id);
      setFolderPath([...folderPath, { id: item.id, name: item.name }]);
      return;
    }

    try {
      let content = item.content || '';
      if (source === 'drive' && !content) {
        setLoading(true);
        content = await readDriveFileContent(item.id);
        setLoading(false);
      }
      onOpenFileInNotepad({
        name: item.name,
        content: content,
        driveId: source === 'drive' ? item.id : undefined,
      });
    } catch (err: any) {
      setError('Could not read file contents: ' + err.message);
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (source === 'drive') {
        await createDriveFile(file.name, text, file.type || 'text/plain', currentFolderId);
      } else {
        const local = getLocalFiles();
        saveLocalFiles([
          {
            id: `local-file-${Date.now()}`,
            name: file.name,
            mimeType: file.type || 'text/plain',
            isFolder: false,
            modifiedTime: new Date().toISOString(),
            size: `${(file.size / 1024).toFixed(1)} KB`,
            content: text,
          },
          ...local,
        ]);
      }
      fetchFiles();
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none overflow-hidden">
      {/* Top Bar with Mode Switcher */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSource('drive')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                source === 'drive'
                  ? 'bg-blue-600 text-white font-medium shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cloud className="w-3.5 h-3.5 text-sky-400" />
              Google Drive Storage
            </button>
            <button
              onClick={() => setSource('local')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                source === 'local'
                  ? 'bg-blue-600 text-white font-medium shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5 text-amber-400" />
              Local Storage
            </button>
          </div>

          {/* Breadcrumbs */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
            {folderPath.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
                <button
                  onClick={() => {
                    setCurrentFolderId(item.id);
                    setFolderPath(folderPath.slice(0, idx + 1));
                  }}
                  className="hover:text-white truncate max-w-[120px]"
                >
                  {item.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewFileDialog(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
          >
            <FilePlus className="w-3.5 h-3.5 text-emerald-400" /> New File
          </button>
          <button
            onClick={() => setIsNewFolderDialog(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
          >
            <FolderPlus className="w-3.5 h-3.5 text-amber-400" /> New Folder
          </button>
          <label className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium cursor-pointer transition">
            <Upload className="w-3.5 h-3.5 text-blue-400" /> Upload
            <input type="file" onChange={handleFileUpload} className="hidden" />
          </label>
          <button
            onClick={fetchFiles}
            title="Refresh Files"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Auth Banner if in Google Drive mode but not signed in */}
      {source === 'drive' && !isGoogleAuthenticated() && (
        <div className="m-4 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cloud className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <p className="font-semibold text-white">Google Drive is not connected</p>
              <p className="text-slate-400 mt-0.5">
                Sign in with Google to access your cloud documents, code files, and desktop storage.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenSignIn}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow transition whitespace-nowrap"
          >
            Sign in with Google
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Files List / Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-xs gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
            Loading files...
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-xs gap-2">
            <Folder className="w-8 h-8 opacity-40" />
            <span>Folder is empty. Create a file or upload from your computer.</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {files.map((file) => (
              <div
                key={file.id}
                onDoubleClick={() => handleOpenFile(file)}
                className="group relative flex flex-col items-center p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition text-center"
              >
                {/* Delete button (top right on hover) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setItemToDelete(file);
                  }}
                  title="Delete Item"
                  className="absolute top-2 right-2 p-1 rounded-md bg-slate-950/80 text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition shadow"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-2">
                  {file.isFolder ? (
                    <Folder className="w-10 h-10 text-amber-400 fill-amber-400/20" />
                  ) : file.name.endsWith('.html') || file.name.endsWith('.js') || file.name.endsWith('.json') ? (
                    <FileCode className="w-10 h-10 text-blue-400 fill-blue-400/20" />
                  ) : (
                    <FileText className="w-10 h-10 text-slate-300 fill-slate-300/10" />
                  )}
                </div>

                <span className="text-xs font-medium text-slate-200 truncate w-full px-1">
                  {file.name}
                </span>

                <span className="text-[10px] text-slate-500 mt-1">
                  {file.isFolder ? 'Folder' : file.size || 'Text'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog: New File */}
      {isNewFileDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FilePlus className="w-4 h-4 text-emerald-400" /> Create New File
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">File Name</label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="notes.txt, script.js, page.html"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Initial Content</label>
                <textarea
                  value={newFileContent}
                  onChange={(e) => setNewFileContent(e.target.value)}
                  rows={4}
                  placeholder="Optional initial text content..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 outline-none focus:border-blue-500 resize-none font-mono text-[11px]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsNewFileDialog(false)}
                className="px-3.5 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFile}
                disabled={!newFileName.trim()}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog: New Folder */}
      {isNewFolderDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-amber-400" /> Create New Folder
            </h3>
            <div className="text-xs">
              <label className="block text-slate-400 mb-1">Folder Name</label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="My Projects"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsNewFolderDialog(false)}
                className="px-3.5 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold"
              >
                Create Folder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workspace-compliant destructive confirmation modal */}
      <ConfirmationModal
        isOpen={itemToDelete !== null}
        title="Delete Item"
        message={`Are you sure you want to permanently delete "${itemToDelete?.name}"? ${
          source === 'drive'
            ? 'This will delete the file from your Google Drive WebDesktop_Storage folder.'
            : 'This will delete the file from your local storage.'
        }`}
        confirmLabel="Delete Permanently"
        confirmVariant="danger"
        onConfirm={handleDeleteItem}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
