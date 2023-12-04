import { useEffect, useState } from 'react';
import Button from '@component/button/button';
import DatePicker from '@shared/form/DatePicker';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import { CustomInput } from '@component/input';
import PageTitle from '@shared/pageTitle';
import { yupResolver } from '@hookform/resolvers/yup';
import { SubmitHandler, useForm } from 'react-hook-form';
import { usePatch } from '@shared/api/useApi';
import toast from '@shared/toast';
import moment from 'moment';
import { extendLicenseSchema } from './schema';

const ExtendLicensePopupForm = (props: any) => {
  const { propDatas } = props;
  const [activeInDays, setActiveInDays] = useState(0);
  const [expirationDate, setExpirationDate] = useState('');

  const {
    licenseDialog,
    setLicenseDialog,
    title,
    handleLicenseSubmit,
    refetch
  } = props;

  type Inputs = {
    start_date: string | any;
    end_date: string | any;
  }
  const { handleSubmit, control, watch, setValue } = useForm<Inputs>({
    resolver: yupResolver(extendLicenseSchema)
  });

  const onSubmit: SubmitHandler<Inputs> = (values) => {
    const payload = {
      activation_start_date: moment(values?.start_date).format('YYYY-MM-DD'),
      activation_end_date: moment(values?.end_date).format('YYYY-MM-DD')
    };
    if (propDatas?.branch_type) {
      mutateBranch(payload);
    } else if (propDatas?.school_type) {
      mutateExtendLicense(payload);
    }
  };

  // Extend License : School
  const { isLoading: licenseSubmitLoader, mutate: mutateExtendLicense } = usePatch({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/schools/extend-license/${propDatas?.school_id}/`,
    onSuccess: (response: any) => {
      setLicenseDialog(false);
      refetch();
      toast('success', 'School License extended successfully');
    },
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
    }
  });
  // Extend License : Branch
  const { isLoading: BranchPostLoader, mutate: mutateBranch } = usePatch({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-branches/branchlicense/${propDatas?.id}`,
    onSuccess: (response: any) => {
      setLicenseDialog(false);
      refetch();
      toast('success', 'Branch License extended successfully');
    },
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
    }
  });

  useEffect(() => {
    if (propDatas && Object.keys(propDatas).length) {
      setValue('start_date', propDatas?.activation_end_date);
      setValue('end_date', propDatas?.activation_end_date);
      setActiveInDays(0);
      setExpirationDate(propDatas?.activation_end_date);
    }
  }, [propDatas]);

  const startDateTemp = watch('start_date');
  const endDateTemp = watch('end_date');
  useEffect(() => {
    if (startDateTemp && endDateTemp) {
      const date1: any = new Date(startDateTemp);
      const date2: any = new Date(endDateTemp);
      const diffTime = Math.abs(date2 - date1);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setActiveInDays(Number.isInteger(diffDays) ? diffDays : 0);
    }
  }, [startDateTemp, endDateTemp]);

  useEffect(() => {
    if (startDateTemp && endDateTemp && typeof endDateTemp === 'string') {
      setValue('end_date', startDateTemp);
    }
    if (startDateTemp && (startDateTemp > endDateTemp)) {
      setValue('end_date', startDateTemp);
    }
  }, [startDateTemp]);

  return (
    <CustomizedDialogs title={title} open={licenseDialog} setOpen={setLicenseDialog}>
      <form className="h-full" onSubmit={handleSubmit(onSubmit)}>
        <CustomInput
          label="Current License Expiration Date"
          value={moment(expirationDate).format('DD-MM-YYYY')}
          onChange={(e: any) => setActiveInDays(e.target.value)}
          icon={true}
          size="small"
          disabled={true}
        />
        <PageTitle title={title} customStyle={{ margin: '40px 0' }} />
        <div className="flex sm:flex-row flex-col gap-8">
          <DatePicker
            control={control}
            name="start_date"
            label="Start Date"
            disablePast={expirationDate ? new Date(expirationDate) : new Date()}
          />
          <DatePicker
            control={control}
            name="end_date"
            label="End Date"
            disablePast={watch('start_date')}
          />
          <CustomInput
            label="Active In Days"
            value={activeInDays}
            onChange={(e: any) => setActiveInDays(e.target.value)}
            icon={true}
            size="small"
            disabled={true}
          />
        </div>
        <div className="mt-20 text-end">
          <Button onClick={handleLicenseSubmit} loading={licenseSubmitLoader || BranchPostLoader}>Save</Button>
        </div>

      </form>
    </CustomizedDialogs>
  );
};

export default ExtendLicensePopupForm;
