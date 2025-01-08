/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable linebreak-style */
import AssignClasses from '@containers/schoolManagement/components/assignClasses';
import BranchDataLoad from '@shared/store/initialDataLoaders/branchDataLoad';
import SchoolDataLoad from '@shared/store/initialDataLoaders/schoolDataLoad';
import attendenceRoutes from '@routes/schoolAdminRoutes/attendenceRoutes';
import React from 'react';
import { Navigate } from 'react-router-dom';
import notificationRoutes from './notificationRoutes';
import reportsRoutes from './reportsRoutes';

const SchoolManagement = React.lazy(
  () => import('@containers/schoolManagement')
);
const SchoolPanel = React.lazy(
  () => import('@containers/schoolManagement/school')
);
const SchoolTabs = React.lazy(
  () => import('@containers/schoolManagement/NewSchool')
);
const EditSchool = React.lazy(
  () => import('@containers/schoolManagement/components/editSchool')
);
const CreateBranch = React.lazy(
  () => import('@containers/schoolManagement/components/branch/createBranch')
);
const SchoolAdminList = React.lazy(
  () =>
    import(
      '@containers/schoolManagement/components/panels/schoolAdmin/schoolAdminList'
    )
);
const ManageClasses = React.lazy(
  () => import('@containers/schoolManagement/components/panels/classes')
);

const ManageMembers = React.lazy(
  () => import('@containers/schoolManagement/school/manageMembers')
);
const TeacherForm = React.lazy(
  () =>
    import(
      '@containers/schoolManagement/components/forms/manageMembers/AddEditTeacher'
    )
);
const StudentForm = React.lazy(
  () =>
    import(
      '@containers/schoolManagement/components/forms/manageMembers/AddEditStudent'
    )
);
const ParentForm = React.lazy(
  () =>
    import(
      '@containers/schoolManagement/components/forms/manageMembers/AddEditParent'
    )
);
const Branchs = React.lazy(
  () => import('@containers/schoolManagement/school/branch/Branches')
);
const BranchPanel = React.lazy(
  () => import('@containers/schoolManagement/school/branch')
);
const EditBranch = React.lazy(
  () => import('@containers/schoolManagement/components/branch/editBranch')
);
const ImportMember = React.lazy(
  () =>
    import(
      '@containers/schoolManagement/components/panels/members/importMember/ImportMember'
    )
);
const StudentPromote = React.lazy(
  () => import('@containers/schoolManagement/components/promote/StudentPromote')
);
const TimeTable = React.lazy(
  () => import('@containers/timeTable/SuperAdminTimetable')
);
// const ImportedDetailCsv = React.lazy(() => import('@/'))
export const commonRoutes = [
  { index: true, element: <ManageMembers /> },
  { path: 'add', element: <ParentForm /> },
  { path: 'add-teacher', element: <TeacherForm /> },
  { path: 'edit-teacher/:userID', element: <TeacherForm /> },
  { path: 'add-student', element: <StudentForm /> },
  { path: 'edit-student/:userID', element: <StudentForm /> },
  { path: 'add-parent', element: <ParentForm /> },
  { path: 'edit-parent/:userID', element: <ParentForm /> },
];
export default {
  path: 'school-management',
  children: [
    { index: true, element: <Navigate to="all-schools" /> },
    { path: 'all-schools', element: <SchoolManagement /> },
    { path: 'new-school', element: <SchoolTabs /> },
    { path: 'schedule', element: <TimeTable /> },
    {
      path: 'school/:id',
      element: <SchoolDataLoad />,
      children: [
        { index: true, element: <Navigate to="panel" /> },
        { path: 'panel', element: <SchoolPanel /> },
        { path: 'edit', element: <EditSchool /> },
        { path: 'new-branch', element: <CreateBranch /> },
        { path: 'admin', element: <SchoolAdminList /> },
        { path: 'branches', element: <Branchs /> },
        { path: 'promote-student', element: <StudentPromote /> },
        { path: 'bulk-upload/:moduleName', element: <ImportMember /> },
        // { path: 'bulk-upload/details/:moduleId', element: <ImportedDetailCsv /> },
        {
          path: 'manage-members',
          children: commonRoutes,
        },
        {
          path: 'manage-classes',
          children: [
            { index: true, element: <ManageClasses /> },
            { path: 'assign-classes/:classID', element: <AssignClasses /> },
          ],
        },
        notificationRoutes,
        attendenceRoutes,
        reportsRoutes,
      ],
    },
    {
      path: 'branch/:branchId',
      element: <BranchDataLoad />,
      children: [
        { path: 'panel', element: <BranchPanel /> },
        { path: 'edit', element: <EditBranch /> },
        { path: 'bulk-upload/:moduleName', element: <ImportMember /> },
        // { path: 'bulk-upload/details/:moduleId', element: <ImportedDetailCsv /> },
        {
          path: 'manage-members',
          children: commonRoutes,
        },
        {
          path: 'manage-classes',
          children: [
            { index: true, element: <ManageClasses /> },
            { path: 'assign-classes/:classID', element: <AssignClasses /> },
          ],
        },
        notificationRoutes,
        attendenceRoutes,
      ],
    },
  ],
};
