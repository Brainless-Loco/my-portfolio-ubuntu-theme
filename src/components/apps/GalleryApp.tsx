import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Typography, Box, Paper } from '@mui/material';
import { Image as ImageIcon } from '@mui/icons-material';

const galleryItems = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  title: `Gallery Item ${i + 1}`,
  color: [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#ffa502',
    '#2ecc71', '#9b59b6', '#e74c3c', '#1abc9c',
    '#3498db', '#f39c12', '#c0392b', '#16a085',
  ][i % 12],
}));

export default function GalleryApp() {
  const theme = useSelector((state: RootState) => state.os.theme);
  const isDark = theme === 'dark';

  return (
    <Box sx={{
      p: 3,
      bgcolor: isDark ? '#1e1e1e' : '#ffffff',
      minHeight: '100%',
    }}>
      <Typography variant="h5" sx={{ mb: 3, color: isDark ? '#fff' : '#000' }}>
        Gallery
      </Typography>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
        gap: 2,
      }}>
        {galleryItems.map((item) => (
          <Paper
            key={item.id}
            sx={{
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backgroundColor: isDark ? '#2d2d2d' : '#f5f5f5',
              border: `1px solid ${isDark ? '#444' : '#e0e0e0'}`,
              '&:hover': {
                transform: 'scale(1.05) translateY(-4px)',
                boxShadow: `0 12px 24px rgba(0, 0, 0, 0.3)`,
              },
            }}
          >
              <Box
                sx={{
                  width: '100%',
                  paddingBottom: '100%',
                  position: 'relative',
                  bgcolor: item.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.15,
                }}
              >
                <ImageIcon sx={{ fontSize: 48, position: 'absolute' }} />
              </Box>
              <Box sx={{ p: 2 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: isDark ? '#bbb' : '#666',
                    textAlign: 'center',
                  }}
                >
                  {item.title}
                </Typography>
              </Box>
            </Paper>
        ))}
      </Box>
    </Box>
  );
}
