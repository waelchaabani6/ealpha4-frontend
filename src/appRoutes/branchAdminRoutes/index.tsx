/* eslint-disable comma-dangle */
import NotFound from '@shared/notFound';
import React from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import LayoutTwo from '@layout/appLayout/layoutTwo';
import ReportAssignmentsDetails from '@containers/reports/ReportAssignmentDetails';
import publicRoutes from '@routes/publicRoutes';
import UsageReports from '@containers/reports/ProgramUsageReports';
import ProgramUsageDetail from '@containers/reports/ProgramUsageDetail';
import ProgramUsageTeacher from '@containers/reports/ReportUsageTeacher1';
import UsageTeacherReport from '@containers/reports/UsageTeacherReport';
import StudentDetailView from '@containers/reports/UsageStudentDetailView';
import TeacherUsageReports from '@containers/reports/Teacher-UsageReports';
import AuthPathHandler from '../helper';
import dashboardRoutes from './dashboardRoutes';
import attendenceRoutes from './attendenceRoutes';
import notificationRoutes from './notificationRoutes';
import myGroupRoutes from './myGroupRoutes';

const EditBranch = React.lazy(
  () => import('@containers/schoolManagement/components/branch/editBranch')
);
const BranchAdminDashboard = React.lazy(
  () => import('@containers/dashboard/branchAdminDashboard')
);
const Profile = React.lazy(() => import('@containers/profile'));

const ParentForm = React.lazy(
  () =>
    import(
      '@containers/schoolManagement/components/forms/manageMembers/AddEditParent'
    )
);

