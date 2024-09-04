/* eslint-disable comma-dangle */
import NotFound from '@shared/notFound';
import React from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import LayoutTwo from '@layout/appLayout/layoutTwo';
import publicRoutes from '@routes/publicRoutes';
import AuthPathHandler from '../helper';

const ParentsDashboard = React.lazy(
  () => import('@containers/dashboard/parentsDashboard')
);
const Profile = React.lazy(() => import('@containers/profile'));
const Assessments = React.lazy(() => import('@containers/assessments/parent'));
const AssessmentDetails = React.lazy(
  () => import('@containers/assessments/parent/AssessmentDetails')
);
const AssessmentsReport = React.lazy(
  () => import('@containers/assessments/student/StudentQuickReport')
);
const AssessmentsReportLearnosity = React.lazy(
  () => import('@containers/assessments/student/StudentQuickReportLearnosity')
);
const CompletedAssessment = React.lazy(
  () => import('@containers/assessments/parent/CompletedAssessments')
);
const Assignment = React.lazy(() => import('@containers/assignment/parent'));
const AssignmentDetails = React.lazy(
  () => import('@containers/assignment/parent/AssignmentDetails')
);
const TimeTable = React.lazy(
  () => import('@containers/timeTable/ParentTimetable')
);
const AttendanceReports = React.lazy(
  () => import('@containers/Attendance/parent')
);
const ComingSoon = React.lazy(() => import('@shared/ComingSoon'));
const CoursePreview = React.lazy(
  () => import('@containers/manageCourses/CoursePreview')
);

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
          { path: 'dashboard', element: <ParentsDashboard /> },
          { path: 'profile', element: <Profile /> },
          {
            path: 'assessments',
            children: [
              {
                index: true,
                element: <Assessments />,
              },
              {
                path: 'completed-assessments',
                element: <CompletedAssessment />,
              },
              {
                path: 'assessment-details/:assessmetName',
                element: <AssessmentDetails />,
              },
              {
                path: 'assigned/assessment-report/:aid',
                element: <AssessmentsReportLearnosity />,
              },
              {
                path: 'assigned/assessment-report-obe/:aid',
                element: <AssessmentsReport />,
              },
            ],
          },
          {
            path: 'assignment',
            children: [
              { index: true, element: <Assignment /> },
              {
                path: 'assignment-details/:assignmentID/:studentID',
                element: <AssignmentDetails />,
              },
            ],
          },
          {
            path: 'time-table',
            element: <TimeTable />,
          },
          {
            path: 'attandance',
            element: <AttendanceReports />,
          },
          { path: 'course-preview', element: <CoursePreview /> },
          { path: 'coming-soon', element: <ComingSoon /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
]);
