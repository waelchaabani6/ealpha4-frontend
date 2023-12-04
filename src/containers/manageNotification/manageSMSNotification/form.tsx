import Button from '@component/button/button';
import { USER_ROLE_LIST } from '@constants/constants';
import { yupResolver } from '@hookform/resolvers/yup';
import { ReactComponent as DropDownArrow } from '@images/down arrow.svg';
import RouteLayout from '@layout/routeLayout';
import MuiInput from '@mui/material/Input';
import MuiSelect from '@mui/material/Select';
import { useGet, usePost } from '@shared/api/useApi';
import Input from '@shared/form/Input';
import Select from '@shared/form/Select';
import TextEditor from '@shared/form/TextEditor';
import AutoCompleteInput from '@shared/form/autoCompleteInput';
import PageTitle from '@shared/pageTitle';
import codes from 'country-calling-code';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useDebounce } from 'react-use';

import { FormControl, InputAdornment, MenuItem, Typography } from '@mui/material';
import { selectSchoolData } from '@shared/store/schoolSlice';
import { selectUser } from '@shared/store/userSlice';
import toast from '@shared/toast';
import { userRole } from '@utility/utility';
import { AxiosError } from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { smsNotificationSchema } from '../schema';

const inputFieldName = 'contact_number';

export default function Form(): JSX.Element {
  const autoCompleteRef = useRef<any>(null);
  const navigate = useNavigate();
  const [value, setvalue] = useState<string>('');
  const { branchId, schoolId } = useSelector(selectUser);
  const { branchData, schoolData } = useSelector(selectSchoolData);
  const [debouncedValue, setDebouncedValue] = useState<string>('');
  const {
    watch,
    reset,
    setValue,
    setError,
    handleSubmit,
    control,
    formState,
    clearErrors
  } = useForm<any>({
    resolver: yupResolver(smsNotificationSchema),
    mode: 'all',
    defaultValues: {
      contact_number: [
        { number: '' }
      ]
    }
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: inputFieldName
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
  const handleSmsBodyError = () => {
    const inputText = new DOMParser().parseFromString(watch('mail_body'), 'text/xml');
    if (!inputText?.documentElement?.textContent) {
      // unregister('mail_body');
      setError('mail_body', { message: 'Please enter email body' });
      return true;
    }
    return false;
  };
  const { isLoading: schoolListLoading, data: schoolList } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/schools/get-schools/?status=Active${debouncedValue ? `&search=${debouncedValue}` : ''}`,
    enabled: !schoolId
  });
  const { isLoading: branchListLoading, data: branchList } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-branches/branch-list/?school_id=${watch('school_id')}`,
    enabled: !!(watch('school_id') && !branchId)
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
    url: 'notification-service/sms-send/',
    onSuccess: () => {
      toast('success', 'Sms Sent');
      // reset({
      //   school_id: '',
      //   branch_id: '',
      //   roles: '',
      //   class_id: '',
      //   contact_number_prirority: '',
      //   contact_number: [{ number: '' }],
      //   sms_body: ''
      // });
      navigate(-1);
    },
    onError: (err: AxiosError) => {
      // const tg = (err?.response?.data as any)?.errors;
      // if (tg) {
      //   Object.keys(tg).forEach((key: string) => {
      //     setError(key as any, { message: tg[key][0] });
      //   });
      // }
      toast('error', 'error');
    }
  });

  const onChange = (val: string | null) => {
    setvalue(val || '');
    if (val === '') {
      setValue('school_id', '');
    }
  };
  const onSelect = (val: string | null) => {
    if (val) {
      setValue('school_id', val, { shouldValidate: true });
      const name = classList?.data?.response?.results?.find((itm: any) => (+itm.id) === (+val));
      if (name) {
        setvalue(name.name);
      }
    }
  };

  const onSubmit = (values: any) => {
    if (!handleSmsBodyError()) {
      const a = new DOMParser();
      const smsText = a.parseFromString(values.sms_body, 'text/html').documentElement.textContent;
      values.sms_body = smsText;
      values.sms_notification = values.contact_number.map((itm: any) => {
        const phoneNumber = `${itm.country_code}${itm.number}`;
        const tmp = {
          school_id: +values.school_id,
          roles: values.roles,
          class_id: +values.class_id,
          contact_number_prirority: values.contact_number_prirority,
          sms_body: smsText,
          phone_number: [
            phoneNumber
          ]
        } as any;
        if (values.branch_id) {
          tmp.branch_id = +values.branch_id;
        }
        if (branchId) {
          tmp.branch_id = branchId;
        }
        return tmp;
      });
      values.school_id = +values.school_id;
      values.class_id = +values.class_id;
      if (!values.branch_id) {
        delete values.branch_id;
      } else {
        values.branch_id = +values.branch_id;
      }
      delete values.contact_number;
      mutate(values);
    }
  };
  const onError = (errValues: any) => {
    handleSmsBodyError();
  };

  const addNew = useCallback((ev: React.MouseEvent) => {
    ev.stopPropagation();
    append({
      number: ''
    });
    document.getElementById(`${inputFieldName}_${fields.length - 1}`)?.scrollIntoView();
  }, [fields]);

  const removeHandler = (index: number) => {
    remove(index);
    document.getElementById(`${inputFieldName}_${index - 1}`)?.scrollIntoView();
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
    <RouteLayout>
      <div className="flex w-full justify-between items-center pb-4 mt-4">
        <PageTitle title="Manage SMS Notifications" />
      </div>
      <form onSubmit={handleSubmit(onSubmit, onError)} className="mt-5 w-full rounded-md h-max border border-accent bg-white">
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
            disablePlaceholderValue={true}
            ismultiple={true}
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
          <Select
            required={true}
            control={control}
            label="Type"
            displayEmpty={true}
            name="contact_number_prirority"
            dataArray={[{ label: 'Primary', value: 'primary' }]}
            disablePlaceholderValue={true}
          />
          <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {
              fields.map((field, index) => (
                <div
                  id={`${inputFieldName}_${index}`}
                  className="w-full flex gap-x-2 items-center justify-between px-1"
                  key={field.id}
                >
                  <Controller
                    control={control}
                    name="contact_number"
                    render={({ field: { onChange: Oc, ...rest }, fieldState: { error } }: any) => (
                      <FormControl
                        fullWidth={true}
                        variant="standard"
                        error={!!error}>
                        <Typography
                          className={`capitalize w-full flex-1 pb-3.5 ${error?.[index] ? 'text-red-600' : ''}`}
                          variant="caption"
                          display="block"
                        >
                          Contact Number
                        </Typography>
                        <MuiInput
                          disableUnderline={true}
                          value={watch(`contact_number[${index}].number`)}
                          onChange={(vv: any) => {
                            const tg = vv?.target?.value;
                            setValue(`contact_number[${index}].number`, tg);
                            if (tg) {
                              clearErrors(`contact_number[${index}].number`);
                            }
                          }}
                          sx={{
                            height: '40px',
                            backgroundColor: 'white',
                            borderRadius: '4px',
                            border: `1px solid ${error?.[index] ? 'red' : 'var(--linegray)'}`,
                            paddingRight: '4px',
                            overflow: 'hidden'
                          }}
                          startAdornment={
                            <InputAdornment position="start">
                              <MuiSelect
                                value={watch(`contact_number[${index}].country_code`)}
                                onChange={(vv: any) => {
                                  const tg = vv?.target?.value;
                                  if (tg) {
                                    setValue(`contact_number[${index}].country_code`, tg);
                                    clearErrors(`contact_number[${index}].country_code`);
                                  }
                                }}
                                IconComponent={DropDownArrow}
                                sx={{
                                  width: 'max-content',
                                  height: '40px',
                                  flexGrow: 1,
                                  background: error?.[index]?.country_code ? 'rgba(255,0,0,0.3)' : 'var(--sandgray)',
                                  position: 'relative',
                                  top: '0px',
                                  left: '0px',
                                  fieldset: {
                                    border: 'none'
                                  },
                                  '&:hover': {
                                    background: error?.[index]?.country_code ? 'rgba(255,0,0,0.6)' : 'var(--linegray)'
                                  }
                                }}
                              >
                                {
                                  codes.map((e: any) => (
                                    <MenuItem
                                      key={`${e?.countryCodes[0]}_${field.id}` || e}
                                      value={e?.countryCodes[0] || e || ''}
                                    >
                                      <em>{`${e?.country} : +${e?.countryCodes[0]}`}</em>
                                    </MenuItem>
                                  ))
                                }
                              </MuiSelect>
                            </InputAdornment>
                          }
                        />
                        {error?.[index] && (
                          <Typography
                            className="text-red-600"
                            variant="caption"
                            display="block"
                          >
                            {error?.[index]?.number?.message || error?.[index]?.country_code?.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                  {/* <Input
                    required={true}
                    control={control}
                    type="number"
                    name={`${inputFieldName}[${index}].number`}
                    label="Contact Number"
                  /> */}
                  {
                    (fields.length > 1) && (
                      <div role="presentation" onClick={() => removeHandler(index)} className=" mt-8 h-8 w-9 grid place-items-center text-xl hover:bg-gray-300 rounded-full bg-gray-200 hover:cursor-pointer">-</div>
                    )
                  }
                </div>
              ))
            }
          </div>
          {/* <Input
              required={true}
              control={control}
              type="number"
              label="Contact Number"
              name="contact_number"
            /> */}
        </div>
        <div className="px-5">
          <Button type="button" onClick={addNew}>
            Add
          </Button>
        </div>
        <hr className="my-2" />
        <div className="p-5">
          <TextEditor
            name="sms_body"
            required={true}
            control={control}
          />
        </div>

        <div className="py-8 float-right space-x-5 px-5">
          <Button
            variant="outlined"
            type="button"
            onClick={() => navigate('/notification/sms-notification')}
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
