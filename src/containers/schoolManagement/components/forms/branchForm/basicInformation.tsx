/* eslint-disable no-console */
import Checkbox from '@component/checkbox';
import { CustomInput } from '@component/input';
import { FormControlLabel } from '@mui/material';
import DatePicker from '@shared/form/DatePicker';
import Input from '@shared/form/Input';
import RadioGroup from '@shared/form/RadioGroup';
import Select from '@shared/form/Select';
import { dateRange, incrementDateByOne, incrementYearByOne } from '@utility/utility';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useContext, useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

type Props = {
  context: React.Context<any>;
  isEdit?: boolean;
  // resetCount: number;
  branchTypeList: any;
  // academicYearList: any;
}

export default function BasicInformation(props: Props) {
  const { contextData } = useContext(props.context);
  const { control, setValue, setError, watch, clearErrors } = useFormContext();
  const name = 'academic_information';
  const { fields, append } = useFieldArray({
    control,
    name
  });

  useEffect(() => {
    if (contextData?.branchData) {
      const timer = setTimeout(() => {
        setValue('academic_information', contextData?.branchData?.academic_type_new ? contextData?.branchData?.academic_information : contextData?.schoolData?.academic_information, { shouldValidate: true });
        clearTimeout(timer);
      }, 0);
    }
  }, [props?.isEdit]);

  useEffect(() => {
    if (!props?.isEdit) {
      setValue('academic_year', contextData?.schoolData?.area_academic_year);
      setValue('activation_start_date', contextData?.schoolData?.activation_start_date);
      setValue('activation_end_date', contextData?.schoolData?.activation_end_date);
      setValue('academic_type', contextData?.schoolData?.academic_type);
      setValue('number_of_terms', contextData?.schoolData?.number_of_terms_or_semester);
      const timer = setTimeout(() => {
        setValue('academic_information', contextData?.schoolData?.academic_information, { shouldValidate: true });
        clearTimeout(timer);
      }, 0);
    }
  }, []);

  const addNewHandler = () => {
    // setValue('activation_start_date', null);
    // setValue('activation_end_date', null);
    setValue('academic_type_new', false);
    setValue('academic_type', '');
    setValue('number_of_terms', '');
    setValue('academic_information', []);
  };

  const onInputChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const count = event.target.value;
    const ct = !!count;
    setValue('number_of_terms', count);
    if (ct && (+count > 0 && +count <= 4)) {
      clearErrors('number_of_terms');
      setValue('academic_information', []);
      for (let i = 0; i < +count;) {
        append({
          term_or_semester_number: i + 1,
          from_date: null,
          to_date: null
        });
        i += 1;
      }
    }
    if (+count <= 0) {
      setError('number_of_terms', { message: 'Should Be Minumum 1' });
    }
    if (+count > 4) {
      setError('number_of_terms', { message: 'Maximum 4' });
      setValue('academic_information', []);
    }
    if (!ct) {
      setError('number_of_terms', { message: 'Required' });
    }
  };

  const onCheckHandler = (checked: boolean) => {
    setValue('academic_type_new', checked);
    if (checked) {
      // setValue('academic_year', contextData?.schoolData?.area_academic_year, { shouldValidate: true });
      setValue('academic_type', contextData?.schoolData?.academic_type, { shouldValidate: true });
      setValue('number_of_terms', contextData?.schoolData?.number_of_terms_or_semester, { shouldValidate: true });
      setValue('number_of_terms', contextData?.schoolData?.number_of_terms_or_semester, { shouldValidate: true });
      // setValue('activation_start_date', contextData?.schoolData?.activation_start_date, { shouldValidate: true });
      // setValue('activation_end_date', contextData?.schoolData?.activation_end_date, { shouldValidate: true });
      const timer = setTimeout(() => {
        setValue('academic_information', contextData?.schoolData?.academic_information, { shouldValidate: true });
        clearTimeout(timer);
      }, 0);
    } else {
      setValue('academic_type', '');
      setValue('number_of_terms', '');
      setValue('academic_information', []);
    }
  };

  const onSelectChangeHandler = (event: any) => {
    setValue('academic_year', event?.target?.value);
    addNewHandler();
  };

  const onEndDateChangeHandler = (value: any) => {
    setValue('activation_end_date', value, { shouldValidate: true });
    watch('academic_information')?.forEach((ele: any, index: number) => {
      setValue(`academic_information[${index}].from_date`, null);
      setValue(`academic_information[${index}].to_date`, null);
    });
  };

  return (
    <div className="w-full h-max border border-accent rounded-md p-6 overflow-auto">
      <div className="flex flex-col md:flex-row justify-between gap-y-2 md:gap-x-6">
        <CustomInput
          value={contextData?.schoolData?.school_name}
          size="small"
          label="School Name"
          disabled={true}
        />
        <CustomInput
          value={contextData?.schoolData?.school_url}
          size="small"
          label="URL"
          disabled={true}
        />
      </div>
      <br />
      <h4 className="text-base text-accent font-bold pb-4">Basic Information</h4>
      <div className="flex flex-col md:flex-row justify-between gap-y-2 md:gap-x-6">
        <Input control={control} name="name" label="Branch Name" required={true} />
        <Select
          control={control}
          name="branch_type"
          label="Branch Type"
          displayEmpty={true}
          dataArray={props.branchTypeList?.data}
          required={true}
          disablePlaceholderValue={true}
        />
      </div>
      <br />
      <div className="grid grid-cols-1 md:grid-cols-3 content-center gap-y-3 md:gap-x-6">
        <div>
          <h4 className="text-base text-accent font-bold pb-4 truncate">
            Academic Information
            <span className="text-red-500"> *</span>
          </h4>
          <Select
            control={control}
            onChange={onSelectChangeHandler}
            name="academic_year"
            label="Area Academic Year"
            dataArray={dateRange(4)}
            // disabled={watch('academic_type_new')}
            disabled={true}
            disablePlaceholderValue={true}
          />
        </div>
        <div className="col-span-2 pt-3 md:pt-0">
          <h4 className="text-base text-accent font-bold pb-4">
            Activation Information
            <span className="text-red-500"> *</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 md:gap-x-6">
            <DatePicker
              // disabled={watch('academic_type_new') || !watch('academic_year')}
              disabled={true}
              disableOld={true}
              disablePast={watch('academic_year') && new Date(watch('academic_year').split('-')[0])}
              disableFuture={watch('academic_year') && incrementYearByOne(watch('academic_year').split('-')[1])}
              control={control}
              name="activation_start_date"
              label="Start Date"
            />
            <DatePicker
              // disabled={watch('academic_type_new') || !watch('activation_start_date')}
              disabled={true}
              disablePast={incrementDateByOne(watch('activation_start_date'))}
              disableFuture={watch('academic_year') && incrementYearByOne(watch('academic_year').split('-')[1])}
              control={control}
              name="activation_end_date"
              label="End Date"
              onChange={onEndDateChangeHandler}
            />
          </div>
        </div>
      </div>
      <br />
      <div className="flex items-center gap-6">
        <h4 className="text-base text-accent font-bold pb-4">
          Academic type
          <span className="text-red-500"> *</span>
        </h4>
        <div className="flex items-center pb-4">
          {/* <FormControlLabel
            control={<Checkbox checked={addNewAcType} onChange={changeHandler} />}
            label="Same as School"
          /> */}
          <FormControlLabel
            control={(
              <Checkbox
                checked={watch('academic_type_new')}
                onChange={(_, checked) => onCheckHandler(checked)}
              />
            )}
            label="Same as School"
          />
          <p className="pr-4">or</p>
          <p
            role="presentation"
            onClick={addNewHandler}
            className="text-accent underline cursor-pointer"
          >
            Add New
          </p>
        </div>
      </div>
      <div className="col-span-3 grid grid-cols-1 lg:grid-cols-2 content-center gap-y-3 md:gap-x-6">
        <div className="flex flex-col md:flex-row items-center gap-x-4">
          <div
            className={`h-full pb-2 self-start ${watch('academic_type') ? 'md:pt-8 md:pb-0' : ''}`}
          >
            <RadioGroup
              disabled={watch('academic_type_new')}
              // disabled={(props?.isEdit && watch('academic_type_new')) || watch('academic_type_new') || !watch('activation_start_date') || !watch('activation_end_date')}
              control={control}
              name="academic_type"
              dataArray={[
                { label: 'Term', value: 'term' },
                { label: 'Semester', value: 'semester' }
              ]}
            />
          </div>
          {
            watch('academic_type') && (
              <div className="w-full flex-1 self-start">
                <Input
                  disabled={(props?.isEdit && watch('academic_type_new')) || watch('academic_type_new')}
                  label={`Number of ${watch('academic_type') === 'term' ? 'Terms' : 'Semester'}`}
                  control={control}
                  name="number_of_terms"
                  type="number"
                  onChange={onInputChangeHandler}
                />
              </div>
            )
          }

        </div>
        <AnimatePresence>
          {
            (watch('number_of_terms') !== '' && (+watch('number_of_terms') > 0 && +watch('number_of_terms') <= 4)) && (
              <motion.div
                className="col-span-3 w-full md:w-max max-h-[400px] overflow-auto
                inline-flex flex-col md:gap-y-4 md:p-4 md:mt-2 rounded-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 700,
                  damping: 50
                }}
              >
                {
                  fields.map((field, index) => (
                    <div
                      key={field.id}
                      className={`inline-flex flex-col md:flex-row gap-x-4 pb-4 
                        ${index !== fields.length - 1 ? 'border-b' : ''}`}
                    >
                      <div className="mt-8 py-2 font-medium flex gap-x-2 items-center w-24">
                        <p>
                          {
                            watch(`academic_type`) === 'term'
                              ? `Term`
                              : `Semester`
                          }
                        </p>
                        <p>{index + 1}</p>
                      </div>
                      <div className="flex gap-x-6">
                        <div>
                          <DatePicker
                            disabled={(props?.isEdit && watch('academic_type_new')) || watch('academic_type_new')}
                            disablePast={index > 0 ? incrementDateByOne(watch(`${name}[${index - 1}].to_date`)) : watch('activation_start_date')}
                            disableFuture={watch('activation_end_date')}
                            control={control}
                            name={`${name}[${index}].from_date`}
                            label="From Date"
                          />
                        </div>
                        <div>
                          <DatePicker
                            disablePast={incrementDateByOne(watch(`${name}[${index}].from_date`))}
                            disableFuture={watch('activation_end_date')}
                            control={control}
                            disabled={(props?.isEdit && watch('academic_type_new')) || watch('academic_type_new') || !watch(`${name}[${index}].from_date`)}
                            name={`${name}[${index}].to_date`}
                            label="To Date"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                }
              </motion.div>
            )
          }
        </AnimatePresence>

      </div>
    </div>
  );
}