const BranchPanel = React.lazy(
  () =>
    import('@containers/schoolManagement/school/branch/SchoolAdminBranchPanel')
);
const ImportMember = React.lazy(
  () =>
    import(
      '@containers/schoolManagement/components/panels/members/importMember/ImportMember'
    )
);
const TimeTable = React.lazy(
  () => import('@containers/timeTable/SchoolAdminTimetable')
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

const ManageMembers = React.lazy(
  () => import('@containers/schoolManagement/school/manageMembers')
);

const ManageClasses = React.lazy(
  () => import('@containers/schoolManagement/components/panels/classes')
);

const AssignClasses = React.lazy(
  () => import('@containers/schoolManagement/components/assignClasses')
);

const ImportedDetailCsv = React.lazy(
  () => import('@component/import/component/importedDetails/importedDetailCsv')
);
const Notifications = React.lazy(
  () => import('@containers/manageNotification')
);
const AssignmentQuestionStudent = React.lazy(
  () => import('@containers/reports/AssignmentQuestionStudent')
);
const MySubject = React.lazy(() => import('@containers/MySubject'));
const GradeComponent = React.lazy(
  () => import('@containers/MySubject/GradeComponent')
);
const Volume = React.lazy(() => import('@containers/MySubject/Volume'));

const CompletedAssignment = React.lazy(
  () => import('@containers/assignment/SchoolAdmin/CompletedAssignment')
);
const AssignmentDetails = React.lazy(
  () =>
    import('@containers/assignment/SchoolAdmin/AssignmentDetailsSchoolAdmin')
);
const CompletedAssignbyname = React.lazy(
  () => import('@containers/assignment/SchoolAdmin/CompletedAssignByName')
);
const CreateAssignment = React.lazy(
  () => import('@containers/assignment/SchoolAdmin/createAssignment')
);
const Assessments = React.lazy(() => import('@containers/assessments'));
const AssignAssessment = React.lazy(
  () => import('@containers/assessments/assignAssessment')
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
// const Assignment = React.lazy(() => import('@containers/assignment/assignmentForm/createAssignment'));
const Reports = React.lazy(
  () => import('@containers/reports/ReportAssignment')
);
const CreateQuestions = React.lazy(
  () => import('@containers/assessments/CreateQuestions')
);
const CreateQuestionsLearnosity = React.lazy(
  () => import('@containers/assessments/CreateQuestionsLearnosity')
);
const PreviewQuestions = React.lazy(
  () => import('@containers/assessments/PreviewQuestions')
);
const PreviewMyAssessmentQuestions = React.lazy(
  () => import('@containers/assessments/PreviewAssessmentQuestion')
);
const PreviewMyAssessmentQuestionsLearnosity = React.lazy(
  () => import('@containers/assessments/PreviewAssessmentQuestionLearnosity')
);
const QuestionAnswer = React.lazy(
  () => import('@containers/assessments/QuestionAnswer')
);
const MarkAttendance = React.lazy(() => import('@containers/Attendance'));
const AttendanceReports = React.lazy(
  () => import('@containers/Attendance/reports')
);
const CoursePreview = React.lazy(
  () => import('@containers/manageCourses/CoursePreview')
);
const GradeBook = React.lazy(() => import('@containers/gradeBook'));
const ManageCourcePermission = React.lazy(
  () =>
    import(
      '@containers/publisher/manageCourcePermission/schoolAssignPermission'
    )
);

const CompletedAssessments = React.lazy(
  () => import('@containers/assessments/CompletedAssessments')
);
const MyAssessments = React.lazy(
  () => import('@containers/assessments/MyAssessments')
);

const StudentCompletedAssessmentList = React.lazy(
  () => import('@containers/assessments/StudentCompletedAssessmentList')
);
const StudentReportAssessment = React.lazy(
  () => import('@containers/assessments/StudentReportAssessment')
);
const Assignment = React.lazy(
  () => import('@containers/assignment/SchoolAdmin')
);
const StaticPagePreview = React.lazy(
  () => import('@containers/MySubject/StaticPagePreview')
);
const DigitalLibrary = React.lazy(() => import('@containers/DigitalLibrary'));
const DigitalLibFileDir = React.lazy(
  () => import('@containers/DigitalLibrary/DigitalLibFileDir')
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
          attendenceRoutes,
          myGroupRoutes,
          { index: true, element: <Navigate to="dashboard" /> },
          {
            path: 'bulk-upload/details/:logId',
            element: <ImportedDetailCsv />,
          },
          {
            path: 'course-preview/:courseID/:chapterID/:lessonID/:urlCourseID/:urlLessonID',
            element: <CoursePreview />,
          },
          { path: 'my-notification', element: <Notifications /> },
          {
            path: 'dashboard',
            children: [
              notificationRoutes,
              { index: true, element: <BranchAdminDashboard /> },
              {
                path: 'branch/:branchId',
                children: [
                  attendenceRoutes,
                  notificationRoutes,
                  { index: true, path: 'panel', element: <BranchPanel /> },
                  { path: 'edit', element: <EditBranch /> },
                  {
                    path: 'bulk-upload/:moduleName',
                    element: <ImportMember />,
                  },
                  {
                    path: 'manage-members/add-teacher',
                    element: <TeacherForm />,
                  },
                  {
                    path: 'manage-members/add-student',
                    element: <StudentForm />,
                  },
                  {
                    path: 'manage-members/add-parent',
                    element: <ParentForm />,
                  },
                  { path: 'manage-members', element: <ManageMembers /> },
                  { path: 'manage-classes', element: <ManageClasses /> },
                  {
                    path: 'manage-classes/assign-classes/:classID',
                    element: <AssignClasses />,
                  },
                  {
                    path: 'manage-members/edit-teacher/:userID',
                    element: <TeacherForm />,
                  },
                  {
                    path: 'manage-members/edit-student/:userID',
                    element: <StudentForm />,
                  },
                  {
                    path: 'manage-members/edit-parent/:userID',
                    element: <ParentForm />,
                  },
                  { path: 'edit', element: <EditBranch /> },
                ],
              },
            ],
          },
          { path: 'profile', element: <Profile /> },
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
          {
            path: 'assessments',
            children: [
              {
                index: true,
                element: <Assessments />,
              },
              {
                path: 'assign/:aid',
                element: <AssignAssessment />,
              },
              {
                path: 'assigned',
                element: <AssignedAssessments />,
              },
              {
                path: 'create-new-assessment',
                element: <CreateNewAssissment />,
              },
              // {
              //   path: 'print-assessment',
              //   element: <AssessmentsPrint />
              // },
              {
                path: 'print-assessment/:aid',
                element: <AssessmentsPrint />,
              },
              {
                path: 'my-assessments',
                element: <MyAssessments />,
              },
              {
                path: 'create-assessment',
                element: <CreateAssessment />,
              },
              {
                path: 'create-new-assessment-obe/create/:LID',
                element: <CreateQuestions />,
              },
              {
                path: 'create-new-assessment/create/:LID',
                element: <CreateQuestionsLearnosity />,
              },
              {
                path: 'preview_question/:LID',
                element: <PreviewQuestions />,
              },
              {
                path: 'preview_myassessment_question/:LID',
                element: <PreviewMyAssessmentQuestionsLearnosity />,
              },
              {
                path: 'preview_myassessment_question-obe/:LID',
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
            path: 'manage-course-permission',
            element: <ManageCourcePermission />,
          },
          {
            path: 'grade-book',
            element: <GradeBook />,
          },
          {
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
              {
                path: 'student-detail-view/:ClassName/:TeacherName/:SchoolID/:ClassID/:StartDate/:LastDate',
                element: <StudentDetailView />,
              },
              { path: 'teacher-reports', element: <TeacherUsageReports /> },
            ],
          },
          {
            path: 'time-table',
            element: <TimeTable />,
          },
          { path: 'static-page-preview', element: <StaticPagePreview /> },
          { path: 'course-preview', element: <CoursePreview /> },
          {
            path: 'digital-library',
            children: [
              { index: true, element: <DigitalLibrary /> },
              { path: ':folderName', element: <DigitalLibFileDir /> },
              { path: ':folderName/:folderId', element: <DigitalLibFileDir /> },
            ],
          },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
