import React, { useState } from 'react';
import { Delete, RotateCcw } from 'lucide-react';

export const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [newNumber, setNewNumber] = useState(true);

  const handleDigit = (digit: string) => {
    if (newNumber || display === '0') {
      setDisplay(digit);
      setNewNumber(false);
    } else {
      setDisplay(display + digit);
    }
  };

  const handleDot = () => {
    if (newNumber) {
      setDisplay('0.');
      setNewNumber(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOp = (nextOp: string) => {
    const current = parseFloat(display);
    if (prev !== null && op) {
      const res = calculate(prev, current, op);
      setDisplay(String(res));
      setPrev(res);
    } else {
      setPrev(current);
    }
    setOp(nextOp);
    setNewNumber(true);
  };

  const calculate = (a: number, b: number, operator: string): number => {
    switch (operator) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handleEquals = () => {
    if (prev !== null && op) {
      const current = parseFloat(display);
      const res = calculate(prev, current, op);
      setDisplay(String(res));
      setPrev(null);
      setOp(null);
      setNewNumber(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPrev(null);
    setOp(null);
    setNewNumber(true);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 p-4 select-none">
      {/* Screen */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4 flex flex-col justify-end text-right min-h-[90px] shadow-inner">
        <div className="text-xs text-slate-500 font-mono h-4">
          {prev !== null && `${prev} ${op || ''}`}
        </div>
        <div className="text-3xl font-bold text-white tracking-tight font-mono truncate">
          {display}
        </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-4 gap-2 flex-1">
        <button onClick={handleClear} className="p-3 bg-red-500/20 text-red-400 font-bold rounded-xl hover:bg-red-500/30 transition text-sm">C</button>
        <button onClick={() => setDisplay(String(-parseFloat(display)))} className="p-3 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition text-sm">±</button>
        <button onClick={() => setDisplay(String(parseFloat(display)/100))} className="p-3 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition text-sm">%</button>
        <button onClick={() => handleOp('÷')} className="p-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition text-sm">÷</button>

        <button onClick={() => handleDigit('7')} className="p-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition text-sm">7</button>
        <button onClick={() => handleDigit('8')} className="p-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition text-sm">8</button>
        <button onClick={() => handleDigit('9')} className="p-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition text-sm">9</button>
        <button onClick={() => handleOp('×')} className="p-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition text-sm">×</button>

        <button onClick={() => handleDigit('4')} className="p-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition text-sm">4</button>
        <button onClick={() => handleDigit('5')} className="p-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition text-sm">5</button>
        <button onClick={() => handleDigit('6')} className="p-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition text-sm">6</button>
        <button onClick={() => handleOp('-')} className="p-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition text-sm">-</button>

        <button onClick={() => handleDigit('1')} className="p-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition text-sm">1</button>
        <button onClick={() => handleDigit('2')} className="p-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition text-sm">2</button>
        <button onClick={() => handleDigit('3')} className="p-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition text-sm">3</button>
        <button onClick={() => handleOp('+')} className="p-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition text-sm">+</button>

        <button onClick={() => handleDigit('0')} className="col-span-2 p-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition text-sm">0</button>
        <button onClick={handleDot} className="p-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition text-sm">.</button>
        <button onClick={handleEquals} className="p-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition text-sm">=</button>
      </div>
    </div>
  );
};
