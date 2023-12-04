import React from 'react';
import { Navigate } from 'react-router-dom';

const MarkAttendance = React.lazy(() => import('@containers/Attendance'));
const AttendanceReports = React.lazy(() => import('@containers/Attendance/reports'));

export default {
  path: 'attandance',
  children: [
    { index: true, element: <Navigate to="mark" replace={true} /> },
    { path: 'mark', element: <MarkAttendance /> },
    { path: 'reports', element: <AttendanceReports /> }
  ]
};
