import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { RootState } from '../../store/store';
import {
  Box,
  List,
  ListItem,
  Button,
  Divider,
  Paper,
} from '@mui/material';
import {
  Home as HomeIcon,
  FolderOpen as FolderIcon,
  Image as GalleryIcon,
  School as CertIcon,
  Work as ExperienceIcon,
  Delete as TrashIcon,
  EmojiEvents as HonorsIcon,
  Language as LanguageIcon,
  MenuBook as PublicationsIcon,
  Psychology as SkillsIcon,
  Groups as ActivitiesIcon,
  History as NewsIcon,
  Link as ProfilesIcon,
  ContactMail as ContactIcon,
} from '@mui/icons-material';
import PortfolioSectionApp from './PortfolioSectionApp';
import { sanitizeRichText } from '../../lib/richText';
import { PortfolioSectionId } from '../../store/portfolioSlice';
import ProjectsApp from './ProjectsApp';
import GalleryApp from './GalleryApp';
import CertificationsApp from './CertificationsApp';
import ContactApp from './ContactApp';
import ExperienceApp from './ExperienceApp';

const sectionIcons = {
  experience: ExperienceIcon,
  projects: FolderIcon,
  certifications: CertIcon,
  gallery: GalleryIcon,
  skills: SkillsIcon,
  english: LanguageIcon,
  education: CertIcon,
  honors: HonorsIcon,
  activities: ActivitiesIcon,
  publications: PublicationsIcon,
  profiles: ProfilesIcon,
  news: NewsIcon,
};

const secondaryItems = [
  { id: 'news', label: 'Recent Activities', icon: NewsIcon },
  { id: 'contact', label: 'Contact Me', icon: ContactIcon },
  { id: 'trash', label: 'Trash', icon: TrashIcon },
];

function isAtScrollEnd(target: EventTarget | null, root: HTMLElement): boolean {
  let element = target instanceof HTMLElement ? target : null;
  while (element && element !== root) {
    const overflowY = window.getComputedStyle(element).overflowY;
    if (/(auto|scroll)/.test(overflowY) && element.scrollHeight > element.clientHeight + 1) {
      return element.scrollTop + element.clientHeight >= element.scrollHeight - 4;
    }
    element = element.parentElement;
  }
  return root.scrollTop + root.clientHeight >= root.scrollHeight - 4;
}

function isAtScrollStart(target: EventTarget | null, root: HTMLElement): boolean {
  let element = target instanceof HTMLElement ? target : null;
  while (element && element !== root) {
    const overflowY = window.getComputedStyle(element).overflowY;
    if (/(auto|scroll)/.test(overflowY) && element.scrollHeight > element.clientHeight + 1) {
      return element.scrollTop <= 4;
    }
    element = element.parentElement;
  }
  return root.scrollTop <= 4;
}

