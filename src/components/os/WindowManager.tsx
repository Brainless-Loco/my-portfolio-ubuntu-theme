import { useSelector } from 'react-redux';
import { AnimatePresence } from 'motion/react';
import { RootState } from '../../store/store';
import { cn } from '../../lib/utils';
import { Globe } from 'lucide-react';
import Window from './Window';
import TerminalApp from '../apps/TerminalApp';
import ExplorerApp from '../apps/ExplorerApp';
import SettingsApp from '../apps/SettingsApp';

export default function WindowManager() {
  const activeWindows = useSelector((state: RootState) => state.windows.activeWindows);
  const isActivitiesMode = useSelector((state: RootState) => state.os.isActivitiesMode);
  const accentColor = useSelector((state: RootState) => state.os.accentColor);

  const theme = useSelector((state: RootState) => state.os.theme);

  return (
    <div className={cn(
      "relative w-full h-full transition-all duration-500",
      isActivitiesMode ? "scale-90" : ""
    )}>
      <AnimatePresence>
        {activeWindows.map((win) => (
          <Window key={win.id} window={win}>
            {win.type === 'terminal' && <TerminalApp />}
            {win.type === 'explorer' && <ExplorerApp />}
            {win.type === 'settings' && <SettingsApp />}
            {win.type === 'contact' && (
              <div className={cn("p-8 h-full flex flex-col gap-8", theme === 'dark' ? "text-white" : "text-black")}>
                <div className="flex flex-col gap-2">
                  <h2 className="text-3xl font-bold">Contact Me</h2>
                  <p className="opacity-60">Feel free to reach out for collaborations or just a friendly hello!</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
                  <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-1">
                      <label className="text-xs opacity-60">Name</label>
                      <input type="text" className={cn("w-full p-2 rounded-lg border outline-none transition-all", theme === 'dark' ? "bg-white/5 border-white/10 focus:border-orange-500" : "bg-black/5 border-black/10 focus:border-orange-500")} placeholder="John Doe" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs opacity-60">Email</label>
                      <input type="email" className={cn("w-full p-2 rounded-lg border outline-none transition-all", theme === 'dark' ? "bg-white/5 border-white/10 focus:border-orange-500" : "bg-black/5 border-black/10 focus:border-orange-500")} placeholder="john@example.com" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs opacity-60">Message</label>
                      <textarea rows={4} className={cn("w-full p-2 rounded-lg border outline-none transition-all resize-none", theme === 'dark' ? "bg-white/5 border-white/10 focus:border-orange-500" : "bg-black/5 border-black/10 focus:border-orange-500")} placeholder="Your message here..." />
                    </div>
                    <button className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors">
                      Send Message
                    </button>
                  </form>

                  <div className="space-y-6">
                    <h4 className="font-bold">Connect Elsewhere</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <a href="https://github.com" target="_blank" rel="noopener noreferrer" className={cn("flex items-center gap-3 p-4 rounded-xl border transition-all hover:scale-105", theme === 'dark' ? "bg-white/5 border-white/5" : "bg-black/5 border-black/5")}>
                        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                          <Globe size={20} className="text-white" />
                        </div>
                        <span className="font-medium">GitHub</span>
                      </a>
                      <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={cn("flex items-center gap-3 p-4 rounded-xl border transition-all hover:scale-105", theme === 'dark' ? "bg-white/5 border-white/5" : "bg-black/5 border-black/5")}>
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Globe size={20} className="text-white" />
                        </div>
                        <span className="font-medium">LinkedIn</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {win.type === 'section' && (
              <div className={cn("p-8 h-full", theme === 'dark' ? "text-white" : "text-black")}>
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-4">
                  <div className="w-2 h-8 rounded-full" style={{ backgroundColor: accentColor }} />
                  {win.title}
                </h2>
                <div className="space-y-6 opacity-80">
                  <p className="text-lg leading-relaxed">
                    This is the {win.title} section of Tonmoy's portfolio. 
                    Detailed information about {win.title.toLowerCase()} will be displayed here.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={cn("p-4 rounded-xl border", theme === 'dark' ? "bg-white/5 border-white/5" : "bg-black/5 border-black/5")}>
                        <h4 className="font-bold mb-2">Sample Item {i}</h4>
                        <p className="text-xs opacity-60">Description for sample item {i} in {win.title}.</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Window>
        ))}
      </AnimatePresence>
    </div>
  );
}
