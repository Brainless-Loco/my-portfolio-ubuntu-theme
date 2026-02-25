import React, { useState } from 'react';
import { useSelector } from 'react-redux';
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
  AccessTime as RecentIcon,
  Star as StarIcon,
  Delete as TrashIcon,
} from '@mui/icons-material';
import ProjectsApp from './ProjectsApp';
import GalleryApp from './GalleryApp';
import CertificationsApp from './CertificationsApp';
import ExperienceApp from './ExperienceApp';

const navItems = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'experience', label: 'Experience', icon: ExperienceIcon },
  { id: 'projects', label: 'Projects', icon: FolderIcon },
  { id: 'certifications', label: 'Certifications', icon: CertIcon },
  { id: 'gallery', label: 'Gallery', icon: GalleryIcon },
];

const secondaryItems = [
  { id: 'recent', label: 'Recent', icon: RecentIcon },
  { id: 'starred', label: 'Starred', icon: StarIcon },
  { id: 'trash', label: 'Trash', icon: TrashIcon },
];

export default function ExplorerApp() {
  const [activeTab, setActiveTab] = useState('home');
  const theme = useSelector((state: RootState) => state.os.theme);
  const isDark = theme === 'dark';

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
      case 'home':
        return (
          <Box sx={{ p: 3, bgcolor: isDark ? '#1e1e1e' : '#ffffff', minHeight: '100%' }}>
            <Box sx={{ maxWidth: 600 }}>
              <h1 style={{ color: isDark ? '#fff' : '#000', marginBottom: '16px' }}>Welcome</h1>
              <p style={{ color: isDark ? '#bbb' : '#666', lineHeight: 1.6 }}>
                Explore my portfolio, projects, experience, and certifications. Navigate through the sections
                using the sidebar menu to learn more about my professional journey and skills.
              </p>
            </Box>
          </Box>
        );
      case 'recent':
        return (
          <Box sx={{ p: 3, bgcolor: isDark ? '#1e1e1e' : '#ffffff', minHeight: '100%' }}>
            <h2 style={{ color: isDark ? '#fff' : '#000' }}>Recent Items</h2>
            <p style={{ color: isDark ? '#bbb' : '#666' }}>You haven't viewed any items recently.</p>
          </Box>
        );
      case 'starred':
        return (
          <Box sx={{ p: 3, bgcolor: isDark ? '#1e1e1e' : '#ffffff', minHeight: '100%' }}>
            <h2 style={{ color: isDark ? '#fff' : '#000' }}>Starred Items</h2>
            <p style={{ color: isDark ? '#bbb' : '#666' }}>You don't have any starred items yet.</p>
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
    <Box sx={{ display: 'flex', height: '100%' }}>
      {/* Sidebar */}
      <Paper
        sx={{
          width: 240,
          flexShrink: 0,
          bgcolor: isDark ? '#2d2d2d' : '#fafafa',
          borderRight: `1px solid ${isDark ? '#444' : '#e0e0e0'}`,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
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
                onClick={() => setActiveTab(item.id)}
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

        <Divider sx={{ bgcolor: isDark ? '#444' : '#e0e0e0' }} />

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
                onClick={() => setActiveTab(item.id)}
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
      </Paper>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          bgcolor: isDark ? '#1e1e1e' : '#ffffff',
        }}
      >
        {renderContent()}
      </Box>
    </Box>
  );
}
