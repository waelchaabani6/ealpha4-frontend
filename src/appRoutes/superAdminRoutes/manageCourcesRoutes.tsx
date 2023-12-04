import React, { Children } from 'react';

const ManageCourses = React.lazy(() => import('@containers/manageCourses'));
const CourceUpload = React.lazy(() => import('@containers/manageCourses/courceUpload'));
const Preview = React.lazy(() => import('@containers/manageCourses/courceUpload/uploadForm/preview/preview'));
const AddCourseMaster = React.lazy(() => import('@containers/manageCourses/addCourseMaster'));
const TableOfContent = React.lazy(() => import('@containers/manageCourses/courceUpload/uploadForm/preview/TableOfContent'));
const CoursePreview = React.lazy(() => import('@containers/manageCourses/CoursePreview'));
export default {
  path: 'manage-courses',
  children: [
    { index: true, element: <ManageCourses /> },
    { path: 'add-course', element: <AddCourseMaster /> },
    {
      path: 'upload-course',
      children: [
        { index: true, element: <CourceUpload /> },
        {
          path: 'preview',
          children: [
            { index: true, element: <Preview /> },
            {
              path: ':courseId',
              element: <TableOfContent />
            }
          ]
        },
        { path: 'course-preview', element: <CoursePreview /> }
      ]
    }
  ]
};
