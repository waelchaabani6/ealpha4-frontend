/* eslint-disable react/jsx-indent-props */
import React from 'react';
import { USER_TYPE } from '@constants/constants';
import { useParams } from 'react-router-dom';
import { selectUser } from '@shared/store/userSlice';
import { useSelector } from 'react-redux';
import TopBarLinks from './topBarLinks';

export default function Index() {
  const { schoolName } = useParams();
  const { role: { name: role } } = useSelector(selectUser);
  let { assessment_count, assignment_count } = useSelector(selectUser);

  if (assessment_count === 0) {
    assessment_count = null;
  }
  if (assignment_count === 0) {
    assignment_count = null;
  }

  const renderAssessment = () => {
    if (role === USER_TYPE.PARENTS || role === USER_TYPE.STUDENT) {
      return (
        <TopBarLinks
          title="Assessments"
          notificationCount={assessment_count}
          path={`/${schoolName}/assessments`}
          dropdown={true}
          childs={[
            { label: 'Assigned Assessments', path: 'assessments' },
            { label: 'Completed Assessments', path: 'assessments/completed-assessments' }
          ]}
        />
      );
    } if (role === USER_TYPE.SCHOOL_ADMIN || role === USER_TYPE.BRANCH_ADMIN || role === USER_TYPE.TEACHER) {
      return (
        <TopBarLinks
          title="Assessments"
          notificationCount={assessment_count}
          path={`/${schoolName}/assessments`}
          dropdown={true}
          childs={[
            { label: 'Alpha Assessments', path: 'assessments' },
            { label: 'Obe Assessments', path: 'assessments/obe-assessments' },
            { label: 'My Assessments', path: 'assessments/my-assessments' },
            { label: 'Create Assessments', path: 'assessments/create-new-assessment' },
            { label: 'Assigned Assessments', path: 'assessments/assigned' },
            { label: 'Completed Assessments', path: 'assessments/assigned/completed_assessments' }
          ]}
        />
      );
    }
    return (
      <TopBarLinks
        notificationCount={assessment_count}
        title="Assessments"
        path={`/${schoolName}/assessments`}
      />
    );
  };

  return (
    <div className="bg-gray-100 h-[60px] w-full flex items-center justify-start lg:justify-center overflow-x-auto">
      <TopBarLinks
        title="Dashboard"
        path={`/${schoolName}/dashboard`}
      />
      {
        !(role === USER_TYPE.PARENTS)
          ? <TopBarLinks
            title="My Courses"
            path={`/${schoolName}/MySubject`}
          /> : ''
      }
      {
        !(role === USER_TYPE.PARENTS || role === USER_TYPE.STUDENT)
          ? <TopBarLinks
            title="My Groups"
            path={`/${schoolName}/my-group`}
          /> : ''
      }
      {/* <TopBarLinks
        title="Connections"
        path={`/${schoolName}/connections`}
      /> */}
      <TopBarLinks
        title="Assignments"
        notificationCount={assignment_count}
        path={`/${schoolName}/assignment`}
        dropdown={true}
        childs={role === USER_TYPE.PARENTS ? [] : role === USER_TYPE.STUDENT ? [
          { label: 'Assigned Assignments', path: 'assignment' },
          { label: 'Completed Assignments', path: 'assignment/completed-assignments' }
        ] : [
          { label: 'View Assignments', path: 'assignment' },
          { label: 'Create Assignment', path: 'assignment/create-assignment' },
          { label: 'Completed Assignments', path: 'assignment/completed-assignments' }
        ]}
      />
      {
        renderAssessment()
      }
      {
        (role === USER_TYPE.SCHOOL_ADMIN || role === USER_TYPE.BRANCH_ADMIN || role === USER_TYPE.TEACHER)
          ? <TopBarLinks
            title="Reports"
            dropdown={true}
            childs={role === USER_TYPE.SCHOOL_ADMIN || role === USER_TYPE.BRANCH_ADMIN ? [
              { label: 'Report - Assignments', path: 'reports' },
              { label: 'Reports Program Usage', path: 'reports/program-usage-reports' },
              { label: 'Usage Reports Teacher/Student', path: 'reports/usage-for-teacher' },
              { label: 'Report - Usage - Teacher 1', path: 'reports/teacher-program-usage' },
              { label: 'Report - Usage - Teacher 2', path: 'reports/teacher-reports' }

              // will be enable when functionality come
              // { label: 'Standard Report - Class', path: 'reports' },
              // { label: 'Standard Report - Student', path: 'reports' }

            ] : []}
            path={`/${schoolName}/reports`}
          /> : ''
      }
      <TopBarLinks
        title="school TimeTable"
        path={`/${schoolName}/time-table`}
        dropdown={true}
      />
      <TopBarLinks
        title="Attendance"
        path={`/${schoolName}/attandance`}
        dropdown={true}
        childs={(role !== USER_TYPE.STUDENT && role !== USER_TYPE.PARENTS) ? [
          { label: 'Mark Attendance', path: 'attandance/mark' },
          { label: 'Attendance Reports', path: 'attandance/reports' }
        ] : []}
      />
    </div>
  );
}
