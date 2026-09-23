import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, Home, Globe, ExternalLink } from 'lucide-react';

export const WebBrowser: React.FC = () => {
  const [url, setUrl] = useState('https://en.wikipedia.org/wiki/Operating_system');
  const [inputUrl, setInputUrl] = useState('https://en.wikipedia.org/wiki/Operating_system');
  const [key, setKey] = useState(0);

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    let dest = inputUrl.trim();
    if (!dest.startsWith('http://') && !dest.startsWith('https://')) {
      dest = 'https://' + dest;
    }
    setUrl(dest);
    setInputUrl(dest);
  };

  const bookmarks = [
    { title: 'Wikipedia OS', url: 'https://en.wikipedia.org/wiki/Operating_system' },
    { title: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
    { title: 'GitHub', url: 'https://github.com' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none overflow-hidden">
      {/* Navigation bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 border-b border-slate-800">
        <button
          onClick={() => setKey((k) => k + 1)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Reload"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <form onSubmit={handleNavigate} className="flex-1 flex items-center">
          <div className="relative w-full flex items-center">
            <Globe className="w-3.5 h-3.5 text-slate-500 absolute left-3" />
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none focus:border-blue-500"
            />
          </div>
        </form>

        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Open in new browser tab"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Bookmarks */}
      <div className="flex items-center gap-2 px-3 py-1 bg-slate-950/80 border-b border-slate-800 text-[11px]">
        <span className="text-slate-500">Bookmarks:</span>
        {bookmarks.map((bm) => (
          <button
            key={bm.url}
            onClick={() => {
              setUrl(bm.url);
              setInputUrl(bm.url);
            }}
            className="px-2 py-0.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition truncate max-w-[140px]"
          >
            {bm.title}
          </button>
        ))}
      </div>

      {/* Webview frame */}
      <div className="flex-1 relative bg-white">
        <iframe
          key={key}
          src={url}
          title="Web Browser"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          className="w-full h-full border-none"
        />
      </div>
    </div>
  );
};
