/* eslint-disable no-console */
import Select from '@shared/form/Select';
import { useFieldArray } from 'react-hook-form';
import Input from '@shared/form/Input';
import { useParams } from 'react-router-dom';
import React, { useContext, useState } from 'react';
import { selectSchoolData } from '@shared/store/schoolSlice';
import { useSelector } from 'react-redux';
import { FormControlLabel } from '@mui/material';
import CheckBox from '@shared/form/Checkbox';
import { useGet } from '@shared/api/useApi';
import { CreateContext } from '../../createNewSchool';

export default function ThirdPartyIntegration({ methods, setSelectedbranchId, isEdit }: any) {
  const { id: schoolId } = useParams();
  const context = useContext(CreateContext);
  const { branchData } = useSelector(selectSchoolData);
  const { control, watch, setValue } = methods;
  const name = 'third_party_integrations';
  const [classArray, setClassArray] = useState([]);
  const schoolServiceBaseURL = import.meta.env.VITE_APP_SCHOOL_SERVICE_URL;

  const { fields } = useFieldArray({
    control,
    name
  });

  const { data: branchList, isLoading: branchListLoading } = useGet({
    baseURL: schoolServiceBaseURL,
    url: `schools-service/school-branches/branch-list/?school_id=${context?.contextData?.schoolData?.id || branchData?.school_data?.id || schoolId}`
  });

  const { isLoading: classLoading, refetch: mutateClass, isRefetching: classFetching } = useGet({
    baseURL: schoolServiceBaseURL,
    url: `schools-service/school-classes/?limit=1000&school_id=${context?.contextData?.schoolData?.id || branchData?.school_data?.id || schoolId}&branch_name=${branchList?.data?.response?.find((obj: any) => obj?.id === watch('branch'))?.name || branchData?.name}`,
    onSuccess: (res: any) => {
      const resp = res?.data?.response?.results;
      const body: any = [];
      resp?.map((i: any) => {
        body.push(
          {
            id: i?.id,
            label: i?.name,
            value: i?.name
          }
        );
        return true;
      });
      setClassArray(body);
    },
    enabled: !!watch('branch') && isEdit
  });

  return (
    <div
      className="w-full h-max border border-accent rounded-md p-6 overflow-auto"
    >
      <h4 className="text-base text-accent font-bold pb-4">Third Party Integration</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 content-center gap-y-3 md:gap-x-6">
        <Select
          control={control}
          name="branch"
          label="Select Branch"
          loading={branchListLoading}
          dataArray={branchList?.data?.response?.map((ele: any) => ({
            label: ele?.name,
            value: ele?.id
          }))}
          onChange={(e: any) => { setValue('branch', e.target.value); setSelectedbranchId(e.target.value); }}
          disablePlaceholderValue={true}
        />
      </div>
      {
        fields.map((field, index) => (
          <div key={field.id}>
            <div className="flex items-center py-3">
              <FormControlLabel
                control={(
                  <CheckBox
                    control={control}
                    name={`${name}[${index}].flag`}
                  />
                )}
                label={<h4 className="pt-4 text-base text-accent font-bold pb-4">{watch(`${name}[${index}].name`)}</h4>}
              />
              <img src={watch(`${name}[${index}].logo`)} alt={watch(`${name}[${index}].logo`)?.split('/')?.pop() || ''} width="8%" />
            </div>
            <div
              className={`grid grid-cols-1 
              ${watch(`${name}[${index}].name`) !== 'Email Integration' ? 'md:grid-cols-4' : 'md:grid-cols-3'} 
               content-center gap-y-3 md:gap-x-6`}
            >
              {
                isEdit ? (<Select
                  control={control}
                  name={`${name}[${index}].classes`}
                  label="Class"
                  dataArray={classArray}
                  loading={classLoading}
                  onChange={(e: any) => {
                    const selectedValues = e.target.value;
                    setValue(`${name}[${index}].classes`, selectedValues);
                    const selectedOptionsArray = selectedValues.map((value: any) => {
                      const selectedOption: any = classArray.find((option: any) => option.value === value);
                      return {
                        name: selectedOption?.label,
                        class_id: selectedOption?.id
                      };
                    });
                    setValue(`${name}[${index}].classesArray`, selectedOptionsArray);
                  }}
                  disablePlaceholderValue={true}
                  ismultiple={true}
                />) : ''
              }
              <Select
                control={control}
                name={`${name}[${index}].role`}
                label="Role"
                dataArray={[
                  { label: 'Student', value: 'student' },
                  { label: 'Teacher', value: 'teacher' },
                  { label: 'Branch Admin', value: 'branch_admin' },
                  { label: 'School Admin', value: 'school_admin' }
                ]}
                disablePlaceholderValue={true}
                ismultiple={true}
              />
              <Input
                control={control}
                name={`${name}[${index}].number_of_licenses`}
                label="No. Licence"
              />
            </div>
          </div>
        ))
      }
    </div>
  );
}
