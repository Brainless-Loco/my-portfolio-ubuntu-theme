import { useSelector } from 'react-redux';
import { AnimatePresence } from 'motion/react';
import { RootState } from '../../store/store';
import { cn } from '../../lib/utils';
import Window from './Window';
import TerminalApp from '../apps/TerminalApp';
import ExplorerApp from '../apps/ExplorerApp';
import SettingsApp from '../apps/SettingsApp';
import ExperienceApp from '../apps/ExperienceApp';
import ProjectsApp from '../apps/ProjectsApp';
import GalleryApp from '../apps/GalleryApp';
import CertificationsApp from '../apps/CertificationsApp';
import ContactApp from '../apps/ContactApp';
import PortfolioSectionApp from '../apps/PortfolioSectionApp';
import { PortfolioSectionId } from '../../store/portfolioSlice';

export default function WindowManager() {
  const activeWindows = useSelector((state: RootState) => state.windows.activeWindows);
  const isActivitiesMode = useSelector((state: RootState) => state.os.isActivitiesMode);
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
            {win.type === 'contact' && <ContactApp />}
            {win.type === 'section' && (
              win.id === 'experience' ? <ExperienceApp /> :
              win.id === 'projects' ? <ProjectsApp /> :
              win.id === 'gallery' ? <GalleryApp /> :
              win.id === 'certifications' ? <CertificationsApp /> :
              <PortfolioSectionApp sectionId={win.id as PortfolioSectionId} />
            )}
          </Window>
        ))}
      </AnimatePresence>
    </div>
  );
}
