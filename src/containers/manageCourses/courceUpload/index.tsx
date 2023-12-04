/* eslint-disable max-len */
/* eslint-disable no-console */
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useGet } from '@shared/api/useApi';
import RouteLayout from '@layout/routeLayout';
import UploadForm from '../../manageCourses/courceUpload/uploadForm/uploadForm';
import CourseUploadForm from './courseUploadForm';

type DT = { label: string; value: string | boolean | number };

export default function Index() {
  const methods = useForm({
    // resolver: yupResolver(),
    defaultValues: {
      contact: [{
        name: '',
        email: '',
        alternate_email: '',
        mobile_number: '',
        alternate_mobile_number: '',
        designation: '',
        others: ''
      }]
    }
  });
  const { isLoading, isRefetching, data, refetch } = useGet({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: 'course-code-service/courses/selection/'
  });

  const onSubmit = (values: any) => {
    // console.log(values);
    // methods.reset();
  };

  return (
    <RouteLayout navBack={true}>

      <div className="h-9 mt-4 flex items-center sm:text-lg text-sm font-semibold border-l-4 border-sunlight pl-2 grow">Course Upload</div>
      <div className="h-full w-full flex flex-col">
        <div className="flex justify-between items-center px-6 py-4">
          {/* <p className="text-sm text-red-500 opacity-80">All (*) marked fields are mandatory</p> */}
        </div>
        <hr />
        <div className="flex-1 p-6 space-y-7 bg-white">
          <CourseUploadForm />
          <UploadForm />
        </div>
      </div>
    </RouteLayout>

  );
}
