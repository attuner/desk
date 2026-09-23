import { DesktopApp } from '../types/desktop';

export const BUILT_IN_APPS: DesktopApp[] = [
  {
    id: 'app-studio',
    name: 'App Studio',
    icon: 'Code2',
    category: 'Development',
    description: 'Create, test, and install custom frontend web applications to your desktop.',
    defaultWidth: 840,
    defaultHeight: 580,
    minWidth: 500,
    minHeight: 400,
    resizable: true,
    pinnedToTaskbar: true,
    showOnDesktop: true,
    version: '1.0.0',
    author: 'System',
  },
  {
    id: 'app-manager',
    name: 'App Center',
    icon: 'LayoutGrid',
    category: 'Utilities',
    description: 'Install, uninstall, browse community apps, and manage your desktop packages.',
    defaultWidth: 820,
    defaultHeight: 560,
    minWidth: 480,
    minHeight: 380,
    resizable: true,
    pinnedToTaskbar: true,
    showOnDesktop: true,
    version: '1.0.0',
    author: 'System',
  },
  {
    id: 'file-explorer',
    name: 'Files & Drive',
    icon: 'Folder',
    category: 'Productivity',
    description: 'Browse, manage, upload, and organize files in Google Drive and local storage.',
    defaultWidth: 800,
    defaultHeight: 520,
    minWidth: 460,
    minHeight: 360,
    resizable: true,
    pinnedToTaskbar: true,
    showOnDesktop: true,
    version: '1.0.0',
    author: 'System',
  },
  {
    id: 'sheets-sync',
    name: 'Sheets Sync',
    icon: 'Table2',
    category: 'System',
    description: 'Inspect and manage the Google Sheets database storing desktop settings.',
    defaultWidth: 780,
    defaultHeight: 500,
    minWidth: 450,
    minHeight: 350,
    resizable: true,
    pinnedToTaskbar: false,
    showOnDesktop: true,
    version: '1.0.0',
    author: 'System',
  },
  {
    id: 'notepad',
    name: 'Notepad',
    icon: 'FileText',
    category: 'Productivity',
    description: 'Lightweight text and code editor with Google Drive cloud save.',
    defaultWidth: 640,
    defaultHeight: 460,
    minWidth: 380,
    minHeight: 300,
    resizable: true,
    pinnedToTaskbar: true,
    showOnDesktop: true,
    version: '1.0.0',
    author: 'System',
  },
  {
    id: 'terminal',
    name: 'Terminal',
    icon: 'Terminal',
    category: 'Development',
    description: 'Command line interface for desktop management, file ops, and package control.',
    defaultWidth: 680,
    defaultHeight: 440,
    minWidth: 400,
    minHeight: 280,
    resizable: true,
    pinnedToTaskbar: false,
    showOnDesktop: true,
    version: '1.0.0',
    author: 'System',
  },
  {
    id: 'calculator',
    name: 'Calculator',
    icon: 'Calculator',
    category: 'Utilities',
    description: 'Standard and scientific desktop calculator with tape history.',
    defaultWidth: 340,
    defaultHeight: 480,
    minWidth: 320,
    minHeight: 450,
    resizable: false,
    pinnedToTaskbar: false,
    showOnDesktop: true,
    version: '1.0.0',
    author: 'System',
  },
  {
    id: 'browser',
    name: 'Web Browser',
    icon: 'Globe',
    category: 'Utilities',
    description: 'Browse web pages, documentation, and external web utilities in a window.',
    defaultWidth: 840,
    defaultHeight: 560,
    minWidth: 480,
    minHeight: 350,
    resizable: true,
    pinnedToTaskbar: false,
    showOnDesktop: false,
    version: '1.0.0',
    author: 'System',
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: 'Settings',
    category: 'System',
    description: 'Customize wallpapers, appearance, Google Workspace sync, and GitHub deployment.',
    defaultWidth: 760,
    defaultHeight: 520,
    minWidth: 450,
    minHeight: 380,
    resizable: true,
    pinnedToTaskbar: true,
    showOnDesktop: true,
    version: '1.0.0',
    author: 'System',
  },
];

