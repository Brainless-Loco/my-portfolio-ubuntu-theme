import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Card, CardContent, CardMedia, Typography, Box, Chip } from '@mui/material';
import { FolderOpen as FolderIcon } from '@mui/icons-material';

const projectsData = [
  { id: 1, name: 'Portfolio Website', tech: 'React, TypeScript', color: '#2196f3' },
  { id: 2, name: 'E-Commerce Platform', tech: 'MERN Stack', color: '#4caf50' },
  { id: 3, name: 'Mobile App', tech: 'React Native', color: '#ff9800' },
  { id: 4, name: 'Dashboard', tech: 'Next.js, TailwindCSS', color: '#9c27b0' },
  { id: 5, name: 'AI Chatbot', tech: 'Python, NLP', color: '#f44336' },
  { id: 6, name: 'Cloud API', tech: 'Node.js, Express', color: '#00bcd4' },
  { id: 7, name: 'Data Visualization', tech: 'D3.js, React', color: '#ffc107' },
  { id: 8, name: 'Game Development', tech: 'Unity, C#', color: '#673ab7' },
  { id: 9, name: 'DevOps Pipeline', tech: 'Docker, Kubernetes', color: '#e91e63' },
  { id: 10, name: 'Analytics Tool', tech: 'Vue.js, Firebase', color: '#009688' },
  { id: 11, name: 'Real-time Chat', tech: 'Socket.io, Node.js', color: '#3f51b5' },
  { id: 12, name: 'CMS System', tech: 'Django, PostgreSQL', color: '#607d8b' },
];

export default function ProjectsApp() {
  const theme = useSelector((state: RootState) => state.os.theme);
  const isDark = theme === 'dark';

  return (
    <Box sx={{
      p: 3,
      bgcolor: isDark ? '#1e1e1e' : '#ffffff',
      minHeight: '100%',
    }}>
      <Typography variant="h5" sx={{ mb: 3, color: isDark ? '#fff' : '#000' }}>
        My Projects
      </Typography>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
        gap: 3,
      }}>
        {projectsData.map((project) => (
          <Card
            key={project.id}
            sx={{
              height: '100%',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              bgcolor: isDark ? '#2d2d2d' : '#f5f5f5',
              border: `1px solid ${isDark ? '#444' : '#e0e0e0'}`,
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 16px rgba(${project.color.slice(1, 3)}, ${project.color.slice(3, 5)}, ${project.color.slice(5, 7)}, 0.3)`,
                bgcolor: isDark ? '#333' : '#fafafa',
              },
            }}
          >
            <CardMedia
              sx={{
                height: 120,
                bgcolor: project.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.2,
              }}
            >
              <FolderIcon sx={{ fontSize: 48, color: project.color }} />
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
                {project.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: isDark ? '#bbb' : '#666',
                  mb: 2,
                }}
              >
                {project.tech}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  label="View"
                  size="small"
                  sx={{
                    bgcolor: project.color,
                    color: '#fff',
                    cursor: 'pointer',
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
