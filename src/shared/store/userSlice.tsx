import { createSlice } from '@reduxjs/toolkit';

export interface UserState {
  userId: number | null;
  schoolId: number | null;
  school_name: string | null;
  branchId: number | null;
  branch_name?: string;
  class_id?: number;
  class_name?: string;
  user_profile_id: number | null;
  first_name: string;
  last_name: string;
  profile_picture: string;
  user_ting: string;
  role: {
    id: number | null;
    name: string;
  };
  loading: boolean;
  isLoggedIn: boolean;
  forceLogout: boolean;
  assignment_count?: number;
  assessment_count?: number;
}

const initialState: UserState = {
  userId: null,
  schoolId: null,
  school_name: null,
  branchId: null,
  user_profile_id: null,
  first_name: '',
  last_name: '',
  profile_picture: '',
  user_ting: '',
  role: {
    id: null,
    name: ''
  },
  loading: false,
  isLoggedIn: !!localStorage.getItem('token'),
  forceLogout: false,
  assignment_count: 0,
  assessment_count: 0
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, { payload }) => {
      state.userId = payload.userId;
      state.first_name = payload.first_name;
      state.last_name = payload.last_name;
      state.user_ting = payload.user_ting;
      state.role = payload.role;
      state.profile_picture = payload.profile_picture;
      if (payload?.schoolId) {
        state.schoolId = payload?.schoolId;
      }
      state.user_profile_id = payload.user_profile_id;
      state.branchId = payload.branchId;
      state.school_name = payload.school_name;
      state.loading = false;
      state.assignment_count = payload.assignment_count;
      state.assessment_count = payload.assessment_count;
      if (payload?.branch_name) {
        state.branch_name = payload.branch_name;
      }
      if (payload?.class_name) {
        state.class_name = payload.class_name;
      }
      if (payload?.class_id) {
        state.class_id = payload.class_id;
      }
    },
    resetUser: () => ({ ...initialState, isLoggedIn: false }),
    setUserProfile: (state, { payload }) => {
      state.profile_picture = payload.profile_picture;
      state.first_name = payload.first_name;
      state.last_name = payload.last_name;
      const user = localStorage.getItem('user');
      if (user) {
        localStorage.setItem('user', JSON.stringify({
          ...JSON.parse(user),
          profile_picture: payload.profile_picture,
          first_name: payload.first_name,
          last_name: payload.last_name
        }));
      }
    },
    setUserLoader: (state, { payload }) => {
      state.loading = payload;
    },
    forceLogout: (state, { payload }) => {
      state.forceLogout = payload;
    },
    setLoggedIn: (state, { payload }) => {
      state.isLoggedIn = payload;
    }
  }
});

export const { setLoggedIn, setUser, setUserProfile, resetUser, setUserLoader, forceLogout } = userSlice.actions;
export const selectUser = (state: any) => state.user;
export default userSlice;
