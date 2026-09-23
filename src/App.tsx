/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { Desktop } from './components/desktop/Desktop';

export default function App() {
  return (
    <div className="w-screen h-screen overflow-hidden select-none bg-slate-950 font-sans">
      <Desktop />
    </div>
  );
}
