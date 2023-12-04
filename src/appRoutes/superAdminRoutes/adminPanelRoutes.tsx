import React from 'react';

const AdminPanel = React.lazy(() => import('@containers/adminPanel'));
const ManageAdmin = React.lazy(() => import('@containers/adminPanel/manageAdmin'));
const CourseIcon = React.lazy(() => import('@containers/adminPanel/CourseIcons/CourseIcons'));

export default {
  path: 'admin-panel',
  children: [
    { index: true, element: <AdminPanel /> },
    { path: 'manage-admin', element: <ManageAdmin /> },
    { path: 'course-icons', element: <CourseIcon /> }
  ]
};
