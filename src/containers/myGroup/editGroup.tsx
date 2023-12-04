import RouteLayout from '@layout/routeLayout';
import PageTitle from '@shared/pageTitle';
import { ReactComponent as PenIcon } from '@images/pen.svg';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Select from '@shared/form/Select';
import Button from '@component/button/button';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import { useGet, usePatch } from '@shared/api/useApi';
import Loader from '@shared/loader';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSelector } from 'react-redux';
import { selectSchoolData } from '@shared/store/schoolSlice';
import { CircularProgress, FormControlLabel } from '@mui/material';
import CheckBox from '@component/checkbox';
import toast from '@shared/toast';
import { selectUser } from '@shared/store/userSlice';
import { CustomInput } from '@component/input';
import Input from '@shared/form/Input';
import groupSchema from './schema';

export default function EditGroup() {
  const [add, setAdd] = useState<boolean>(false);
  const [removedStudents, setRemovedStudents] = useState<number[]>([]);
  const { groupId, schoolName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [rename, setRename] = useState<any>(false);
  const { schoolId, branchId } = useSelector(selectUser);
  const { schoolData, branchData } = useSelector(selectSchoolData);
  const { watch, setError, handleSubmit, control, register, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(groupSchema),
    mode: 'all',
    defaultValues: {
      group_name: '',
      group_members: []
    }
  }) as any;
  const { data, isLoading, isSuccess } = useGet({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/group/${groupId}/`,
    cacheTime: 0
  });
  useEffect(() => {
    if (isSuccess) {
      setValue('group_name', data?.data?.response.group_name);
      setValue('class_id', data?.data?.response.class_id);
      const tmp = data?.data?.response.student_group.map((i: any) => +i.student_id);
      setValue('group_members', tmp);
      setRemovedStudents(tmp);
    }
  }, [isSuccess]);
  const { isLoading: classListLoading, data: classList } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-classes/?school_id=${schoolId}${branchData ? `&branch_name=${branchData?.name}` : ''}`
  });
  const { isLoading: studentListLoading, data: studentList } = useGet({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/student-list-class/?school_id=${schoolId}${branchId ? `&branch_id=${branchId}` : ''}${watch('class_id') ? `&class_id=${watch('class_id')}` : ''}&ordering=name`,
    enabled: !!watch('class_id')
  });

  const { isLoading: updateLoading, mutate: updateGroup } = usePatch({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/edit/${groupId}/group`,
    onSuccess: (res: any) => {
      toast('success', res.data?.message);
      navigate(`/${schoolName}/my-group`, { state: location?.state?.page ? { page: location?.state?.page } : {} });
    },
    onError: (err: any) => {
      if (err?.response?.data?.errors?.group_name) {
        setError('group_name', { message: err?.response?.data?.errors?.group_name[0] });
      }
      toast('error', err.response.data.message || err.message);
    }
  });

  const renderCheckbox1 = useCallback((item: any) => {
    const isChecked = watch('group_members').indexOf(item.id) > -1;
    const isDisabled = data?.data?.response.student_group?.findIndex((ele: any) => +ele.student_id === item.id) > -1;
    const onChangeHandler = () => setValue('group_members', isChecked ? watch('group_members').filter((itemId: number) => itemId !== item.id) : [...watch('group_members'), item.id]);
    return (
      <FormControlLabel
        className="w-full h-max hover:bg-gray-100 pr-3 rounded-md truncate"
        key={item.id}
        control={(
          <CheckBox
            // disabled={isDisabled}
            disabled={isChecked && isDisabled}
            checked={isChecked}
            onChange={onChangeHandler}
          />
        )}
        label={`${item.first_name} ${item.last_name}`}
      />
    );
  }, [watch('group_members'), studentList?.data?.response, data]);
  const removeButtonDisabled = useMemo(() => {
    const a = data?.data?.response?.student_group?.map((i: any) => +i.student_id);
    return a?.length === removedStudents?.length || removedStudents?.length < 1;
  }, [removedStudents, data]);

  const addButtonDisabled = useMemo(() => {
    const a = data?.data?.response?.student_group?.map((i: any) => +i.student_id);
    return watch('group_members')?.length < 1 || watch('group_members')?.every((stdId: number) => a?.includes(stdId));
  }, [watch('group_members'), data]);

  const renderCheckBox2 = useMemo(() => {
    const tmp = data?.data?.response?.student_group?.map((i: any) => +i.student_id);
    const tmp2 = studentList?.data?.response?.filter((ele: any) => tmp?.includes(ele.id));
    return tmp2?.map((item: any) => {
      const isChecked = !removedStudents?.includes(item.id);
      const onChangeHandler = () => {
        const exists = removedStudents.indexOf(item.id) > -1;
        setRemovedStudents((prev: number[]) => (exists ? prev.filter((i: number) => i !== item.id) : [...prev, item.id]));
      };
      return (
        <FormControlLabel
          className="w-fll h-fit hover:bg-gray-100 pr-3 rounded-md truncate"
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
    });
  }, [watch('group_members'), studentList, data, removedStudents, watch('class_id')]);
  const onSubmit = (values: any) => {
    values.school_id = schoolId;
    if (branchId) {
      values.branch_id = branchId;
    }
    values.class_id = +values.class_id;
    if (!add && !rename) {
      values.group_members = removedStudents;
    }

    updateGroup(values);
  };

  const classname = useMemo(() => classList?.data?.response?.results?.find((ele: any) => ele.id === data?.data?.response?.class_id), [classList, data]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <RouteLayout navBack={true} state={location?.state} path={`/${schoolName}/my-group`}>
      <form onSubmit={handleSubmit(onSubmit)} className="h-max md:h-full flex flex-col md:overflow-hidden">
        <div className="py-4">
          <PageTitle title="Edit My Group" />
        </div>
        <div className="py-4 flex items-center gap-x-4">
          <div className="flex flex-col">
            <p className="mb-3 text-sm">Group Name</p>
            <div className={`h-[36px] w-[213px] rounded-[4px] flex items-center justify-between gap-x-1 ${errors?.group_name ? 'border border-red-500' : ''}`}>
              <input type="text" {...register('group_name')} className="w-full outline-none h-[35px] rounded-[4px] pl-1" />
              {/* <PenIcon className="scale-110" /> */}
              <IconButton
                aria-label="expand row"
                size="large"
                title="Rename"
                type="submit"
                onClick={() => setRename(true)}
                className="ml-4 bg-green-400"
              >
                <PenIcon />
              </IconButton>
            </div>

            {
              errors?.group_name && (
                <span className="text-xs text-red-500">{errors?.group_name.message}</span>
              )
            }
          </div>
        </div>
        <div className="flex-1 overflow-hidden border border-accent rounded-md bg-white p-6 grid grid-cols-1 gap-y-6 md:grid-cols-2 md:gap-x-6">
          <div className="h-max md:h-full flex flex-col gap-y-2 bg-sandgray border border-linegray p-4 overflow-auto">
            <div className="h-max">
              <PageTitle title="Add Students" />
            </div>
            {
              classname && (
                <Select
                  control={control}
                  label="Class"
                  dataArray={classList?.data?.response?.results?.map((ele: any) => ({ label: ele.name, value: ele.id }))}
                  name="class_id"
                />
              )
            }
            <div className={`grid ${studentListLoading ? 'w-full h-full place-items-center' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} `}>
              {
                studentListLoading && (
                  <CircularProgress color="success" size={24} />
                )
              }
              {
                studentList && studentList?.data?.response?.length < 1 ? <p>No Data</p> : studentList?.data?.response?.map(renderCheckbox1)
              }
            </div>
            <div className="flex justify-end">
              <Button
                loading={updateLoading && add}
                disabled={studentListLoading || addButtonDisabled}
                onClick={() => setAdd(true)}
              >
                Add
              </Button>
            </div>
          </div>
          {
            watch('class_id') && (
              <div className="h-max md:h-full flex flex-col gap-y-2 bg-sandgray border border-linegray p-4 overflow-auto">
                <div className="h-max">
                  <PageTitle title="Remove Students" />
                  {
                    removedStudents?.length < 1 && (
                      <p className="py-2 text-xs text-red-500">Group cannot be empty</p>
                    )
                  }
                </div>
                <div className={`grid ${studentListLoading ? 'w-full place-items-center' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} `}>
                  {
                    studentListLoading ? (
                      <CircularProgress color="success" size={24} />
                    ) : renderCheckBox2
                  }
                </div>
                <div className="flex justify-end">
                  <Button
                    loading={updateLoading && !add}
                    disabled={studentListLoading || removeButtonDisabled}
                    onClick={() => setAdd(false)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )
          }
        </div>
      </form>
    </RouteLayout>
  );
}
