import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OSState {
  lastBootTime: number | null;
  theme: 'dark' | 'light';
  accentColor: string;
  wallpaper: string;
  isLocked: boolean;
  isActivitiesMode: boolean;
  volume: number;
  brightness: number;
  language: 'en' | 'bn';
  isShuttingDown: boolean;
}

const initialState: OSState = {
  lastBootTime: null,
  theme: 'dark',
  accentColor: '#e95420', // Ubuntu Orange
  wallpaper: 'https://picsum.photos/seed/ubuntu/1920/1080',
  isLocked: false,
  isActivitiesMode: false,
  volume: 80,
  brightness: 100,
  language: 'en',
  isShuttingDown: false,
};

const osSlice = createSlice({
  name: 'os',
  initialState,
  reducers: {
    setBootTime: (state, action: PayloadAction<number>) => {
      state.lastBootTime = action.payload;
    },
    setTheme: (state, action: PayloadAction<'dark' | 'light'>) => {
      state.theme = action.payload;
    },
    setAccentColor: (state, action: PayloadAction<string>) => {
      state.accentColor = action.payload;
    },
    setWallpaper: (state, action: PayloadAction<string>) => {
      state.wallpaper = action.payload;
    },
    setLocked: (state, action: PayloadAction<boolean>) => {
      state.isLocked = action.payload;
    },
    toggleActivitiesMode: (state) => {
      state.isActivitiesMode = !state.isActivitiesMode;
    },
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = action.payload;
    },
    setBrightness: (state, action: PayloadAction<number>) => {
      state.brightness = action.payload;
    },
    setLanguage: (state, action: PayloadAction<'en' | 'bn'>) => {
      state.language = action.payload;
    },
    setShuttingDown: (state, action: PayloadAction<boolean>) => {
      state.isShuttingDown = action.payload;
    },
  },
});

export const { 
  setBootTime, setTheme, setAccentColor, setWallpaper, 
  setLocked, toggleActivitiesMode, setVolume, 
  setBrightness, setLanguage, setShuttingDown 
} = osSlice.actions;
export default osSlice.reducer;
