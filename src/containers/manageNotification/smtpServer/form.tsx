import Button from '@component/button/button';
import { yupResolver } from '@hookform/resolvers/yup';
import RouteLayout from '@layout/routeLayout';
import PageTitle from '@shared/pageTitle';
import Input from '@shared/form/Input';
import Checkbox from '@component/checkbox';
import { FormControlLabel } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useGet, usePost } from '@shared/api/useApi';
import { useEffect, useRef, useState } from 'react';
import { useDebounce } from 'react-use';
import AutoCompleteInput from '@shared/form/autoCompleteInput';
import { AxiosError, AxiosResponse } from 'axios';
import toast from '@shared/toast';
import { useNavigate } from 'react-router-dom';
import { selectSchoolData } from '@shared/store/schoolSlice';
import { useSelector } from 'react-redux';
import { CustomInput } from '@component/input';
import { emailServerSettingSchema } from '../schema';

export default function Form(): JSX.Element {
  const { schoolData, branchData } = useSelector(selectSchoolData);
  const autoCompleteRef = useRef<any>(null);
  const navigate = useNavigate();
  const [value, setvalue] = useState<string>('');
  const [debouncedValue, setDebouncedValue] = useState<string>('');
  const {
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    setError
  } = useForm<any>({
    resolver: yupResolver(emailServerSettingSchema),
    mode: 'all',
    defaultValues: {
      is_secure_connection: false,
      use_auth: false
    }
  });
  const { isLoading: schoolListLoading, data: schoolList } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/schools/get-schools/?status=Active${debouncedValue ? `&search=${debouncedValue}` : ''}`
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
    url: 'notification-service/create-smtp-server',
    onSuccess: () => {
      toast('success', 'Created');
      // reset({
      //   login: '',
      //   password: '',
      //   host_name: '',
      //   username: '',
      //   port: '',
      //   smtp_host_name: '',
      //   smtp_username: '',
      //   smtp_password: '',
      //   is_secure_connection: '',
      //   use_auth: '',
      //   school_id: ''
      // });
      // setvalue('');
      // setDebouncedValue('');
      navigate(-1);
    },
    onError: (err: AxiosError) => {
      const tg = (err?.response?.data as any)?.errors;
      if (tg) {
        Object.keys(tg).forEach((key: string) => {
          setError(key as any, { message: tg[key][0] });
          if (key === 'non_field_errors') {
            toast('error', tg?.non_field_errors?.[0]);
          }
        });
      }
    }
  });
  const onChange = (val: string | null) => {
    setvalue(val || '');
    if (val === '') {
      setValue('school_id', '');
    }
  };
  const onSelect = (val: string | null) => {
    if (val) {
      setValue('school_id', val, { shouldValidate: true });
      const name = schoolList?.data?.response?.results?.find((itm: any) => (+itm.id) === (+val));
      if (name) {
        setvalue(name.name);
      }
    }
  };

  const onSubmit = (values: any) => {
    mutate(values);
  };

  useEffect(() => {
    if (schoolData?.id) {
      setValue('school_id', schoolData?.id);
    } else if (branchData?.id) {
      setValue('school_id', branchData?.school_data?.id);
    }
  }, [schoolData?.id, branchData?.id]);

  return (
    <RouteLayout>
      <div className="flex w-full justify-between items-center pb-4 mt-4">
        <PageTitle title="Manage Email Server Settings" />
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-5 w-full overflow-auto rounded-md h-max border border-accent bg-white p-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3 md:gap-x-6 pb-4">
          {
            schoolData?.id || branchData?.id
              ? (
                <CustomInput
                  size="small"
                  value={schoolData?.school_name || branchData?.name || ''}
                  required={true}
                  label="Select School"
                  name="school_name"
                  disabled={true}
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
                  onChange={onChange}
                  onSelect={onSelect}
                  onClose={(reason: any) => reason !== 'selectOption' && onChange('')}
                />
              )
          }
          <Input
            required={true}
            control={control}
            label="Login"
            name="login"
          />
          <Input
            required={true}
            control={control}
            label="Password"
            name="password"
            type="password"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3 md:gap-x-6">
          <Input
            required={true}
            control={control}
            label="Host Name"
            name="host_name"
          />

          <Input
            required={true}
            control={control}
            label="Username"
            name="username"
          />
          <Input
            required={true}
            control={control}
            type="number"
            label="Port"
            name="port"
          />
          <Input
            required={true}
            control={control}
            label="SMTP Host Name"
            name="smtp_host_name"
          />
          <Input
            required={true}
            control={control}
            label="SMTP User Name"
            name="smtp_username"
          />
          <Input
            required={true}
            control={control}
            label="SMTP Password"
            name="smtp_password"
            type="password"
          />
        </div>
        <div className="flex flex-col pt-4">
          <FormControlLabel
            checked={watch('is_secure_connection')}
            onChange={(_, checked: boolean) => setValue('is_secure_connection', checked)}
            className="hover:bg-gray-100"
            control={<Checkbox size="small" />}
            label={<p className="text-sm font-semibold">Use Secure Connection</p>}
          />
          <FormControlLabel
            checked={watch('use_auth')}
            onChange={(_, checked: boolean) => setValue('use_auth', checked)}
            className="hover:bg-gray-100"
            control={<Checkbox size="small" />}
            label={<p className="text-sm font-semibold">Use Authentication</p>}
          />
        </div>
        <div className="pt-4 float-right space-x-5 px-5">
          <Button
            variant="outlined"
            type="button"
            onClick={() => navigate('/notification/smtp-server')}
          >
            Cancel
          </Button>
          <Button disabled={isLoading} loading={isLoading}>
            Save
          </Button>
        </div>
      </form>
    </RouteLayout>
  );
}
