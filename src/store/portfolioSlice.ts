import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type PortfolioEntry = {
  id: string;
  serial: string;
  [key: string]: string | string[];
};

export type PortfolioSectionId =
  | 'experience'
  | 'projects'
  | 'certifications'
  | 'gallery'
  | 'skills'
  | 'english'
  | 'education'
  | 'honors'
  | 'activities'
  | 'publications'
  | 'news';

export type PortfolioSection = {
  id: PortfolioSectionId;
  title: string;
  visible: boolean;
  serial: number;
};

export type TerminalCommand = {
  id: string;
  command: string;
  output: string;
  sectionId: string;
};

export type PortfolioSchedule = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
};

export type PortfolioState = {
  homeRichText: string;
  sections: PortfolioSection[];
  professionalExperience: PortfolioEntry[];
  academicExperience: PortfolioEntry[];
  projects: PortfolioEntry[];
  certifications: PortfolioEntry[];
  gallery: PortfolioEntry[];
  skills: PortfolioEntry[];
  english: PortfolioEntry[];
  education: PortfolioEntry[];
  honors: PortfolioEntry[];
  activities: PortfolioEntry[];
  publications: PortfolioEntry[];
  news: PortfolioEntry[];
  commands: TerminalCommand[];
  schedules: PortfolioSchedule[];
};

export const initialPortfolioState: PortfolioState = {
  homeRichText: '<p>Welcome to my portfolio. Use the sidebar to explore my work and experience.</p>',
  sections: [
    { id: 'experience', title: 'Experience', visible: true, serial: 1 },
    { id: 'projects', title: 'Projects', visible: true, serial: 2 },
    { id: 'certifications', title: 'Certifications', visible: true, serial: 3 },
    { id: 'gallery', title: 'Gallery', visible: true, serial: 4 },
    { id: 'skills', title: 'Skills', visible: true, serial: 5 },
    { id: 'english', title: 'English Proficiency', visible: true, serial: 6 },
    { id: 'education', title: 'Education', visible: true, serial: 7 },
    { id: 'honors', title: 'Honors and Awards', visible: true, serial: 8 },
    { id: 'activities', title: 'Extra Curricular Activities', visible: true, serial: 9 },
    { id: 'publications', title: 'Publications', visible: true, serial: 10 },
    { id: 'news', title: 'Recent Activity', visible: true, serial: 11 },
  ],
  professionalExperience: [],
  academicExperience: [],
  projects: [],
  certifications: [],
  gallery: [],
  skills: [],
  english: [],
  education: [],
  honors: [],
  activities: [],
  publications: [],
  news: [],
  commands: [
    { id: 'whoami', command: 'whoami', output: 'Portfolio owner', sectionId: '' },
    { id: 'uname', command: 'uname', output: 'tonmoyOS 24.04.1 LTS x86_64', sectionId: '' },
  ],
  schedules: [],
};

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState: initialPortfolioState,
  reducers: {
    updatePortfolio: (_state, action: PayloadAction<PortfolioState>) => action.payload,
    mergePortfolio: (state, action: PayloadAction<Partial<PortfolioState>>) => {
      Object.assign(state, action.payload);
    },
  },
});

export const { updatePortfolio, mergePortfolio } = portfolioSlice.actions;
export default portfolioSlice.reducer;
