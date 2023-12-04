import Button from '@component/button/button';
import { yupResolver } from '@hookform/resolvers/yup';
import { usePost } from '@shared/api/useApi';
import Input from '@shared/form/Input';
import Select from '@shared/form/Select';
import toast from '@shared/toast';
import { AxiosError, AxiosResponse } from 'axios';
import { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { addSubjectSchema } from './schema';

interface FormInput {
  selection: string;
  content: string;
}
type DT = { label: string; value: string | boolean | number };

type Props = {
  dataArray: DT[];
  isLoading: boolean;
  setSelection: React.Dispatch<any>;
  appendNewData: (obj: DT) => void;
  resetPage: () => void;
  shouldReset: boolean;
  setshouldReset: any;
}

export default function AddSubject(props: Props) {
  const { shouldReset, setshouldReset } = props;
  const { control, handleSubmit, setError, setValue, watch, resetField } = useForm<FormInput>({
    resolver: yupResolver(addSubjectSchema),
    mode: 'all'
  });

  const { isLoading, mutate } = usePost({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: 'course-code-service/courses/content/',
    onSuccess: (res: AxiosResponse) => {
      resetField('content');
      props.appendNewData({ label: res.data?.response.content, value: res.data?.response.id });
      toast('success', res?.data.message);
    },
    onError: (err: AxiosError) => {
      const { errors } = err?.response?.data as { errors: any };
      setError('content' as any, { message: errors?.content[0] }, { shouldFocus: true });
    }
  });
  const onChange = (e: any, ev: any) => {
    setValue('selection', e.target.value);
    props.resetPage();
    if (e.target.value) {
      props.setSelection(ev.props?.children[1]);
    } else {
      props.setSelection('');
    }
  };
  const onSubmit: SubmitHandler<FormInput> = (values: any) => {
    values.selection = +values.selection;
    mutate(values);
  };

  useEffect(() => {
    if (shouldReset) {
      setValue('selection', '');
    }
  }, [shouldReset]);

  useEffect(() => {
    if (!watch('selection')) {
      setshouldReset(false);
    }
  }, [watch('selection')]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="border border-linegray shadow-md rounded p-4 flex flex-col justify-between gap-y-1"
    >
      <div className="flex-1 flex flex-col">
        <p className="text-lg font-semibold">Add</p>
        <div className="flex-1 flex flex-col gap-y-6">
          <Select
            control={control}
            name="selection"
            label="Select From"
            loading={props.isLoading}
            dataArray={props.dataArray}
            onChange={onChange}
            displayEmpty={true}
          />
          {
          watch('selection') && <Input control={control} name="content" label={`Add ${props.dataArray.find((item: any) => item.value === +watch('selection'))?.label}`} placeholder="eg.Alpha-Maths" />
        }
        </div>
      </div>
      <div className="self-end pt-4">
        <Button
          loading={isLoading}
          disabled={isLoading}
        >
          Add
        </Button>
      </div>
    </form>
  );
}
