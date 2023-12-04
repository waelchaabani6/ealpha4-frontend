import Button from '@component/button/button';
import { yupResolver } from '@hookform/resolvers/yup';
import RouteLayout from '@layout/routeLayout';
import DatePicker from '@shared/form/DatePicker';
import Select from '@shared/form/Select';
import PageTitle from '@shared/pageTitle';
import Input from '@shared/form/Input';
import { useForm } from 'react-hook-form';
import { ReactComponent as ImportIcon } from '@images/pageHeaderIcons/download.svg';
import TextEditor from '@shared/form/TextEditor';
import { useEffect, useMemo, useRef, useState } from 'react';
import { USER_ROLE_LIST, USER_TYPE, WEEK_DAYS_LIST } from '@constants/constants';
import { useGet, usePost } from '@shared/api/useApi';
import AutoCompleteInput from '@shared/form/autoCompleteInput';
import { incrementDateByOne, userRole } from '@utility/utility';
import moment from 'moment';
import { useDebounce } from 'react-use';
import { useNavigate } from 'react-router-dom';
import toast from '@shared/toast';
import { useSelector } from 'react-redux';
import { selectUser } from '@shared/store/userSlice';
import { selectSchoolData } from '@shared/store/schoolSlice';
import { emailPushNotificationSchema } from '../schema';

export default function Form(): JSX.Element {
  const navigate = useNavigate();
  const autoCompleteRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [value, setvalue] = useState<string>('');
  const { branchId, schoolId } = useSelector(selectUser);
  const { branchData, schoolData } = useSelector(selectSchoolData);
  const [debouncedValue, setDebouncedValue] = useState<string>('');
  const {
    watch,
    unregister,
    setValue,
    setError,
    handleSubmit,
    control,
    reset
  } = useForm<any>({
    resolver: yupResolver(emailPushNotificationSchema),
    mode: 'all'
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
  const handleMailBodyError = () => {
    const inputText = new DOMParser().parseFromString(watch('mail_body'), 'text/xml');
    if (!inputText?.documentElement?.textContent) {
      setError('mail_body', { message: 'Please enter email body' });
      return true;
    }
    return false;
  };

  const { isLoading: branchListLoading, data: branchList } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-branches/branch-list/?school_id=${watch('school_id')}`,
    enabled: !!(watch('school_id') && !branchId)
  });
  const { isLoading: schoolListLoading, data: schoolList } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/schools/get-schools/?status=Active${debouncedValue ? `&search=${debouncedValue}` : ''}`,
    enabled: !schoolId
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
    url: 'notification-service/email-notifications/',
    onSuccess: () => {
      toast('success', 'Email Sent');
      // reset({
      //   school_id: '',
      //   branch_id: '',
      //   roles: [],
      //   class_id: '',
      //   recurring_on: '',
      //   repeating_every: [],
      //   start_date: null,
      //   end_date: null,
      //   email: '',
      //   csv_file: '',
      //   mail_subject: '',
      //   mail_body: ''
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

  const onSubmit = (values: any) => {
    const tmp = {} as any;
    if (!handleMailBodyError()) {
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

  const fileInputHandler = (ev: React.ChangeEvent<HTMLInputElement>) => {
    if (ev?.target.files) {
      setValue('csv_file', ev.target.files[0]);
      setValue('email', '');
      unregister('email');
    }
  };

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

  const onError = (errValues: any) => {
    handleMailBodyError();
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
    <RouteLayout overflow={true}>
      <div className="flex w-full justify-between items-center pb-4 mt-4">
        <PageTitle title="Manage Email Push Notifications" />
      </div>
      <form onSubmit={handleSubmit(onSubmit, onError)} className="w-full overflow-auto rounded-md h-max border border-accent bg-white">
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
                  onChange={onChange}
                  onSelect={onSelect}
                  onClose={(reason: any) => reason !== 'selectOption' && onChange('')}
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
            required={true}
            value={watch('start_date')}
            disableOld={true}
            control={control}
            name="start_date"
            label="Start Date"
          />
          <DatePicker
            required={true}
            value={watch('end_date')}
            disabled={!watch('start_date')}
            disablePast={incrementDateByOne(watch('start_date'))}
            control={control}
            name="end_date"
            label="End Date"
          />
          <Select
            required={true}
            control={control}
            name="recurring_on"
            displayEmpty={true}
            label="Recurring On"
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
            displayEmpty={true}
            name="repeating_every"
            label="Repeating Every"
            ismultiple={true}
            disablePlaceholderValue={true}
            dataArray={WEEK_DAYS_LIST}
          />
        </div>
        <hr className="my-2" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 md:gap-x-6 p-4">
          <Input
            required={true}
            control={control}
            name="email"
            label="Mail to"
          />
          <div
            role="presentation"
            className="cursor-pointer self-end rounded-[4px] h-[40px] border border-accent flex justify-center items-center gap-x-4 active:bg-green-50 overflow-hidden"
            onClick={() => fileInputRef?.current?.click()}
          >
            <input
              ref={fileInputRef}
              onChange={fileInputHandler}
              onClick={(ev: any) => {
                ev.target.value = '';
              }}
              type="file"
              accept=".csv"
              className="hidden"
            />
            <div className="h-full w-full flex items-center gap-x-2 px-2 justify-between">
              <div className={`flex-1 flex ${watch('csv_file') ? 'justify-start' : 'justify-center'} items-center gap-x-4`}>
                <ImportIcon className="fill-accent" />
                <p className="text-accent font-medium text-base">Import Emails</p>
              </div>
              {
                watch('csv_file') && (
                  <p className="max-w-[100px] truncate">
                    {watch('csv_file').name}
                  </p>
                )
              }
            </div>
          </div>
          <div className="col-span-1 md:col-span-2">
            <Input
              required={true}
              control={control}
              label="Subject"
              name="mail_subject"
            />
          </div>
        </div>

        <div className="p-5">
          <TextEditor
            name="mail_body"
            label="Mail Body"
            required={true}
            control={control}
          />
        </div>

        <div className="py-8 float-right space-x-5 px-5">
          <Button
            variant="outlined"
            type="button"
            onClick={() => navigate('/notification/email-notification')}
          >
            Cancel
          </Button>
          <Button loading={isLoading} disabled={isLoading}>
            Save
          </Button>
        </div>
      </form>
    </RouteLayout>
  );
}
