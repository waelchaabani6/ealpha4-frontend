import Button from '@component/button/button';
import Checkbox from '@component/checkbox';
import Dropdown from '@component/dropdown/Dropdown';
import { yupResolver } from '@hookform/resolvers/yup';
import RouteLayout from '@layout/routeLayout';
import { FormControlLabel } from '@mui/material';
import { useGet, usePost } from '@shared/api/useApi';
import DatePicker from '@shared/form/DatePicker';
import Input from '@shared/form/Input';
import TextArea from '@shared/form/TextArea';
import Loader from '@shared/loader';
import PageTitle from '@shared/pageTitle';
import { selectSchoolData } from '@shared/store/schoolSlice';
import toast from '@shared/toast';
import { capEveryFirstLetter } from '@utility/utility';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { USER_TYPE } from '@constants/constants';
import UseGetProfile from '@utility/Hooks/UseGetProfile';
import assignAssessmentSchema from './assignAssessmentSchema';

const CATEGORY_LIST: Array<any> = [
  {
    label: 'Class',
    value: 'class'
  },
  {
    label: 'Student',
    value: 'student'
  },
  {
    label: 'My Groups',
    value: 'my_group'
  }
];

export default function AssignAssessment() {
  const { SCHOOL_ADMIN, BRANCH_ADMIN, TEACHER } = USER_TYPE;
  const userData = useSelector((state: any) => state?.user);
  const { branchId } = userData;
  const { schoolData, branchData } = useSelector(selectSchoolData);
  const { user } = useSelector((state: any) => state);
  const { aid, schoolName } = useParams();
  const role = user?.role?.name;
  const [searchParams, setSearchParams] = useSearchParams();
  const { isLoading, getUser } = UseGetProfile();

  const { control, handleSubmit, watch } = useForm({
    resolver: yupResolver(assignAssessmentSchema)
  });

  const navigate = useNavigate();
  const location = useLocation();
  const navState = location?.state?.navState;
  const [currentCategory, setCurrentCategory] = useState(CATEGORY_LIST[0]?.value);
  const [boxData, setBoxData] = useState<any>([]);
  const [selectedData, setSelectedData] = useState<any>([]);

  const [classArray, setClassArray] = useState<any>([]);
  const [selectedClass, setSelectedClass] = useState<any>('');

  const onCheckHandler = (e: any, value: any) => {
    if (e) {
      setSelectedData([...selectedData, value]);
    } else {
      setSelectedData(selectedData.filter((ele: string) => ele !== value));
    }
  };

  const categoryHandler = (data: string) => {
    setBoxData([]);
    setSelectedData([]);
    if (data === CATEGORY_LIST[0].value) {
      fetchClassList();
    } else if (data === CATEGORY_LIST[1].value) {
      fetchStudents();
    } else if (data === CATEGORY_LIST[2].value) {
      fetchMyGroups();
    }
    setCurrentCategory(data);
  };

  const fetchClassList = () => {
    if (role === SCHOOL_ADMIN && schoolData?.id) {
      ClassesForSchool();
    } else if (role === BRANCH_ADMIN && branchData?.school_data?.id) {
      ClassesForSchool();
    } else if (role === TEACHER && user?.user_profile_id) {
      ClassesForTeacher({
        teacher_id: user?.user_profile_id
      });
    }
  };

  const fetchStudents = () => {
    setSelectedClass('');
  };
  // ----------------------------API----------------------------------------------------
  const { isLoading: loadMyGroups, refetch: fetchMyGroups } = useGet({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/groups-list/?limit=1000&offset=0`,
    onSuccess: (response: any) => {
      const data = response?.data?.response?.results;
      const arr: any = [];
      data?.map((item: any) => {
        arr.push(
          {
            label: item?.group_name,
            value: item?.id
          }
        );
        return arr;
      });
      setBoxData(arr);
    },
    enabled: false
  });

  // Fetch Classes for School
  const { isLoading: loadClassesForSchool, refetch: ClassesForSchool } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-classes/?limit=1000&school_id=${schoolData?.id || branchData?.school_data?.id}&branch_name=${branchData?.name || ''}`,
    onSuccess: (res: any) => {
      const resp = res?.data?.response?.results;
      const body: any = [];
      resp?.map((i: any) => {
        body.push(
          {
            label: i?.name,
            value: i?.id
          }
        );
        return true;
      });
      setClassArray(body);
      setBoxData(body);
    },
    enabled: false
  });

  // Fetch Classes for Teacher
  const { isLoading: loadClassesForTeacher, mutate: ClassesForTeacher } = usePost({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-classes/teacher/assigned-class`,
    onSuccess: (resp: any) => {
      const res = resp?.data?.response;
      const formatArr = res?.map((ele: any) => ({ label: ele.name, value: ele.class_id })) || [];
      setClassArray(formatArr);
      setBoxData(formatArr);
    }
  });

  // Fetch Assigned Students
  const { isLoading: loadAssignedStudents, isRefetching: refetchStudent, refetch: fetchAssignedStudents } = useGet({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/students/assigned/?limit=1000&school_id=${schoolData?.id || branchData?.school_data?.id}&class_id=${selectedClass}${branchId ? `&branch_id=${branchId}` : ''}`,
    onSuccess: (resp: any) => {
      const res = resp?.data?.response?.results;
      const formatArr = res?.map((ele: any) => ({ label: `${ele.first_name} ${ele.last_name}`, value: ele.id })) || [];
      setBoxData(formatArr);
    },
    enabled: false
  });

  // Assigned Assessment
  const { isLoading: LoadAssement, mutate: saveAssesment } = usePost({
    baseURL: import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/assign-assessment/`,
    onSuccess: (response: any) => {
      toast('success', 'Assessment assigned successfully');
      // const {isLoading, getUser} = UseGetProfile();
      getUser();
      if (!isLoading) {
        setTimeout(() => {
          const schoolNameInURL = decodeURIComponent(location.pathname.split('/')[1]);
          if (navState?.assignType === 'print-assessment') {
            navigate(`/${schoolNameInURL}/assessments/print-assessment/${aid}?name=${searchParams.get('name')}`);
          } else {
            navigate(`/${schoolNameInURL}/assessments`);
          }
        }, 1000);
      }
    },
    onError: ({ response }: any) => {
      toast('error', response?.data?.message || 'Error');
    }
  });

  // ---------------------------END API ------------------------------------------------

  const onSubmit = (values: any) => {
    if (!selectedData.length) {
      toast('error', 'Please select any Class/Student/Groups from checkbox');
      return false;
    }
    let payload: any = {
      category_name: currentCategory,
      is_printed: !!searchParams.get('type'),
      start_date: moment(values?.start_date).format('YYYY-MM-DD'),
      submission_date: moment(values?.end_date).format('YYYY-MM-DD'),
      duration: Number(values?.duration) * 60,
      assessment_id: aid,
      school_id: schoolData?.id || branchData?.school_data?.id,
      comments: values?.comments,
      created_by: userData?.user_profile_id,
      updated_by: userData?.user_profile_id
    };
    if (currentCategory === CATEGORY_LIST[0].value) {
      const filteredClasses = boxData.filter((i: any) => selectedData.includes(i?.value))?.map((ele: any) => ({ id: ele.value, class_name: ele.label }));

      payload = {
        ...payload,
        class_id: filteredClasses
      };
    } else if (currentCategory === CATEGORY_LIST[1].value) {
      const className = classArray?.find((i: any) => i?.value === selectedClass);
      payload = {
        ...payload,
        student_id: selectedData,
        class_id: [selectedClass] || '',
        class_name: className?.label || ''
      };
    } else if (currentCategory === CATEGORY_LIST[2].value) {
      payload = {
        ...payload,
        group_id: selectedData
      };
    }
    saveAssesment(payload);
    return false;
  };

  useEffect(() => {
    if (selectedClass) {
      fetchAssignedStudents();
    }
  }, [selectedClass]);

  useEffect(() => {
    if (branchData?.school_data?.id || schoolData?.id) {
      categoryHandler(currentCategory);
    }
  }, [branchData?.id, schoolData?.id]);

  return (
    <RouteLayout
      navBack={true}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="h-max py-4">
          <PageTitle title={`${searchParams.get('name') || 'Test'}`} />
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex gap-x-4">
            <Dropdown
              title="Choose Category"
              value={currentCategory}
              padding={true}
              dataArray={CATEGORY_LIST}
              onChangeHandler={categoryHandler}
            />
          </div>
          <div className="flex gap-x-4">
            {
            currentCategory === CATEGORY_LIST[1].value
              ? (
                <Dropdown
                  displayEmpty={true}
                  title="Select Class"
                  padding={true}
                  value={selectedClass}
                  dataArray={classArray || []}
                  onChangeHandler={(data) => {
                    setSelectedData([]);
                    setSelectedClass(data);
                  }}
                />
              )
              : null
          }
          </div>
          <div className="flex gap-x-4">
            <DatePicker
              control={control}
              name="start_date"
              label="Start Date"
              sxClass={
                {
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  borderColor: 'transparent',
                  outline: 'none'
                }
              }
              padding={true}
              disableOld={true}
              disableFuture={watch('end_date')}
              required={true}
            />
            <DatePicker
              control={control}
              name="end_date"
              padding={true}
              label="End Date"
              disablePast={watch('start_date')}
              disableOld={watch('start_date')}
              sxClass={
                {
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  borderColor: 'transparent',
                  outline: 'none'
                }
              }
            />
          </div>
          <div className="flex flex-col">
            <Input padding={true} control={control} name="duration" label="Set Duration (Mins)" />
          </div>
        </div>
        <div className="h-full overflow-hidden flex flex-col border border-accent rounded-md mt-4 space-y-4 p-4 bg-white">
          <div className="flex flex-col gap-2">
            <p className="text-sm">
              {`Select ${capEveryFirstLetter(currentCategory)}`}
              {' '}
              {
                currentCategory === CATEGORY_LIST[1].value
                  ? (
                    <p>
                      <em>
                        <b>Note:</b>
                        {' '}
                        To select Students, first select any class from the above dropdown
                      </em>
                    </p>
                  )
                  : ''
              }
            </p>
            <div className="h-62 overflow-auto border border-linegray rounded-md pl-6 pr-2 py-3 flex flex-wrap gap-2">
              {
                loadClassesForTeacher || loadClassesForSchool || loadMyGroups || loadAssignedStudents || refetchStudent
                  ? (<Loader size={20} />)
                  : (

                    boxData.length
                      ? (
                        boxData?.map((item: any) => {
                          const checked = selectedData.includes(item?.value);
                          return (
                            <FormControlLabel
                              label={item.label}
                              className="w-60 h-fit hover:bg-gray-100 pr-3 rounded-md"
                              key={item.label}
                              control={(
                                <Checkbox
                                  checked={checked}
                                  onChange={(data: any) => onCheckHandler(data?.target?.checked, item?.value)}
                                />
                              )}
                            />
                          );
                        })
                      )
                      : <em>No Data</em>
                  )
              }
            </div>
          </div>
          <div className="flex-1 overflow-auto flex flex-col gap-2">
            <p className="text-sm">Comments</p>
            <TextArea
              customClass="bg-white outline-none"
              control={control}
              name="comments"
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button loading={LoadAssement}>Assign Assessments</Button>
          </div>
        </div>
      </form>
    </RouteLayout>
  );
}
