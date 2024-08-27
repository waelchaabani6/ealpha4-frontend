/* eslint-disable comma-dangle */
import NotFound from '@shared/notFound';
import React from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import LayoutTwo from '@layout/appLayout/layoutTwo';
import publicRoutes from '@routes/publicRoutes';
import ObeAssessments from '@containers/assessments/ObeAssessments';
import GoogleClassroom from '@containers/googleClassroom';
import AuthPathHandler from '../helper';
import myGroupRoutes from './myGroupRoutes';

const TeacherDashboard = React.lazy(
  () => import('@containers/dashboard/teacherDashboard')
);
const Profile = React.lazy(() => import('@containers/profile'));
const MarkAttendance = React.lazy(() => import('@containers/Attendance'));
const AttendanceReports = React.lazy(
  () => import('@containers/Attendance/reports')
);
// const Assessments = React.lazy(() => import('@containers/assessments'));
// const AssignAssessment = React.lazy(() => import('@containers/assessments/assignAssessment'));
const TimeTable = React.lazy(
  () => import('@containers/timeTable/TeacherTimetable')
);
const MySubject = React.lazy(() => import('@containers/MySubject'));
const GradeComponent = React.lazy(
  () => import('@containers/MySubject/GradeComponent')
);
const Volume = React.lazy(() => import('@containers/MySubject/Volume'));
const Assignment = React.lazy(() => import('@containers/assignment'));
const CompletedAssignment = React.lazy(
  () => import('@containers/assignment/CompletedAssignment')
);
const AssignmentDetails = React.lazy(
  () => import('@containers/assignment/AssignmentDetails')
);
const CompletedAssignbyname = React.lazy(
  () => import('@containers/assignment/CompletedAssignByName')
);
// const CreateAssignment = React.lazy(() => import('@containers/assignment/assignmentForm/createAssignment'));
const CreateAssignment = React.lazy(
  () => import('@containers/assignment/SchoolAdmin/createAssignment')
);
const Assessments = React.lazy(() => import('@containers/assessments'));
const GradeBook = React.lazy(() => import('@containers/gradeBook'));
const AssignAssessment = React.lazy(
  () => import('@containers/assessments/assignAssessment')
);
const MyAssessments = React.lazy(
  () => import('@containers/assessments/MyAssessments')
);
const AssignedAssessments = React.lazy(
  () => import('@containers/assessments/assignedAssessments')
);
const CreateNewAssissment = React.lazy(
  () => import('@containers/assessments/createNewAssessment')
);
const AssessmentsReport = React.lazy(
  () => import('@containers/assessments/assessmentReprot')
);
const AssessmentsPrint = React.lazy(
  () => import('@containers/assessments/printAssessment')
);
const CreateAssessment = React.lazy(
  () => import('@containers/assessments/createAssessments')
);
const Reports = React.lazy(
  () => import('@containers/reports/ReportAssignment')
);
const ReportAssignmentDetails = React.lazy(
  () => import('@containers/reports/ReportAssignmentDetails')
);
const AssignmentQuestionStudent = React.lazy(
  () => import('@containers/reports/AssignmentQuestionStudent')
);
const CreateQuestions = React.lazy(
  () => import('@containers/assessments/CreateQuestions')
);
const PreviewQuestions = React.lazy(
  () => import('@containers/assessments/PreviewQuestions')
);
const PreviewMyAssessmentQuestions = React.lazy(
  () => import('@containers/assessments/PreviewAssessmentQuestion')
);

