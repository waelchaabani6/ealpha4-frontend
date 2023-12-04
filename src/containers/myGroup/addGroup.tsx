import RouteLayout from '@layout/routeLayout';
import PageTitle from '@shared/pageTitle';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ReactComponent as PenIcon } from '@images/pen.svg';
import Dropdown from '@component/dropdown/Dropdown';
import DebounceInput from '@component/input/DebounceInput';
import CheckBox from '@component/checkbox';
import { FormControlLabel } from '@mui/material';
import Button from '@component/button/button';
import { yupResolver } from '@hookform/resolvers/yup';
import { useGet, usePost } from '@shared/api/useApi';
import { useSelector } from 'react-redux';
import { selectSchoolData } from '@shared/store/schoolSlice';
import toast from '@shared/toast';
import { useNavigate } from 'react-router-dom';
import { selectUser } from '@shared/store/userSlice';
import { sortByName, sortData } from '@utility/utility';
import groupSchema from './schema';

export default function AddGroup() {
  const inputRef = useRef<any>();
  const [debounceInput, setdebounceInput] = useState<string>('');
  const [searchStudent, setsearchStudent] = useState<string>('');
  const { branchData } = useSelector(selectSchoolData);
  const { schoolId, branchId } = useSelector(selectUser);
  const navigate = useNavigate();
  const { watch, handleSubmit, control, setError, register, setValue, clearErrors, formState: { errors } } = useForm({
    resolver: yupResolver(groupSchema),
    mode: 'all',
    defaultValues: {
      group_name: '',
      group_members: []
    }
  }) as any;

  useEffect(() => {
    setsearchStudent(debounceInput);
  }, [debounceInput]);

  const { isLoading: studentListLoading, data: studentList } = useGet({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/student-list-class/?school_id=${schoolId}&limit=200${branchId ? `&branch_id=${branchId}` : ''}${watch('class_id') ? `&class_id=${watch('class_id')}` : ''} ${searchStudent ? `&search=${searchStudent}` : ''}`,
    enabled: !!watch('class_id')
  });

  const { isLoading: schoolListLoading, data: schoolList } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-classes/?school_id=${schoolId}&limit=200${branchData ? `&branch_name=${branchData?.name}` : ''}`
  });

  const ListingArray = schoolList?.data?.response?.results.sort(sortByName);

  const { isLoading: saveLoading, mutate: addNewGroup } = usePost({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: 'users-service/groups/add/',
    onSuccess: () => {
      toast('success', 'Group added');
      navigate(-1);
    },
    onError: (err: any) => {
      if (err?.response?.data?.errors?.group_name) {
        setError('group_name', { message: err?.response?.data?.errors?.group_name[0] });
      }
      toast('error', err?.response?.data?.message || err?.message);
    }
  });

  const onSubmit = (values: any) => {
    values.school_id = schoolId;
    values.class_id = +values.class_id;
    if (branchId) {
      values.branch_id = branchId;
    }
    addNewGroup(values);
  };

  useEffect(() => {
    setsearchStudent('');
    inputRef?.current?.reset();
  }, [watch('class_id')]);

  const renderCheckbox = (item: any) => {
    const isChecked = watch('group_members').indexOf(item.id) > -1;
    const onChangeHandler = () => {
      const tmp = isChecked ? watch('group_members').filter((itemId: number) => itemId !== item.id) : [...watch('group_members'), item.id];
      setValue('group_members', tmp);
      if (tmp?.length > 0) {
        clearErrors('group_members');
      } else {
        setError('group_members', { message: 'Please Select' });
      }
    };
    return (
      <FormControlLabel
        className="w-max h-fit hover:bg-gray-100 pr-3 rounded-md"
        key={item.id}
        control={(
          <CheckBox
            checked={isChecked}
            onChange={onChangeHandler}
          />
        )}
        label={`${item.first_name} ${item.last_name}`}
      />
    );
  };
  const isStudents = useMemo(() => studentList?.data?.response?.length > 0, [studentList]);
  return (
    <RouteLayout>
      <div className="py-4">
        <PageTitle title="Add New Group" />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="h-full overflow-hidden flex flex-col">
        <div className="py-4 flex items-center gap-x-4">
          <div className="flex flex-col">
            <p className="mb-3 text-sm">Group Name</p>
            <div className={`h-[36px] w-[213px] rounded-[4px] px-2 flex items-center justify-between gap-x-1 bg-white ${errors?.group_name ? 'border border-red-500' : ''}`}>
              <input type="text" {...register('group_name')} className="w-full outline-none" />
              <PenIcon className="scale-110" />
            </div>
            {
              errors?.group_name && (
                <span className="text-xs text-red-500">{errors?.group_name.message}</span>
              )
            }
          </div>
          <Controller
            control={control}
            name="class_id"
            render={({ field: { onChange, value }, formState }) => (
              <div className="flex flex-col">
                <Dropdown
                  loading={schoolListLoading}
                  title="Class"
                  value={value}
                  displayEmpty={true}
                  dataArray={ListingArray?.map((ele: any) => ({ label: ele.name, value: ele.id }))}
                  onChangeHandler={(student: string) => { setValue('group_members', []); onChange(student); }}
                  sxClass={formState.errors?.class_id ? {
                    border: '1px solid red'
                  } : {}}
                />
                {
                  formState.errors?.class_id && (
                    <p className="text-xs text-red-500">{formState.errors?.class_id?.message as any}</p>
                  )
                }
              </div>
            )}
          />
        </div>
        <div className="flex-1 flex flex-col gap-y-4 justify-between overflow-hidden p-6 bg-white rounded-md border border-accent">
          <div className={`relative h-[279px] flex flex-col gap-y-2 p-4 bg-sandgray ${errors?.group_members ? 'border border-red-500' : ''}`}>
            <div className="w-max">
              <DebounceInput ref={inputRef} loading={studentListLoading} onChange={(value: string) => setdebounceInput(value)} />
            </div>
            <div className="w-full md:w-[50%] overflow-auto">
              {
                !studentListLoading && watch('class_id') && !isStudents && (
                  <p>No student is assigned to this class</p>
                )
              }
              <div className="flex-1 mt-4 grid grid-cols-1 md:grid-cols-2">
                {
                  studentList?.data?.response?.map(renderCheckbox)
                }
              </div>
              {
                errors?.group_members && (
                  <p className="absolute -bottom-5 left-0 text-red-500 text-xs">{errors?.group_members.message}</p>
                )
              }
            </div>
          </div>
          <div className="flex items-center justify-end">
            <Button disabled={!isStudents} loading={saveLoading}>Add</Button>
          </div>
        </div>
      </form>
    </RouteLayout>
  );
}
