import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Download, 
  Sparkles, 
  Check, 
  Code2, 
  Eye, 
  Layers, 
  RotateCcw,
  PlusCircle,
  FileCode,
  Info
} from 'lucide-react';
import { DesktopApp } from '../types/desktop';
import { AppIconRenderer } from '../components/desktop/AppIconRenderer';

interface AppStudioProps {
  onInstallApp: (app: DesktopApp) => void;
  onLaunchApp: (appId: string) => void;
  initialAppToEdit?: DesktopApp | null;
}

const TEMPLATES = [
  {
    name: 'Pomodoro Timer',
    icon: 'Timer',
    category: 'Productivity',
    code: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {
    margin: 0; background: #0f172a; color: #fff; font-family: system-ui, sans-serif;
    display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;
  }
  .box { background: #1e293b; padding: 30px; border-radius: 16px; text-align: center; width: 280px; box-shadow: 0 10px 25px rgba(0,0,0,0.4); }
  .time { font-size: 54px; font-weight: 700; color: #38bdf8; margin: 15px 0; font-family: monospace; }
  button { padding: 10px 18px; margin: 4px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; }
  .start { background: #10b981; color: white; }
  .reset { background: #475569; color: white; }
</style>
</head>
<body>
  <div class="box">
    <div style="font-size:14px;color:#94a3b8;font-weight:600">FOCUS TIMER</div>
    <div class="time" id="t">25:00</div>
    <button class="start" id="btn" onclick="toggle()">Start</button>
    <button class="reset" onclick="reset()">Reset</button>
  </div>
  <script>
    let s = 1500, run = false, id = null;
    function update() {
      const m = Math.floor(s/60), sec = s%60;
      document.getElementById('t').innerText = String(m).padStart(2,'0') + ':' + String(sec).padStart(2,'0');
    }
    function toggle() {
      if(run) { clearInterval(id); run = false; document.getElementById('btn').innerText='Start'; }
      else {
        run = true; document.getElementById('btn').innerText='Pause';
        id = setInterval(() => { if(s>0){s--;update();} else {clearInterval(id); alert('Time up!');} }, 1000);
      }
    }
    function reset() { clearInterval(id); run = false; s = 1500; update(); document.getElementById('btn').innerText='Start'; }
  </script>
</body>
</html>`,
  },
  {
    name: 'Retro Pong Game',
    icon: 'Gamepad2',
    category: 'Games',
    code: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #000; color: #00ff66; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; }
  canvas { border: 2px solid #00ff66; background: #050505; }
  p { margin: 6px 0; font-size: 12px; }
</style>
</head>
<body>
  <p>Move mouse up & down to control left paddle</p>
  <canvas id="c" width="400" height="260"></canvas>
  <script>
    const c = document.getElementById('c'), ctx = c.getContext('2d');
    let p1 = 100, p2 = 100, bx = 200, by = 130, vx = 3, vy = 2, s1 = 0, s2 = 0;
    c.addEventListener('mousemove', e => {
      const rect = c.getBoundingClientRect();
      p1 = Math.max(0, Math.min(200, e.clientY - rect.top - 30));
    });
    function loop() {
      bx += vx; by += vy;
      if (by <= 0 || by >= 252) vy = -vy;
      // AI paddle
      p2 += (by - (p2 + 30)) * 0.1;
      // Left hit
      if (bx <= 18 && by >= p1 && by <= p1 + 60) { vx = -vx * 1.05; bx = 18; }
      // Right hit
      if (bx >= 374 && by >= p2 && by <= p2 + 60) { vx = -vx * 1.05; bx = 374; }
      // Score
      if (bx < 0) { s2++; reset(); }
      if (bx > 400) { s1++; reset(); }
      // Draw
      ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, 400, 260);
      ctx.fillStyle = '#00ff66';
      ctx.fillRect(10, p1, 8, 60);
      ctx.fillRect(382, p2, 8, 60);
      ctx.fillRect(bx, by, 8, 8);
      ctx.fillText(s1 + '  :  ' + s2, 185, 25);
      requestAnimationFrame(loop);
    }
    function reset() { bx = 200; by = 130; vx = (Math.random() > 0.5 ? 3 : -3); vy = (Math.random() > 0.5 ? 2 : -2); }
    loop();
  </script>
</body>
</html>`,
  },
  {
    name: 'Quick Markdown Notes',
    icon: 'FileText',
    category: 'Productivity',
    code: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #18181b; color: #f4f4f5; font-family: system-ui, sans-serif; display: flex; height: 100vh; }
  textarea { flex: 1; padding: 16px; background: #09090b; color: #a1a1aa; border: none; border-right: 1px solid #27272a; resize: none; font-family: monospace; font-size: 13px; outline: none; }
  .preview { flex: 1; padding: 16px; overflow-y: auto; font-size: 14px; line-height: 1.6; }
  h1, h2 { color: #60a5fa; border-bottom: 1px solid #3f3f46; padding-bottom: 4px; }
  code { background: #27272a; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
</style>
</head>
<body>
  <textarea id="src" placeholder="Type Markdown here..."># My Quick Notes 📝

- [x] Test the new App Studio
- [ ] Connect Google Drive
- [ ] Deploy to GitHub Pages

Here is an example code block:
~~~javascript
console.log("WebDesktop is live!");
~~~
</textarea>
  <div class="preview" id="dest"></div>
  <script>
    function render() {
      let val = document.getElementById('src').value;
      val = val.replace(/^# (.*$)/gim, '<h1>$1</h1>')
               .replace(/^## (.*$)/gim, '<h2>$1</h2>')
               .replace(/\\*\\*(.*)\\*\\*/gim, '<b>$1</b>')
               .replace(/\\*(.*)\\*/gim, '<i>$1</i>')
               .replace(/^- \\[x\\] (.*$)/gim, '<p>✅ <s>$1</s></p>')
               .replace(/^- \\[ \\] (.*$)/gim, '<p>⬜ $1</p>')
               .replace(/^- (.*$)/gim, '<li>$1</li>')
               .replace(new RegExp('\\x60\\x60\\x60([\\\\s\\\\S]*?)\\x60\\x60\\x60', 'gm'), '<pre><code>$1</code></pre>')
               .replace(new RegExp('\\x60([^\\x60]+)\\x60', 'g'), '<code>$1</code>');
      document.getElementById('dest').innerHTML = val;
    }
    document.getElementById('src').addEventListener('input', render);
    render();
  </script>
</body>
</html>`,
  },
  {
    name: 'Interactive Canvas Painter',
    icon: 'Palette',
    category: 'Media',
    code: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #121214; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
  .bar { padding: 8px 12px; background: #1f1f23; border-bottom: 1px solid #2e2e33; display: flex; gap: 8px; align-items: center; }
  button { padding: 6px 12px; border-radius: 6px; border: none; background: #3b82f6; color: white; cursor: pointer; font-size: 12px; }
  canvas { flex: 1; background: #ffffff; cursor: crosshair; }
</style>
</head>
<body>
  <div class="bar">
    <button onclick="ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height)">Clear</button>
    <input type="color" id="col" value="#3b82f6">
    <input type="range" id="sz" min="1" max="25" value="4" style="width:70px">
    <span style="font-size:12px;color:#a1a1aa;margin-left:auto">Click & drag to draw</span>
  </div>
  <canvas id="c"></canvas>
  <script>
    const c = document.getElementById('c'), ctx = c.getContext('2d');
    let down = false;
    function rs() {
      const img = ctx.getImageData(0,0,c.width,c.height);
      c.width = window.innerWidth; c.height = window.innerHeight - 45;
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,c.width,c.height);
      ctx.putImageData(img,0,0);
    }
    window.addEventListener('resize', rs);
    setTimeout(rs, 50);
    c.addEventListener('mousedown', () => down = true);
    window.addEventListener('mouseup', () => { down = false; ctx.beginPath(); });
    c.addEventListener('mousemove', e => {
      if (!down) return;
      ctx.lineWidth = document.getElementById('sz').value;
      ctx.lineCap = 'round';
      ctx.strokeStyle = document.getElementById('col').value;
      ctx.lineTo(e.clientX, e.clientY - 45);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(e.clientX, e.clientY - 45);
    });
  </script>
</body>
</html>`,
  }
];

const AVAILABLE_ICONS = [
  'Code2', 'Play', 'Sparkles', 'Timer', 'Gamepad2', 'Palette', 'Music', 'FileText',
  'Calculator', 'Globe', 'Terminal', 'Database', 'Activity', 'Layers', 'Compass',
  'Cpu', 'Coffee', 'Radio', 'Camera', 'Bookmark', 'CheckCircle', 'Flame'
];

export const AppStudio: React.FC<AppStudioProps> = ({
  onInstallApp,
  onLaunchApp,
  initialAppToEdit,
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [code, setCode] = useState(initialAppToEdit?.code || TEMPLATES[0].code);
  const [appName, setAppName] = useState(initialAppToEdit?.name || 'My New App');
  const [appIcon, setAppIcon] = useState(initialAppToEdit?.icon || 'Sparkles');
  const [appCategory, setAppCategory] = useState<DesktopApp['category']>(
    initialAppToEdit?.category || 'Utilities'
  );
  const [appDesc, setAppDesc] = useState(
    initialAppToEdit?.description || 'A custom frontend application installed on WebDesktop OS.'
  );
  const [appWidth, setAppWidth] = useState(initialAppToEdit?.defaultWidth || 680);
  const [appHeight, setAppHeight] = useState(initialAppToEdit?.defaultHeight || 480);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [installedAppId, setInstalledAppId] = useState<string | null>(null);

  useEffect(() => {
    if (initialAppToEdit) {
      setCode(initialAppToEdit.code || '');
      setAppName(initialAppToEdit.name);
      setAppIcon(initialAppToEdit.icon);
      setAppCategory(initialAppToEdit.category);
      setAppDesc(initialAppToEdit.description);
      setAppWidth(initialAppToEdit.defaultWidth);
      setAppHeight(initialAppToEdit.defaultHeight);
    }
  }, [initialAppToEdit]);

  const handleInstall = () => {
    if (!appName.trim()) return;

    const newApp: DesktopApp = {
      id: initialAppToEdit?.id || `custom-app-${Date.now()}`,
      name: appName.trim(),
      icon: appIcon,
      category: appCategory,
      description: appDesc.trim(),
      code: code,
      defaultWidth: Number(appWidth) || 680,
      defaultHeight: Number(appHeight) || 480,
      minWidth: 320,
      minHeight: 240,
      resizable: true,
      pinnedToTaskbar: false,
      showOnDesktop: true,
      isCustom: true,
      version: '1.0.0',
      author: 'User',
      createdAt: new Date().toISOString(),
    };

    onInstallApp(newApp);
    setInstalledAppId(newApp.id);
    setInstallSuccess(true);
    setTimeout(() => setInstallSuccess(false), 5000);
  };

  const handleLoadTemplate = (template: typeof TEMPLATES[0]) => {
    setCode(template.code);
    setAppName(template.name);
    setAppIcon(template.icon);
    setAppCategory(template.category as any);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none overflow-hidden">
      {/* Top Studio Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600/20 text-blue-400 rounded-lg">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
              <span>App Studio</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono">
                Frontend Installer
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Write HTML/JS/CSS & install as desktop application</p>
          </div>
        </div>

        {/* Tab Switcher & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition ${
                activeTab === 'editor'
                  ? 'bg-blue-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              Source Code
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition ${
                activeTab === 'preview'
                  ? 'bg-blue-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Live Preview
            </button>
          </div>

          <button
            onClick={handleInstall}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition active:scale-95"
          >
            {installSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" /> Installed!
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" /> Install to Desktop
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Studio Body: 2 Columns */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Code / Preview */}
        <div className="flex-1 flex flex-col border-r border-slate-800/80 bg-slate-900/40">
          {activeTab === 'editor' ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 text-slate-400 text-xs border-b border-slate-800">
                <span className="font-mono text-[11px]">index.html (HTML + CSS + JS)</span>
                <span className="text-[10px] text-slate-500">Self-contained web app</span>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="flex-1 p-3.5 bg-slate-950 font-mono text-xs text-blue-200/90 leading-relaxed outline-none resize-none selection:bg-blue-600/40 border-none"
                placeholder="Write or paste full HTML code here..."
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col bg-slate-950">
              <div className="px-3 py-1.5 bg-slate-900 text-slate-400 text-xs border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-medium text-slate-300">Sandboxed Sandbox Runtime</span>
                </div>
                <button
                  onClick={() => {
                    const temp = code;
                    setCode('');
                    setTimeout(() => setCode(temp), 50);
                  }}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                >
                  <RotateCcw className="w-3 h-3" /> Refresh
                </button>
              </div>
              <iframe
                title="Preview"
                srcDoc={code}
                sandbox="allow-scripts allow-forms allow-modals"
                className="flex-1 w-full h-full border-none bg-white"
              />
            </div>
          )}
        </div>

        {/* Right Column: Configuration & Templates */}
        <div className="w-80 flex flex-col bg-slate-900/60 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Quick Success Banner */}
          {installSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-xs">App Installed!</span>
              </div>
              {installedAppId && (
                <button
                  onClick={() => onLaunchApp(installedAppId)}
                  className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-semibold hover:bg-emerald-500"
                >
                  Launch Now
                </button>
              )}
            </div>
          )}

          {/* App Metadata Form */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              App Properties
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">App Title</label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-xs focus:border-blue-500 outline-none"
                placeholder="My App"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Category</label>
              <select
                value={appCategory}
                onChange={(e) => setAppCategory(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-xs focus:border-blue-500 outline-none"
              >
                <option value="Productivity">Productivity</option>
                <option value="Utilities">Utilities</option>
                <option value="Development">Development</option>
                <option value="Games">Games</option>
                <option value="Media">Media</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
                Icon (Select or Emoji / URL)
              </label>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <AppIconRenderer name={appIcon} size={20} />
                </div>
                <input
                  type="text"
                  value={appIcon}
                  onChange={(e) => setAppIcon(e.target.value)}
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-xs font-mono focus:border-blue-500 outline-none"
                  placeholder="Icon Name or Emoji"
                />
              </div>

              {/* Icon Picker Grid */}
              <div className="grid grid-cols-6 gap-1 p-1 bg-slate-900/60 rounded-lg border border-slate-800">
                {AVAILABLE_ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setAppIcon(ic)}
                    className={`p-1.5 rounded flex items-center justify-center hover:bg-slate-800 transition ${
                      appIcon === ic ? 'bg-blue-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    <AppIconRenderer name={ic} size={15} />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Width (px)</label>
                <input
                  type="number"
                  value={appWidth}
                  onChange={(e) => setAppWidth(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-xs focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Height (px)</label>
                <input
                  type="number"
                  value={appHeight}
                  onChange={(e) => setAppHeight(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-xs focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Description</label>
              <textarea
                value={appDesc}
                onChange={(e) => setAppDesc(e.target.value)}
                rows={2}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-xs focus:border-blue-500 outline-none resize-none"
              />
            </div>
          </div>

          {/* Quick Starter Templates */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Starter Templates
            </div>
            <div className="space-y-1.5">
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.name}
                  onClick={() => handleLoadTemplate(tmpl)}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left transition group"
                >
                  <div className="flex items-center gap-2">
                    <div className="text-slate-400 group-hover:text-blue-400">
                      <AppIconRenderer name={tmpl.icon} size={15} />
                    </div>
                    <span className="text-[11px] font-medium text-slate-300 group-hover:text-white">
                      {tmpl.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-blue-400 opacity-0 group-hover:opacity-100 transition">
                    Load
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
