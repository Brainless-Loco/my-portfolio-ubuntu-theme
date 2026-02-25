import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Card, CardContent, Typography, Box, Chip, LinearProgress } from '@mui/material';
import { Verified as VerifiedIcon } from '@mui/icons-material';

const certificationsData = [
  { name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', date: '2023', progress: 100 },
  { name: 'Google Cloud Associate Cloud Engineer', issuer: 'Google Cloud', date: '2023', progress: 100 },
  { name: 'Certified Kubernetes Administrator', issuer: 'Linux Foundation', date: '2023', progress: 100 },
  { name: 'MongoDB Developer Associate', issuer: 'MongoDB', date: '2022', progress: 100 },
  { name: 'HashiCorp Certified: Terraform Associate', issuer: 'HashiCorp', date: '2022', progress: 100 },
  { name: 'Azure Developer Associate', issuer: 'Microsoft', date: '2023', progress: 100 },
  { name: 'Scrum Master Certified', issuer: 'Scrum Alliance', date: '2022', progress: 100 },
  { name: 'Full Stack Web Development Bootcamp', issuer: 'Udemy', date: '2021', progress: 100 },
];

export default function CertificationsApp() {
  const theme = useSelector((state: RootState) => state.os.theme);
  const isDark = theme === 'dark';
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Box sx={{
      p: isMobile ? 1.5 : 3,
      bgcolor: isDark ? '#1e1e1e' : '#ffffff',
      minHeight: '100%',
    }}>
      <Typography variant="h5" sx={{ mb: 2, color: isDark ? '#fff' : '#000', fontSize: isMobile ? '1.3rem' : '1.5rem' }}>
        Certifications
      </Typography>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
        gap: isMobile ? 2 : 3,
      }}>
        {certificationsData.map((cert, index) => (
          <Card
            key={index}
            sx={{
              height: '100%',
              transition: 'all 0.3s ease',
              bgcolor: isDark ? '#2d2d2d' : '#f5f5f5',
              border: `1px solid ${isDark ? '#444' : '#e0e0e0'}`,
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 16px rgba(76, 175, 80, 0.3)`,
                bgcolor: isDark ? '#333' : '#fafafa',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                <VerifiedIcon
                  sx={{
                    color: '#4caf50',
                    flex: 'none',
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: isDark ? '#fff' : '#000',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                    }}
                  >
                    {cert.name}
                  </Typography>
                </Box>
              </Box>

              <Typography
                variant="body2"
                sx={{
                  color: isDark ? '#bbb' : '#666',
                  mb: 1,
                }}
              >
                {cert.issuer}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={cert.progress}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    bgcolor: isDark ? '#444' : '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#4caf50',
                      borderRadius: 2,
                    },
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={cert.date}
                  size="small"
                  sx={{
                    bgcolor: '#4caf50',
                    color: '#fff',
                  }}
                />
                <Chip
                  label="Verified"
                  size="small"
                  sx={{
                    bgcolor: isDark ? '#444' : '#e0e0e0',
                    color: isDark ? '#fff' : '#000',
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
