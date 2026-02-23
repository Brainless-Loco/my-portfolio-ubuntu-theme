import React, { useEffect, useState } from 'react';
import { Clock, Wifi, Battery, Volume2, ChevronDown, Power, Settings, LogOut, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { toggleActivitiesMode, setVolume, setBrightness, setShuttingDown, setLocked } from '../../store/osSlice';
import { openWindow } from '../../store/windowSlice';
import { cn } from '../../lib/utils';

export default function TopBar() {
  const dispatch = useDispatch();
  const [time, setTime] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [showSystemMenu, setShowSystemMenu] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const volume = useSelector((state: RootState) => state.os.volume);
  const brightness = useSelector((state: RootState) => state.os.brightness) ?? 100;
  const isActivitiesMode = useSelector((state: RootState) => state.os.isActivitiesMode);
  const language = useSelector((state: RootState) => state.os.language);
  const isShuttingDown = useSelector((state: RootState) => state.os.isShuttingDown);
  const accentColor = useSelector((state: RootState) => state.os.accentColor);

  const schedules = [
    { title: 'Project Review', desc: 'Review the latest UI changes', date: '2026-02-23', time: '10:00 AM' },
    { title: 'Client Meeting', desc: 'Discuss portfolio expansion', date: '2026-02-23', time: '02:00 PM' },
    { title: 'Code Refactor', desc: 'Optimize window manager', date: '2026-02-24', time: '09:00 AM' },
  ];

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePowerOff = () => {
    dispatch(setShuttingDown(true));
    setTimeout(() => {
      dispatch(setShuttingDown(false));
      dispatch(setLocked(true));
      setShowSystemMenu(false);
    }, 2000);
  };

  const handleRestart = () => {
    dispatch(setShuttingDown(true));
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const handleLogOut = () => {
    dispatch(setLocked(true));
    setShowSystemMenu(false);
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setViewDate(newDate);
  };

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

  return (
    <>
      {/* Brightness Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-[9999] bg-black" 
        style={{ opacity: (100 - brightness) / 100 }} 
      />

      {/* Shutdown Animation */}
      <AnimatePresence>
        {isShuttingDown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black flex items-center justify-center flex-col gap-4"
          >
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-white text-sm font-light tracking-widest">System shutting down...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="fixed top-0 left-0 right-0 h-8 bg-black/40 backdrop-blur-md text-white text-xs flex items-center justify-between px-4 z-[2000] border-b border-white/5">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => dispatch(toggleActivitiesMode())}
            className={cn(
              "font-semibold px-2 py-0.5 rounded cursor-default transition-colors",
              isActivitiesMode ? "bg-white/20" : "hover:bg-white/10"
            )}
          >
            {language === 'en' ? 'Activities' : 'কার্যক্রম'}
          </button>
        </div>

        <div className="relative">
          <button 
            onClick={() => { setShowCalendar(!showCalendar); setShowSystemMenu(false); }}
            className={cn(
              "font-medium px-3 py-0.5 rounded cursor-default transition-colors",
              showCalendar ? "bg-white/20" : "hover:bg-white/10"
            )}
          >
            {time.toLocaleDateString(language === 'en' ? 'en-US' : 'bn-BD', { weekday: 'short', month: 'short', day: 'numeric' })} {time.toLocaleTimeString(language === 'en' ? 'en-US' : 'bn-BD', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </button>

          <AnimatePresence>
            {showCalendar && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] bg-[#2d2d2d] border border-white/10 rounded-xl shadow-2xl p-6 flex gap-6"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                      <ChevronLeft size={16} />
                    </button>
                    <span className="font-bold text-sm">{viewDate.toLocaleDateString(language === 'en' ? 'en-US' : 'bn-BD', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={() => changeMonth(1)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] opacity-50 mb-2">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                      <div key={`empty-${i}`} className="p-2" />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "p-2 rounded-full hover:bg-white/10 transition-colors cursor-default",
                          i + 1 === time.getDate() && viewDate.getMonth() === time.getMonth() && viewDate.getFullYear() === time.getFullYear() ? "bg-orange-600 text-white font-bold" : ""
                        )}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-48 border-l border-white/10 pl-6 space-y-4">
                  <h4 className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Schedules</h4>
                  <div className="space-y-3">
                    {schedules.map((s, i) => (
                      <div key={i} className="space-y-1">
                        <div className="text-[11px] font-bold text-orange-400">{s.title}</div>
                        <div className="text-[9px] opacity-70 line-clamp-2">{s.desc}</div>
                        <div className="text-[8px] opacity-40">{s.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <button 
            onClick={() => { setShowSystemMenu(!showSystemMenu); setShowCalendar(false); }}
            className={cn(
              "flex items-center gap-3 px-2 py-0.5 rounded cursor-default transition-colors",
              showSystemMenu ? "bg-white/20" : "hover:bg-white/10"
            )}
          >
            <div className="flex items-center gap-2">
              <Wifi size={14} />
              <Volume2 size={14} />
              <Battery size={14} />
            </div>
            <ChevronDown size={12} />
          </button>

          <AnimatePresence>
            {showSystemMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-10 right-0 w-72 bg-[#2d2d2d] border border-white/10 rounded-xl shadow-2xl p-4 space-y-4"
              >
                {/* Volume Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] opacity-60">
                    <span>{language === 'en' ? 'Volume' : 'ভলিউম'}</span>
                    <span>{volume}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Volume2 size={16} />
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={volume ?? 80}
                      onChange={(e) => dispatch(setVolume(parseInt(e.target.value)))}
                      style={{ accentColor: accentColor }}
                      className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Brightness Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] opacity-60">
                    <span>{language === 'en' ? 'Brightness' : 'উজ্জ্বলতা'}</span>
                    <span>{brightness}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="rotate-180" />
                    <input 
                      type="range" 
                      min="10" 
                      max="100" 
                      value={brightness}
                      onChange={(e) => dispatch(setBrightness(parseInt(e.target.value)))}
                      style={{ accentColor: accentColor }}
                      className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button className="flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                    <Wifi size={18} className="text-blue-400" />
                    <span className="text-[10px]">Wi-Fi</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                    <Battery size={18} className="text-green-400" />
                    <span className="text-[10px]">Battery</span>
                  </button>
                  <button 
                    onClick={() => { dispatch(openWindow({ id: 'settings', title: 'Settings', type: 'settings' })); setShowSystemMenu(false); }}
                    className="flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Settings size={18} />
                    <span className="text-[10px]">{language === 'en' ? 'Settings' : 'সেটিংস'}</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <button 
                    onClick={handleRestart}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    title={language === 'en' ? 'Restart' : 'পুনরায় আরম্ভ করুন'}
                  >
                    <RotateCcw size={16} />
                  </button>
                  <button 
                    onClick={handlePowerOff}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-red-400"
                    title={language === 'en' ? 'Power Off' : 'বন্ধ করুন'}
                  >
                    <Power size={16} />
                  </button>
                  <button 
                    onClick={handleLogOut}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    title={language === 'en' ? 'Log Out' : 'লগ আউট'}
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
    </>
  );
}
