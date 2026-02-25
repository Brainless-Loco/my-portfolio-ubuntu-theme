import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'motion/react';
import { RootState } from '../../store/store';
import { openWindow } from '../../store/windowSlice';
import TopBar from '../../components/os/TopBar';
import Dock from '../../components/os/Dock';
import WindowManager from '../../components/os/WindowManager';
import LockScreen from '../../components/os/LockScreen';
import { AnimatePresence } from 'motion/react';

export default function Desktop() {
  const dispatch = useDispatch();
  const wallpaper = useSelector((state: RootState) => state.os.wallpaper);
  const isLocked = useSelector((state: RootState) => state.os.isLocked);
  const activeWindows = useSelector((state: RootState) => state.windows.activeWindows);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    // Open explorer window by default if no windows are open
    if (activeWindows.length === 0 && !isLocked) {
      dispatch(openWindow({ id: 'explorer', title: 'Home', type: 'explorer' }));
    }
  }, []);

  return (
    <div 
      className="relative h-screen w-screen overflow-hidden bg-cover bg-center select-none"
      style={{ backgroundImage: `url(${wallpaper})` }}
    >
      <AnimatePresence>
        {isLocked && <LockScreen />}
      </AnimatePresence>
      {/* Background Overlay for depth */}
      <div className="absolute inset-0 bg-black/10" />

      {/* OS UI Layers */}
      <TopBar />
      
      <main className={isMobile ? "absolute inset-0 pt-10 pb-20" : "absolute inset-0 pt-8"}>
        <WindowManager />
      </main>

      <Dock />

      {/* Desktop Context Menu could go here */}
    </div>
  );
}
