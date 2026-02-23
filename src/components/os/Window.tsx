import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Minus, Square, Copy } from 'lucide-react';
import { WindowState, closeWindow, focusWindow, minimizeWindow, toggleMaximize } from '../../store/windowSlice';
import { RootState } from '../../store/store';
import { cn } from '../../lib/utils';

interface WindowProps {
  window: WindowState;
  children: React.ReactNode;
  key?: string;
}

export default function Window({ window, children }: WindowProps) {
  const dispatch = useDispatch();
  const focusedWindowId = useSelector((state: RootState) => state.windows.focusedWindowId);
  const isActivitiesMode = useSelector((state: RootState) => state.os.isActivitiesMode);
  const theme = useSelector((state: RootState) => state.os.theme);
  const isFocused = focusedWindowId === window.id;

  const [size, setSize] = useState({ width: 900, height: 600 });

  if (window.isMinimized) return null;

  return (
    <motion.div
      drag={!window.isMaximized && !isActivitiesMode}
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        scale: isActivitiesMode ? 0.6 : 1, 
        zIndex: window.zIndex,
        width: window.isMaximized ? '100vw' : size.width,
        height: window.isMaximized ? 'calc(100vh - 2rem)' : size.height,
        top: window.isMaximized ? 0 : '4rem',
        left: window.isMaximized ? 0 : '10rem',
        x: window.isMaximized ? 0 : undefined,
        y: window.isMaximized ? 0 : undefined,
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onMouseDown={() => dispatch(focusWindow(window.id))}
      className={cn(
        "absolute pointer-events-auto flex flex-col rounded-lg overflow-hidden shadow-2xl border window-container",
        window.isMaximized ? "!rounded-none" : "",
        isFocused ? "border-white/20 shadow-black/40" : "border-white/10 shadow-black/20 opacity-90",
        window.type === 'terminal' ? "bg-[#300a24]/95" : theme === 'dark' ? "bg-[#2d2d2d]/95 backdrop-blur-xl" : "bg-white/95 backdrop-blur-xl",
        isActivitiesMode ? "cursor-pointer hover:ring-4" : ""
      )}
      onClick={() => {
        if (isActivitiesMode) {
          dispatch(focusWindow(window.id));
        }
      }}
    >
      <div 
        className={cn(
          "h-10 flex items-center justify-between px-4 select-none cursor-default",
          isFocused ? (theme === 'dark' ? "bg-[#3d3d3d]" : "bg-gray-200") : (theme === 'dark' ? "bg-[#2d2d2d]" : "bg-gray-100")
        )}
        onDoubleClick={() => dispatch(toggleMaximize(window.id))}
      >
        <div className="flex items-center gap-3">
          <span className={cn("text-xs font-medium", theme === 'dark' ? "text-white/90" : "text-black/90")}>{window.title}</span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); dispatch(minimizeWindow(window.id)); }}
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <Minus size={14} className={theme === 'dark' ? "text-white" : "text-black"} />
          </button>
          <button 
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); dispatch(toggleMaximize(window.id)); }}
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            {window.isMaximized ? <Copy size={12} className={theme === 'dark' ? "text-white" : "text-black"} /> : <Square size={12} className={theme === 'dark' ? "text-white" : "text-black"} />}
          </button>
          <button 
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); dispatch(closeWindow(window.id)); }}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-[#c7162b] hover:bg-[#e95420] text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className={cn("flex-1 overflow-auto custom-scrollbar", theme === 'dark' ? "text-white" : "text-black")}>
        {children}
      </div>

      {/* Resize Handles */}
      {!window.isMaximized && !isActivitiesMode && (
        <>
          <div 
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-50"
            onMouseDown={(e) => {
              e.stopPropagation();
              const startX = e.clientX;
              const startY = e.clientY;
              const startWidth = size.width;
              const startHeight = size.height;

              const onMouseMove = (moveEvent: MouseEvent) => {
                setSize({
                  width: Math.max(400, startWidth + (moveEvent.clientX - startX)),
                  height: Math.max(300, startHeight + (moveEvent.clientY - startY)),
                });
              };

              const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
              };

              document.addEventListener('mousemove', onMouseMove);
              document.addEventListener('mouseup', onMouseUp);
            }}
          />
          <div 
            className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize"
            onMouseDown={(e) => {
              e.stopPropagation();
              const startX = e.clientX;
              const startWidth = size.width;
              const onMouseMove = (moveEvent: MouseEvent) => setSize(s => ({ ...s, width: Math.max(400, startWidth + (moveEvent.clientX - startX)) }));
              const onMouseUp = () => { document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); };
              document.addEventListener('mousemove', onMouseMove);
              document.addEventListener('mouseup', onMouseUp);
            }}
          />
          <div 
            className="absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize"
            onMouseDown={(e) => {
              e.stopPropagation();
              const startY = e.clientY;
              const startHeight = size.height;
              const onMouseMove = (moveEvent: MouseEvent) => setSize(s => ({ ...s, height: Math.max(300, startHeight + (moveEvent.clientY - startY)) }));
              const onMouseUp = () => { document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); };
              document.addEventListener('mousemove', onMouseMove);
              document.addEventListener('mouseup', onMouseUp);
            }}
          />
          <div 
            className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize"
            onMouseDown={(e) => {
              e.stopPropagation();
              const startX = e.clientX;
              const startWidth = size.width;
              const onMouseMove = (moveEvent: MouseEvent) => setSize(s => ({ ...s, width: Math.max(400, startWidth + (moveEvent.clientX - startX)) }));
              const onMouseUp = () => { document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); };
              document.addEventListener('mousemove', onMouseMove);
              document.addEventListener('mouseup', onMouseUp);
            }}
          />
          <div 
            className="absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize"
            onMouseDown={(e) => {
              e.stopPropagation();
              const startY = e.clientY;
              const startHeight = size.height;
              const onMouseMove = (moveEvent: MouseEvent) => setSize(s => ({ ...s, height: Math.max(300, startHeight + (moveEvent.clientY - startY)) }));
              const onMouseUp = () => { document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); };
              document.addEventListener('mousemove', onMouseMove);
              document.addEventListener('mouseup', onMouseUp);
            }}
          />
        </>
      )}
    </motion.div>
  );
}
