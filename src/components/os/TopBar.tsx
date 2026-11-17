import React, { useEffect, useState, useRef } from 'react';
import { Clock, Wifi, Battery, Volume2, ChevronDown, Power, Settings, LogOut, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store/store';
import { toggleActivitiesMode, setVolume, setBrightness, setShuttingDown, setLocked } from '../../store/osSlice';
import { openWindow } from '../../store/windowSlice';
import { cn } from '../../lib/utils';

export default function TopBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const headerRef = useRef<HTMLDivElement>(null);
  const [time, setTime] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [showSystemMenu, setShowSystemMenu] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const volume = useSelector((state: RootState) => state.os.volume);
  const brightness = useSelector((state: RootState) => state.os.brightness) ?? 100;
  const isActivitiesMode = useSelector((state: RootState) => state.os.isActivitiesMode);
  const language = useSelector((state: RootState) => state.os.language);
  const isShuttingDown = useSelector((state: RootState) => state.os.isShuttingDown);
  const accentColor = useSelector((state: RootState) => state.os.accentColor);
  const schedules = useSelector((state: RootState) => state.portfolio.schedules ?? []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
        setShowSystemMenu(false);
      }
    };

    if (showCalendar || showSystemMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCalendar, showSystemMenu]);

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

  const formatDateForComparison = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    setSelectedDate(newDate);
  };

  const displayDate = selectedDate || time;
  const displayDateStr = formatDateForComparison(displayDate);
  const filteredSchedules = schedules
    .filter((schedule) => schedule.date === displayDateStr)
    .sort((a, b) => a.time.localeCompare(b.time));

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

      <header ref={headerRef} className={cn("fixed top-0 left-0 right-0 bg-black/40 backdrop-blur-md text-white flex items-center justify-between z-[2000] border-b border-white/5", isMobile ? "h-10 px-2 text-[10px]" : "h-8 px-4 text-xs")}>
        <div className="flex items-center gap-2">
          {/* {!isMobile && (
            <button 
              onClick={() => dispatch(toggleActivitiesMode())}
              className={cn(
                "font-semibold px-2 py-0.5 rounded cursor-default transition-colors",
                isActivitiesMode ? "bg-white/20" : "hover:bg-white/10"
              )}
            >
              {language === 'en' ? 'Activities' : 'কার্যক্রম'}
            </button>
          )} */}
        </div>

        <div className="relative">
          <button 
            onClick={() => { setShowCalendar(!showCalendar); setShowSystemMenu(false); }}
            className={cn(
              "font-medium px-2 py-0.5 rounded cursor-default transition-colors",
              showCalendar ? "bg-white/20" : "hover:bg-white/10"
            )}
          >
            {isMobile ? time.toLocaleTimeString(language === 'en' ? 'en-US' : 'bn-BD', { hour: '2-digit', minute: '2-digit', hour12: false }) : time.toLocaleDateString(language === 'en' ? 'en-US' : 'bn-BD', { weekday: 'short', month: 'short', day: 'numeric' })} {(!isMobile) && time.toLocaleTimeString(language === 'en' ? 'en-US' : 'bn-BD', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </button>

          <AnimatePresence>
            {showCalendar && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn("absolute top-10 bg-[#2d2d2d] border border-white/10 rounded-xl shadow-2xl p-6 flex gap-6", isMobile ? "w-72 left-0" : "w-[500px] left-1/2 -translate-x-1/2")}
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
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const isCurrentDate = i + 1 === time.getDate() && viewDate.getMonth() === time.getMonth() && viewDate.getFullYear() === time.getFullYear();
                      const dateObj = new Date(viewDate.getFullYear(), viewDate.getMonth(), i + 1);
                      const isSelectedDate = selectedDate && formatDateForComparison(selectedDate) === formatDateForComparison(dateObj);
                      return (
                        <button
                          key={i}
                          onClick={() => handleDateClick(i + 1)}
                          className={cn(
                            "p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer",
                            isCurrentDate ? "bg-orange-600 text-white font-bold" : isSelectedDate ? "bg-white/20 font-bold" : ""
                          )}
                        >
                          {i + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="w-48 border-l border-white/10 pl-6 space-y-4">
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest opacity-50 font-bold mb-3">Schedules</h4>
                    <p className="text-[9px] opacity-60">{displayDate.toLocaleDateString(language === 'en' ? 'en-US' : 'bn-BD', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                  </div>
                  <div className="space-y-3">
                    {filteredSchedules.length > 0 ? (
                      filteredSchedules.map((schedule) => (
                        <div key={schedule.id} className="space-y-1">
                          <div className="text-[11px] font-bold text-orange-400">{schedule.title}</div>
                          <div className="text-[9px] opacity-70 line-clamp-2">{schedule.description}</div>
                          <div className="text-[8px] opacity-40">{schedule.time}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-[9px] opacity-50 italic">{language === 'en' ? 'No schedules found' : 'কোন সময়সূচী পাওয়া যায়নি'}</div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => { navigate('/admin#schedules'); setShowCalendar(false); }}
                    className="text-[9px] font-medium text-orange-300 hover:text-orange-200"
                  >
                    Manage schedules
                  </button>
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
