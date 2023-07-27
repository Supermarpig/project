// src/store/reducers/data.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DataState {
  data: any;
  error: string | null;
}

const initialState: DataState = {
  data: null,
  error: null,
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setData: (state, action: PayloadAction<any>) => {
      state.data = action.payload;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.data = null;
      state.error = action.payload;
    },
  },
});

export const { setData, setError } = dataSlice.actions;
export default dataSlice.reducer;
