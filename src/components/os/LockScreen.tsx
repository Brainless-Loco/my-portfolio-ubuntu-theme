import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { setLocked } from '../../store/osSlice';
import { ChevronUp } from 'lucide-react';

export default function LockScreen() {
  const dispatch = useDispatch();
  const [isSwipedUp, setIsSwipedUp] = useState(false);
  const wallpaper = useSelector((state: RootState) => state.os.wallpaper);
  const language = useSelector((state: RootState) => state.os.language);
  const [time, setTime] = useState(new Date());

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
      
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="text-8xl font-thin tracking-tighter">
          {time.toLocaleTimeString(language === 'en' ? 'en-US' : 'bn-BD', { hour: '2-digit', minute: '2-digit', hour12: false })}
        </div>
        <div className="text-xl font-light opacity-80">
          {time.toLocaleDateString(language === 'en' ? 'en-US' : 'bn-BD', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="absolute bottom-12 flex flex-col items-center gap-2 animate-bounce opacity-60">
        <ChevronUp size={24} />
        <span className="text-xs uppercase tracking-widest">
          {language === 'en' ? 'Click or Swipe up to unlock' : 'আনলক করতে ক্লিক করুন'}
        </span>
      </div>

      <AnimatePresence>
        {isSwipedUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-20 bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center gap-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <div className="w-16 h-16 rounded-full bg-orange-600 flex items-center justify-center font-bold text-2xl">
                T
              </div>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-medium">Tonmoy</h2>
              <p className="text-xs opacity-50">{language === 'en' ? 'Logged in' : 'লগ ইন করা আছে'}</p>
            </div>
            <button 
              onClick={handleUnlock}
              className="px-8 py-2 bg-orange-600 hover:bg-orange-700 rounded-full font-medium transition-colors"
            >
              {language === 'en' ? 'Enter' : 'প্রবেশ করুন'}
            </button>
            <button 
              onClick={() => setIsSwipedUp(false)}
              className="text-xs opacity-40 hover:opacity-100 transition-opacity"
            >
              {language === 'en' ? 'Cancel' : 'বাতিল'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
