import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Card, CardContent, CardMedia, Typography, Box, Chip } from '@mui/material';
import { FolderOpen as FolderIcon } from '@mui/icons-material';

const experienceData = [
  { name: 'Professional', items: 5, color: '#ff9800' },
  { name: 'Academic', items: 3, color: '#2196f3' },
];

export default function ExperienceApp() {
  const theme = useSelector((state: RootState) => state.os.theme);
  const isDark = theme === 'dark';

  return (
    <Box sx={{
      p: 3,
      bgcolor: isDark ? '#1e1e1e' : '#ffffff',
      minHeight: '100%',
    }}>
      <Typography variant="h5" sx={{ mb: 3, color: isDark ? '#fff' : '#000' }}>
        My Experience
      </Typography>
      
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
        gap: 3,
      }}>
        {experienceData.map((item) => (
          <Card
            key={item.name}
            sx={{
              height: '100%',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              bgcolor: isDark ? '#2d2d2d' : '#f5f5f5',
              border: `1px solid ${isDark ? '#444' : '#e0e0e0'}`,
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 16px rgba(255, 152, 0, 0.3)`,
                bgcolor: isDark ? '#333' : '#fafafa',
              },
            }}
          >
            <CardMedia
              sx={{
                height: 120,
                bgcolor: item.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.2,
              }}
            >
              <FolderIcon sx={{ fontSize: 48, color: item.color }} />
            </CardMedia>
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  color: isDark ? '#fff' : '#000',
                  fontWeight: 600,
                  mb: 1,
                }}
              >
                {item.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  label={`${item.items} items`}
                  size="small"
                  sx={{
                    bgcolor: item.color,
                    color: '#fff',
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
