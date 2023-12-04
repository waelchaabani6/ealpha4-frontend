import { createSlice } from '@reduxjs/toolkit';

export interface AssignState {
    Program: string | null;
    AssessmentName: string | null;
    Class: string|number | null;
    StartDate?: any;
    EndDate?:any;
}

const initialState: AssignState = {
  Program: null,
  Class: null,
  AssessmentName: null,
  StartDate: null,
  EndDate: null
};

export const assignSlice = createSlice({
  name: 'assign',
  initialState,
  reducers: {
    setAssign: (state, { payload }) => {
      state.Program = payload.Program;
      state.AssessmentName = payload.AssessmentName;
      state.Class = payload.Class;
      state.StartDate = payload.StartDate;
      state.EndDate = payload.EndDate;
    }
  }
});

export const { setAssign } = assignSlice.actions;
export const selectassign = (state: any) => state.assign;
export default assignSlice;