// const ReportAssessment = React.lazy(() => import('@containers/assessments/ReportAssessment'));
const QuestionAnswer = React.lazy(
  () => import('@containers/assessments/QuestionAnswer')
);
const CompletedAssessments = React.lazy(
  () => import('@containers/assessments/CompletedAssessments')
);
const StudentCompletedAssessmentList = React.lazy(
  () => import('@containers/assessments/StudentCompletedAssessmentList')
);
const StudentReportAssessment = React.lazy(
  () => import('@containers/assessments/StudentReportAssessment')
);
const CoursePreview = React.lazy(
  () => import('@containers/manageCourses/CoursePreview')
);
const StaticPagePreview = React.lazy(
  () => import('@containers/MySubject/StaticPagePreview')
);
const AssessmentDataLoad = React.lazy(
  () => import('@containers/assessments/AssessmentDataLoad')
);
const ComingSoon = React.lazy(() => import('@shared/ComingSoon'));
const DigitalLibrary = React.lazy(() => import('@containers/DigitalLibrary'));
const DigitalLibFileDir = React.lazy(
  () => import('@containers/DigitalLibrary/DigitalLibFileDir')
);
/*
CreateQuestions
DisplayAssessments
PreviewQuestions
ReportAssessment
*/
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
          myGroupRoutes,
          { index: true, element: <Navigate to="dashboard" /> },
          { path: 'dashboard', element: <TeacherDashboard /> },
          { path: 'profile', element: <Profile /> },
          {
            path: 'course-preview/:courseID/:chapterID/:lessonID/:urlCourseID/:urlLessonID',
            element: <CoursePreview />,
          },
          {
            path: 'grade-book',
            element: <GradeBook />,
          },
          {
            path: 'assessments',
            element: <AssessmentDataLoad />,
            children: [
              {
                index: true,
                element: <ObeAssessments />,
              },
              // {
              //   path: 'obe-assessments',
              //   element: <ObeAssessments />,
              // },
              {
                path: 'assign/:aid',
                element: <AssignAssessment />,
              },
              {
                path: 'my-assessments',
                element: <MyAssessments />,
              },
              {
                path: 'assigned',
                element: <AssignedAssessments />,
              },
              {
                path: 'create-new-assessment',
                element: <CreateNewAssissment />,
              },
              {
                path: 'print-assessment/:aid',
                element: <AssessmentsPrint />,
              },
              {
                path: 'create-assessment',
                element: <CreateAssessment />,
              },
              {
                path: 'create-new-assessment/create/:LID',
                element: <CreateQuestions />,
              },
              {
                path: 'preview_question/:LID',
                element: <PreviewQuestions />,
              },
              {
                path: 'preview_myassessment_question/:LID',
                element: <PreviewMyAssessmentQuestions />,
              },
              {
                path: 'assigned/assessment-report/:aid',
                element: <AssessmentsReport />,
              },
              {
                path: 'print-assessment/:aid/question_answer',
                element: <QuestionAnswer />,
              },
              {
                path: 'assigned/completed_assessments',
                element: <CompletedAssessments />,
              },
              {
                path: 'assigned/completed_assessments/completed_assessment_student_list/:aid',
                element: <StudentCompletedAssessmentList />,
              },
              {
                path: 'assigned/completed_assessments/completed_assessment_student_list/student_report/:aid',
                element: <StudentReportAssessment />,
              },
            ],
          },
          {
            path: 'time-table',
            element: <TimeTable />,
          },
          {
            path: 'MySubject',
            children: [
              {
                index: true,
                element: <MySubject />,
              },
              {
                path: ':name/:grade',
                children: [
                  {
                    index: true,
                    element: <GradeComponent />,
                  },
                  {
                    path: ':courseId',
                    element: <Volume />,
                  },
                ],
              },
            ],
          },
          // {
          //   path: 'Attendance/markattendance',
          //   element: <MarkAttendance />
          // },
          // {
          //   path: 'Attendance/AttendanceReports',
          //   element: <AttendanceReports />
          // },
          {
            path: 'attandance',
            children: [
              { index: true, element: <Navigate to="mark" replace={true} /> },
              { path: 'mark', element: <MarkAttendance /> },
              { path: 'reports', element: <AttendanceReports /> },
            ],
          },
          {
            path: 'digital-library',
            children: [
              { index: true, element: <DigitalLibrary /> },
              { path: ':folderName', element: <DigitalLibFileDir /> },
              { path: ':folderName/:folderId', element: <DigitalLibFileDir /> },
            ],
          },
          {
            path: 'assignment',
            children: [
              { index: true, element: <Assignment /> },
              { path: 'create-assignment', element: <CreateAssignment /> },
              {
                path: 'create-assignment/:courseId/:selectedLesson/:course_name/:grade_id/:grade/:component_id/:components/:volume_id/:volume',
                element: <CreateAssignment />,
              },
              {
                path: 'completed-assignments',
                element: <CompletedAssignment />,
              },
              {
                path: 'assignment-details/:assignId/:assignedStudentsList/:isFromComplete',
                element: <AssignmentDetails />,
              },
              { path: 'assigned-students', element: <CompletedAssignbyname /> },
            ],
          },
          {
            path: 'reports',
            children: [
              { index: true, element: <Reports /> },
              {
                path: 'report-assignment-details/:assignID/:CourseID/:ClassID',
                element: <ReportAssignmentDetails />,
              },
              {
                path: 'assignment-question-level-student/:StudentID/:AssignID',
                element: <AssignmentQuestionStudent />,
              },
            ],
          },
          { path: 'coming-soon', element: <ComingSoon /> },
          { path: 'static-page-preview', element: <StaticPagePreview /> },
          { path: 'course-preview', element: <CoursePreview /> },
          { path: 'google-classroom', element: <GoogleClassroom /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
