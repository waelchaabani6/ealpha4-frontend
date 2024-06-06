import Button from '@component/button/button';
import { yupResolver } from '@hookform/resolvers/yup';
import { useGet, usePost } from '@shared/api/useApi';
import Input from '@shared/form/Input';
import Select from '@shared/form/Select';
import PageTitle from '@shared/pageTitle';
import { selectSchoolData } from '@shared/store/schoolSlice';
import toast from '@shared/toast';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { USER_TYPE } from '@constants/constants';
import { useNavigate } from 'react-router-dom';
import { sortData } from '@utility/utility';
import axios from 'axios';
import RouteLayout from '../layout/routeLayout';
import schema from './schema';

export default function AssignedAssessments() {
  const navigate = useNavigate();
  const { SCHOOL_ADMIN, BRANCH_ADMIN, TEACHER } = USER_TYPE;
  const { schoolData, branchData } = useSelector(selectSchoolData);
  const { user } = useSelector((state: any) => state);
  const role = user?.role?.name;
  const [courseArray, setcourseArray] = useState<any>([]);
  const [TeacherClassesArray, setTeacherClassesArray] = useState<any>([]);
  const {
    handleSubmit,
    control
  } = useForm<any>({
    resolver: yupResolver(schema),
    mode: 'all'
  });

  // ----------API Call--------------------------------------------------------------------
  const { isLoading: LoadAssesment, mutate: mutateAssesment } = usePost({
    baseURL: import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/create-assessment/`,
    onSuccess: (response: any) => {
      const data = response?.data?.response;
      navigate(`create/${data?.id}`);
    },
    onError: ({ response }: any) => {
      const errorObj = response?.data?.errors;
      let errMessage = '';
      if (Object.keys(errorObj).length) {
        Object.keys(errorObj).forEach((key1: any) => {
          errMessage = `${key1}:${errorObj?.[key1][0]}`;
        });
      } else {
        errMessage = response?.statusText;
      }
      toast('error', errMessage || 'Error');
    }
  });

  const { isLoading: loadCourses, refetch: getCourses } = useGet({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/assigned_courses/${user?.userId}/details/?all_courses=all`,
    onSuccess: (response: any) => {
      const data = response?.data?.response;
      const arr: any = [];
      data?.map((item: any) => {
        arr.push(
          {
            label: item?.name,
            value: item?.id
          }
        );
        arr.sort(sortData);
        return arr;
      });
      setcourseArray(arr);
    },
    enabled: false
  });

  const { isLoading: loadClassesForSchool, data: ClassesForSchool } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-classes/?limit=1000&school_id=${schoolData?.id || branchData?.school_data?.id}&branch_name=${branchData?.name || ''}`,
    enabled: !!((role === SCHOOL_ADMIN && schoolData?.id) || (role === BRANCH_ADMIN && branchData?.school_data?.id))
  });
  const formatSchoolClasses = ClassesForSchool?.data?.response?.results?.map((ele: any) => ({ label: ele.name, value: ele.id })) || [];

  const { isLoading: loadClassesForTeacher, mutate: ClassesForTeacher } = usePost({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-classes/teacher/assigned-class`,
    onSuccess: (resp: any) => {
      const res = resp?.data?.response;
      const formatArr = res?.map((ele: any) => ({ label: ele.name, value: ele.class_id })) || [];
      setTeacherClassesArray(formatArr);
    }
  });

  // eslint-disable-next-line consistent-return
  const getConfigAssessments = async (name: any, subject_id: any, grade_id: any) => {
    const config = {
      apiKey: `${import.meta.env.VITE_APP_SDK}`,
      name,
      subject_id,
      grade_id,
      user: `${user?.first_name} ${user?.last_name}`,
      role: user?.role?.name
    };

    try {
      const [response] = await Promise.all([axios.post(
        `${import.meta.env.VITE_APP_IFRAME_APP_SDK}/api/config/assessments`,
        JSON.stringify(config),
        {
          headers: {
            Origin: '*',
            'Content-Type': 'application/json'
          }
        }
      )]);
      if (response.status === 200) {
        return response;
      } /* empty */
    } catch (error) { /* empty */ }
  };

  // ----------END APIs-------------------------------------------------------------------------
  const CLASS_ARRAY = (role === TEACHER ? TeacherClassesArray : formatSchoolClasses) || [];
  CLASS_ARRAY.sort(sortData);
  const onSubmit = async (values: any) => {
    // const getCourse = courseArray.find((i: any) => Number(i?.value) === Number(values?.select_course));
    const getGrade = CLASS_ARRAY.find((i: any) => Number(i?.value) === Number(values?.select_grade));

    const res = await getConfigAssessments(values?.assignment_name, '', getGrade?.value);
    const obeasses_id = res?.data?.data?.item?.id;

    const payload = {
      assessment_name: values?.assignment_name,
      // courses: getCourse?.value,
      // courses_name: getCourse?.label,
      grade: getGrade?.value,
      grade_name: getGrade?.label,
      school_id: schoolData?.id || branchData?.school_data?.id || '',
      branch_id: branchData?.id || null,
      created_by: user?.user_profile_id,
      updated_by: user?.user_profile_id,
      obeasses_id
    };
    mutateAssesment(payload);
  };

  useEffect(() => {
    if (role === TEACHER && user?.user_profile_id) {
      ClassesForTeacher({
        teacher_id: user?.user_profile_id
      });
    }
  }, [user]);

  useEffect(() => {
    if (user?.user_profile_id) {
      getCourses();
    }
  }, [user]);

  return (
    <RouteLayout>
      <div className="h-max py-4">
        <PageTitle title="Create Assessments" />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 w-full overflow-auto rounded-md h-max border border-accent bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3 md:gap-x-6 p-4">
          <Input control={control} name="assignment_name" label="Assessment Name" />
          {/* <Select
            displayEmpty={true}
            disablePlaceholderValue={true}
            control={control}
            name="select_course"
            label="Select Course"
            dataArray={courseArray}
            loading={loadCourses}
          /> */}
          <Select
            displayEmpty={true}
            disablePlaceholderValue={true}
            control={control}
            name="select_grade"
            label="Select Class"
            dataArray={CLASS_ARRAY}
            loading={loadClassesForTeacher || loadClassesForSchool}
          />
        </div>
        <div className="py-8 float-right space-x-5 px-5">
          <Button loading={LoadAssesment}>
            Create
          </Button>
        </div>
      </form>
    </RouteLayout>
  );
}
