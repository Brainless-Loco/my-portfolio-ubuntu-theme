import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { setLocked } from '../../store/osSlice';
import { ChevronUp } from 'lucide-react';

export default function LockScreen() {
  const dispatch = useDispatch();
  const [isSwipedUp, setIsSwipedUp] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const wallpaper = useSelector((state: RootState) => state.os.wallpaper);
  const language = useSelector((state: RootState) => state.os.language);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleUnlock = () => {
    dispatch(setLocked(false));
  };

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: isSwipedUp ? '-100%' : 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[10000] bg-cover bg-center flex flex-col items-center justify-center text-white select-none"
      style={{ backgroundImage: `url(${wallpaper})` }}
      onClick={() => setIsSwipedUp(true)}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      
      <div className="relative z-10 flex flex-col items-center gap-2 md:gap-4">
        <div className={`font-thin tracking-tighter ${isMobile ? 'text-5xl' : 'text-8xl'}`}>
          {time.toLocaleTimeString(language === 'en' ? 'en-US' : 'bn-BD', { hour: '2-digit', minute: '2-digit', hour12: false })}
        </div>
        <div className={`font-light opacity-80 ${isMobile ? 'text-xs' : 'text-xl'}`}>
          {time.toLocaleDateString(language === 'en' ? 'en-US' : 'bn-BD', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="absolute bottom-8 md:bottom-12 flex flex-col items-center gap-2 animate-bounce opacity-60">
        <ChevronUp size={isMobile ? 16 : 24} />
        <span className={`uppercase tracking-widest ${isMobile ? 'text-[9px]' : 'text-xs'}`}>
          {language === 'en' ? 'Click or Swipe up to unlock' : 'আনলক করতে ক্লিক করুন'}
        </span>
      </div>

      <AnimatePresence>
        {isSwipedUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-20 bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center gap-6 md:gap-8 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`rounded-full bg-white/10 flex items-center justify-center border border-white/20 ${isMobile ? 'w-16 h-16' : 'w-24 h-24'}`}>
              <div className={`rounded-full bg-orange-600 flex items-center justify-center font-bold ${isMobile ? 'w-12 h-12 text-xl' : 'w-16 h-16 text-2xl'}`}>
                T
              </div>
            </div>
            <div className="text-center space-y-1 md:space-y-2">
              <h2 className={`font-medium ${isMobile ? 'text-lg' : 'text-2xl'}`}>Tonmoy</h2>
              <p className={`opacity-50 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>{language === 'en' ? 'Logged in' : 'লগ ইন করা আছে'}</p>
            </div>
            <button 
              onClick={handleUnlock}
              className={`bg-orange-600 hover:bg-orange-700 rounded-full font-medium transition-colors ${isMobile ? 'px-6 py-1.5 text-sm' : 'px-8 py-2'}`}
            >
              {language === 'en' ? 'Enter' : 'প্রবেশ করুন'}
            </button>
            <button 
              onClick={() => setIsSwipedUp(false)}
              className={`opacity-40 hover:opacity-100 transition-opacity ${isMobile ? 'text-[10px]' : 'text-xs'}`}
            >
              {language === 'en' ? 'Cancel' : 'বাতিল'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
