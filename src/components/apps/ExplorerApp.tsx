import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Folder, File, ChevronRight, Home, Clock, Star, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const sidebarItems = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'recent', icon: Clock, label: 'Recent' },
  { id: 'starred', icon: Star, label: 'Starred' },
  { id: 'trash', icon: Trash2, label: 'Trash' },
];

const folders = [
  { id: 'experience', name: 'Experience', items: 2, subfolders: [
    { name: 'Professional', items: 5 },
    { name: 'Academic', items: 3 },
  ]},
  { name: 'Projects', items: 12 },
  { name: 'Certifications', items: 8 },
  { name: 'Gallery', items: 24 },
];

export default function ExplorerApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [currentPath, setCurrentPath] = useState<string[]>(['Home']);
  const theme = useSelector((state: RootState) => state.os.theme);

  const handleFolderClick = (folder: any) => {
    if (folder.subfolders) {
      setCurrentPath([...currentPath, folder.name]);
    }
  };

  const handleBack = () => {
    if (currentPath.length > 1) {
      setCurrentPath(currentPath.slice(0, -1));
    }
  };

  const currentFolder = currentPath[currentPath.length - 1];

  return (
    <div className={cn("h-full flex text-sm", theme === 'dark' ? "text-white/90" : "text-black/90")}>
      {/* Sidebar */}
      <div className={cn("w-48 border-r p-2 flex flex-col gap-1", theme === 'dark' ? "bg-[#2d2d2d] border-white/5" : "bg-gray-100 border-black/5")}>
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { setActiveTab(item.id); setCurrentPath(['Home']); }}
            className={cn(
              "flex items-center gap-3 px-3 py-1.5 rounded-md transition-colors",
              activeTab === item.id 
                ? (theme === 'dark' ? "bg-white/10" : "bg-black/10") 
                : (theme === 'dark' ? "hover:bg-white/5" : "hover:bg-black/5")
            )}
          >
            <item.icon size={16} className="text-orange-500" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className={cn("flex-1 flex flex-col", theme === 'dark' ? "bg-[#1e1e1e]" : "bg-white")}>
        {/* Breadcrumbs */}
        <div className={cn("h-10 border-b flex items-center px-4 gap-2 text-xs", theme === 'dark' ? "border-white/5 text-white/60" : "border-black/5 text-black/60")}>
          {currentPath.map((p, i) => (
            <React.Fragment key={p}>
              <span 
                className={cn("cursor-pointer hover:underline", i === currentPath.length - 1 ? (theme === 'dark' ? "text-white/90" : "text-black/90") : "")}
                onClick={() => setCurrentPath(currentPath.slice(0, i + 1))}
              >
                {p}
              </span>
              {i < currentPath.length - 1 && <ChevronRight size={12} />}
            </React.Fragment>
          ))}
        </div>

        {/* Grid */}
        <div className="p-6 grid grid-cols-4 gap-6 content-start overflow-y-auto">
          {activeTab === 'home' && (
            <>
              {currentFolder === 'Home' ? (
                folders.map((folder) => (
                  <div 
                    key={folder.name}
                    onClick={() => handleFolderClick(folder)}
                    className="flex flex-col items-center gap-2 group cursor-default"
                  >
                    <div className="w-16 h-16 bg-orange-600/20 rounded-xl flex items-center justify-center group-hover:bg-orange-600/30 transition-colors">
                      <Folder size={32} className="text-orange-500 fill-orange-500/20" />
                    </div>
                    <span className="text-center text-xs font-medium group-hover:underline">{folder.name}</span>
                    <span className="text-[10px] opacity-40">{folder.items} items</span>
                  </div>
                ))
              ) : (
                folders.find(f => f.name === currentFolder)?.subfolders?.map((sub) => (
                  <div 
                    key={sub.name}
                    className="flex flex-col items-center gap-2 group cursor-default"
                  >
                    <div className="w-16 h-16 bg-orange-600/20 rounded-xl flex items-center justify-center group-hover:bg-orange-600/30 transition-colors">
                      <Folder size={32} className="text-orange-500 fill-orange-500/20" />
                    </div>
                    <span className="text-center text-xs font-medium group-hover:underline">{sub.name}</span>
                    <span className="text-[10px] opacity-40">{sub.items} items</span>
                  </div>
                ))
              )}
              {currentFolder === 'Home' && (
                <div className="flex flex-col items-center gap-2 group cursor-default">
                  <div className="w-16 h-16 bg-blue-600/20 rounded-xl flex items-center justify-center group-hover:bg-blue-600/30 transition-colors">
                    <File size={32} className="text-blue-500 fill-blue-500/20" />
                  </div>
                  <span className="text-center text-xs font-medium group-hover:underline">resume.pdf</span>
                  <span className="text-[10px] opacity-40">1.2 MB</span>
                </div>
              )}
            </>
          )}

          {activeTab === 'starred' && (
            <div className="flex flex-col items-center gap-2 group cursor-default">
              <div className="w-16 h-16 bg-blue-600/20 rounded-xl flex items-center justify-center group-hover:bg-blue-600/30 transition-colors">
                <File size={32} className="text-blue-500 fill-blue-500/20" />
              </div>
              <span className="text-center text-xs font-medium group-hover:underline">resume.pdf</span>
              <span className="text-[10px] opacity-40">1.2 MB</span>
            </div>
          )}

          {activeTab === 'recent' && (
            <div className="flex flex-col items-center gap-2 group cursor-default">
              <div className="w-16 h-16 bg-orange-600/20 rounded-xl flex items-center justify-center group-hover:bg-orange-600/30 transition-colors">
                <Folder size={32} className="text-orange-500 fill-orange-500/20" />
              </div>
              <span className="text-center text-xs font-medium group-hover:underline">New Project</span>
              <span className="text-[10px] opacity-40">Just now</span>
            </div>
          )}

          {activeTab === 'trash' && (
            <div className="col-span-4 flex flex-col items-center justify-center h-64 opacity-30">
              <Trash2 size={48} className="mb-4" />
              <p>Trash is empty</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
