import React, { useRef, useState } from 'react';
import { motion, useDragControls } from 'motion/react';
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
  const dragControls = useDragControls();
  const windowRef = useRef<HTMLDivElement>(null);
  const isMaximizedRef = useRef(window.isMaximized);
  isMaximizedRef.current = window.isMaximized;

  // Detect mobile/tablet/desktop
  const [isMobile, setIsMobile] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  React.useEffect(() => {
    const handleResize = () => {
      const width = globalThis.window.innerWidth;
      const height = globalThis.window.innerHeight;
      setWindowSize({ width, height });
      setIsMobile(width < 768);
    };

    handleResize();
    globalThis.window.addEventListener('resize', handleResize);
    return () => globalThis.window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate responsive initial size
  const getInitialSize = () => {
    const screenWidth = windowSize.width;
    const topBarHeight = windowSize.width < 640 ? 40 : 32;
    const availableHeight = Math.max(windowSize.height - topBarHeight, 0);

    if (window.type === 'explorer') {
      const horizontalMargin = screenWidth < 640 ? 16 : 80;
      const verticalMargin = screenWidth < 640 ? 40 : 80;
      return {
        width: Math.min(Math.max(screenWidth - horizontalMargin, 0), 1440),
        height: Math.min(Math.max(availableHeight - verticalMargin, 0), 800),
      };
    }

    if (screenWidth < 480) {
      // Mobile: full width minus padding
      return { width: Math.max(screenWidth - 16, 0), height: Math.max(availableHeight - 40, 0) };
    } else if (screenWidth < 768) {
      // Small tablet
      return { width: screenWidth - 32, height: availableHeight - 80 };
    } else if (screenWidth < 1024) {
      // Tablet
      return { width: Math.min(screenWidth - 80, 700), height: availableHeight - 100 };
    }
    // Desktop
    return { width: 900, height: Math.min(600, availableHeight - 32) };
  };

  const initialSize = getInitialSize();
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [restoredPosition, setRestoredPosition] = useState<{ left: number; top: number } | null>(null);
  const topBarHeight = windowSize.width < 640 ? 40 : 32;
  const availableHeight = Math.max(windowSize.height - topBarHeight, 0);

  // Update size when screen size changes
  React.useEffect(() => {
    setSize(initialSize);
  }, [windowSize.width, windowSize.height]);

  const startResize = (event: React.PointerEvent<HTMLDivElement>, direction: 'both' | 'width' | 'height') => {
    event.stopPropagation();
    event.preventDefault();
    setIsResizing(true);

    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = size.width;
    const startHeight = size.height;
    const minWidth = Math.min(window.type === 'explorer' ? 320 : 400, windowSize.width);

    const onPointerMove = (moveEvent: PointerEvent) => {
      setSize({
        width: direction === 'height'
          ? startWidth
          : Math.min(window.type === 'explorer' ? 1440 : windowSize.width, Math.max(minWidth, startWidth + moveEvent.clientX - startX)),
        height: direction === 'width'
          ? startHeight
          : Math.min(availableHeight, Math.max(Math.min(300, availableHeight), startHeight + moveEvent.clientY - startY)),
      });
    };

    const onPointerUp = () => {
      setIsResizing(false);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  };

  if (window.isMinimized) return null;

  return (
    <motion.div
      ref={windowRef}
      drag={!isActivitiesMode && !isResizing}
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        scale: isActivitiesMode ? 0.6 : 1, 
        zIndex: window.zIndex + (isDragging ? 10000 : isFocused ? 100 : 0),
        width: window.isMaximized ? '100vw' : size.width,
        height: window.isMaximized ? availableHeight : size.height,
        top: window.isMaximized || window.type === 'explorer'
          ? topBarHeight
          : restoredPosition?.top ?? topBarHeight + 32,
        left: window.isMaximized
          ? 0
          : restoredPosition
            ? restoredPosition.left
            : window.type === 'explorer'
              ? Math.max(0, (windowSize.width - size.width) / 2)
              : isMobile ? 0 : '10rem',
        x: window.isMaximized ? 0 : undefined,
        y: window.isMaximized ? 0 : undefined,
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onDragStart={(_event, info) => {
        setIsDragging(true);
        if (isMaximizedRef.current) {
          const dragStartX = info.point.x - info.offset.x;
          const horizontalPosition = dragStartX - size.width * (dragStartX / Math.max(windowSize.width, 1));
          setRestoredPosition({
            left: Math.max(0, Math.min(windowSize.width - size.width, horizontalPosition)),
            top: topBarHeight,
          });
          isMaximizedRef.current = false;
          dispatch(toggleMaximize(window.id));
        }
      }}
      onDragEnd={() => {
        setIsDragging(false);
        const bounds = windowRef.current?.getBoundingClientRect();
        if (bounds && bounds.top <= topBarHeight + 8 && !isMaximizedRef.current) {
          isMaximizedRef.current = true;
          dispatch(toggleMaximize(window.id));
        }
      }}
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
          "h-10 flex items-center justify-between px-4 select-none cursor-move",
          isFocused ? (theme === 'dark' ? "bg-[#3d3d3d]" : "bg-gray-200") : (theme === 'dark' ? "bg-[#2d2d2d]" : "bg-gray-100")
        )}
        onPointerDown={(event) => {
          if ((event.target as HTMLElement).closest('button')) return;
          dragControls.start(event);
        }}
        onDoubleClick={() => dispatch(toggleMaximize(window.id))}
      >
        <div className="flex items-center gap-3">
          <span className={cn("text-xs font-medium", theme === 'dark' ? "text-white/90" : "text-black/90")}>{window.title}</span>
        </div>

        <div className="flex items-center gap-2 relative z-50">
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
            onPointerDown={(event) => startResize(event, 'both')}
          />
          <div 
            className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize z-50"
            onPointerDown={(event) => startResize(event, 'width')}
          />
          <div 
            className="absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize z-50"
            onPointerDown={(event) => startResize(event, 'height')}
          />
        </>
      )}
    </motion.div>
  );
}
