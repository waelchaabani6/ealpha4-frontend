import RouteLayout from '@layout/routeLayout';
import Input from '@shared/form/Input';
// import Select from '@component/dropdown/select';
import Select from '@shared/form/Select';
import PageTitle from '@shared/pageTitle';
import Checkbox from '@component/checkbox';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { USER_TYPE } from '@constants/constants';
import { useDebounce } from 'react-use';
import Button from '@component/button/button';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import { ReactComponent as Group } from '@images/Group.svg';
import { useForm } from 'react-hook-form';
import { CustomInput } from '@component/input';
import toast from '@shared/toast';
import { FormControlLabel } from '@mui/material';
import Loader from '@shared/loader';
import DebounceInput from '@component/input/DebounceInput';
import { yupResolver } from '@hookform/resolvers/yup';
import Dropdown from '@component/dropdown/Dropdown';
import { sortData, userRole } from '@utility/utility';
import { useGet, usePost } from '@shared/api/useApi';
import { useSelector } from 'react-redux';
import { selectSchoolData } from '@shared/store/schoolSlice';
import { selectUser } from '@shared/store/userSlice';
import { schoolManagePermission } from './schema';

export default function SchoolAssignPermission() {
  const userData = useSelector((state: any) => state?.user);
  const USER_ROLE = userData?.role?.name;
  const { schoolData, branchData } = useSelector(selectSchoolData);
  const { SCHOOL_ADMIN, BRANCH_ADMIN, TEACHER } = USER_TYPE;

  const SELECT = {
    label: 'Select',
    value: 'Select',
    id: null
  };

  const assignedToArr = [
    { label: 'Class', value: 'class' },
    { label: 'Students', value: 'students' },
    { label: 'Teachers', value: 'teachers' }
  ];
  const arr1 = [
    ...assignedToArr,
    { label: 'Branch Admin', value: 'branch_admin' }
  ];

  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [dialogOpen, setdialogOpen] = useState<boolean>(false);
  const [dialogErrorMassage, setdialogErrorMassage] = useState<string>('');
  const { schoolId } = useSelector(selectUser);
  const [displayCheckboxData, setDisplayCheckboxData] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<any>(`${branchData?.name || 'Select'}`);
  const [courseList, setCourseList] = useState<any>({});
  const [debouncedValue, setDebouncedValue] = useState<string>('');
  const [searchString, setSearchString] = useState('');
  const [branchArray, setBranchArray] = useState<any>([SELECT]);
  const [AssignToOptionsArray, setAssignToOptionsArray] = useState<any[]>(assignedToArr);
  const [showbranch, setShowBranch] = useState<any>(false);
  const [showList, setShowList] = useState<any>(false);
  const [coursename, setCourseName] = useState<any>('');
  const {
    watch,
    unregister,
    setValue,
    setError,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<any>({
    resolver: yupResolver(schoolManagePermission),
    mode: 'all'
  });

  useDebounce(
    () => {
      setDebouncedValue(watch('code_name'));
    },
    1000,
    [watch('code_name')]
  );

  const onCheckboxSelect = useCallback((value: number) => {
    if (selected.includes(value)) {
      const tempSelected = [...selected];
      const eleIndex = tempSelected.indexOf(value);
      if (eleIndex > -1) {
        tempSelected.splice(eleIndex, 1);
        setSelectAll(false);
      }
      setValue('users_id', [...tempSelected]);
      setSelected([...tempSelected]);
    } else {
      setValue('users_id', [...selected, value]);
      setSelected([...selected, value]);
    }
  }, [watch('users_id')]);

  useEffect(() => {
  }, [watch('users_id')]);

  const { isLoading: branchListLoading, data: branchList } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-branches/branch-list/?school_id=${schoolId}`,
    enabled: !!schoolId,
    onSuccess: (res: any) => {
      const resp = res?.data?.response;
      const body: any = [];
      if (resp?.length > 0) {
        resp?.map((i: any) => {
          body.push(
            {
              label: i?.name,
              value: i?.name,
              id: i?.id
            }
          );
          body.sort(sortData);
          return true;
        });
        setBranchArray([SELECT, ...body]);
        setShowBranch(true);
      } else {
        setShowBranch(false);
      }
    },
    onError: () => { }
  });

  const { isLoading: courseDetailListLoading, data: courseDetailList } = useGet({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/course-code/details/?code_name=${debouncedValue}`,
    enabled: !!debouncedValue,
    onSuccess: (resp: any) => {
      const respData = resp?.data?.response;
      setCourseList(respData);
    },
    retry: false,
    onError: ({ response }: any) => {
      setCourseList({});
      setdialogOpen(true);
      setdialogErrorMassage(response?.data?.message);
      setShowList(true);
    }
  });

  const { isLoading: teachersLoading, refetch: mutateTeachers, isRefetching: teachersFetching } = useGet({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/teachers-list/?limit=1000&school_id=${schoolId}${selectedBranch !== 'Select' ? `&branch_id=${branchArray.find((obj: any) => obj?.value === selectedBranch)?.id}` : ''}${searchString ? `&search=${searchString}` : ''}`,
    onSuccess: (resp: any) => {
      const tempDisplayCheckboxData = resp?.data?.response?.results;
      setDisplayCheckboxData(tempDisplayCheckboxData);
    },
    enabled: false
  });

  const { isLoading: classLoading, refetch: mutateClass, isRefetching: classFetching } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-classes/?limit=1000&school_id=${schoolId}${selectedBranch !== 'Select' ? `&branch_name=${selectedBranch}` : ''}${searchString ? `&search=${searchString}` : ''}`,
    onSuccess: (resp: any) => {
      const tempDisplayCheckboxData = resp?.data?.response?.results;
      setDisplayCheckboxData(tempDisplayCheckboxData);
    },
    enabled: false
  });

  const { isLoading: studentsLoading, refetch: mutatestudents, isRefetching: studentFetching } = useGet({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/students-list/?limit=1000&school_id=${schoolId}${selectedBranch !== 'Select' ? `&branch_id=${branchArray.find((obj: any) => obj?.value === selectedBranch)?.id}` : ''}${searchString ? `&search=${searchString}` : ''}`,
    onSuccess: (resp: any) => {
      const tempDisplayCheckboxData = resp?.data?.response?.results;
      setDisplayCheckboxData(tempDisplayCheckboxData);
    },
    enabled: false
  });

  const { isLoading: branchAdminLoading, refetch: mutateBranchAdmin, isRefetching: branchAdminFetching } = useGet({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/school-admins/?school_id=${schoolId}&role=4${selectedBranch !== 'Select' ? `&branch=${branchArray.find((obj: any) => obj?.value === selectedBranch)?.id}` : ''}${searchString ? `&search=${searchString}` : ''}${searchString ? `&search=${searchString}` : ''}`,
    onSuccess: (resp: any) => {
      const tempDisplayCheckboxData = resp?.data?.response?.results;
      setDisplayCheckboxData(tempDisplayCheckboxData);
    },
    enabled: false
  });

  useEffect(() => {
    if (watch('assigned_to') && watch('assigned_to') !== '') {
      if (watch('assigned_to') === 'teachers') {
        mutateTeachers();
      } else if (watch('assigned_to') === 'class') {
        mutateClass();
      } else if (watch('assigned_to') === 'students') {
        mutatestudents();
      } else if (watch('assigned_to') === 'branch_admin' && selectedBranch !== 'Select') {
        mutateBranchAdmin();
      }
    }
  }, [watch('assigned_to'), searchString, selectedBranch]);

  const { isLoading: loadingSave, mutate: assignCousreSave } = usePost({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/assign-course-permission/`,
    onSuccess: (response: any) => {
      Clear();
      toast('success', 'Assigned successfully');
    },
    onError: ({ response }: any) => {
      setdialogOpen(true);
      setdialogErrorMassage(response?.data?.message);
    }
  });

  const onSubmit = (values: any) => {
    // const tmp = {} as any;
    const branchId = branchArray.find((obj: any) => obj?.value === selectedBranch);
    let payload = {};
    if (selectedBranch === 'Select') {
      payload = {
        assign_to_role: values?.assigned_to,
        school_id: schoolId,
        course_code: courseList?.id,
        users: values?.users_id
      };
    } else {
      payload = {
        assign_to_role: values?.assigned_to,
        school_id: schoolId,
        course_code: courseList?.id,
        users: values?.users_id,
        branch_id: branchId.id
      };
    }
    assignCousreSave(payload);
  };

  const onChangeHandler = (event: any) => {
    setShowList(false);
    setCourseName(event?.target?.value);
    setValue('code_name', event?.target?.value);
  };

  const checkboxComponent = () => (
    <div className="max-h-[280px] overflow-auto border border-linegray bg-white p-5 rounded">
      <div className="flex items-center justify-between pb-2">
        <div className="text-sm font-light">
          Select
          {' '}
          {AssignToOptionsArray.find((obj) => obj?.value === watch('assigned_to'))?.label}
        </div>
      </div>
      <div className="flex justify-between mt-3 mb-4 ">
        <div className="flex">
          <FormControlLabel
            label="Select All"
            name="users_id"
            control={(
              <Checkbox
                name="users_id"
                checked={selectAll}
                onChange={() => {
                  if (selectAll === false) {
                    setSelectAll(true);
                    setValue('users_id', displayCheckboxData.map((ele) => (ele.user_id_id ? ele.user_id_id : ele.user_id ? ele.user_id : ele.id)));
                    setSelected(displayCheckboxData.map((ele) => (ele.user_id_id ? ele.user_id_id : ele.user_id ? ele.user_id : ele.id)));
                  } else {
                    setSelectAll(false);
                    setValue('users_id', []);
                    setSelected([]);
                  }
                }}
              />
              )}
          />
        </div>
        <div className="flex">
          <DebounceInput
            onChange={(e) => setSearchString(e)}
            loading={teachersLoading || classLoading || studentsLoading}
          />
        </div>
      </div>
      {
        displayCheckboxData.length > 0
          ? (
            <div className="grid grid-cols-2 gap-3 h-max overflow-auto">
              {
                  displayCheckboxData?.map((ele: any, i: any) => {
                    const checked = selected.includes(ele.user_id_id ? ele.user_id_id : ele.user_id ? ele.user_id : ele.id);
                    return (
                      <div className="flex items-center w-[50%]" key={ele?.id}>
                        <FormControlLabel
                          label={watch('assigned_to') === 'class' && watch('assigned_to') ? `${ele.name}` : watch('assigned_to') === 'branch_admin' ? `${ele.user_name}` : `${ele.username}`}
                          key={i}
                          name="users_id"
                          control={(
                            <Checkbox
                              name="users_id"
                              checked={checked}
                              size="small"
                              onChange={() => onCheckboxSelect(ele.user_id_id ? ele.user_id_id : ele.user_id ? ele.user_id : ele.id)}
                            />
                            )}
                        />
                      </div>
                    );
                  })
              }
            </div>) : (
              <span>No user found</span>
          )
      }
    </div>
  );
  const CourseArray = courseDetailList?.data?.response?.courses;

  useEffect(() => {
    if (selectedBranch !== 'Select') {
      setAssignToOptionsArray(arr1);
    } else {
      setAssignToOptionsArray(assignedToArr);
      setDisplayCheckboxData([]);
    }
  }, [selectedBranch]);

  const SortedAssignArr = AssignToOptionsArray?.sort(sortData);

  const Clear = () => {
    setSelectedBranch('Select');
    setSearchString('');
    setCourseName('');
    setValue('assigned_to', []);
    setShowList(false);
    setSelectAll(false);
    setSelected([]);
    setValue('code_name', '');
    setCourseList({});
  };

  return (
    <RouteLayout navBack={true}>
      <br />
      <PageTitle title="Assign Course Permission" />
      <div className="w-full">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {(userData && USER_ROLE === USER_TYPE.BRANCH_ADMIN) ? (
            <div className="w-max">
              <CustomInput
                name="Branch Name"
                label="Branch Name"
                size="small"
                value={branchData?.name || ''}
                disabled={true}
              />
            </div>
          ) : (
            showbranch ? (
              <Dropdown
                displayEmpty={false}
                title="Select Branch"
                value={selectedBranch}
                dataArray={branchArray}
                onChangeHandler={(e: any) => setSelectedBranch(e)}
                loading={branchListLoading}
                disabled={!!(USER_ROLE === BRANCH_ADMIN)}
              />) : (
                <>
                  <div className="w-max">
                    <CustomInput label="School Name" size="small" value={schoolData?.school_name} disabled={true} />
                  </div>
                </>
            )
          )}
          <div className="w-[130px]">
            <CustomInput
              name="code_name"
              label="Course Code"
              size="small"
              value={coursename}
              sx={{
                background: 'var(--white)'
              }}
              onChange={onChangeHandler}
            />
          </div>
          <div className="w-[130px]">
            <CustomInput label="Created Date" size="small" value={'start_date' in courseList ? courseList?.start_date : ''} disabled={true} />
          </div>
          <div className="w-[130px]">
            <CustomInput label="Expiry Date" size="small" value={'end_date' in courseList ? courseList?.end_date : ''} disabled={true} />
          </div>
          <div className="w-[180px]">
            <CustomInput label="Number of License Created" size="small" value={'license_count' in courseList ? courseList?.license_count : ''} disabled={true} />
          </div>
          <div className="w-[180px]">
            <CustomInput label="Number of License Pending" size="small" value={'remaining_license' in courseList ? courseList?.remaining_license : ''} disabled={true} />
          </div>
          <div className="w-[130px]">
            <CustomInput label="Created By" size="small" value={'generated_by' in courseList ? courseList?.generated_by : ''} disabled={true} />
          </div>
          <div className="w-[130px]">
            <CustomInput label="Status" size="small" value={'status' in courseList ? courseList?.status : ''} disabled={true} />
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          <div className="mt-5 w-full h-max border border-accent
          bg-white rounded-md p-5 overflow-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded bg-[#F7F7F7] p-5 border border-linegray">
                <div className="flex flex-col">
                  <Select
                    required={true}
                    control={control}
                    loading={branchListLoading}
                    label="Assigned To"
                    name="assigned_to"
                    dataArray={SortedAssignArr}
                    onChange={(e: any) => {
                      setValue('assigned_to', e.target.value);
                      setDisplayCheckboxData([]);
                      setValue('users_id', []);
                      setSelected([]); setSelectAll(false);
                      setSearchString('');
                    }}
                    displayEmpty={true}
                  />
                </div>
                <hr className="bg-linegray my-3" />
                {
                  !searchString && ((teachersLoading || teachersFetching) || (classLoading || classFetching) || (studentsLoading || studentFetching) || (branchAdminLoading || branchAdminFetching))
                    ? (
                      <div className="h-32 relative">
                        <Loader />
                      </div>
                    )
                    : checkboxComponent()
                }
                {errors.users_id && (
                  <span className="text-red-600 font-normal text-xs">Please select a user</span>
                )}
              </div>
              <div className="rounded bg-[#F7F7F7] p-5 border border-linegray">
                <div className="h-[350px] border border-linegray bg-white p-5 rounded overflow-auto">
                  <div>
                    <p className="font-semibold pb-2">Course Detail List</p>
                    <ol className="list-decimal pl-4 font-normal">
                      {
                        CourseArray?.length > 0 ? (
                          <>
                            {
                      courseDetailList?.data?.response?.courses?.map((ele: any) => (
                        <>
                          <li>
                            <div>{ele?.name}</div>
                            <div>
                              ISBN Number:
                              {' '}
                              {ele?.isbn_number}
                            </div>
                          </li>
                        </>)
                      )
                    }
                          </>
                        )
                          : (
                            <>
                              {
                              showList && (
                                <> No Result Found</>
                              )

                            }
                              <div className="mt-5">
                                {
                                  courseDetailListLoading
                                    && (
                                      <div className="h-32 relative">
                                        <Loader />
                                      </div>
                                    )
                                }
                              </div>

                            </>
                          )
                      }

                    </ol>
                  </div>
                </div>
              </div>
            </div>
            <div className="float-right pt-4">
              <Button className="float-right" loading={loadingSave}>Assign</Button>
            </div>
          </div>
        </form>
      </div>
      <CustomizedDialogs
        open={dialogOpen}
        setOpen={() => setdialogOpen(false)}
        title="Assign Course Permission"
      >
        <div className="grid place-items-center h-[250px]">
          <div>
            <div className="flex flex-col justify-center items-center pb-4">
              <Group />
              <span className="text-red-500 font-medium">Assign Permission Error</span>
            </div>
            <p className="text-center px-8">
              {dialogErrorMassage}
            </p>
          </div>
        </div>
        <div className="flex justify-end py-6">
          <Button onClick={() => setdialogOpen(false)}>Ok</Button>
        </div>
      </CustomizedDialogs>
    </RouteLayout>
  );
}
