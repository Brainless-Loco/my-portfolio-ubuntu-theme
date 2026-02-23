import { useSelector } from 'react-redux';
import { motion } from 'motion/react';
import { RootState } from '../../store/store';
import TopBar from '../../components/os/TopBar';
import Dock from '../../components/os/Dock';
import WindowManager from '../../components/os/WindowManager';
import LockScreen from '../../components/os/LockScreen';
import { AnimatePresence } from 'motion/react';

export default function Desktop() {
  const wallpaper = useSelector((state: RootState) => state.os.wallpaper);
  const isLocked = useSelector((state: RootState) => state.os.isLocked);

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
      
      <main className="absolute inset-0 pt-8">
        <WindowManager />
      </main>

      <Dock />

      {/* Desktop Context Menu could go here */}
    </div>
  );
}
