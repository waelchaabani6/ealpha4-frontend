/* eslint-disable operator-linebreak */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-confusing-arrow */
/* eslint-disable indent */
import RouteLayout from '@layout/routeLayout';
import Input from '@shared/form/Input';
import Button from '@component/button/button';
import Checkbox from '@component/checkbox';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import { yupResolver } from '@hookform/resolvers/yup';
import { ReactComponent as Group } from '@images/Group.svg';
import { FormControlLabel } from '@mui/material';
import { useGet, usePost } from '@shared/api/useApi';
import Select from '@shared/form/Select';
import Loader from '@shared/loader';
import PageTitle from '@shared/pageTitle';
import toast from '@shared/toast';
import { userRole } from '@utility/utility';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDebounce } from 'react-use';
import { managePermission } from './schema';

export default function AssignPermission() {
  const commanArr = [
    { label: 'Teachers', value: 'teachers' },
    { label: 'Students', value: 'students' },
    { label: 'Class', value: 'class' },
  ];
  const arr1 = [...commanArr, { label: 'School Admin', value: 'school_admin' }];
  const arr2 = [...commanArr, { label: 'Branch Admin', value: 'branch_admin' }];
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [dialogOpen, setdialogOpen] = useState<boolean>(false);
  const [dialogErrorMassage, setdialogErrorMassage] = useState<string>('');
  const [displayCheckboxData, setDisplayCheckboxData] = useState<any[]>([]);
  const [debouncedValue, setDebouncedValue] = useState<string>('');
  const [courseList, setCourseList] = useState<any>({});
  const [AssignToOptionsArray, setAssignToOptionsArray] =
    useState<any[]>(commanArr);

  const navigate = useNavigate();

  const location = useLocation();

  const {
    watch,
    unregister,
    setValue,
    setError,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(managePermission),
    mode: 'all',
  });

  useDebounce(
    () => {
      setDebouncedValue(watch('code_name'));
    },
    1000,
    [watch('code_name')]
  );

  const onCheckboxSelect = useCallback(
    (value: number) => {
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
    },
    [watch('users_id')]
  );

  useEffect(() => {}, [watch('users_id')]);

  const { isLoading: branchListLoading, data: branchList } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-branches/branch-list/?school_id=${watch('school_id')}`,
    enabled: !!watch('school_id'),
  });
  const branchListArray =
    branchList?.data?.response?.map((i: any) => ({
      label: i?.name,
      value: i?.id,
      id: i?.id,
    })) || [];
  const { isLoading: schoolListLoading, data: schoolList } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: 'schools-service/schools/get-schools/?limit=1000&ordering=name',
  });
  const {
    isLoading: courseDetailListLoading,
    isRefetching: refetchCourse,
    data: courseDetailList,
  } = useGet({
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
    },
  });

  const {
    isLoading: assignToLoading,
    isRefetching: fetchAssignTo,
    refetch: mutateassignTo,
  } = useGet({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/assign-to/?user=${watch('assigned_to')}&school_id=${watch('school_id')}${watch('branch_id') ? `&branch_id=${watch('branch_id')}` : ''}`,
    onSuccess: (resp: any) => {
      const tempDisplayCheckboxData = resp?.data?.response;
      setDisplayCheckboxData(tempDisplayCheckboxData);
    },
    enabled: false,
  });

  const { isRefetching: fetchAssignToClass, refetch: mutateClass } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-classes/?limit=1000&school_id=${watch('school_id')}${watch('branch_name') ? `&branch_name=${watch('branch_name')}` : ''}`,
    onSuccess: (resp: any) => {
      const tempDisplayCheckboxData = resp?.data?.response?.results;
      setDisplayCheckboxData(tempDisplayCheckboxData);
    },
    enabled: !!(watch('assigned_to') === 'class' && watch('school_id')),
  });

  const {
    isLoading: SchoolAdminLoading,
    isRefetching: refetchSchool,
    refetch: mutateSchoolAdmin,
  } = useGet({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/school-admins/?school_id=${watch('school_id')}&role=3`,
    onSuccess: (resp: any) => {
      const tempDisplayCheckboxData = resp?.data?.response?.results;
      setDisplayCheckboxData(tempDisplayCheckboxData);
    },
    enabled: false,
  });

  const {
    isLoading: BranchAdminLoading,
    isRefetching: refetchBranch,
    refetch: mutateBranchAdmin,
  } = useGet({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/school-admins/?school_id=${watch('school_id')}&role=4${watch('branch_id') ? `&branch=${watch('branch_id')}` : ''}`,
    onSuccess: (resp: any) => {
      const tempDisplayCheckboxData = resp?.data?.response?.results;
      setDisplayCheckboxData(tempDisplayCheckboxData);
    },
    enabled: false,
  });

  const { isLoading: loadingSave, mutate: assignCousreSave } = usePost({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/assign-course-permission/`,
    onSuccess: (response: any) => {
      toast('success', 'Assigned successfully');
      navigate('/publisher/assigned-course');
    },
    onError: ({ response }: any) => {
      setdialogOpen(true);
      setdialogErrorMassage(response?.data?.message);
    },
  });

  const onSubmit = (values: any) => {
    let payload = {};
    if (values?.branch_id) {
      payload = {
        assign_to_role: values?.assigned_to,
        school_id: values?.school_id,
        course_code: courseDetailList?.data?.response?.id,
        users: values?.users_id,
        branch_id: values?.branch_id,
      };
    } else {
      payload = {
        assign_to_role: values?.assigned_to,
        school_id: values?.school_id,
        course_code: courseDetailList?.data?.response?.id,
        users: values?.users_id,
      };
    }
    assignCousreSave(payload);
  };

  useEffect(() => {
    setDisplayCheckboxData([]);
    if (watch('assigned_to') && watch('school_id')) {
      if (watch('assigned_to') === 'school_admin' && !watch('branch_id')) {
        mutateSchoolAdmin();
      } else if (
        watch('assigned_to') === 'branch_admin' &&
        watch('branch_id')
      ) {
        mutateBranchAdmin();
      } else if (
        watch('assigned_to') === 'teachers' ||
        watch('assigned_to') === 'students' ||
        watch('assigned_to') === 'teachers_and_students'
      ) {
        mutateassignTo();
      }
    }
  }, [watch('assigned_to'), watch('school_id'), watch('branch_id')]);

  const onChangeHandler = (event: any) => {
    setValue('code_name', event?.target?.value);
  };

  const checkboxComponent = () => (
    <div className="max-h-[400px] overflow-auto border border-linegray bg-white p-5 rounded">
      {BranchAdminLoading ||
      SchoolAdminLoading ||
      assignToLoading ||
      fetchAssignTo ||
      refetchSchool ||
      refetchBranch ? (
        <Loader size={20} />
      ) : (
        <>
          <div className="flex items-center justify-between pb-2">
            <div className="text-sm font-light">
              Select{' '}
              {
                AssignToOptionsArray.find(
                  (obj) => obj?.value === watch('assigned_to')
                )?.label
              }
            </div>
          </div>
          {watch('assigned_to') && displayCheckboxData.length > 0 ? (
            <>
              <div className="flex justify-between mt-3 mb-4 ">
                <div className="flex">
                  <FormControlLabel
                    label="Select All"
                    name="users_id"
                    control={
                      <Checkbox
                        name="users_id"
                        checked={selectAll}
                        onChange={() => {
                          if (selectAll === false) {
                            setSelectAll(true);
                            setValue(
                              'users_id',
                              displayCheckboxData.map((ele) =>
                                ele.user_id_id ? ele.user_id_id : ele.id
                              )
                            );
                            setSelected(
                              displayCheckboxData.map((ele) =>
                                ele.user_id_id ? ele.user_id_id : ele.id
                              )
                            );
                          } else {
                            setSelectAll(false);
                            setValue('users_id', []);
                            setSelected([]);
                          }
                        }}
                      />
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 h-max overflow-auto">
                {displayCheckboxData?.map((ele: any, i: any) => {
                  const checked = selected.includes(
                    ele?.user_id_id ? ele?.user_id_id : ele?.id
                  );
                  return (
                    <div className="flex items-center w-[50%]" key={ele?.id}>
                      <FormControlLabel
                        label={
                          watch('assigned_to') === 'class'
                            ? `${ele.name}`
                            : watch('assigned_to') === 'school_admin'
                              ? `${ele.user_name}`
                              : watch('assigned_to') === 'branch_admin'
                                ? `${ele.user_name}`
                                : `${ele.username}`
                        }
                        key={i}
                        name="users_id"
                        control={
                          <Checkbox
                            name="users_id"
                            checked={checked}
                            size="small"
                            onChange={() =>
                              onCheckboxSelect(
                                ele?.user_id_id ? ele?.user_id_id : ele?.id
                              )
                            }
                          />
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <span>No user found</span>
          )}
        </>
      )}
    </div>
  );

  useEffect(() => {
    setValue('assigned_to', '');
    if (watch('school_id') && watch('branch_id')) {
      setAssignToOptionsArray(arr2);
    } else if (watch('school_id') && !watch('branch_id')) {
      setAssignToOptionsArray(arr1);
    }
  }, [watch('branch_id'), watch('school_id')]);

  useEffect(() => {
    setValue('branch_name', '');
    setValue('branch_id', '');
  }, [watch('school_id')]);

  useEffect(() => {
    if (location.state) {
      setValue('school_id', location.state.id);
    }
  }, []);

  return (
    <RouteLayout navBack={true}>
      <br />
      <PageTitle title="Assign Course Permission" />
      <div className="mt-5">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className=" w-full h-max border border-accent
       bg-white rounded-md p-5 overflow-auto grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="rounded bg-[#F7F7F7] p-5 border border-linegray">
            <div className="flex flex-col space-y-4">
              <div>
                <Select
                  required={true}
                  control={control}
                  loading={schoolListLoading}
                  label="Select School"
                  name="school_id"
                  dataArray={schoolList?.data?.response?.results?.map(
                    (ele: any) => ({ label: ele.name, value: ele.id })
                  )}
                  displayEmpty={true}
                />
              </div>
              <Input
                control={control}
                name="code_name"
                label="Course Code Name"
                onChange={onChangeHandler}
                required={true}
              />
            </div>
            <br />
            <br />
            <br />
            <br />

            <div className="h-[400px] border border-linegray bg-white p-5 rounded overflow-auto">
              {courseDetailListLoading || refetchCourse ? (
                <Loader />
              ) : Object.keys(courseList).length ? (
                <>
                  <div>
                    <p className="font-semibold pb-2">Course Detail List</p>
                    <ol className="list-decimal pl-4 font-normal">
                      {courseDetailList?.data?.response?.courses?.map(
                        (ele: any) => (
                          <li>
                            <div>{ele.name}</div>
                            <div>ISBN Number: {ele?.isbn_number}</div>
                          </li>
                        )
                      )}
                    </ol>
                  </div>
                  <br />
                  <br />
                  <div>
                    <p className="font-semibold pb-2">Course Details</p>
                    <p>
                      Duration From:{' '}
                      {'start_date' in courseList ? courseList?.start_date : ''}{' '}
                      : {'end_date' in courseList ? courseList?.end_date : ''}
                    </p>
                    <p>
                      Number of License:{' '}
                      {'license_count' in courseList
                        ? courseList?.license_count
                        : ''}
                    </p>
                    <p>
                      Number of License Used:{' '}
                      {'used_license_count' in courseList
                        ? courseList?.used_license_count
                        : ''}
                    </p>
                    <p>
                      Number of License Remaining:{' '}
                      {'remaining_license' in courseList
                        ? courseList?.remaining_license
                        : ''}
                    </p>
                    <p>
                      Status: {'status' in courseList ? courseList?.status : ''}
                    </p>
                  </div>
                </>
              ) : (
                <i>{`${dialogErrorMassage || 'No Course Found'}`}</i>
              )}
            </div>
          </div>
          <div className="rounded bg-[#F7F7F7] p-5 border border-linegray">
            <div className="flex flex-col space-y-4">
              {watch('school_id') ? (
                <div>
                  <Select
                    // required={true}
                    control={control}
                    loading={branchListLoading}
                    label="Select Branch"
                    name="branch_id"
                    dataArray={branchListArray}
                    displayEmpty={true}
                    disablePlaceholderValue={false}
                    onChange={(e: any) => {
                      setValue('branch_id', e?.target?.value);
                      setValue(
                        'branch_name',
                        branchListArray.find(
                          (ele: { value: number }) =>
                            ele.value === e?.target?.value
                        )?.label
                      );
                    }}
                  />
                </div>
              ) : null}
              <div>
                <Select
                  required={true}
                  control={control}
                  label="Assigned To"
                  name="assigned_to"
                  dataArray={AssignToOptionsArray}
                  onChange={(e: any) => {
                    setDisplayCheckboxData([]);
                    setValue('users_id', []);
                    setSelected([]);
                    setSelectAll(false);
                    setValue('assigned_to', e.target.value);
                  }}
                  displayEmpty={true}
                />
              </div>
            </div>
            <br />
            <br />
            <br />
            <br />
            {assignToLoading || SchoolAdminLoading || BranchAdminLoading ? (
              <div className="h-32 relative">
                <Loader />
              </div>
            ) : (
              checkboxComponent()
            )}
            {errors.users_id && (
              <span className="text-red-600 font-normal text-xs">
                Please select a user
              </span>
            )}
            <div className="float-right space-x-5 pt-4">
              <Button loading={loadingSave}>Assign</Button>
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
              <span className="text-red-500 font-medium">
                Assign Permission Error
              </span>
            </div>
            <p className="text-center px-8">{dialogErrorMassage}</p>
          </div>
        </div>
        <div className="flex justify-end py-6">
          <Button onClick={() => setdialogOpen(false)}>Ok</Button>
        </div>
      </CustomizedDialogs>
    </RouteLayout>
  );
}
