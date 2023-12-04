/* eslint-disable no-console */
import React, { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import Select from '@shared/form/Select';
import Input from '@shared/form/Input';
import { useGet } from '@shared/api/useApi';
import AutoCompleteInput from '@shared/form/autoCompleteInput';
import { useDebounce } from 'react-use';

type Props = {
  countryList: any;
}

export default function ProfileInformation(props: Props) {
  const { control, watch, setValue } = useFormContext();
  const autoCompleteRef = useRef<any>(null);
  const [value, setvalue] = useState(watch('city') || '');
  const [debouncedValue, setDebouncedValue] = useState<string | null>(null);
  const masterServiceBaseURL = import.meta.env.VITE_APP_MASTER_SERVICE_URL;

  const { data, isLoading } = useGet({
    baseURL: masterServiceBaseURL,
    url: `master-service/city/?country_code=${watch('country')}${debouncedValue ? `&city_name=${debouncedValue}` : ''}`,
    enabled: !!watch('country')
  });
  useDebounce(
    () => {
      const found = data?.data?.results?.findIndex((item: any) => item.value === value) > -1;
      if (!found) {
        setDebouncedValue(value);
      }
    },
    500,
    [value]
  );
  useEffect(() => {
    setvalue(debouncedValue);
  }, [debouncedValue]);

  useEffect(() => {
    if (watch('city')) {
      setvalue(watch('city'));
    }
  }, [watch('city')]);

  const changehandle = (event: any) => {
    setValue('country', event.target.value);
    setValue('city', '');
    setvalue(null);
    autoCompleteRef?.current?.clear();
  };

  const onChange = (val: string | null) => {
    if (watch('city')) {
      setValue('city', '');
    }
    setvalue(val);
    // setError(`${name}.city`, { message: 'Please Select City' });
  };
  const onSelect = (val: string | null) => {
    if (val) {
      setValue('city', val, { shouldValidate: true });
      setvalue(val);
    }
  };

  return (
    <div className="w-full h-max border border-accent rounded-md p-6 overflow-auto">
      <h4 className="text-base text-accent font-bold pb-4">Profile Information</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 content-center gap-y-3 md:gap-x-6">
        <Input
          control={control}
          name="email"
          label="Email"
          required={true}
        />
        <Input
          control={control}
          name="website"
          label="Website"
          required={true}
        />
        <Input
          control={control}
          name="address"
          label="Address"
        />
        <Select
          control={control}
          name="country"
          label="Country"
          dataArray={props.countryList?.data.results}
          required={true}
          onChange={changehandle}
          disablePlaceholderValue={true}
        />
        <AutoCompleteInput
          ref={autoCompleteRef}
          control={control}
          label="City"
          name="city"
          value={value}
          dataArray={data?.data?.results?.map((ele: any) => ({ label: ele.label, value: ele.value }))}
          isLoading={isLoading}
          onChange={onChange}
          onSelect={onSelect}
        />
        <Input
          control={control}
          name="zipcode"
          label="Zip Code"
          type="number"
        />
        <Input
          control={control}
          name="phone_number"
          label="Phone"
          type="number"
          required={true}
        />
        <Input
          control={control}
          name="fax"
          label="Fax"
          type="number"
        />
      </div>

    </div>
  );
}
