import Button from '@component/button/button';
import { yupResolver } from '@hookform/resolvers/yup';
import RouteLayout from '@layout/routeLayout';
import DatePicker from '@shared/form/DatePicker';
import Select from '@shared/form/Select';
import PageTitle from '@shared/pageTitle';
import FileSelect from '@component/fileUpload';
import { useEffect, useMemo, useRef, useState } from 'react';
import TextEditor from '@shared/form/TextEditor';
import { useForm } from 'react-hook-form';
import { useDebounce } from 'react-use';
import { useGet, usePost } from '@shared/api/useApi';
import moment from 'moment';

import { USER_ROLE_LIST, WEEK_DAYS_LIST } from '@constants/constants';
import AutoCompleteInput from '@shared/form/autoCompleteInput';
import { AxiosError } from 'axios';
import toast from '@shared/toast';
import { incrementDateByOne, userRole } from '@utility/utility';
import { useNavigate } from 'react-router-dom';
import { selectUser } from '@shared/store/userSlice';
import { useSelector } from 'react-redux';
import Input from '@shared/form/Input';
import { selectSchoolData } from '@shared/store/schoolSlice';
import { pushNotificationSchema } from '../schema';

export default function Form(): JSX.Element {
  const fileRef = useRef();
  const navigate = useNavigate();
  const autoCompleteRef = useRef<any>(null);
  const [value, setvalue] = useState<string>('');
  const [debouncedValue, setDebouncedValue] = useState<string>('');
  const { branchId, schoolId } = useSelector(selectUser);
  const { branchData, schoolData } = useSelector(selectSchoolData);
  const {
    handleSubmit,
    control,
    setError,
    reset,
    clearErrors,
    setValue,
    watch
  } = useForm<any>({
    resolver: yupResolver(pushNotificationSchema)
  });
  useEffect(() => {
    if (branchData) {
      setvalue(branchData?.school_data?.school_name);
      setValue('school_id', branchData?.school_data?.id);
    }
    if (schoolData) {
      setvalue(schoolData?.school_name);
      setValue('school_id', schoolData?.id);
    }
  }, [branchData, schoolData]);
  const handleDescError = () => {
    const inputText = new DOMParser().parseFromString(watch('description'), 'text/xml');
    if (!inputText?.documentElement?.textContent) {
      // unregister('description');
      setError('description', { message: 'Please enter description' });
      return true;
    }
    return false;
  };

  const { isLoading: schoolListLoading, data: schoolList } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/schools/get-schools/?status=Active${debouncedValue ? `&search=${debouncedValue}` : ''}`,
    enabled: !schoolId
  });
  const { isLoading: branchListLoading, data: branchList } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-branches/branch-list/?school_id=${watch('school_id')}`,
    enabled: !!(watch('school_id') && !branchId)
  });

  const branchName = useMemo(() => {
    if (watch('branch_id')) {
      const tmp = branchList?.data?.response?.find((itm: any) => itm?.id === watch('branch_id'));
      if (tmp) {
        return tmp?.name;
      }
    }
    return null;
  }, [branchList, watch('branch_id')]);

  const { isLoading: classListLoading, data: classList } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-classes/?limit=50&school_id=${watch('school_id')}${watch('branch_id') ? `&branch_name=${branchName}` : branchData ? `&branch_name=${branchData?.name}` : ''}`,
    enabled: !!watch('school_id')
  });
  useDebounce(
    () => {
      const found = schoolList?.data?.response?.results?.find((itm: any) => itm.name === value);
      if (!found) {
        setDebouncedValue(value);
      }
    },
    500,
    [value, schoolList]
  );
  const { isLoading, mutate } = usePost({
    baseURL: import.meta.env.VITE_APP_NOTIFICATION_SERVICE_URL,
    url: 'notification-service/create-push-notification',
    onSuccess: () => {
      toast('success', 'Notification Sent');
      // reset({
      //   school_id: '',
      //   branch_id: '',
      //   roles: [],
      //   class_id: '',
      //   start_date: null,
      //   end_date: null,
      //   recurring_on: '',
      //   repeating_every: [],
      //   attached_file: '',
      //   description: ''
      // });
      // setvalue('');
      // setDebouncedValue('');
      navigate(-1);
    },
    onError: (err: any) => {
      // const tg = (err?.response?.data as any)?.errors;
      // if (tg) {
      //   Object.keys(tg).forEach((key: string) => {
      //     setError(key as any, { message: tg[key][0] });
      //   });
      // }
      toast('error', err?.response?.data?.message || err?.message);
    }
  });

  const onInputChange = (val: string | null) => {
    setvalue(val || '');
    if (val === '') {
      setValue('school_id', '');
    }
    // setError(`${name}.school_id`, { message: 'Please Select City' });
  };
  const onSelect = (val: string | null) => {
    if (val) {
      setValue('school_id', val, { shouldValidate: true });
      const name = classList?.data?.response?.results?.find((itm: any) => (+itm.id) === (+val));
      if (name) {
        setvalue(name.name);
      }
    }
  };

  const onChange = (files: FileList | File[]) => {
    if (files.length > 0) {
      setValue('attached_file', files[0]);
    }
  };
  const onSubmit = (values: any) => {
    const tmp = {} as any;
    if (!handleDescError()) {
      if (!values.branch_id) {
        delete values.branch_id;
      } else {
        values.branch_id = +values.branch_id;
      }
      if (branchId) {
        values.branch_id = branchId;
      }
      values.class_id = +values.class_id;
      values.school_id = +values.school_id;
      const documentFormData = new FormData();
      Object.keys(values).forEach((key: string) => {
        if (key === 'start_date' || key === 'end_date') {
          const val = moment(values[key]).format('YYYY-MM-DD');
          documentFormData.append(key, val);
          tmp[key] = val;
        } else if (key === 'repeating_every' || key === 'roles') {
          values[key].forEach((val: string, index: number) => {
            documentFormData.append(`${key}[${index}]`, val);
          });
        } else {
          tmp[key] = values[key];
          documentFormData.append(key, values[key]);
        }
      });
      mutate(documentFormData);
    }
  };
  const onError = (errValues: any) => {
    handleDescError();
  };

  const useRoleList = () => {
    if (userRole().isSchoolAdmin) {
      return USER_ROLE_LIST.filter((itm: any) => itm.value !== 'super-admin' && itm.value !== 'school-admin');
    }
    if (userRole().isBranchAdmin) {
      return USER_ROLE_LIST.filter((itm: any) => itm.value !== 'super-admin' && itm.value !== 'school-admin' && itm.value !== 'branch-admin');
    }
    return USER_ROLE_LIST.filter((itm: any) => itm.value !== 'super-admin');
  };

  return (
    <RouteLayout>
      <div className="flex w-full justify-between items-center pb-4 mt-4">
        <PageTitle title="Manage Push Notification" />
      </div>
      <form onSubmit={handleSubmit(onSubmit, onError)} className="mt-5 w-full overflow-auto rounded-md h-max border border-accent bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3 md:gap-x-6 p-4">
          {
            (schoolData || branchData)
              ? (
                <Input
                  label="School"
                  name="school_id"
                  control={control}
                  disabled={true}
                  value={value}
                />
              )
              : (
                <AutoCompleteInput
                  ref={autoCompleteRef}
                  control={control}
                  label="Select School"
                  name="school_id"
                  value={value}
                  dataArray={schoolList?.data?.response?.results?.map((ele: any) => ({ label: ele.name, value: ele.id }))}
                  isLoading={schoolListLoading}
                  onChange={onInputChange}
                  onSelect={onSelect}
                  onClose={(reason: any) => reason !== 'selectOption' && onInputChange('')}
                />
              )
          }
          {
            branchData
              ? (
                <Input
                  label="Branch"
                  name="branch_id"
                  control={control}
                  disabled={true}
                  value={branchData?.name}
                />
              )
              : (
                <Select
                  control={control}
                  loading={branchListLoading}
                  label="Select Branch"
                  name="branch_id"
                  displayEmpty={true}
                  dataArray={branchList?.data?.response?.map((i: any) => ({
                    label: i?.name,
                    value: i?.id
                  }))}
                />
              )
          }

          <Select
            required={true}
            control={control}
            label="Select Users"
            name="roles"
            displayEmpty={true}
            dataArray={useRoleList()}
            ismultiple={true}
            disablePlaceholderValue={true}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 md:gap-x-6 p-4">
          <Select
            required={true}
            control={control}
            label="Select Class"
            name="class_id"
            displayEmpty={true}
            dataArray={classList?.data?.response?.results?.map((itm: any) => ({ label: itm.name, value: itm.id }))}
            disablePlaceholderValue={true}
            loading={classListLoading}
          />

          <DatePicker
            control={control}
            value={watch('start_date')}
            disableOld={true}
            name="start_date"
            label="Start Date"
          />
          <DatePicker
            control={control}
            name="end_date"
            label="End Date"
            value={watch('end_date')}
            disabled={!watch('start_date')}
            disablePast={incrementDateByOne(watch('start_date'))}
          />
          <Select
            required={true}
            control={control}
            name="recurring_on"
            label="Recurring On"
            displayEmpty={true}
            disablePlaceholderValue={true}
            dataArray={[
              { value: 'daily', label: 'Daily' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'weekly', label: 'Weekly' }
            ]}
          />
          <Select
            required={true}
            control={control}
            name="repeating_every"
            label="Repeating Every"
            ismultiple={true}
            displayEmpty={true}
            disablePlaceholderValue={true}
            dataArray={WEEK_DAYS_LIST}
          />
        </div>
        <hr className="my-2" />

        <div className="w-full p-4">
          <p className="font-medium text-base pb-1">Attach your files</p>
          <FileSelect
            singleSelect={true}
            ref={fileRef}
            onChange={onChange}
            {...(watch('attached_file') && { placeholder: watch('attached_file').name })}
          />
        </div>

        <div className="p-5">
          <TextEditor
            name="description"
            label="Description"
            required={true}
            control={control}
          />
        </div>

        <div className="py-8 float-right space-x-5 px-5">
          <Button
            variant="outlined"
          >
            Preview
          </Button>
          <Button loading={isLoading} disabled={isLoading}>
            Send
          </Button>
        </div>
      </form>
    </RouteLayout>
  );
}
