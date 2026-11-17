import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Box, Button } from '@mui/material';
import PortfolioSectionApp from './PortfolioSectionApp';

export default function ExperienceApp() {
  const { theme, accentColor } = useSelector((state: RootState) => state.os);
  const [activeTab, setActiveTab] = React.useState<'professionalExperience' | 'academicExperience'>('professionalExperience');
  const isDark = theme === 'dark';

  return (
    <Box sx={{ height: '100%', overflowY: 'auto', bgcolor: isDark ? '#1e1e1e' : '#fff' }}>
      <Box sx={{ display: 'inline-flex', gap: 0.5, mx: { xs: 2, sm: 3 }, mt: 2, p: 0.5, borderRadius: 2, bgcolor: isDark ? '#303030' : '#f0f0f0' }} role="tablist" aria-label="Experience type">
        {([
          { id: 'professionalExperience', label: 'Professional' },
          { id: 'academicExperience', label: 'Academic' },
        ] as const).map((tab) => (
          <Button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            size="small"
            onClick={() => setActiveTab(tab.id)}
            sx={{
              minWidth: { xs: 128, sm: 150 },
              borderRadius: 1.5,
              px: 2,
              py: 0.75,
              textTransform: 'none',
              fontWeight: 600,
              color: activeTab === tab.id ? '#fff' : isDark ? '#bbb' : '#555',
              bgcolor: activeTab === tab.id ? accentColor : 'transparent',
              boxShadow: activeTab === tab.id ? 1 : 'none',
              '&:hover': { bgcolor: activeTab === tab.id ? accentColor : isDark ? '#3b3b3b' : '#e5e5e5' },
            }}
          >
            {tab.label}
          </Button>
        ))}
      </Box>
      <PortfolioSectionApp sectionId="experience" experienceKey={activeTab} />
    </Box>
  );
}
