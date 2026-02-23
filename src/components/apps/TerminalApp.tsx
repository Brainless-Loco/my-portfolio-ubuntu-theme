import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { closeWindow } from '../../store/windowSlice';

export default function TerminalApp() {
  const dispatch = useDispatch();
  const [history, setHistory] = useState<string[]>([
    'Welcome to tonmoyOS Terminal v2.4.0',
    'Type "help" to see available commands.',
    '',
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim().toLowerCase();
    const newHistory = [...history, `tonmoy@ubuntu:~$ ${input}`];

    switch (cmd) {
      case 'help':
        newHistory.push('Available commands: help, clear, whoami, ls, date, exit, uname');
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      case 'whoami':
        newHistory.push('tonmoy - Full Stack Developer & OS Enthusiast');
        break;
      case 'ls':
        newHistory.push('professional-history  academic-history  projects  skills  eca  references  publications');
        break;
      case 'date':
        newHistory.push(new Date().toLocaleString());
        break;
      case 'uname':
        newHistory.push('tonmoyOS 24.04.1 LTS x86_64');
        break;
      case 'exit':
        dispatch(closeWindow('terminal'));
        return;
      default:
        newHistory.push(`Command not found: ${cmd}`);
    }

    setHistory(newHistory);
    setInput('');
  };

  return (
    <div 
      ref={scrollRef}
      className="h-full p-4 font-mono text-sm text-[#dfdbd2] overflow-y-auto"
      onClick={() => document.getElementById('terminal-input')?.focus()}
    >
      {history.map((line, i) => (
        <div key={i} className="mb-1 whitespace-pre-wrap">{line}</div>
      ))}
      <form onSubmit={handleCommand} className="flex items-center">
        <span className="text-[#87ff5f] mr-2">tonmoy@ubuntu:~$</span>
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
