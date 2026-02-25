import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WindowState {
  id: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  type: 'terminal' | 'explorer' | 'browser' | 'settings' | 'section' | 'contact';
  content?: any;
  width?: number;
  height?: number;
}

interface WindowsState {
  activeWindows: WindowState[];
  focusedWindowId: string | null;
  nextZIndex: number;
}

const initialState: WindowsState = {
  activeWindows: [],
  focusedWindowId: null,
  // start above UI overlays like the dock (z-1000) but below the topbar (z-2000)
  nextZIndex: 1500,
};

const windowSlice = createSlice({
  name: 'windows',
  initialState,
  reducers: {
    openWindow: (state, action: PayloadAction<Omit<WindowState, 'isOpen' | 'isMinimized' | 'isMaximized' | 'zIndex'>>) => {
      const existing = state.activeWindows.find(w => w.id === action.payload.id);
      if (existing) {
        existing.isMinimized = false;
        existing.zIndex = state.nextZIndex++;
        state.focusedWindowId = existing.id;
      } else {
        state.activeWindows.push({
          ...action.payload,
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          zIndex: state.nextZIndex++,
        });
        state.focusedWindowId = action.payload.id;
      }
    },
    closeWindow: (state, action: PayloadAction<string>) => {
      state.activeWindows = state.activeWindows.filter(w => w.id !== action.payload);
      if (state.focusedWindowId === action.payload) {
        state.focusedWindowId = state.activeWindows.length > 0 ? state.activeWindows[state.activeWindows.length - 1].id : null;
      }
    },
    minimizeWindow: (state, action: PayloadAction<string>) => {
      const win = state.activeWindows.find(w => w.id === action.payload);
      if (win) {
        win.isMinimized = true;
        state.focusedWindowId = null;
      }
    },
    focusWindow: (state, action: PayloadAction<string>) => {
      const win = state.activeWindows.find(w => w.id === action.payload);
      if (win) {
        win.isMinimized = false;
        win.zIndex = state.nextZIndex++;
        state.focusedWindowId = win.id;
      }
    },
    toggleMaximize: (state, action: PayloadAction<string>) => {
      const win = state.activeWindows.find(w => w.id === action.payload);
      if (win) {
        win.isMaximized = !win.isMaximized;
      }
    }
  },
});

export const { openWindow, closeWindow, minimizeWindow, focusWindow, toggleMaximize } = windowSlice.actions;
export default windowSlice.reducer;
