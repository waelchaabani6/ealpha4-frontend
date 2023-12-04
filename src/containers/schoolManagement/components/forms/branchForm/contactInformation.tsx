/* eslint-disable no-console */
import Button from '@component/button/button';
import Input from '@shared/form/Input';
import Select from '@shared/form/Select';
import React, { useCallback } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

export default function ContactInformation({ name }: { name: string }) {
  const { control, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name
  });
  const addNew = useCallback((ev: React.MouseEvent) => {
    ev.stopPropagation();
    append({
      contact_name: '',
      contact_email: '',
      contact_email_alternate: '',
      contact_mobile: '',
      contact_mobile_alternate: '',
      contact_designation: '',
      contact_others: ''
    });
    document.getElementById(`${name}_${fields.length - 1}`)?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [fields]);
  const removeHandler = (index: number) => {
    remove(index);
    document.getElementById(`${name}_${index - 1}`)?.scrollIntoView();
  };

  return (
    <>
      <div className="w-full h-max border border-accent rounded-md p-6 overflow-auto">
        <h4 className="text-base text-accent font-bold pb-4">Contact Information</h4>
        {
          fields.map((field, index) => (
            <React.Fragment key={field.id}>
              <div
                id={`${name}_${index}`}
                className="grid grid-cols-1 md:grid-cols-3 content-center gap-y-3 md:gap-x-6"
              >
                <Input
                  control={control}
                  name={`${name}[${index}].contact_name`}
                  label="Name"
                  required={true}
                />
                <Input
                  control={control}
                  name={`${name}[${index}].contact_email`}
                  label="Email ID"
                  required={true}
                />
                <Input
                  control={control}
                  name={`${name}[${index}].contact_email_alternate`}
                  label="Alternate Email ID"
                />
                <Input
                  control={control}
                  name={`${name}[${index}].contact_mobile`}
                  label="Mobile No."
                  required={true}
                  type="number"
                />
                <Input
                  control={control}
                  name={`${name}[${index}].contact_mobile_alternate`}
                  label="Alternate Mobile No."
                />
                <Select
                  disablePlaceholderValue={true}
                  control={control}
                  name={`${name}[${index}].contact_designation`}
                  label="Designation"
                  dataArray={[
                    { label: 'Accountant', value: 'accountant' },
                    { label: 'Finance', value: 'finance' },
                    { label: 'Key Account Manager', value: 'key_account_manager' },
                    { label: 'Others', value: 'others' },
                    { label: 'Principal', value: 'principal' }
                  ]}
                />
                {
                  watch(`${name}[${index}].contact_designation`) === 'others' && (
                    <>
                      <div className="hidden md:block" />
                      <div className="hidden md:block" />
                      <Input
                        control={control}
                        name={`${name}[${index}].contact_others`}
                        label="Others"
                      />
                    </>
                  )
                }
                {
                  (index > 0) && (
                    <div className="col-span-3 flex justify-end items-center">
                      <p
                        role="presentation"
                        onClick={() => removeHandler(index)}
                        className="w-8 h-8 grid place-items-center text-white text-2xl cursor-pointer
                   font-bold rounded-full bg-red-500"
                      >
                        -
                      </p>
                    </div>
                  )
                }

              </div>
              {
                (fields.length > 1 && index !== fields.length - 1) && (
                  <>
                    <br />
                    <hr />
                    <br />
                  </>
                )
              }

            </React.Fragment>
          ))
        }
      </div>
      <div className="flex justify-end w-full">
        <Button type="button" onClick={addNew}>Add Alternative Contact</Button>
      </div>
    </>
  );
}
