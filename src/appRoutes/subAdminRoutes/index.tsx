import NotFound from '@shared/notFound';
import React from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import LayoutTwo from '@layout/appLayout/layoutTwo';
import publicRoutes from '@routes/publicRoutes';
import AuthPathHandler from '../helper';

const SubAdminDashboard = React.lazy(
  () => import('@containers/dashboard/subAdminDashboard')
);
const Profile = React.lazy(() => import('@containers/profile'));

export default createBrowserRouter([
  {
    path: '/',
    children: [
      ...publicRoutes,
      { index: true, element: <Navigate to="/:schoolName" /> },
      {
        path: '/:schoolName',
        element: <LayoutTwo />,
        children: [
          AuthPathHandler,
          { index: true, element: <Navigate to="dashboard" /> },
          { path: 'dashboard', element: <SubAdminDashboard /> },
          { path: 'profile', element: <Profile /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
