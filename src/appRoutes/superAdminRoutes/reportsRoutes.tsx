/* eslint-disable linebreak-style */
import React from 'react';

const Reports = React.lazy(
  () => import('@containers/reports/ReportAssignment')
);

const ReportAssignmentsDetails = React.lazy(
  () => import('@containers/reports/ReportAssignmentDetails')
);
const ProgramUsageDetail = React.lazy(
  () => import('@containers/reports/ProgramUsageDetail')
);
const StudentDetailView = React.lazy(
  () => import('@containers/reports/UsageStudentDetailView')
);

const UsageTeacherReport = React.lazy(
  () => import('@containers/reports/UsageTeacherReport')
);
const UsageStudentReport = React.lazy(
  () => import('@containers/reports/UsageStudentReport')
);

const ProgramUsageTeacher = React.lazy(
  () => import('@containers/reports/ReportUsageTeacher1')
);

const AssignmentQuestionStudent = React.lazy(
  () => import('@containers/reports/AssignmentQuestionStudent')
);

const UsageReports = React.lazy(
  () => import('@containers/reports/ProgramUsageReports')
);

const TeacherUsageReports = React.lazy(
  () => import('@containers/reports/Teacher-UsageReports')
);

export default {
  path: 'reports',
  children: [
    { index: true, element: <Reports /> },
    {
      path: 'report-assignment-details/:assignID/:CourseID/:ClassID',
      element: <ReportAssignmentsDetails />,
    },
    {
      path: 'assignment-question-level-student/:StudentID/:AssignID',
      element: <AssignmentQuestionStudent />,
    },
    { path: 'program-usage-reports', element: <UsageReports /> },
    {
      path: 'program-usage-detail/:FromDate/:ToDate/:ProgramID/:ProgramName',
      element: <ProgramUsageDetail />,
    },
    {
      path: 'teacher-program-usage',
      element: <ProgramUsageTeacher />,
    },
    { path: 'usage-for-teacher', element: <UsageTeacherReport /> },
    { path: 'usage-for-student', element: <UsageStudentReport /> },
    {
      path: 'student-detail-view/:ClassName/:TeacherName/:SchoolID/:ClassID/:StartDate/:LastDate',
      element: <StudentDetailView />,
    },
    { path: 'teacher-reports', element: <TeacherUsageReports /> },
  ],
};
