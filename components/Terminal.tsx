
import React, { useRef, useEffect, useState } from 'react';
import { HistoryItem, HistoryItemType } from '../types';

// --- TerminalInput Component ---
interface TerminalInputProps {
  onCommand: (command: string) => void;
  isLoading: boolean;
}

const TerminalInput: React.FC<TerminalInputProps> = ({ onCommand, isLoading }) => {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isLoading) {
      onCommand(value);
      setValue('');
    }
  };
  
  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
        inputRef.current.focus();
    }
  }, []);

  return (
    <div className="flex items-center w-full">
      <span className="text-green-400 mr-2 text-lg font-bold">{'>'}</span>
      <form onSubmit={handleSubmit} className="flex-grow">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={isLoading}
          className="bg-transparent border-none text-gray-200 focus:ring-0 focus:outline-none w-full placeholder-gray-500"
          autoComplete="off"
          spellCheck="false"
          placeholder={isLoading ? '' : 'Enter a command...'}
        />
      </form>
    </div>
  );
};

// --- TerminalOutput Component ---
interface TerminalOutputProps {
    history: HistoryItem[];
}

const TerminalOutput: React.FC<TerminalOutputProps> = ({ history }) => {
  return (
    <div className="flex flex-col">
      {history.map((item) => {
        switch (item.type) {
          case HistoryItemType.COMMAND:
            return (
              <div key={item.id} className="flex items-center">
                <span className="text-green-400 mr-2 text-lg font-bold">{'>'}</span>
                <span className="text-gray-100">{item.text}</span>
              </div>
            );
          case HistoryItemType.OUTPUT:
            return (
              <div key={item.id} className="whitespace-pre-wrap text-gray-300 py-1">
                {item.text}
              </div>
            );
          case HistoryItemType.SYSTEM:
            return (
                <div key={item.id} className="text-blue-400 italic py-1">
                    {item.text}
                </div>
            );
          case HistoryItemType.ERROR:
            return (
                <div key={item.id} className="text-red-500 font-semibold py-1">
                    {item.text}
                </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
};

// --- Main Terminal Component ---
interface TerminalProps {
  history: HistoryItem[];
  onCommand: (command: string) => void;
  isLoading: boolean;
}

const Terminal: React.FC<TerminalProps> = ({ history, onCommand, isLoading }) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [history]);

  const focusInput = () => {
      containerRef.current?.querySelector('input')?.focus();
  }

  return (
    <div 
        ref={containerRef}
        className="w-full h-[90vh] max-h-[800px] bg-black/80 backdrop-blur-sm rounded-lg shadow-2xl shadow-purple-500/10 border border-gray-700 p-4 overflow-y-auto flex flex-col"
        onClick={focusInput}
    >
        <div className="flex-grow">
            <TerminalOutput history={history} />
            <div ref={terminalEndRef} />
        </div>
        
        {isLoading && (
            <div className="flex items-center text-gray-400">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse mr-2"></div>
                Assistant is thinking...
            </div>
        )}

        <div className="mt-auto pt-2">
            <TerminalInput onCommand={onCommand} isLoading={isLoading} />
        </div>
    </div>
  );
};

export default Terminal;
