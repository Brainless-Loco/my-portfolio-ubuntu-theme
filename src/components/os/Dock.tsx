import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDispatch, useSelector } from 'react-redux';
import { Terminal, Folder, Globe, Settings, User, Briefcase, GraduationCap, Award, Mail, LayoutGrid } from 'lucide-react';
import { openWindow } from '../../store/windowSlice';
import { toggleActivitiesMode, toggleSidebar } from '../../store/osSlice';
import { RootState } from '../../store/store';
import { cn } from '../../lib/utils';

const apps = [
  { id: 'terminal', icon: Terminal, label: 'Terminal', type: 'terminal', color: 'bg-[#300a24]' },
  { id: 'explorer', icon: Folder, label: 'Home', type: 'explorer', color: 'accent-bg' },
  { id: 'contact', icon: Mail, label: 'Contact Me', type: 'contact', color: 'bg-red-600' },
  { id: 'divider', type: 'divider' },
  { id: 'settings', icon: Settings, label: 'Settings', type: 'settings', color: 'bg-gray-600' },
];

export default function Dock() {
  const dispatch = useDispatch();
  const activeWindows = useSelector((state: RootState) => state.windows.activeWindows);
  const isActivitiesMode = useSelector((state: RootState) => state.os.isActivitiesMode);
  const isSidebarVisible = useSelector((state: RootState) => state.os.isSidebarVisible);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSidebarClick = (e: React.MouseEvent) => {
    // Only hide sidebar if clicking directly on the background, not on app buttons
    if (e.target === e.currentTarget) {
      dispatch(toggleSidebar());
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={isMobile ? { y: 100 } : { x: -100 }}
        animate={isMobile ? { y: 0 } : { x: 0 }}
        whileHover={isMobile ? {} : { x: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        onClick={handleSidebarClick}
        className={cn(
          "fixed flex items-center gap-2 p-2 bg-black/40 backdrop-blur-xl border border-white/10 z-[1000] transition-opacity duration-300 dock-container cursor-pointer",
          isMobile ? (
            "bottom-0 left-0 right-0 flex-row justify-center rounded-t-2xl opacity-90"
          ) : (
            "left-0 top-1/2 -translate-y-1/2 flex-col rounded-r-2xl opacity-60 hover:opacity-100"
            )
          )}
        >
          {apps.map((app) => {
            if (app.type === 'divider') {
              return <div key={app.id} className={cn("bg-white/10 pointer-events-none", isMobile ? "w-[1px] h-8 mx-1" : "w-8 h-[1px] my-1")} />;
            }
            const isActive = activeWindows.some(w => w.id === app.id);
            
            return (
              <div key={app.id} className="relative group">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (app.id === 'contact') {
                      dispatch(openWindow({ id: 'contact', title: 'Contact Me', type: 'contact' }));
                    } else {
                      dispatch(openWindow({ id: app.id, title: app.label, type: app.type as any }));
                    }
                  }}
                  className={cn(
                    "rounded-xl flex items-center justify-center text-white transition-all duration-200 shadow-lg",
                    isMobile ? "w-12 h-12" : "w-10 h-10",
                    app.color,
                    "hover:brightness-110"
                  )}
                >
                  {app.icon && <app.icon size={isMobile ? 24 : 20} />}
                </motion.button>
                
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full md:block hidden" />
                )}
                {isActive && (
                  <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full md:hidden block" />
                )}

                {/* Tooltip */}
                <div className="absolute left-full ml-4 px-2 py-1 bg-black/80 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap dock-item-tooltip">
                  {app.label}
                </div>
              </div>
            );
          })}
        </motion.div>
    </AnimatePresence>
  );
}
