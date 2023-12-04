import RouteLayout from '@layout/routeLayout';
import Select from '@shared/form/Select';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import PageTitle from '@shared/pageTitle';
import Input from '@shared/form/Input';
import { useCallback, useEffect, useState } from 'react';
import DatePicker from '@shared/form/DatePicker';
import Button from '@component/button/button';
import { yupResolver } from '@hookform/resolvers/yup';
import { CODE_TYPE } from '@constants/constants';
import moment from 'moment';
import toast from '@shared/toast';
import { usePost } from '@shared/api/useApi';
import { useNavigate } from 'react-router-dom';
import schema from './schema';
import AdvanceFilter from './advanceFilter';

const Index = () => {
  const navigate = useNavigate();
  const [redirectTo, setRedirectTo] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string[]>([]);
  const [error, seterror] = useState<string>('');
  const { control, handleSubmit, watch, setValue, reset } = useForm({
    resolver: yupResolver(schema)
  });
  const wCodeType = watch('code_type');
  const startDateTemp = watch('start_date');
  const endDateTemp = watch('end_date');
  const onSubmit = (values: any) => {
    if (error === '') {
      const genData = {
        ...values,
        courses: selectedCourse,
        start_date: moment(values?.start_date).format('YYYY-MM-DD'),
        end_date: moment(values?.end_date).format('YYYY-MM-DD'),
        status: true
      };
      formReset();
      mutateGenerateCourseCode(genData);
    } else {
      setCustomError();
    }
  };
  const onError = (values: any) => {
    setCustomError();
  };

  const setCustomError = useCallback(() => {
    if (selectedCourse.length < 1) {
      seterror('required');
    } else {
      seterror('');
    }
  }, [selectedCourse]);

  const formReset = () => {
    reset();
    setSelectedCourse([]);
  };
  // ---------------------API----------------------------------
  // Toolbar Email
  const { isLoading: mutateLoading, mutate: mutateGenerateCourseCode } = usePost({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/course-code/`,
    onSuccess: (response: any) => {
      toast('success', 'Course code generated successfully');
      setSelectedCourse([]);
      setTimeout(() => {
        if (redirectTo) {
          navigate('/publisher/course-code');
        } else {
          formReset();
        }
      }, 500);
    },
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
      setSelectedCourse([]);
    }
  });
  // --------------------END API------------------------------

  useEffect(() => {
    setSelectedCourse([]);
    seterror('Required');
  }, [wCodeType]);

  useEffect(() => {
    if (startDateTemp && endDateTemp) {
      const date1: any = new Date(startDateTemp);
      const date2: any = new Date(endDateTemp);
      const diffTime = Math.abs(date2 - date1);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setValue('course_activation_in_days', Number.isInteger(diffDays) ? diffDays : 0);
    }
  }, [startDateTemp, endDateTemp]);

  const setToggleCourse = (value: string[]) => setSelectedCourse(value);
  return (
    <RouteLayout navBack={true}>
      <div className="mt-5">
        <PageTitle title="Generate Course Code" />
      </div>
      <form
        className="mt-5 bg-white p-5 flex flex-col md:grid md:grid-cols-3 gap-4"
        onSubmit={handleSubmit(onSubmit, onError)}
      >
        <Select
          required={true}
          control={control}
          name="code_type"
          label="Code Type"
          dataArray={CODE_TYPE}
        />
        <Input control={control} name="code_name" label="Course Code Name" required={true} />
        <Input control={control} name="license_count" label="Number of License" required={true} />
        {
          wCodeType
            ? (
              <div className="col-span-3 h-max">
                <AdvanceFilter
                  codeType={watch('code_type')}
                  setToggleCourse={setToggleCourse}
                  selectedCourse={selectedCourse}
                  error={error}
                  seterror={seterror}
                />
              </div>
            )
            : null
        }

        <DatePicker control={control} name="start_date" label="Start Date" disablePast={new Date()} required={true} />
        <DatePicker control={control} name="end_date" label="End Date" disablePast={startDateTemp} required={true} />
        <Input control={control} name="course_activation_in_days" label="Course Activation in Days" disabled={true} />
        <div className="col-span-3 flex gap-x-4 items-center justify-end">
          <Button variant="outlined" type="submit" onClick={() => setRedirectTo(false)}>Create & Add New</Button>
          <Button loading={mutateLoading} onClick={() => setRedirectTo(true)}>Create</Button>
        </div>
      </form>
    </RouteLayout>
  );
};

export default Index;
