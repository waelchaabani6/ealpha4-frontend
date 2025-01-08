/* eslint-disable comma-dangle */
import React from 'react';

const AdminPanel = React.lazy(() => import('@containers/adminPanel'));
const ManageAdmin = React.lazy(
  () => import('@containers/adminPanel/manageAdmin')
);
const CourseIcon = React.lazy(
  () => import('@containers/adminPanel/CourseIcons/CourseIcons')
);
const ManageUsers = React.lazy(
  () => import('@containers/adminPanel/manageUsers')
);

export default {
  path: 'admin-panel',
  children: [
    { index: true, element: <AdminPanel /> },
    { path: 'manage-admin', element: <ManageAdmin /> },
    { path: 'course-icons', element: <CourseIcon /> },
    { path: 'manage-users', element: <ManageUsers /> },
  ],
};
