import { commonRoutes } from '@routes/superAdminRoutes/schoolManagementRoutes';
import React from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';

const Branchs = React.lazy(() => import('@containers/schoolManagement/school/branch/Branches'));
const SchoolAdminList = React.lazy(() => import('@containers/schoolManagement/components/panels/schoolAdmin/schoolAdminList'));
const ManageClasses = React.lazy(() => import('@containers/schoolManagement/components/panels/classes'));
const StudentPromote = React.lazy(() => import('@containers/schoolManagement/components/promote/StudentPromote'));
const EditSchool = React.lazy(() => import('@containers/schoolManagement/components/editSchool'));
const AssignClasses = React.lazy(() => import('@containers/schoolManagement/components/assignClasses'));
const ImportMember = React.lazy(() => import('@containers/schoolManagement/components/panels/members/importMember/ImportMember'));
const CreateBranch = React.lazy(() => import('@containers/schoolManagement/components/branch/createBranch'));

export default {
  path: ':id',
  children: [
    { path: 'edit', element: <EditSchool /> },
    {
      path: 'manage-members',
      children: commonRoutes
    },
    { path: 'branches', element: <Branchs /> },
    { path: 'new-branch', element: <CreateBranch /> },
    { path: 'bulk-upload/:moduleName', element: <ImportMember /> },
    { path: 'admin', element: <SchoolAdminList /> },
    {
      path: 'manage-classes',
      children: [
        { index: true, element: <ManageClasses /> },
        { path: 'assign-classes/:classID', element: <AssignClasses /> }
      ]
    },
    { path: 'promote-student', element: <StudentPromote /> }
  ]
};
