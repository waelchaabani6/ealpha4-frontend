import { yupResolver } from '@hookform/resolvers/yup';
import RouteLayout from '@layout/routeLayout';
import Input from '@shared/form/Input';
import Select from '@shared/form/Select';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import FileSelect from '@component/fileUpload';
import Button from '@component/button/button';
import { usePost } from '@shared/api/useApi';
import toast from '@shared/toast';
import { USER_ROLE_LIST } from '@constants/constants';
import schema from './schema';

type Props = {
  close: () => void;
  refetch: any;
}

export const IntegrationType = [
  { label: 'Email', value: 'email' },
  { label: 'SMS', value: 'sms' },
  { label: 'Learning', value: 'learning' },
  { label: 'Online Resources', value: 'online resources' },
  { label: 'For Students', value: 'for students' },
  { label: 'For Teachers', value: 'for teachers' },
  { label: 'For Teachers', value: 'for teachers' },
  { label: 'Others', value: 'others' }
];

export default function CreateSubscription(props: Props) {
  const baseURL = import.meta.env.VITE_APP_MASTER_SERVICE_URL;
  const imageRef = useRef<any>();
  const {
    handleSubmit,
    control,
    setValue,
    watch,
    formState
  } = useForm({
    resolver: yupResolver(schema)
  });
  const { isLoading, mutate } = usePost({
    baseURL,
    url: 'master-service/integration/',
    onSuccess: (res: any) => {
      toast('success', res?.data?.message || 'Created');
      props.refetch();
      props.close();
    }
  });
  const onSubmit = (val: any) => {
    const payload: any = new FormData();
    Object.keys(val).forEach((key: string) => {
      if (key !== 'assigned_roles') {
        payload.append(key, val[key]);
      }
    });
    val.assigned_roles.forEach((valu: string, index: number) => {
      payload.append(`assigned_roles[${index}]`, valu);
    });
    mutate(payload);
  };
  const onChange = (files: FileList | File[]) => {
    if (files.length > 0) {
      setValue('logo_url', files[0]);
    }
  };
  return (
    <RouteLayout navBack={false} overflow={true}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
        <Input
          label="Integration Name"
          name="name"
          control={control}
        />
        <Select
          label="Integration Type"
          name="integration_type"
          control={control}
          dataArray={IntegrationType}
        />
        <Select
          label="Assigned To"
          name="assigned_roles"
          control={control}
          ismultiple={true}
          dataArray={USER_ROLE_LIST.filter((rle: any) => rle.value === 'school-admin' || rle.value === 'branch-admin')}
        />
        <Select
          label="Integration Through"
          name="integration_through"
          control={control}
          dataArray={[{ label: 'API', value: 'API' }, { label: 'Upload Content', value: 'Upload Content' }, { label: 'Other Resource', value: 'other resource' }]}
        />
        <div className="md:col-span-2">
          <Input
            label="Description"
            name="description"
            control={control}
          />
        </div>
        <div className="col-span-2 py-2 h-44">
          <p className="font-semibold pb-1">Upload Logo</p>
          {
            (!watch('logo_url') && formState.errors?.logo_url) && (
              <p className="text-red-600 text-xs py-2">
                {formState.errors?.logo_url?.message as string}
              </p>
            )
          }
          <FileSelect
            singleSelect={true}
            ref={imageRef}
            onChange={onChange}
            placeholder={watch('logo_url')?.name || ''}
          />
        </div>
        <div className="col-span-2 pt-12 flex items-center justify-end">
          <Button disabled={isLoading} loading={isLoading}>Save</Button>
        </div>
      </form>
    </RouteLayout>
  );
}
