import React, { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import Select from '@shared/form/Select';
import Input from '@shared/form/Input';
import AutoCompleteInput from '@shared/form/autoCompleteInput';
import { useDebounce } from 'react-use';
import { useGet } from '@shared/api/useApi';

type Props = {
  countryList: any;
  schoolTypeList: any;
}

export default function ProfileInformation(props: Props) {
  const { control, watch, setValue } = useFormContext();
  const autoCompleteRef = useRef<any>(null);
  const name = 'profile_information';
  const [value, setvalue] = useState(watch(`${name}.city`) || '');
  const [countryCode, setCountryCode] = useState('');
  const [debouncedValue, setDebouncedValue] = useState<string | null>(null);
  const { data, isLoading } = useGet({
    baseURL: import.meta.env.VITE_APP_MASTER_SERVICE_URL,
    url: `master-service/city/?country_code=${countryCode}${debouncedValue ? `&city_name=${debouncedValue}` : ''}`,
    enabled: !!countryCode
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
    if (watch(`${name}.city`)) {
      setvalue(watch(`${name}.city`));
    }
  }, [watch(`${name}.city`)]);

  const changehandle = (event: any) => {
    const selectedCountry = event.target.value;
    const selectedCountryCode = props.countryList?.data.results.find((option: any) => option?.name === selectedCountry);
    setCountryCode(selectedCountryCode?.value);
    setValue(`${name}.country`, event.target.value);
    setValue(`${name}.city`, '');
    setvalue(null);
    autoCompleteRef?.current?.clear();
  };

  const onChange = (val: string | null) => {
    if (watch(`${name}.city`)) {
      setValue(`${name}.city`, '');
    }
    setvalue(val);
    // setError(`${name}.city`, { message: 'Please Select City' });
  };
  const onSelect = (val: string | null) => {
    if (val) {
      setValue(`${name}.city`, val, { shouldValidate: true });
      setvalue(val);
    }
  };
  return (
    <div className="w-full h-max border border-accent rounded-md p-6 overflow-auto">
      <h4 className="text-base text-accent font-bold pb-4">Profile Information</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 content-center gap-y-3 md:gap-x-6">
        <Input
          control={control}
          name={`${name}.email`}
          label="Email"
          required={true}
        />
        <Input
          control={control}
          name={`${name}.website`}
          label="Website"
          required={true}
        />
        <Input
          control={control}
          name={`${name}.address`}
          label="Address"
        />
        <Select
          control={control}
          name={`${name}.country`}
          label="Country"
          dataArray={props.countryList?.data.results?.map((item: any) => ({
            label: item.name,
            value: item.name
          })) || []}
          required={true}
          onChange={changehandle}
          disablePlaceholderValue={true}
        />
        <AutoCompleteInput
          ref={autoCompleteRef}
          control={control}
          label="City"
          name={`${name}.city`}
          value={value}
          dataArray={data?.data?.results?.map((ele: any) => ({ label: ele.label, value: ele.value }))}
          isLoading={isLoading}
          onChange={onChange}
          onSelect={onSelect}
        />

        <Input
          control={control}
          name={`${name}.zipcode`}
          label="Zip Code"
          type="number"
        />
        <Select
          control={control}
          name={`${name}.school_type`}
          label="School Type"
          dataArray={props?.schoolTypeList?.data}
          required={true}
          disablePlaceholderValue={true}
        />
        <Input
          control={control}
          required={true}
          name={`${name}.phone_number`}
          label="Phone"
          type="number"
        />
        <Input
          control={control}
          name={`${name}.fax`}
          label="Fax"
          type="number"
        />
      </div>
    </div>
  );
}
