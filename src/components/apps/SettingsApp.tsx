import React, { useState } from 'react';
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

  return (
    <div className="h-full flex text-white/90 text-sm">
      {/* Sidebar */}
      <div className="w-56 bg-[#2d2d2d] border-r border-white/5 p-2 flex flex-col gap-1">
        {['Network', 'Appearance', 'Language', 'Notifications', 'Privacy', 'Users'].map((tab) => (
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

      {/* Content */}
      <div className={cn("flex-1 p-8 overflow-y-auto", currentTheme === 'dark' ? "bg-[#1e1e1e]" : "bg-gray-50 text-black")}>
        {activeTab === 'Appearance' && (
          <div className="max-w-2xl space-y-8">
            <section>
              <h3 className="text-lg font-medium mb-4">Style</h3>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => dispatch(setTheme('light'))}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all",
                    currentTheme === 'light' ? "border-orange-500 bg-white/5" : "border-transparent bg-black/20"
                  )}
                >
                  <div className="h-24 bg-gray-100 rounded-lg mb-2" />
                  <span>Light</span>
                </button>
                <button 
                  onClick={() => dispatch(setTheme('dark'))}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all",
                    currentTheme === 'dark' ? "border-orange-500 bg-white/5" : "border-transparent bg-black/20"
                  )}
                >
                  <div className="h-24 bg-gray-800 rounded-lg mb-2" />
                  <span>Dark</span>
                </button>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-medium mb-4">Accent Color</h3>
              <div className="flex flex-wrap gap-3">
                {accentColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => dispatch(setAccentColor(color.value))}
                    style={{ backgroundColor: color.value }}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all",
                      currentAccent === color.value ? "border-white scale-125 shadow-lg" : "border-transparent hover:scale-110"
                    )}
                  />
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Background</h3>
                <label className="text-xs bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-full cursor-pointer transition-colors">
                  Upload Image
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </label>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {wallpapers.map((wp) => (
                  <button
                    key={wp}
                    onClick={() => dispatch(setWallpaper(wp))}
                    className={cn(
                      "aspect-video rounded-lg overflow-hidden border-2 transition-all",
                      currentWallpaper === wp ? "border-orange-500 scale-95" : "border-transparent hover:scale-105"
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
          <div className="max-w-md space-y-6">
            <h3 className="text-lg font-medium mb-4">Language Settings</h3>
            <div className="space-y-2">
              {[
                { id: 'en', label: 'English' },
                { id: 'bn', label: 'Bangla (বাংলা)' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => dispatch(setLanguage(lang.id as any))}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all",
                    currentLang === lang.id ? "border-orange-500 bg-white/5" : "border-transparent bg-black/10"
                  )}
                >
                  <span>{lang.label}</span>
                  {currentLang === lang.id && <div className="w-2 h-2 bg-orange-500 rounded-full" />}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {activeTab !== 'Appearance' && activeTab !== 'Language' && (
          <div className="flex flex-col items-center justify-center h-full opacity-40">
            <Monitor size={48} className="mb-4" />
            <p>{activeTab} settings are not implemented in this demo.</p>
          </div>
        )}
      </div>
    </div>
  );
}
