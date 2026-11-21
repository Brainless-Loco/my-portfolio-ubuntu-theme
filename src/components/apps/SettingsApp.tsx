import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { setWallpaper, setTheme, setAccentColor, setLanguage } from '../../store/osSlice';
import { Monitor, Palette, User, Shield, Bell, Globe } from 'lucide-react';
import { cn } from '../../lib/utils';

const wallpapers = [
  'https://picsum.photos/seed/ubuntu1/1920/1080',
  'https://picsum.photos/seed/ubuntu2/1920/1080',
  'https://picsum.photos/seed/ubuntu3/1920/1080',
  'https://picsum.photos/seed/nature1/1920/1080',
  'https://picsum.photos/seed/tech1/1920/1080',
  'https://picsum.photos/seed/space1/1920/1080',
  'https://picsum.photos/seed/abstract1/1920/1080',
  'https://picsum.photos/seed/minimal1/1920/1080',
  'https://picsum.photos/seed/city1/1920/1080',
];

const accentColors = [
  { name: 'Orange', value: '#e95420' },
  { name: 'Blue', value: '#3498db' },
  { name: 'Green', value: '#2ecc71' },
  { name: 'Purple', value: '#9b59b6' },
  { name: 'Red', value: '#e74c3c' },
  { name: 'Teal', value: '#1abc9c' },
];

export default function SettingsApp() {
  const dispatch = useDispatch();
  const currentWallpaper = useSelector((state: RootState) => state.os.wallpaper);
  const currentTheme = useSelector((state: RootState) => state.os.theme);
  const currentAccent = useSelector((state: RootState) => state.os.accentColor);
  const currentLang = useSelector((state: RootState) => state.os.language);
  const [activeTab, setActiveTab] = useState('Appearance');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          dispatch(setWallpaper(event.target.result as string));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = ['Network', 'Appearance', 'Language', 'Notifications', 'Privacy', 'Users'];

  return (
    <div className={`h-full flex flex-col md:flex-row text-white/90 ${isMobile ? 'text-xs' : 'text-sm'}`}>
      {/* Sidebar / Tab Navigation */}
      {isMobile ? (
        <div className="bg-[#2d2d2d] border-b border-white/5 p-1 flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-3 py-1 rounded-md transition-colors whitespace-nowrap text-xs",
                activeTab === tab ? "bg-white/15" : "hover:bg-white/5"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      ) : (
        <div className="w-56 bg-[#2d2d2d] border-r border-white/5 p-2 flex flex-col gap-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-left",
                activeTab === tab ? "bg-white/10" : "hover:bg-white/5"
              )}
            >
              {tab === 'Appearance' && <Palette size={16} />}
              {tab === 'Language' && <Globe size={16} />}
              {tab === 'Notifications' && <Bell size={16} />}
              {tab === 'Privacy' && <Shield size={16} />}
              {tab === 'Users' && <User size={16} />}
              {tab === 'Network' && <Monitor size={16} />}
              <span>{tab}</span>
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className={cn("flex-1 overflow-y-auto", isMobile ? "p-3" : "p-8", currentTheme === 'dark' ? "bg-[#1e1e1e]" : "bg-gray-50 text-black")}>
        {activeTab === 'Appearance' && (
          <div className={`${isMobile ? 'max-w-full space-y-4' : 'max-w-2xl space-y-8'}`}>
            <section>
              <h3 className={`font-medium mb-3 ${isMobile ? 'text-sm' : 'text-lg'}`}>Style</h3>
              <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-2'}`}>
                <button 
                  onClick={() => dispatch(setTheme('light'))}
                  style={currentTheme === 'light' ? { borderColor: currentAccent } : undefined}
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all",
                    currentTheme === 'light' ? "bg-white/5" : "border-transparent bg-black/20"
                  )}
                >
                  <div className={`${isMobile ? 'h-16' : 'h-24'} bg-gray-100 rounded-lg mb-2`} />
                  <span className="text-xs md:text-sm">Light</span>
                </button>
                <button 
                  onClick={() => dispatch(setTheme('dark'))}
                  style={currentTheme === 'dark' ? { borderColor: currentAccent } : undefined}
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all",
                    currentTheme === 'dark' ? "bg-white/5" : "border-transparent bg-black/20"
                  )}
                >
                  <div className={`${isMobile ? 'h-16' : 'h-24'} bg-gray-800 rounded-lg mb-2`} />
                  <span className="text-xs md:text-sm">Dark</span>
                </button>
              </div>
            </section>

            <section>
              <h3 className={`font-medium mb-3 ${isMobile ? 'text-sm' : 'text-lg'}`}>Accent Color</h3>
              <div className="flex flex-wrap gap-2">
                {accentColors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    aria-label={`Set accent color to ${color.name}`}
                    aria-pressed={currentAccent === color.value}
                    onClick={() => dispatch(setAccentColor(color.value))}
                    style={{ backgroundColor: color.value }}
                    className={cn(
                      "rounded-full border-2 transition-all",
                      isMobile ? "w-6 h-6" : "w-8 h-8",
                      currentAccent === color.value ? "border-white scale-125 shadow-lg" : "border-transparent hover:scale-110"
                    )}
                  />
                ))}
              </div>
            </section>

            <section>
              <div className={`flex items-center justify-between mb-3 flex-col md:flex-row gap-2`}>
                <h3 className={`font-medium ${isMobile ? 'text-sm' : 'text-lg'}`}>Background</h3>
                <label className="accent-bg text-xs text-white px-3 py-1.5 rounded-full cursor-pointer transition-colors">
                  Upload Image
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </label>
              </div>
              <div className={`grid gap-2 ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {wallpapers.map((wp) => (
                  <button
                    key={wp}
                    onClick={() => dispatch(setWallpaper(wp))}
                    style={currentWallpaper === wp ? { borderColor: currentAccent } : undefined}
                    className={cn(
                      "aspect-video rounded-lg overflow-hidden border-2 transition-all",
                      currentWallpaper === wp ? "scale-95" : "border-transparent hover:scale-105"
                    )}
                  >
                    <img src={wp} alt="Wallpaper" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'Language' && (
          <div className={`${isMobile ? 'max-w-full space-y-3' : 'max-w-md space-y-6'}`}>
            <h3 className={`font-medium mb-3 ${isMobile ? 'text-sm' : 'text-lg'}`}>Language Settings</h3>
            <div className="space-y-2">
              {[
                { id: 'en', label: 'English' },
                { id: 'bn', label: 'Bangla (বাংলা)' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => dispatch(setLanguage(lang.id as any))}
                  style={currentLang === lang.id ? { borderColor: currentAccent } : undefined}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all text-sm",
                    currentLang === lang.id ? "bg-white/5" : "border-transparent bg-black/10"
                  )}
                >
                  <span>{lang.label}</span>
                  {currentLang === lang.id && <div className="accent-bg w-2 h-2 rounded-full" />}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {activeTab !== 'Appearance' && activeTab !== 'Language' && (
          <div className="flex flex-col items-center justify-center h-full opacity-40">
            <Monitor size={isMobile ? 32 : 48} className="mb-4" />
            <p className="text-xs md:text-sm text-center">{activeTab} settings are not implemented in this demo.</p>
          </div>
        )}
      </div>
    </div>
  );
}
