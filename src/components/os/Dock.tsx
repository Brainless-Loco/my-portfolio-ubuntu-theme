import { motion, AnimatePresence } from 'motion/react';
import { useDispatch, useSelector } from 'react-redux';
import { Terminal, Folder, Globe, Settings, User, Briefcase, GraduationCap, Award, Mail, LayoutGrid } from 'lucide-react';
import { openWindow } from '../../store/windowSlice';
import { toggleActivitiesMode, toggleSidebar } from '../../store/osSlice';
import { RootState } from '../../store/store';
import { cn } from '../../lib/utils';

const apps = [
  { id: 'terminal', icon: Terminal, label: 'Terminal', type: 'terminal', color: 'bg-[#300a24]' },
  { id: 'explorer', icon: Folder, label: 'Home', type: 'explorer', color: 'bg-orange-600' },
  { id: 'contact', icon: Mail, label: 'Contact Me', type: 'contact', color: 'bg-red-600' },
  { id: 'divider', type: 'divider' },
  { id: 'settings', icon: Settings, label: 'Settings', type: 'settings', color: 'bg-gray-600' },
];

export default function Dock() {
  const dispatch = useDispatch();
  const activeWindows = useSelector((state: RootState) => state.windows.activeWindows);
  const isActivitiesMode = useSelector((state: RootState) => state.os.isActivitiesMode);
  const isSidebarVisible = useSelector((state: RootState) => state.os.isSidebarVisible);

  const handleSidebarClick = (e: React.MouseEvent) => {
    // Only hide sidebar if clicking directly on the background, not on app buttons
    if (e.target === e.currentTarget) {
      dispatch(toggleSidebar());
    }
  };

  return (
    <AnimatePresence>
      {(isActivitiesMode || isSidebarVisible) && (
        <motion.div 
          initial={{ x: -100 }}
          animate={{ x: isActivitiesMode || isSidebarVisible ? 0 : -85 }}
          whileHover={{ x: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          onClick={handleSidebarClick}
          className={cn(
            "fixed left-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 p-2 bg-black/40 backdrop-blur-xl rounded-r-2xl border border-white/10 z-[1000] transition-opacity duration-300 dock-container cursor-pointer",
            isActivitiesMode ? "scale-110 opacity-100" : "opacity-40 hover:opacity-100"
          )}
        >
          {apps.map((app) => {
            if (app.type === 'divider') {
              return <div key={app.id} className="w-8 h-[1px] bg-white/10 my-1 pointer-events-none" />;
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
                    "w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all duration-200 shadow-lg",
                    app.color,
                    "hover:brightness-110"
                  )}
                >
                  {app.icon && <app.icon size={20} />}
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
      )}
    </AnimatePresence>
  );
}
