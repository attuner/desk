import React from 'react';
import { DesktopApp } from '../types/desktop';
import { AlertCircle } from 'lucide-react';

interface CustomAppRunnerProps {
  app: DesktopApp;
}

export const CustomAppRunner: React.FC<CustomAppRunnerProps> = ({ app }) => {
  if (!app.code) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-950 text-slate-400 p-6 text-center text-xs">
        <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
        <p className="font-semibold text-slate-200">No Application Code Found</p>
        <p className="mt-1 text-slate-500">
          This custom app does not contain runnable frontend HTML/JS code. You can edit its source in App Studio.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-slate-950 overflow-hidden relative">
      <iframe
        title={app.name}
        srcDoc={app.code}
        sandbox="allow-scripts allow-forms allow-modals allow-popups"
        className="w-full h-full border-none bg-white"
      />
    </div>
  );
};
