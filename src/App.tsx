/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable comma-dangle */

import 'react-toastify/dist/ReactToastify.css';
import ErrorBoundary from '@utility/errorBoundary';
import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useSelector } from 'react-redux';
import { selectUser } from '@shared/store/userSlice';
import { USER_TYPE } from '@constants/constants';
import Loader from '@shared/loader';
import React, { useMemo } from 'react';
import AuthRoutes from '@routes/authRoutes';
import SuperAdminRoutes from '@routes/superAdminRoutes';
import SubAdminRoutes from '@routes/subAdminRoutes';
import SchoolAdminRoutes from '@routes/schoolAdminRoutes';
import BranchAdminRoutes from '@routes/branchAdminRoutes';
import TeacherRoutes from '@routes/teacherRoutes';
import StudentRoutes from '@routes/studentRoutes';
import ParentRoutes from '@routes/parentRoutes';
import GetUserWrapper from '@layout/getUserWrapper';

export default function App(): JSX.Element {
  return (
    <GetUserWrapper>
      <Init />
    </GetUserWrapper>
  );
}

// export default getUserHOC(App);

function Init() {
  const { role, loading } = useSelector(selectUser);

  const myRoutes = useMemo(() => {
    switch (role.name) {
      case USER_TYPE.SUPER_ADMIN:
        return SuperAdminRoutes;
      case USER_TYPE.SUB_ADMIN:
        return SubAdminRoutes;
      case USER_TYPE.SCHOOL_ADMIN:
        return SchoolAdminRoutes;
      case USER_TYPE.BRANCH_ADMIN:
        return BranchAdminRoutes;
      case USER_TYPE.TEACHER:
        return TeacherRoutes;
      case USER_TYPE.STUDENT:
        return StudentRoutes;
      case USER_TYPE.PARENTS:
        return ParentRoutes;
      default:
        return AuthRoutes;
    }
  }, [role.name]);
  return (
    <ErrorBoundary>
      {loading && (
        <div className="backdrop-blur-sm bg-white/30 w-screen h-screen absolute z-50 top-0 left-0 grid place-items-center">
          <div>
            <Loader size={50} />
          </div>
        </div>
      )}
      <React.Suspense fallback={<Loader />}>
        <RouterProvider router={myRoutes} fallbackElement={<Loader />} />
      </React.Suspense>
      <ToastContainer />
    </ErrorBoundary>
  );
}
