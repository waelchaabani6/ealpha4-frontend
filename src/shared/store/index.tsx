import { configureStore } from '@reduxjs/toolkit';
import schoolSlice from './schoolSlice';
import uiSlice from './uiStore';
import userSlice from './userSlice';
import assignmentSlice from './assignmentSlice';
import assignSlice from './assignmentPageSlice';
import createAssignmentSlice from './createAssignmentSlice';

export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    school: schoolSlice.reducer,
    ui: uiSlice.reducer,
    assignment: assignmentSlice.reducer,
    assign: assignSlice.reducer,
    createAssignment: createAssignmentSlice.reducer
  }
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
