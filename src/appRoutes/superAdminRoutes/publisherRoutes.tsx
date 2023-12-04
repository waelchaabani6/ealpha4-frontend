import React from 'react';
import { Navigate } from 'react-router-dom';

const GenerateCourseCode = React.lazy(() => import('@containers/publisher/GenerateCourseCode'));
const CourceCode = React.lazy(() => import('@containers/publisher/courceCode'));
const AssignCource = React.lazy(() => import('@containers/publisher/assignCource'));
const ManageCourcePermission = React.lazy(() => import('@containers/publisher/manageCourcePermission'));

export default {
  path: 'publisher',
  children: [
    // { index: true, element: <Publisher /> },
    { index: true, element: <Navigate to="course-code" /> },
    { path: 'generate-course-code', element: <GenerateCourseCode /> },
    { path: 'course-code', element: <CourceCode /> },
    { path: 'assigned-course', element: <AssignCource /> },
    { path: 'manage-course-permission', element: <ManageCourcePermission /> }
  ]
};