// Curated App Store catalog with ready-to-run frontend apps
export const APP_STORE_CATALOG: DesktopApp[] = [
  {
    id: 'store-pomodoro',
    name: 'Pomodoro Focus',
    icon: 'Timer',
    category: 'Productivity',
    description: 'Classic Pomodoro technique timer with work/break intervals and sound chimes.',
    defaultWidth: 420,
    defaultHeight: 520,
    resizable: true,
    version: '1.2.0',
    author: 'WebOS Community',
    code: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {
    margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #0f172a; color: #f8fafc; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; box-sizing: border-box;
  }
  .card { background: #1e293b; padding: 32px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); text-align: center; width: 100%; max-width: 320px; }
  .badge { display: inline-block; padding: 4px 12px; background: #3b82f6; color: white; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 16px; }
  .timer { font-size: 56px; font-weight: 800; font-variant-numeric: tabular-nums; margin: 16px 0; color: #38bdf8; }
  .btn-group { display: flex; gap: 12px; justify-content: center; margin-top: 20px; }
  button { padding: 10px 20px; font-size: 14px; font-weight: 600; border-radius: 10px; border: none; cursor: pointer; transition: 0.2s; }
  .btn-start { background: #10b981; color: white; }
  .btn-start:hover { background: #059669; }
  .btn-reset { background: #475569; color: white; }
  .btn-reset:hover { background: #334155; }
  .stats { margin-top: 20px; font-size: 13px; color: #94a3b8; }
</style>
</head>
<body>
  <div class="card">
    <div class="badge" id="mode">Work Session</div>
    <div class="timer" id="timer">25:00</div>
    <div class="btn-group">
      <button class="btn-start" id="toggleBtn" onclick="toggleTimer()">Start</button>
      <button class="btn-reset" onclick="resetTimer()">Reset</button>
    </div>
    <div class="stats">Pomodoros completed: <span id="count" style="color:#38bdf8;font-weight:700">0</span></div>
  </div>
  <script>
    let timeLeft = 25 * 60;
    let isRunning = false;
    let timerId = null;
    let count = 0;
    let isWork = true;

    function updateDisplay() {
      const mins = Math.floor(timeLeft / 60);
      const secs = timeLeft % 60;
      document.getElementById('timer').textContent = 
        String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
    }

    function toggleTimer() {
      if (isRunning) {
        clearInterval(timerId);
        isRunning = false;
        document.getElementById('toggleBtn').textContent = 'Start';
        document.getElementById('toggleBtn').style.background = '#10b981';
      } else {
        isRunning = true;
        document.getElementById('toggleBtn').textContent = 'Pause';
        document.getElementById('toggleBtn').style.background = '#f59e0b';
        timerId = setInterval(() => {
          if (timeLeft > 0) {
            timeLeft--;
            updateDisplay();
          } else {
            clearInterval(timerId);
            isRunning = false;
            if (isWork) {
              count++;
              document.getElementById('count').textContent = count;
              isWork = false;
              timeLeft = 5 * 60;
              document.getElementById('mode').textContent = 'Short Break';
              document.getElementById('mode').style.background = '#10b981';
            } else {
              isWork = true;
              timeLeft = 25 * 60;
              document.getElementById('mode').textContent = 'Work Session';
              document.getElementById('mode').style.background = '#3b82f6';
            }
            updateDisplay();
            document.getElementById('toggleBtn').textContent = 'Start';
          }
        }, 1000);
      }
    }

    function resetTimer() {
      clearInterval(timerId);
      isRunning = false;
      isWork = true;
      timeLeft = 25 * 60;
      document.getElementById('mode').textContent = 'Work Session';
      document.getElementById('mode').style.background = '#3b82f6';
      document.getElementById('toggleBtn').textContent = 'Start';
      document.getElementById('toggleBtn').style.background = '#10b981';
      updateDisplay();
    }
    updateDisplay();
  </script>
</body>
</html>`,
  },
  {
    id: 'store-snake',
    name: 'Retro Snake Arcade',
    icon: 'Gamepad2',
    category: 'Games',
    description: 'Smooth retro snake arcade game with score tracking, speed levels, and neon graphics.',
    defaultWidth: 460,
    defaultHeight: 520,
    resizable: true,
    version: '1.0.4',
    author: 'Arcade Labs',
    code: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {
    margin: 0; background: #090d16; color: #e2e8f0; font-family: monospace;
    display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;
  }
  .header { display: flex; justify-content: space-between; width: 360px; margin-bottom: 12px; font-size: 16px; }
  canvas { background: #131c2e; border: 2px solid #3b82f6; border-radius: 8px; box-shadow: 0 0 20px rgba(59,130,246,0.2); }
  .controls { margin-top: 12px; font-size: 12px; color: #94a3b8; }
</style>
</head>
<body>
  <div class="header">
    <div>SCORE: <span id="score" style="color:#10b981;font-weight:bold">0</span></div>
    <div>HIGH: <span id="high" style="color:#f59e0b;font-weight:bold">0</span></div>
  </div>
  <canvas id="game" width="360" height="360"></canvas>
  <div class="controls">Use Arrow Keys or WASD to Move • Press Space to Restart</div>
  <script>
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    const grid = 18;
    let snake = [{x: 9, y: 9}];
    let food = {x: 5, y: 5};
    let dx = 1, dy = 0;
    let score = 0;
    let highScore = 0;
    let gameOver = false;

    function resetGame() {
      snake = [{x: 9, y: 9}];
      dx = 1; dy = 0;
      score = 0;
      document.getElementById('score').textContent = score;
      gameOver = false;
      placeFood();
    }

    function placeFood() {
      food.x = Math.floor(Math.random() * (canvas.width / grid));
      food.y = Math.floor(Math.random() * (canvas.height / grid));
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w') { if (dy === 0) { dx = 0; dy = -1; } }
      else if (e.key === 'ArrowDown' || e.key === 's') { if (dy === 0) { dx = 0; dy = 1; } }
      else if (e.key === 'ArrowLeft' || e.key === 'a') { if (dx === 0) { dx = -1; dy = 0; } }
      else if (e.key === 'ArrowRight' || e.key === 'd') { if (dx === 0) { dx = 1; dy = 0; } }
      else if (e.key === ' ' && gameOver) { resetGame(); }
    });

    function loop() {
      if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ef4444';
        ctx.font = '24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 10);
        ctx.fillStyle = '#f8fafc';
        ctx.font = '14px monospace';
        ctx.fillText('Press SPACE to play again', canvas.width/2, canvas.height/2 + 25);
        return;
      }

      const head = { x: snake[0].x + dx, y: snake[0].y + dy };

      // Wall wrap
      if (head.x < 0) head.x = canvas.width / grid - 1;
      if (head.x >= canvas.width / grid) head.x = 0;
      if (head.y < 0) head.y = canvas.height / grid - 1;
      if (head.y >= canvas.height / grid) head.y = 0;

      // Self collision
      for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
          gameOver = true;
          return;
        }
      }

      snake.unshift(head);

      // Check food
      if (head.x === food.x && head.y === food.y) {
        score += 10;
        document.getElementById('score').textContent = score;
        if (score > highScore) {
          highScore = score;
          document.getElementById('high').textContent = highScore;
        }
        placeFood();
      } else {
        snake.pop();
      }

      // Draw
      ctx.fillStyle = '#131c2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Food
      ctx.fillStyle = '#f43f5e';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#f43f5e';
      ctx.fillRect(food.x * grid + 2, food.y * grid + 2, grid - 4, grid - 4);

      // Snake
      ctx.fillStyle = '#10b981';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#10b981';
      snake.forEach((seg, i) => {
        ctx.fillStyle = i === 0 ? '#34d399' : '#059669';
        ctx.fillRect(seg.x * grid + 1, seg.y * grid + 1, grid - 2, grid - 2);
      });
      ctx.shadowBlur = 0;
    }

    setInterval(loop, 110);
  </script>
</body>
</html>`,
  },
  {
    id: 'store-paint',
    name: 'Canvas Paint & Sketch',
    icon: 'Palette',
    category: 'Media',
    description: 'Interactive digital sketchpad with brush tools, colors, eraser, and image export.',
    defaultWidth: 640,
    defaultHeight: 520,
    resizable: true,
    version: '1.1.0',
    author: 'Creative Suite',
    code: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #1e1e24; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
  .toolbar { display: flex; gap: 8px; align-items: center; padding: 10px 16px; background: #2b2b36; border-bottom: 1px solid #3f3f4e; flex-wrap: wrap; }
  .btn { padding: 6px 12px; background: #3b3b4f; border: none; color: white; border-radius: 6px; cursor: pointer; font-size: 13px; }
  .btn:hover { background: #4f4f6b; }
  .btn.active { background: #3b82f6; }
  input[type="color"] { border: none; width: 32px; height: 32px; border-radius: 6px; cursor: pointer; background: transparent; }
  .canvas-wrapper { flex: 1; background: #ffffff; cursor: crosshair; }
  canvas { display: block; width: 100%; height: 100%; }
</style>
</head>
<body>
  <div class="toolbar">
    <button class="btn active" id="brushBtn" onclick="setTool('brush')">✏️ Brush</button>
    <button class="btn" id="eraserBtn" onclick="setTool('eraser')">🧹 Eraser</button>
    <input type="color" id="colorPicker" value="#1e1e24">
    <label style="font-size:12px;display:flex;align-items:center;gap:4px">Size:
      <input type="range" id="sizePicker" min="1" max="40" value="4" style="width:80px">
    </label>
    <button class="btn" onclick="clearCanvas()">Clear</button>
    <button class="btn" onclick="downloadCanvas()" style="margin-left:auto;background:#10b981">Save PNG</button>
  </div>
  <div class="canvas-wrapper">
    <canvas id="paintCanvas"></canvas>
  </div>
  <script>
    const canvas = document.getElementById('paintCanvas');
    const ctx = canvas.getContext('2d');
    let painting = false;
    let tool = 'brush';

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      const temp = ctx.getImageData(0,0,canvas.width,canvas.height);
      canvas.width = rect.width;
      canvas.height = rect.height;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.putImageData(temp,0,0);
    }
    window.addEventListener('resize', resize);
    setTimeout(resize, 50);

    function setTool(t) {
      tool = t;
      document.getElementById('brushBtn').classList.toggle('active', t === 'brush');
      document.getElementById('eraserBtn').classList.toggle('active', t === 'eraser');
    }

    function startPosition(e) {
      painting = true;
      draw(e);
    }
    function endPosition() {
      painting = false;
      ctx.beginPath();
    }
    function draw(e) {
      if (!painting) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ctx.lineWidth = document.getElementById('sizePicker').value;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (tool === 'eraser') {
        ctx.strokeStyle = '#ffffff';
      } else {
        ctx.strokeStyle = document.getElementById('colorPicker').value;
      }
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    }

    canvas.addEventListener('mousedown', startPosition);
    canvas.addEventListener('mouseup', endPosition);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseleave', endPosition);

    function clearCanvas() {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function downloadCanvas() {
      const link = document.createElement('a');
      link.download = 'sketch-' + Date.now() + '.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  </script>
</body>
</html>`,
  },
  {
    id: 'store-synth',
    name: 'WebAudio Mini Synth',
    icon: 'Music',
    category: 'Media',
    description: 'Playable musical keyboard synth built with Web Audio API and real-time oscillator waveforms.',
    defaultWidth: 540,
    defaultHeight: 400,
    resizable: true,
    version: '1.0.2',
    author: 'Audio Labs',
    code: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #111827; color: #f9fafb; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; }
  .synth-box { background: #1f2937; border-radius: 16px; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); text-align: center; }
  .controls { display: flex; gap: 16px; justify-content: center; margin-bottom: 24px; }
  select { background: #374151; color: white; border: 1px solid #4b5563; padding: 8px 12px; border-radius: 8px; }
  .keyboard { display: flex; position: relative; height: 180px; }
  .key { width: 44px; height: 100%; background: #f3f4f6; border: 1px solid #9ca3af; border-radius: 0 0 6px 6px; cursor: pointer; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 8px; color: #4b5563; font-weight: bold; font-size: 13px; user-select: none; }
  .key:hover { background: #e5e7eb; }
  .key:active, .key.active { background: #60a5fa; color: white; }
  .key.black { width: 30px; height: 62%; background: #111827; color: #9ca3af; margin-left: -15px; margin-right: -15px; z-index: 2; border: none; border-radius: 0 0 4px 4px; }
  .key.black:hover { background: #1f2937; }
  .key.black:active, .key.black.active { background: #2563eb; color: white; }
</style>
</head>
<body>
  <div class="synth-box">
    <div style="font-size:20px;font-weight:700;margin-bottom:16px;color:#60a5fa">Synthesizer & Piano</div>
    <div class="controls">
      <label>Waveform:
        <select id="wave">
          <option value="sine">Sine (Smooth)</option>
          <option value="square">Square (8-Bit)</option>
          <option value="sawtooth" selected>Sawtooth (Synth)</option>
          <option value="triangle">Triangle (Warm)</option>
        </select>
      </label>
    </div>
    <div class="keyboard" id="keys">
      <div class="key" data-note="261.63">C</div>
      <div class="key black" data-note="277.18">C#</div>
      <div class="key" data-note="293.66">D</div>
      <div class="key black" data-note="311.13">D#</div>
      <div class="key" data-note="329.63">E</div>
      <div class="key" data-note="349.23">F</div>
      <div class="key black" data-note="369.99">F#</div>
      <div class="key" data-note="392.00">G</div>
      <div class="key black" data-note="415.30">G#</div>
      <div class="key" data-note="440.00">A</div>
      <div class="key black" data-note="466.16">A#</div>
      <div class="key" data-note="493.88">B</div>
      <div class="key" data-note="523.25">C5</div>
    </div>
  </div>
  <script>
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function playNote(freq) {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = document.getElementById('wave').value;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    }
    document.querySelectorAll('.key').forEach(k => {
      const freq = parseFloat(k.dataset.note);
      k.addEventListener('mousedown', () => { playNote(freq); k.classList.add('active'); });
      window.addEventListener('mouseup', () => k.classList.remove('active'));
    });
  </script>
</body>
</html>`,
  }
];

export const DEFAULT_WALLPAPERS = [
  {
    id: 'nebula',
    name: 'Cosmic Nebula',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=2400&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=300&q=80',
    dark: true,
  },
  {
    id: 'abstract-mountain',
    name: 'Alpine Dusk',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2400&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=300&q=80',
    dark: true,
  },
  {
    id: 'cyber-city',
    name: 'Tokyo Neon Cyber',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=2400&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=300&q=80',
    dark: true,
  },
  {
    id: 'minimal-waves',
    name: 'Minimal Oceanic Waves',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80',
    dark: false,
  },
  {
    id: 'aurora',
    name: 'Nordic Aurora',
    url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=2400&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=300&q=80',
    dark: true,
  },
];
