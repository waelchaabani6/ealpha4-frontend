import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api, useGet } from '@shared/api/useApi';
import { useParams } from 'react-router-dom';
import { store } from '.';
import { setUiError, setUiLoading } from './uiStore';

const schoolServiceUrl = import.meta.env.VITE_APP_SCHOOL_SERVICE_URL;

interface SchoolState {
  schoolData: any;
  branchData: any;
}

const initialState: SchoolState = {
  schoolData: null,
  branchData: null
};

export const schoolSlice = createSlice({
  name: 'school',
  initialState,
  reducers: {
    setStoreSchool: (state, { payload }) => {
      state.schoolData = payload;
    },
    setStoreBranch: (state, { payload }) => {
      state.branchData = payload;
    },
    resetStoreSchool: (state) => {
      state.schoolData = null;
    },
    resetStoreBranch: (state) => {
      state.branchData = null;
    }
  }
});

export const { setStoreSchool, setStoreBranch, resetStoreSchool, resetStoreBranch } = schoolSlice.actions;
export const selectSchoolData = (state: any) => state.school;

// export const fetchSchoolById = createAsyncThunk('school/fetch', async (id: string, { dispatch }) => {
//   dispatch(setUiLoading(true));
//   api.get(`schools-service/schoolss/${id}/`).then(({ data }) => {
//     dispatch(setStoreSchool(data));
//   }).catch((error) => {
//     console.log(error);
//     dispatch(setUiError({
//       status: true,
//       type: 'tata',
//       message: 'ambani'
//     }));
//   }).finally(() => dispatch(setUiLoading(false)));
// });

export const fetchSchoolById = (id: string) => {
  store.dispatch(setUiLoading(true));
  api(schoolServiceUrl).get(`schools-service/schoolss/${id}/`).then(({ data }) => {
    store.dispatch(setStoreSchool(data));
  }).catch((error) => {
    store.dispatch(setUiError({
      status: true,
      type: 'tata',
      message: 'ambani'
    }));
  })
    .finally(() => store.dispatch(setUiLoading(false)));
};

export default schoolSlice;
