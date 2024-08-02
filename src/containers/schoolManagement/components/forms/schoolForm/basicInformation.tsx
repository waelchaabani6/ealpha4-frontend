/* eslint-disable space-in-parens */
/* eslint-disable operator-linebreak */
/* eslint-disable comma-dangle */
/* eslint-disable indent */
import { useFieldArray, useFormContext } from 'react-hook-form';
import DatePicker from '@shared/form/DatePicker';
import Select from '@shared/form/Select';
import Input from '@shared/form/Input';
import RadioGroup from '@shared/form/RadioGroup';
import { AnimatePresence, motion } from 'framer-motion';
import {
  dateRange,
  incrementDateByOne,
  incrementYearByOne,
} from '@utility/utility';
import { useContext, useEffect } from 'react';

type Props = {
  // academicYearList: any;
  isEdit?: boolean;
  context: React.Context<any>;
};

export default function BasicInformation(props: Props) {
  const { contextData } = useContext(props.context);
  const { control, setValue, setError, watch, clearErrors } = useFormContext();
  const name = 'academic_information';
  const { fields, append } = useFieldArray({
    control,
    name,
  });

  const onInputChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const count = event.target.value;
    const ct = !!count;
    setValue('number_of_terms_or_semester', count);
    if (ct && +count > 0 && +count <= 4) {
      clearErrors('number_of_terms_or_semester');
      setValue('academic_information', []);
      for (let i = 0; i < +count; ) {
        append({
          term_or_semester_number: i + 1,
          from_date: null,
          to_date: null,
        });
        i += 1;
      }
    }
    if (+count <= 0) {
      setError('number_of_terms_or_semester', {
        message: 'Should Be Minumum 1',
      });
    }
    if (+count > 4) {
      setError('number_of_terms_or_semester', { message: 'Maximum 4' });
    }
    if (!ct) {
      setError('number_of_terms_or_semester', { message: 'Required' });
    }
  };

  useEffect(() => {
    if (contextData?.schoolData) {
      const timer = setTimeout(() => {
        setValue(
          'academic_information',
          contextData?.schoolData?.academic_information,
          { shouldValidate: true }
        );
        clearTimeout(timer);
      }, 0);
    }
  }, [props?.isEdit]);

  const onEndDateChangeHandler = (value: any) => {
    setValue('activation_end_date', value, { shouldValidate: true });
    // clearErrors('number_of_terms_or_semester');
    watch('academic_information')?.forEach((ele: any, index: number) => {
      setValue(`academic_information[${index}].from_date`, null);
      setValue(`academic_information[${index}].to_date`, null);
    });
  };

  const onSelectChangeHandler = (event: any) => {
    setValue('area_academic_year', event?.target?.value);
    setValue('activation_start_date', null);
    setValue('activation_end_date', null);
    setValue('academic_type', '');
    setValue('number_of_terms_or_semester', '');
    setValue('academic_information', []);
  };

  return (
    <div className="w-full h-max border border-accent rounded-md p-6 overflow-auto">
      <h4 className="text-base text-accent font-bold pb-4">
        Basic Information
      </h4>
      <div className="flex flex-col md:flex-row justify-between gap-y-2 md:gap-x-6">
        <Input
          control={control}
          name="school_name"
          label="School Name"
          required={true}
        />
        <Input control={control} name="school_url" label="URL" />
      </div>
      <br />
      <div className="grid grid-cols-1 md:grid-cols-3 content-center gap-y-3 md:gap-x-6">
        <div>
          <h4 className="text-base text-accent font-bold pb-4 truncate">
            Academic Information
            <span className="text-red-500"> *</span>
          </h4>
          <Select
            onChange={onSelectChangeHandler}
            control={control}
            name="area_academic_year"
            label="Area Academic Year"
            disabled={true}
            // dataArray={props?.academicYearList?.data}
            dataArray={dateRange(4)}
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
              disabled={!watch('area_academic_year')}
              disableOld={true}
              disablePast={
                watch('area_academic_year') &&
                new Date(watch('area_academic_year').split('-')[0])
              }
              disableFuture={
                watch('area_academic_year') &&
                incrementYearByOne(watch('area_academic_year').split('-')[1])
              }
              control={control}
              name="activation_start_date"
              label="Start Date"
              required={true}
            />
            <DatePicker
              disabled={!watch('activation_start_date')}
              disablePast={incrementDateByOne(watch('activation_start_date'))}
              disableFuture={
                watch('area_academic_year') &&
                incrementYearByOne(watch('area_academic_year').split('-')[1])
              }
              control={control}
              name="activation_end_date"
              label="End Date"
              onChange={onEndDateChangeHandler}
              required={true}
            />
          </div>
        </div>
      </div>
      <br />
      <div className="flex gap-x-4">
        <h4 className="text-base text-accent font-bold pb-4">
          Academic type
          <span className="text-red-500"> *</span>
        </h4>
      </div>
      <div className="col-span-3 grid grid-cols-1 lg:grid-cols-2 content-center gap-y-3 md:gap-x-6">
        <div className="flex flex-col md:flex-row items-center gap-x-4">
          <div
            className={`h-full pb-2 self-start ${watch('academic_type') ? 'md:pt-8 md:pb-0' : ''}`}
          >
            <RadioGroup
              disabled={
                !watch('activation_start_date') || !watch('activation_end_date')
              }
              control={control}
              name="academic_type"
              dataArray={[
                { label: 'Term', value: 'term' },
                { label: 'Semester', value: 'semester' },
              ]}
            />
          </div>
          {watch('academic_type') && (
            <div className="w-full flex-1 self-start">
              <Input
                label={`Number of ${watch('academic_type') === 'term' ? 'Terms' : 'Semester'}`}
                control={control}
                name="number_of_terms_or_semester"
                type="number"
                onChange={onInputChangeHandler}
              />
            </div>
          )}
        </div>
        <AnimatePresence>
          {watch('number_of_terms_or_semester') !== '' &&
            +watch('number_of_terms_or_semester') > 0 &&
            +watch('number_of_terms_or_semester') <= 4 && (
              <motion.div
                className="col-span-3 w-full md:w-max max-h-[400px] overflow-auto
              inline-flex flex-col md:gap-y-4 md:p-4 md:mt-2 rounded-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 700,
                  damping: 50,
                }}
              >
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className={`inline-flex flex-col md:flex-row gap-x-4 pb-4
                        ${index !== fields.length - 1 ? 'border-b' : ''}`}
                  >
                    <div className="mt-8 py-2 font-medium flex gap-x-2 items-center w-24">
                      <p>
                        {watch(`academic_type`) === 'term'
                          ? `Term`
                          : `Semester`}
                      </p>
                      <p>{index + 1}</p>
                    </div>
                    <div className="flex gap-x-6">
                      <div>
                        <DatePicker
                          disablePast={
                            index > 0
                              ? incrementDateByOne(
                                  watch(`${name}[${index - 1}].to_date`)
                                )
                              : watch('activation_start_date')
                          }
                          disableFuture={watch('activation_end_date')}
                          control={control}
                          name={`${name}[${index}].from_date`}
                          label="From Date"
                          disabled={
                            index > 0 && !watch(`${name}[${index - 1}].to_date`)
                          }
                        />
                      </div>
                      <div>
                        <DatePicker
                          disablePast={incrementDateByOne(
                            watch(`${name}[${index}].from_date`)
                          )}
                          disableFuture={watch('activation_end_date')}
                          control={control}
                          disabled={!watch(`${name}[${index}].from_date`)}
                          name={`${name}[${index}].to_date`}
                          label="To Date"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}
