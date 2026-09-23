import React, { useState, useEffect } from 'react';
import { Save, Cloud, HardDrive, FileText, Check, AlertCircle } from 'lucide-react';
import { updateDriveFileContent, createDriveFile } from '../services/googleDriveService';
import { isGoogleAuthenticated } from '../services/googleAuth';
import { getLocalFiles, saveLocalFiles } from '../services/desktopStorage';
import { DriveItem } from '../types/desktop';

interface NotepadProps {
  initialFile?: { name: string; content: string; driveId?: string };
}

export const Notepad: React.FC<NotepadProps> = ({ initialFile }) => {
  const [content, setContent] = useState(initialFile?.content || '');
  const [fileName, setFileName] = useState(initialFile?.name || 'Untitled.txt');
  const [driveId, setDriveId] = useState<string | undefined>(initialFile?.driveId);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialFile) {
      setContent(initialFile.content);
      setFileName(initialFile.name);
      setDriveId(initialFile.driveId);
    }
  }, [initialFile]);

  const handleSave = async (target: 'drive' | 'local') => {
    setSaving(true);
    setStatus(null);

    try {
      if (target === 'drive') {
        if (!isGoogleAuthenticated()) {
          throw new Error('Please sign in with Google to save to Drive.');
        }

        if (driveId) {
          await updateDriveFileContent(driveId, content);
          setStatus('Saved to Google Drive!');
        } else {
          const created = await createDriveFile(fileName, content);
          setDriveId(created.id);
          setStatus('Created & saved to Google Drive!');
        }
      } else {
        const local = getLocalFiles();
        const existingIdx = local.findIndex((f) => f.name === fileName);
        if (existingIdx >= 0) {
          local[existingIdx].content = content;
          local[existingIdx].modifiedTime = new Date().toISOString();
          saveLocalFiles([...local]);
        } else {
          const newDoc: DriveItem = {
            id: `local-file-${Date.now()}`,
            name: fileName,
            mimeType: 'text/plain',
            isFolder: false,
            modifiedTime: new Date().toISOString(),
            size: `${Math.max(1, Math.round(content.length / 1024))} KB`,
            content,
          };
          saveLocalFiles([newDoc, ...local]);
        }
        setStatus('Saved to Local Storage!');
      }
    } catch (err: any) {
      setStatus(`Error: ${err.message || 'Save failed'}`);
    } finally {
      setSaving(false);
      setTimeout(() => setStatus(null), 4000);
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none overflow-hidden">
      {/* Notepad Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100 font-medium focus:border-blue-500 outline-none w-44"
          />
          {driveId && (
            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-mono">
              Google Drive Synced
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {status && (
            <span
              className={`text-xs flex items-center gap-1 font-medium ${
                status.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {status.startsWith('Error') ? <AlertCircle className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
              {status}
            </span>
          )}

          <button
            onClick={() => handleSave('local')}
            disabled={saving}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
          >
            <HardDrive className="w-3.5 h-3.5 text-amber-400" /> Save Local
          </button>

          <button
            onClick={() => handleSave('drive')}
            disabled={saving}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition"
          >
            <Cloud className="w-3.5 h-3.5" /> Save to Drive
          </button>
        </div>
      </div>

      {/* Editor Canvas */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start typing your text or notes..."
        spellCheck={false}
        className="flex-1 p-4 bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed outline-none resize-none border-none selection:bg-blue-600/40"
      />

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center gap-4">
          <span>Words: {wordCount}</span>
          <span>Characters: {charCount}</span>
          <span>Encoding: UTF-8</span>
        </div>
        <div className="font-mono text-[10px] text-slate-500">
          {driveId ? `Drive ID: ${driveId.slice(0, 10)}...` : 'Local Document'}
        </div>
      </div>
    </div>
  );
};
