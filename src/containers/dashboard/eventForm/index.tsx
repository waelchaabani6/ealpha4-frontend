import { yupResolver } from '@hookform/resolvers/yup';
import Input from '@shared/form/Input';
import { SubmitHandler, useForm } from 'react-hook-form';
import TextArea from '@shared/form/TextArea';
import Button from '@component/button/button';
import moment from 'moment';
import { usePost } from '@shared/api/useApi';
import toast from '@shared/toast';
import { useSelector } from 'react-redux';
import { selectUser } from '@shared/store/userSlice';
import DateTimePicker from '@shared/form/DateTimePicker';
import schema from './schema';

type Inputs = {
  event_name: string;
  start_date: string;
  end_date: string;
  description: string;
};

type Props = {
  close: () => void;
  refetch?: any;
  disabled?: boolean;
  // eslint-disable-next-line react/no-unused-prop-types
  data?: any;
};

export default function Index(props: Props) {
  const roasterBaseURL = import.meta.env.VITE_APP_ROSTER_SERVICE_URL;
  const { schoolId, userId: userID } = useSelector(selectUser);

  const { handleSubmit, control, setError, watch } = useForm<Inputs>({
    resolver: yupResolver(schema)
  });

  const { isLoading, mutate: createEvent } = usePost({
    baseURL: roasterBaseURL,
    url: 'roster-service/events/',
    onSuccess: (res: any) => {
      toast('success', 'Event Created');
      props.refetch();
      props.close();
    },
    onError: (res: any) => {
      if (res?.response?.data?.errors?.event_name) {
        setError('event_name' as any, {
          message: res?.response?.data?.errors?.event_name[0] || 'error'
        });
      }
    }
  });

  const onSubmit: SubmitHandler<any> = (values) => {
    values.start_date = moment(values.start_date)
      .utc()
      .format('YYYY-MM-DDTHH:mm:ss[Z]');
    values.end_date = moment(values.end_date)
      .utc()
      .format('YYYY-MM-DDTHH:mm:ss[Z]');
    values.school_id = schoolId;
    values.created_by = userID;
    values.updated_by = 1;
    createEvent(values);
  };

  const sxClass = props?.disabled ? {
    '.Mui-disabled,.MuiInputBase-input.MuiOutlinedInput-input': {
      '-webkit-text-fill-color': 'black'
    }
  } : {};

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full grid grid-cols-1 gap-4"
    >
      <Input
        required={true}
        control={control}
        name="event_name"
        icon={false}
        value={props?.data?.event_name}
        label="Event Name"
        disabled={props?.disabled}
        sxClass={sxClass}
      />
      <div className="grid grid-cols-2 gap-y-2 md:gap-x-2">
        <DateTimePicker
          required={true}
          disablePast={new Date()}
          disableOld={true}
          control={control}
          value={props?.data?.start_date}
          name="start_date"
          label="Start Date"
          disabled={props?.disabled}
          sxClass={sxClass}
        />
        <DateTimePicker
          required={true}
          disablePast={new Date(watch('start_date'))}
          disabled={!watch('start_date') || props?.disabled}
          disableOld={true}
          control={control}
          name="end_date"
          value={props?.data?.end_date}
          label="End Date"
          sxClass={sxClass}
        />
      </div>
      {!props?.disabled && (
        <TextArea
          required={true}
          control={control}
          name="description"
          label="Description"
          customClass="bg-white"
        />
      )}
      {
        props?.disabled && (
          <textarea
            defaultValue={props?.data?.description}
            disabled={props?.disabled}
            className="bg-white border border-solid rounded border-gray-400 p-4 text-black"
          />
        )
      }
      {!props?.disabled && (
        <div className="w-full flex items-center justify-end">
          <Button loading={isLoading} disabled={isLoading}>
            Submit
          </Button>
        </div>
      )}
    </form>
  );
}
