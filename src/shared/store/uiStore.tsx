import { createSlice } from '@reduxjs/toolkit';

interface ErrorType {
  status: boolean;
  type: string;
  message: string;
}
interface uiTypes {
  loading: boolean;
  error: ErrorType;
}

const initialState: uiTypes = {
  loading: false,
  error: {
    status: false,
    type: '',
    message: ''
  }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setUiLoading: (state, { payload }) => {
      state.loading = payload;
    },
    setUiError: (state, { payload }) => {
      state.error = payload;
      // state.loading = false;
    }
  }
});

export const { setUiLoading, setUiError } = uiSlice.actions;
export const selectUiState = (state: any) => state.ui;

export default uiSlice;
