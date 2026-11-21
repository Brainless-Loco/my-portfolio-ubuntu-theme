import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { setBootTime, setShuttingDown } from '../../store/osSlice';

export default function EntryController() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const lastBootTime = useSelector((state: RootState) => state.os.lastBootTime);
  const [bootType, setBootType] = useState<'cold' | 'warm' | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    dispatch(setShuttingDown(false));
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    if (!lastBootTime || now - lastBootTime > oneHour) {
      setBootType('cold');
      dispatch(setBootTime(now));
    } else {
      setBootType('warm');
    }
  }, [lastBootTime, dispatch]);

  useEffect(() => {
    if (bootType) {
      const duration = bootType === 'cold' ? 4000 : 1200;
      const interval = 50;
      const steps = duration / interval;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const p = Math.min((currentStep / steps) * 100, 100);
        setProgress(p);

        if (p >= 100) {
          clearInterval(timer);
          setTimeout(() => navigate('/desktop'), 500);
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [bootType, navigate]);

  if (!bootType) return null;

  return (
    <div className="fixed inset-0 bg-[#2c001e] flex flex-col items-center justify-center text-white font-sans overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center"
      >
        {/* Ubuntu Logo Placeholder */}
        <div className="w-24 h-24 mb-8 relative">
           <div className="absolute inset-0 border-4 border-white rounded-full opacity-20 animate-pulse" />
           <div className="absolute inset-4 border-4 border-white rounded-full" />
           <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl">
             U
           </div>
        </div>

        <h1 className="text-3xl font-light tracking-widest mb-12">Tonmoy Chandro Das</h1>

        {bootType === 'cold' ? (
          <div className="w-64 space-y-4">
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-white"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-[10px] font-mono opacity-50 h-4 overflow-hidden">
              {progress < 20 && "[ OK ] Reached target Local File Systems."}
              {progress >= 20 && progress < 40 && "[ OK ] Started Network Time Synchronization."}
              {progress >= 40 && progress < 60 && "[ OK ] Started GNOME Display Manager."}
              {progress >= 60 && progress < 80 && "[ OK ] Reached target Multi-User System."}
              {progress >= 80 && "[ OK ] Reached target Graphical Interface."}
            </div>
          </div>
        ) : (
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-sm font-medium opacity-80"
          >
            Resuming session...
          </motion.div>
        )}
      </motion.div>
      
      <div className="absolute bottom-12 text-[10px] opacity-30 uppercase tracking-[0.2em]">
        Ubuntu 24.04 LTS Inspired
      </div>
    </div>
  );
}
