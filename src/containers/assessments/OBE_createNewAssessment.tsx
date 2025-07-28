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
import {useLocation, useNavigate} from 'react-router-dom';
import {sortData, userRole} from '@utility/utility';
import axios from 'axios';
import encryptMessage from '@utility/encrypt';
import RouteLayout from '../layout/routeLayout';
import schema from './schema';

export default function OBE_CreateAssessments() {
  const navigate = useNavigate();
  const { SCHOOL_ADMIN, BRANCH_ADMIN, TEACHER } = USER_TYPE;
  const { schoolData, branchData } = useSelector(selectSchoolData);
  const [dataValues, setDataValues] = useState<any>();
  const [obeId, setObeId] = useState<string | null>(null);
  const { user } = useSelector((state: any) => state);
  const role = user?.role?.name;
  const [courseArray, setcourseArray] = useState<any>([]);
  const [TeacherClassesArray, setTeacherClassesArray] = useState<any>([]);
  const location = useLocation();
  const {
    handleSubmit,
    control
  } = useForm<any>({
    resolver: yupResolver(schema),
    mode: 'all'
  });

  // ----------API Call--------------------------------------------------------------------
  const { isLoading: LoadAssesment, mutate: mutateAssesment } = usePost({
    baseURL: import.meta.env.VITE_APP_OBE_ASSESSMENT_SERVICE_URL,
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
  const { isLoading: LoadObeAssesment, mutate: mutateObeAssesment } = usePost({
    baseURL: import.meta.env.VITE_APP_OBE_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/create-assessment/`,
    onSuccess: (response: any) => {
      const data = response?.data?.response;
      setDataValues(data);
      // navigate(`create/${data?.id}`);
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
    url: `course-code-service/courses/assigned_courses/${user?.userId}/details`,
    onSuccess: (response: any) => {
      const data = response?.data?.response;
      const arr: any = [];
      data?.map((item: any) => {
        arr.push(
          {
            label: item?.short_name,
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
      apiKey: `${import.meta.env.VITE_OBESASS_API_KEY}`,
      name,
      subject_id,
      grade_id,
      user: `${user?.first_name} ${user?.last_name}`,
      role: user?.role?.name,
      user_ting: user?.user_ting
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_OBEASSESS_SDK_URL}sdk-assessments`,
        { name: config?.name, subject_id: config?.subject_id },
        {
          headers: {
            'X-Authorization': `${config?.apiKey}`,
            Accept: 'application/json',
            User: config?.user,
            Role: config?.role,
            User_ting: config?.user_ting
          }
        }
      );
      if (response.status === 200 || response.status === 201) {
        // const obeasses_id = await res?.data?.data?.item?.id;

        return response;
      } /* empty */
    } catch (error) {
    }
  };
  useEffect(() => {
    if (dataValues) {
      const currentDate = new Date();
      const schoolName = decodeURIComponent(location.pathname.split('/')[1]);
      const targetPagePath = `/${schoolName}/obe-assessments/my-assessments`; // Update this to the path of the page you want to redirect to
      const targetPageUrl = `${window.location.origin}${targetPagePath}`; // Constructs the full URL
      const domain_name = import.meta.env.VITE_OBESASS_domain_name;

      const message: any = {
        key: import.meta.env.VITE_OBESASS_API_ENC_KEY as string,
        user_name: `${user?.first_name} ${user?.last_name}`,
        user_id: user?.user_ting,
        assessment_id: obeId,
        date_time: currentDate,
        role: user?.role?.name,
        redirectionPath: targetPageUrl
      };
      const encryptedData = encryptMessage(JSON.stringify(message));
      window.location.href = `${import.meta.env.VITE_APP_IFRAME_APP_SDK}/create-assessments/?token=${encodeURIComponent(encryptedData)}&domain_name=${domain_name}`;
    }
  }, [dataValues, obeId]);

  // async function createAssessments(config) {
  //   console.log(config)
  //   let data = { name : config?.name ,subject_id: config?.subject_id }
  //   try {
  //     return await axios.post(`${process.env.REACT_APP_API_URL}/apiv2/sdk-assessments`,
  //         data,
  //         {
  //           headers: {
  //             'X-Authorization': `${config?.apiKey}`,
  //             Accept: 'application/json',
  //             User: config?.user,
  //             Role: config?.role,
  //             User_ting: config?.user_ting
  //           }
  //         },
  //     );
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  // ----------END APIs-------------------------------------------------------------------------
  const CLASS_ARRAY = (role === TEACHER ? TeacherClassesArray : formatSchoolClasses) || [];
  CLASS_ARRAY.sort(sortData);
  const onSubmit = async (values: any) => {
    // const getCourse = courseArray.find((i: any) => Number(i?.value) === Number(values?.select_course));
    const getCourse = courseArray.find(
      (i: any) => Number(i?.value) === Number(values?.select_course)
  );
  const getGrade = CLASS_ARRAY.find(
      (i: any) => Number(i?.value) === Number(values?.select_grade)
  );
  const res = await getConfigAssessments(values?.assignment_name, getCourse?.value, getGrade?.value);

    const obeasses_id = await res?.data?.item?.id;
    // console.log(await res?.data?.item?.id, 'sadasdasdas')
    setObeId(obeasses_id);
    const payload = {
      assessment_name: values?.assignment_name,
      // courses: getCourse?.value,
      // courses_name: getCourse?.label,
      courses: getCourse?.value,
      courses_name: getCourse?.label,
      grade: getGrade?.value,
      grade_name: getGrade?.label,
      school_id: schoolData?.id || branchData?.school_data?.id || '',
      branch_id: branchData?.id || null,
      created_by: user.userId,
      updated_by: user?.userId,
      obeasses_id
    };
    // mutateAssesment(payload);
    const response = mutateObeAssesment(payload);
    setDataValues(response);
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
        <PageTitle title="Create OBE Assessments" />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 w-full overflow-auto rounded-md h-max border border-accent bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3 md:gap-x-6 p-4">
          <Input control={control} name="assignment_name" label="Assessment Name" />
          <Select
            displayEmpty={true}
            disablePlaceholderValue={true}
            control={control}
            name="select_course"
            label="Select Course"
            dataArray={courseArray}
            loading={loadCourses}
          />
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
