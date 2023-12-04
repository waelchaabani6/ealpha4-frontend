import CheckBox from '@shared/form/Checkbox';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useRef } from 'react';
import Select from '@shared/form/Select';
import FileSelect from '@component/fileUpload';
import TextArea from '@shared/form/TextArea';

export default function FormAndAttachment() {
  const fileRef = useRef();
  const { control, setValue, setError, watch, clearErrors } = useFormContext();
  const name = 'academic_information';
  const { fields, append } = useFieldArray({
    control,
    name
  });

  const onChange = (files: FileList | File[]) => {
    if (files.length > 0) {
      const fileData = Array.from(files)?.map((item: File, index: number) => ({
        sr_no: (watch('documents') && watch('documents').length > 0) ? watch('documents').length + (index + 1) : index + 1,
        document_name: item.name,
        file: item,
        document_ting: `${item.name}_${index}`
      }));
      setValue('documents', [...watch('documents'), ...fileData]);
    }
  };

  return (
    <div className="w-full h-max p-6 overflow-auto">
      <div className="w-1/2">
        <Select
          control={control}
          name="assignment_name"
          label="Assignment Title"
          dataArray={[
            { label: 'Finance', value: 'finance' },
            { label: 'Principal', value: 'principal' },
            { label: 'Accountant', value: 'accountant' },
            { label: 'Key Account Manager', value: 'key_account_manager' },
            { label: 'Others', value: 'others' }
          ]}
        />
      </div>
      <div className="flex mt-2">
        <div className="grow">
          <Select
            control={control}
            name="select_type"
            label="Select Type"
            dataArray={[
              { label: 'Accountant', value: 'accountant' },
              { label: 'Finance', value: 'finance' },
              { label: 'Key Account Manager', value: 'key_account_manager' },
              { label: 'Principal', value: 'principal' },
              { label: 'Others', value: 'others' }
            ]}
          />
        </div>

        <div className="grow ml-3">
          <Select
            control={control}
            name="select_class"
            label="Select Class"
            dataArray={[
              { label: 'Finance', value: 'finance' },
              { label: 'Principal', value: 'principal' },
              { label: 'Accountant', value: 'accountant' },
              { label: 'Key Account Manager', value: 'key_account_manager' },
              { label: 'Others', value: 'others' }
            ]}
          />
        </div>
      </div>
      <div className="flex my-5">
        <div className="w-1/2">
          <CheckBox control={control} name="single_access" label="Single Access" />
        </div>
        <div className="w-1/2">
          <CheckBox control={control} name="block_access" label="Block Access after Due Date" />
        </div>
      </div>
      <div>
        <h4 className="text-base text-black font-bold pb-4">Attach Your Files</h4>
        <div className="min-h-[100px]">
          <FileSelect
            ref={fileRef}
            onChange={onChange}
          />
        </div>
      </div>
      <div>
        <h4 className="text-base text-black font-bold pb-4">Comments</h4>
        <TextArea control={control} name="comments" />
      </div>
      {/* <div className="w-full grid grid-cols-1 md:grid-cols-2 content-center gap-y-3 md:gap-x-6">
        <div>
          <h4 className="text-base text-black font-bold pb-4">Attach Your Files</h4>
          <div className="min-h-[100px]">
            <FileSelect
              ref={fileRef}
              onChange={onChange}
            />
          </div>
        </div>
        <div>
          <h4 className="text-base text-black font-bold pb-4">Comments</h4>
          <TextArea control={control} name="comments" />
        </div>
      </div> */}
    </div>
  );
}
