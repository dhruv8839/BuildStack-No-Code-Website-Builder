import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface FocusState {
  focusedContainerId: string | null;
  breadcrumbStack: { id: string; name: string }[];
}

const initialState: FocusState = {
  focusedContainerId: null,
  breadcrumbStack: [],
};

export const focusSlice = createSlice({
  name: 'focus',
  initialState,
  reducers: {
    setFocusContainer: (state, action: PayloadAction<{ id: string; name: string; ancestors?: { id: string; name: string }[] }>) => {
      state.focusedContainerId = action.payload.id;
      if (action.payload.ancestors) {
        state.breadcrumbStack = [...action.payload.ancestors, { id: action.payload.id, name: action.payload.name }];
      } else {
        state.breadcrumbStack = [{ id: action.payload.id, name: action.payload.name }];
      }
    },
    exitFocusMode: (state) => {
      state.focusedContainerId = null;
      state.breadcrumbStack = [];
    },
  },
});

export const { setFocusContainer, exitFocusMode } = focusSlice.actions;
export default focusSlice.reducer;
