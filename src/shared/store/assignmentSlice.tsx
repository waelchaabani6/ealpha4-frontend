import { createSlice } from '@reduxjs/toolkit';

export interface AssignmentState {
    studentID: number | null;
    studentName: number | null;
    assignmentName: string | null;
    className: number | null;
    Score?: number | null;
    percentage?: number | null;
    Submitteddate?: number | null;
}

const initialState: AssignmentState = {
  studentID: null,
  studentName: null,
  assignmentName: null,
  className: null,
  Score: null,
  percentage: null,
  Submitteddate: null
};

export const assignmentSlice = createSlice({
  name: 'assignment',
  initialState,
  reducers: {
    setAssinment: (state, { payload }) => {
      state.studentID = payload.studentID;
      state.studentName = payload.studentName;
      state.assignmentName = payload.assignmentName;
      state.className = payload.className;
      state.Score = payload.Score;
      state.percentage = payload.percentage;
      state.Submitteddate = payload.Submitteddate;
    }
  }
});

export const { setAssinment } = assignmentSlice.actions;
export const selectassignmenent = (state: any) => state.assignment;
export default assignmentSlice;
