import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeWindow, openWindow } from '../../store/windowSlice';
import { RootState } from '../../store/store';

export default function TerminalApp() {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.os.theme);
  const portfolio = useSelector((state: RootState) => state.portfolio);
  const [isMobile, setIsMobile] = useState(false);
  const [history, setHistory] = useState<Array<{ type: 'text' | 'command' | 'ls'; content: string; items?: string[] }>>([
    { type: 'text', content: 'Welcome to tonmoyOS Terminal v2.4.0' },
    { type: 'text', content: 'Type "help" to see available commands.' },
    { type: 'text', content: '' },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const visibleSections = [...portfolio.sections].filter((section) => section.visible).sort((a, b) => a.serial - b.serial);
  const folders: string[] = visibleSections.map((section) => section.id);

  const handleFolderClick = (folder: string) => {
    const section = portfolio.sections.find((item) => item.id === folder);
    if (!section) return;
    dispatch(openWindow({
      id: folder,
      title: section.title,
      type: 'section'
    }));
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim().toLowerCase();
    const newHistory = [...history, { type: 'command' as const, content: `tonmoy@ubuntu:~$ ${input}` }];

    // Check if input is a folder name or cd command
    if (folders.includes(cmd)) {
      handleFolderClick(cmd);
      setHistory(newHistory);
      setInput('');
      return;
    }

    // Check for cd command
    const cdMatch = cmd.match(/^cd\s+(.+)$/);
    if (cdMatch) {
      const folderName = cdMatch[1].trim();
      if (folders.includes(folderName)) {
        handleFolderClick(folderName);
        setHistory(newHistory);
        setInput('');
        return;
      } else {
        newHistory.push({ type: 'text', content: `cd: ${folderName}: No such file or directory` });
        setHistory(newHistory);
        setInput('');
        return;
      }
    }

    switch (cmd) {
      case 'help':
        newHistory.push({ type: 'text', content: `Available commands: help, clear, ls, date, exit, ${portfolio.commands.map((item) => item.command).filter(Boolean).join(', ')}` });
        newHistory.push({ type: 'text', content: 'Or type a folder name or "cd folder-name" to navigate.' });
        newHistory.push({ type: 'text', content: `Available folders: ${folders.join(', ')}` });
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      case 'ls':
        newHistory.push({ type: 'ls', content: 'Directories:', items: folders });
        break;
      case 'date':
        newHistory.push({ type: 'text', content: new Date().toLocaleString() });
        break;
      case 'exit':
        dispatch(closeWindow('terminal'));
        return;
      default:
        {
          const configured = portfolio.commands.find((item) => item.command.trim().toLowerCase() === cmd);
          if (!configured) {
            newHistory.push({ type: 'text', content: `Command not found: ${cmd}` });
          } else {
            if (configured.output) newHistory.push({ type: 'text', content: configured.output });
            if (configured.sectionId) handleFolderClick(configured.sectionId);
          }
        }
    }

    setHistory(newHistory);
    setInput('');
  };

  return (
    <div 
      ref={scrollRef}
      className={`h-full font-mono text-[#dfdbd2] overflow-y-auto bg-black/95 ${isMobile ? 'text-xs p-2' : 'text-sm p-4'}`}
      onClick={() => document.getElementById('terminal-input')?.focus()}
    >
      {history.map((item, i) => (
        <div key={i} className={`whitespace-pre-wrap ${isMobile ? 'mb-0.5' : 'mb-1'}`}>
          {item.type === 'command' && (
            <div className="text-[#87ff5f]">{item.content}</div>
          )}
          {item.type === 'text' && (
            <div>{item.content}</div>
          )}
          {item.type === 'ls' && (
            <>
              <div>{item.content}</div>
              <div className="flex flex-wrap gap-4 mt-2 mb-2">
                {item.items?.map((folder) => (
                  <button
                    key={folder}
                    onClick={() => handleFolderClick(folder)}
                    className={`px-3 py-1 rounded cursor-pointer transition-colors ${
                      theme === 'dark'
                        ? 'hover:bg-[#87ff5f]/20 text-[#87ff5f]'
                        : 'hover:bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    📁 {folder}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      ))}
      <form onSubmit={handleCommand} className="flex items-center gap-1">
        <span className="text-[#87ff5f] flex-shrink-0">tonmoy@ubuntu:~$</span>
        <input
          id="terminal-input"
          type="text"
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-[#dfdbd2]"
          autoComplete="off"
        />
      </form>
    </div>
  );
}
