import NotFound from '@shared/notFound';
import React from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import LayoutTwo from '@layout/appLayout/layoutTwo';
import publicRoutes from '@routes/publicRoutes';
import AuthPathHandler from '../helper';

const StundentDashboard = React.lazy(() => import('@containers/dashboard/studentDashboard'));
const Profile = React.lazy(() => import('@containers/profile'));
const Assignment = React.lazy(() => import('@containers/assignment/student'));
const CompletedAssignment = React.lazy(() => import('@containers/assignment/student/CompletedAssignment'));
const Assessments = React.lazy(() => import('@containers/assessments/student'));
const CompletedAssessment = React.lazy(() => import('@containers/assessments/student/CompletedAssessments'));
const AssessmentDetails = React.lazy(() => import('@containers/assessments/student/AssessmentDetails'));
const AssignmentDetails = React.lazy(() => import('@containers/assignment/student/AssignmentDetails'));
const TimeTable = React.lazy(() => import('@containers/timeTable/StudentTimetable'));
const MySubject = React.lazy(() => import('@containers/StudentMySubject'));
const TableOfContent = React.lazy(() => import('@containers/StudentMySubject/TableOfContent'));
// const AttendanceReports = React.lazy(() => import('@containers/Attendance/reports'));
const AttendanceReports = React.lazy(() => import('@containers/Attendance/reports'));
const CoursePreview = React.lazy(() => import('@containers/manageCourses/CoursePreview'));
const CompletedAssignbyname = React.lazy(() => import('@containers/assignment/CompletedAssignByName'));
const DisplayAssessment = React.lazy(() => import('@containers/assessments/DisplayAssessments'));
const AssessmentsReport = React.lazy(() => import('@containers/assessments/student/StudentQuickReport'));
const AssessmentDataLoad = React.lazy(() => import('@containers/assessments/AssessmentDataLoad'));
const ComingSoon = React.lazy(() => import('@shared/ComingSoon'));
const StaticPagePreview = React.lazy(() => import('@containers/MySubject/StaticPagePreview'));
const DigitalLibrary = React.lazy(() => import('@containers/DigitalLibrary'));
const DigitalLibFileDir = React.lazy(() => import('@containers/DigitalLibrary/DigitalLibFileDir'));

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
          { path: 'dashboard', element: <StundentDashboard /> },
          { path: 'profile', element: <Profile /> },
          { path: 'course-preview/:courseID/:chapterID/:lessonID/:urlCourseID/:urlLessonID', element: <CoursePreview /> },
          {
            path: 'MySubject',
            children: [
              { index: true, element: <MySubject /> },
              {
                path: ':courseId',
                element: <TableOfContent />
              }
            ]
          },
          {
            path: 'assessments',
            element: <AssessmentDataLoad />,
            children: [
              {
                index: true,
                element: <Assessments />
              },
              {
                path: 'completed-assessments',
                element: <CompletedAssessment />
              },
              {
                path: 'assessment-details/:assessmetName',
                element: <AssessmentDetails />
              },
              {
                path: 'perform-assessment/:aid',
                element: <DisplayAssessment />
              },
              {
                path: 'assigned/assessment-report/:aid',
                element: <AssessmentsReport />
              }
            ]
          },
          {
            path: 'time-table',
            element: <TimeTable />
          },
          {
            path: 'assignment',
            children: [
              { index: true, element: <Assignment /> },
              { path: 'completed-assignments', element: <CompletedAssignment /> },
              { path: 'assignment-details/:assignId/:assignedStudentsList/:isFromComplete', element: <AssignmentDetails /> }
            ]
          },
          {
            path: 'attandance',
            element: <AttendanceReports />
          },
          { path: 'reports', element: <ComingSoon /> },
          { path: 'static-page-preview', element: <StaticPagePreview /> },
          { path: 'course-preview', element: <CoursePreview /> },
          {
            path: 'digital-library',
            children: [
              { index: true, element: <DigitalLibrary /> },
              { path: ':folderName', element: <DigitalLibFileDir /> },
              { path: ':folderName/:folderId', element: <DigitalLibFileDir /> }
            ]
          },
          { path: 'coming-soon', element: <ComingSoon /> }
        ]
      }
    ]
  },
  { path: '*', element: <NotFound /> }
]);
