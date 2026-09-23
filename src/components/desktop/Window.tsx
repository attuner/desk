import React, { useState, useRef, useEffect } from 'react';
import { Minus, Square, Copy, X } from 'lucide-react';
import { WindowState } from '../../types/desktop';
import { AppIconRenderer } from './AppIconRenderer';

interface WindowProps {
  window: WindowState;
  isActive: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onUpdatePosition: (x: number, y: number) => void;
  onUpdateSize: (width: number, height: number) => void;
  children: React.ReactNode;
}

export const Window: React.FC<WindowProps> = ({
  window,
  isActive,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  onUpdatePosition,
  onUpdateSize,
  children,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: 0, h: 0, wx: 0, wy: 0 });

  const handleMouseDownHeader = (e: React.MouseEvent) => {
    if (window.isMaximized) return;
    onFocus();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - window.x,
      y: e.clientY - window.y,
    });
  };

  const handleMouseDownResize = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    if (window.isMaximized) return;
    onFocus();
    setIsResizing(handle);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      w: window.width,
      h: window.height,
      wx: window.x,
      wy: window.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(e.clientX - dragOffset.x, globalThis.innerWidth - 100));
        const newY = Math.max(0, Math.min(e.clientY - dragOffset.y, globalThis.innerHeight - 100));
        onUpdatePosition(newX, newY);
      } else if (isResizing) {
        const dx = e.clientX - resizeStart.x;
        const dy = e.clientY - resizeStart.y;

        let newW = resizeStart.w;
        let newH = resizeStart.h;

        if (isResizing.includes('e')) newW = Math.max(340, resizeStart.w + dx);
        if (isResizing.includes('s')) newH = Math.max(260, resizeStart.h + dy);

        onUpdateSize(newW, newH);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeStart]);

  if (window.isMinimized) return null;

  return (
    <div
      onMouseDown={onFocus}
      style={{
        zIndex: window.zIndex,
        transform: window.isMaximized
          ? 'none'
          : `translate3d(${window.x}px, ${window.y}px, 0)`,
        width: window.isMaximized ? '100vw' : `${window.width}px`,
        height: window.isMaximized ? 'calc(100vh - 48px)' : `${window.height}px`,
        top: window.isMaximized ? 0 : 0,
        left: window.isMaximized ? 0 : 0,
        position: 'absolute',
      }}
      className={`flex flex-col rounded-2xl overflow-hidden transition-[box-shadow,border-color] duration-150 ${
        window.isMaximized ? 'rounded-none' : ''
      } ${
        isActive
          ? 'shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-slate-700/80 ring-1 ring-blue-500/30'
          : 'shadow-[0_10px_35px_-10px_rgba(0,0,0,0.5)] border border-slate-800/80 opacity-95'
      }`}
    >
      {/* Title Bar */}
      <div
        onMouseDown={handleMouseDownHeader}
        onDoubleClick={onMaximize}
        className={`flex items-center justify-between px-4 py-2.5 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 cursor-move select-none ${
          isActive ? 'text-slate-100' : 'text-slate-400'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate flex-1 mr-4">
          <AppIconRenderer name={window.icon} size={17} className="shrink-0" />
          <span className="text-xs font-semibold tracking-wide truncate">
            {window.title}
          </span>
        </div>

        {/* Window Controls */}
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 shrink-0"
        >
          <button
            onClick={onMinimize}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onMaximize}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={window.isMaximized ? 'Restore' : 'Maximize'}
          >
            {window.isMaximized ? (
              <Copy className="w-3 h-3" />
            ) : (
              <Square className="w-3 h-3" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-red-500 transition"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Window Body Container */}
      <div className="flex-1 bg-slate-950 overflow-hidden relative">
        {children}
      </div>

      {/* Resize handles */}
      {!window.isMaximized && (
        <>
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'e')}
            className="absolute top-0 right-0 w-2 h-full cursor-e-resize"
          />
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 's')}
            className="absolute bottom-0 left-0 w-full h-2 cursor-s-resize"
          />
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'se')}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          />
        </>
      )}
    </div>
  );
};