export default function ExplorerApp() {
  const location = useLocation();
  const navigate = useNavigate();
  const routeSegment = location.pathname.slice(1);
  const activeTab = routeSegment === 'desktop' ? 'home' : routeSegment === 'recent' ? 'news' : routeSegment || 'home';
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const isAutoAdvancing = React.useRef(false);
  const touchStartY = React.useRef<number | null>(null);
  const theme = useSelector((state: RootState) => state.os.theme);
  const portfolio = useSelector((state: RootState) => state.portfolio);
  const isDark = theme === 'dark';
  const navItems = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    ...[...portfolio.sections]
      .filter((section) => section.visible && section.id !== 'news')
      .sort((a, b) => a.serial - b.serial)
      .map((section) => ({ id: section.id, label: section.title, icon: sectionIcons[section.id] })),
  ];
  const progressionItems = [
    { id: 'home' },
    ...[...portfolio.sections]
      .filter((section) => section.visible)
      .sort((first, second) => first.serial - second.serial)
      .map((section) => ({ id: section.id })),
    { id: 'contact' },
  ];
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
    isAutoAdvancing.current = false;
    touchStartY.current = null;
  }, [activeTab]);

  const navigateAtBoundary = (target: EventTarget | null, direction: -1 | 1) => {
    const root = contentRef.current;
    if (!root || isAutoAdvancing.current) return;
    const atBoundary = direction === 1 ? isAtScrollEnd(target, root) : isAtScrollStart(target, root);
    if (!atBoundary) return;
    const currentIndex = progressionItems.findIndex((item) => item.id === activeTab);
    if (currentIndex < 0) return;
    const nextItem = progressionItems[currentIndex + direction];
    if (!nextItem) return;
    isAutoAdvancing.current = true;
    navigate(`/${nextItem.id}`);
  };

  const handleContentWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (event.deltaY > 0) navigateAtBoundary(event.target, 1);
    else if (event.deltaY < 0) navigateAtBoundary(event.target, -1);
  };

  const handleContentTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartY.current = event.changedTouches[0]?.clientY ?? null;
  };

  const handleContentTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const endY = event.changedTouches[0]?.clientY;
    const movement = touchStartY.current !== null && endY !== undefined ? touchStartY.current - endY : 0;
    touchStartY.current = null;
    if (movement > 24) navigateAtBoundary(event.target, 1);
    else if (movement < -24) navigateAtBoundary(event.target, -1);
  };

  // Auto close sidebar on mobile when item is selected
  const handleItemClick = (id: string) => {
    navigate(`/${id}`);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'projects':
        return <ProjectsApp />;
      case 'gallery':
        return <GalleryApp />;
      case 'certifications':
        return <CertificationsApp />;
      case 'experience':
        return <ExperienceApp />;
      case 'recent':
      case 'news':
        return <PortfolioSectionApp sectionId="news" />;
      case 'contact':
        return <ContactApp />;
      case 'skills':
      case 'english':
      case 'education':
      case 'honors':
      case 'activities':
      case 'publications':
      case 'profiles':
        return <PortfolioSectionApp sectionId={activeTab as PortfolioSectionId} />;
      case 'home':
        return (
          <Box sx={{ p: 3, bgcolor: isDark ? '#1e1e1e' : '#ffffff', minHeight: '100%' }}>
            <Box className="portfolio-rich-text" sx={{ maxWidth: 800, color: isDark ? '#ddd' : '#444', '& a': { color: '#ff9800' }, '& ul, & ol': { pl: 3 } }}
              dangerouslySetInnerHTML={{ __html: sanitizeRichText(portfolio.homeRichText) }} />
          </Box>
        );
      case 'trash':
        return (
          <Box sx={{ p: 3, bgcolor: isDark ? '#1e1e1e' : '#ffffff', minHeight: '100%' }}>
            <h2 style={{ color: isDark ? '#fff' : '#000' }}>Trash</h2>
            <p style={{ color: isDark ? '#bbb' : '#666' }}>Trash is empty</p>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100%', flexDirection: isMobile ? 'column' : 'row' }}>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <Box sx={{ 
          p: 1, 
          bgcolor: isDark ? '#2d2d2d' : '#fafafa',
          borderBottom: `1px solid ${isDark ? '#444' : '#e0e0e0'}`,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}>
          <Button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            size="small"
            sx={{
              minWidth: 'auto',
              color: '#ff9800',
              bgcolor: isDark ? 'rgba(255, 152, 0, 0.1)' : 'rgba(255, 152, 0, 0.1)',
            }}
          >
            {sidebarOpen ? '✕ Hide' : '☰ Menu'}
          </Button>
          <Box sx={{ flex: 1 }} />
          <span style={{ fontSize: '0.85rem', opacity: 0.6, color: isDark ? '#fff' : '#000' }}>
            {[...navItems, ...secondaryItems].find((item) => item.id === activeTab)?.label || 'Home'}
          </span>
        </Box>
      )}

      {/* Sidebar */}
      {(!isMobile || sidebarOpen) && (
        <Paper
          sx={{
            width: isMobile ? '100%' : 280,
            flexShrink: 0,
            bgcolor: isDark ? '#2d2d2d' : '#fafafa',
            borderRight: isMobile ? 'none' : `1px solid ${isDark ? '#444' : '#e0e0e0'}`,
            borderBottom: isMobile ? `1px solid ${isDark ? '#444' : '#e0e0e0'}` : 'none',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            maxHeight: isMobile ? '200px' : 'auto',
          }}
        >
          <List sx={{ flex: 1, p: 1 }}>
            {navItems.map((item) => (
              <ListItem
                key={item.id}
                disablePadding
                sx={{
                  mb: 0.5,
                }}
              >
                <Button
                  fullWidth
                  onClick={() => handleItemClick(item.id)}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    fontSize: isMobile ? '0.9rem' : '0.95rem',
                    color: isDark ? '#fff' : '#000',
                    bgcolor: activeTab === item.id ? (isDark ? '#444' : '#e0e0e0') : 'transparent',
                    '&:hover': {
                      bgcolor: isDark ? '#383838' : '#f0f0f0',
                    },
                  }}
                >
                  <item.icon
                    sx={{
                      mr: isMobile ? 1 : 2,
                      fontSize: isMobile ? '1.2rem' : '1.5rem',
                      color: activeTab === item.id ? '#ff9800' : (isDark ? '#bbb' : '#666'),
                    }}
                  />
                  {item.label}
                </Button>
              </ListItem>
            ))}
            {isMobile && secondaryItems.map((item) => (
              <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                <Button
                  fullWidth
                  onClick={() => handleItemClick(item.id)}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    color: isDark ? '#fff' : '#000',
                    bgcolor: activeTab === item.id ? (isDark ? '#444' : '#e0e0e0') : 'transparent',
                    '&:hover': { bgcolor: isDark ? '#383838' : '#f0f0f0' },
                  }}
                >
                  <item.icon sx={{ mr: 1, fontSize: '1.2rem', color: activeTab === item.id ? '#ff9800' : isDark ? '#bbb' : '#666' }} />
                  {item.label}
                </Button>
              </ListItem>
            ))}
          </List>

          {!isMobile && <Divider sx={{ bgcolor: isDark ? '#444' : '#e0e0e0' }} />}

          {!isMobile && (
            <List sx={{ p: 1 }}>
              {secondaryItems.map((item) => (
                <ListItem
                  key={item.id}
                  disablePadding
                  sx={{
                    mb: 0.5,
                  }}
                >
                  <Button
                    fullWidth
                    onClick={() => handleItemClick(item.id)}
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      color: isDark ? '#fff' : '#000',
                      bgcolor: activeTab === item.id ? (isDark ? '#444' : '#e0e0e0') : 'transparent',
                      '&:hover': {
                        bgcolor: isDark ? '#383838' : '#f0f0f0',
                      },
                    }}
                  >
                    <item.icon
                      sx={{
                        mr: 2,
                        color: activeTab === item.id ? '#ff9800' : (isDark ? '#bbb' : '#666'),
                      }}
                    />
                    {item.label}
                  </Button>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      )}

      {/* Main Content */}
      <Box
        ref={contentRef}
        onWheel={handleContentWheel}
        onTouchStart={handleContentTouchStart}
        onTouchEnd={handleContentTouchEnd}
        sx={{
          flex: 1,
          overflow: 'auto',
          bgcolor: isDark ? '#1e1e1e' : '#ffffff',
          minHeight: isMobile ? 'calc(100vh - 200px)' : '100%',
        }}
        className="custom-scrollbar"
      >
        {renderContent()}
      </Box>
    </Box>
  );
}
