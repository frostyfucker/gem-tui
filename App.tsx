
import React, { useState, useEffect, useCallback } from 'react';
import { HistoryItem, HistoryItemType } from './types';
import Terminal from './components/Terminal';
import { generateTuiResponseStream } from './services/geminiService';

const App: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const addHistoryItem = useCallback((item: Omit<HistoryItem, 'id'>) => {
    setHistory(prev => [...prev, { ...item, id: prev.length }]);
  }, []);

  const handleCommand = useCallback(async (command: string) => {
    addHistoryItem({ type: HistoryItemType.COMMAND, text: command });

    const trimmedCommand = command.trim().toLowerCase();
    if (trimmedCommand === 'clear') {
      setHistory([]);
      return;
    }

    if (trimmedCommand === 'help') {
        addHistoryItem({ type: HistoryItemType.SYSTEM, text: "Available commands:\n- 'help': Shows this message.\n- 'clear': Clears the terminal history.\n- Any other text will be sent to the Gemini TUI assistant." });
        return;
    }

    setIsLoading(true);
    let currentOutputId: number | null = null;

    try {
      const stream = generateTuiResponseStream(command);
      for await (const chunk of stream) {
        setHistory(prev => {
          if (currentOutputId === null) {
            const newItem: HistoryItem = { id: prev.length, type: HistoryItemType.OUTPUT, text: chunk };
            currentOutputId = newItem.id;
            return [...prev, newItem];
          } else {
            return prev.map(item =>
              item.id === currentOutputId ? { ...item, text: item.text + chunk } : item
            );
          }
        });
      }
    } catch (error) {
      console.error(error);
      addHistoryItem({ type: HistoryItemType.ERROR, text: "An error occurred while communicating with the AI." });
    } finally {
      setIsLoading(false);
    }
  }, [addHistoryItem]);

  // Initial greeting and response to the user's implicit question
  useEffect(() => {
    const initializeTerminal = async () => {
        addHistoryItem({type: HistoryItemType.SYSTEM, text: "Welcome to the Gemini TUI Assistant!"});
        addHistoryItem({type: HistoryItemType.SYSTEM, text: "Type 'help' for a list of commands."});
        const initialCommand = "Let's build a TUI. Compare two popular options for creating a TUI in Node.js: 'blessed' vs 'ink'.";
        await handleCommand(initialCommand);
        setIsLoading(false);
    };

    initializeTerminal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="bg-gray-900 text-gray-200 min-h-screen font-mono p-4 flex items-center justify-center">
      <div className="w-full max-w-5xl">
        <Terminal
          history={history}
          onCommand={handleCommand}
          isLoading={isLoading}
        />
      </div>
    </main>
  );
};

export default App;
