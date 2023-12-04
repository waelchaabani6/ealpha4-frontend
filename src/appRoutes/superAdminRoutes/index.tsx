import NotFound from '@shared/notFound';
import ImportedDetailCsv from '@component/import/component/importedDetails/importedDetailCsv';
import LayoutOne from '@layout/appLayout/layoutOne';
import React from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import publicRoutes from '@routes/publicRoutes';
import notificationRoutes from './notificationRoutes';
import integrationRoutes from './integrationRoutes';
import schoolManagementRoutes from './schoolManagementRoutes';
import publisherRoutes from './publisherRoutes';
import manageCourcesRoutes from './manageCourcesRoutes';
import adminPanelRoutes from './adminPanelRoutes';
import AuthPathHandler from '../helper';

const SuperAdminDashboard = React.lazy(() => import('@containers/dashboard/superAdminDashboard'));
const Profile = React.lazy(() => import('@containers/profile'));
const Calendar = React.lazy(() => import('@containers/calendar'));
const ManageInfomativePages = React.lazy(() => import('@containers/manageInfomativePages'));
const JoditEditor = React.lazy(() => import('@containers/manageInfomativePages/JoditEditorPage'));
const StaticPage = React.lazy(() => import('@containers/manageInfomativePages/StaticPage'));
const EditPage = React.lazy(() => import('@containers/manageInfomativePages/editPage'));
const CoursePreview = React.lazy(() => import('@containers/manageCourses/CoursePreview'));
const StaticPagePreview = React.lazy(() => import('@containers/MySubject/StaticPagePreview'));

export default createBrowserRouter([
  {
    path: '/',
    element: <LayoutOne />,
    children: [
      AuthPathHandler,
      { index: true, element: <Navigate to="dashboard" /> },
      { path: 'dashboard', element: <SuperAdminDashboard /> },
      { path: 'profile', element: <Profile /> },
      { path: 'calendar', element: <Calendar /> },
      { path: 'infomative-pages', element: <ManageInfomativePages /> },
      { path: 'infomative-pages/add-informative-page', element: <JoditEditor /> },
      { path: 'infomative-pages/edit-informative-page/:id', element: <EditPage /> },
      { path: 'page/:id/', element: <StaticPage /> },
      { path: 'bulk-upload/details/:logId', element: <ImportedDetailCsv /> },
      notificationRoutes,
      integrationRoutes,
      schoolManagementRoutes,
      publisherRoutes,
      manageCourcesRoutes,
      adminPanelRoutes,
      { path: 'manage-courses/course-preview/:courseID', element: <CoursePreview /> },
      { path: 'manage-courses/static-page-preview', element: <StaticPagePreview /> }
    ]
  },
  ...publicRoutes,
  { path: '*', element: <NotFound /> }
]);
