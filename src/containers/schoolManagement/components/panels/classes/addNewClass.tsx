import RouteLayout from '@layout/routeLayout';
import PageTitle from '@shared/pageTitle';
import React, { useEffect, useState } from 'react';
import { useGet, usePatch, usePost } from '@shared/api/useApi';
import { useParams } from 'react-router-dom';
import Input, { CustomInput } from '@component/input';
import Select from '@component/dropdown/select';
import Loader from '@shared/loader';
import Button from '@component/button/button';
import toast from '@shared/toast';
import { selectSchoolData } from '@shared/store/schoolSlice';
import { useSelector } from 'react-redux';
import { NAME_REGEX } from '@constants/constants';

type Props = {
  title?: string;
  editData: any;
  closeDialog: () => void;
  branchArray: any;
}

export default function AddNewClass(props: Props) {
  const { id, branchId: branchID } = useParams();
  const [branchId, setBranchId] = useState<string | undefined>(branchID || '');
  const { branchData } = useSelector(selectSchoolData);
  const [error, setError] = useState<string | undefined>('');
  const [existingClassIndex, setExistingClassIndex] = useState<number>(-1);
  const [newClassName, setNewClassName] = useState<string>('');

  const onChangeHandler = (event: any) => {
    setBranchId(event.target.value);
  };

  const clsNameValidator = () => {
    const index = classList?.data?.response?.findIndex((ele: any) => ele.name.toLowerCase() === newClassName?.toLowerCase());
    setExistingClassIndex(index);
    if (index > -1) {
      setError('');
    } else {
      setError(undefined);
    }
  };

  const { isLoading: schoolDataLoading, data: schoolData, isSuccess } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-classes/${props?.editData?.school_class_ting}/details/`,
    enabled: !!props.editData
  });

  const newBranchArray = props?.branchArray?.map((ele: any) => ({ label: ele?.label, value: ele?.id || ele?.value }));

  const { isLoading: classListLoading, data: classList } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-classes/existing-class-list/?branch_id=${branchId || ''}&school_id=${id || branchData?.school_data?.id}`,
    enabled: !!branchId || branchData?.id
  });
  const inputChangeHandler = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const newName = ev.target.value;

    const trimmedText = newName.toLowerCase().trim();
    const index = classList?.data?.response?.findIndex((ele: any) => {
      const curText = ele.name.toLowerCase();
      return curText === trimmedText && trimmedText !== (props?.editData?.name || '').toLowerCase().trim();
    });
    setExistingClassIndex(index);

    if (index >= 0) {
      setError('Class Already Exist.');
    }
    if (!newName.match(NAME_REGEX)) {
      setError('Class name should contain only numbers, letters and spaces');
    }
    setNewClassName(newName);
    if (newName.length > 10) {
      setError('maximum limit 10');
    }
  };

  const { isLoading, mutate: addNewClass } = usePost({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: 'schools-service/school-classes/',
    onSuccess: (res: any) => {
      toast('success', 'School Class Created');
      props.closeDialog();
    },
    onError: () => {
      setError('Class Already Exist.');
      toast('error', 'Error');
    }
  });

  const { isLoading: classUpdateLoading, mutate: updateClass } = usePatch({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-classes/${props?.editData?.school_class_ting}/edit/`,
    onSuccess: (res: any) => {
      toast('success', 'School Class Updated');
      props.closeDialog();
    },
    onError: () => {
      setError('Class Already Exist.');
      toast('error', 'Error');
    }
  });

  const onAddHandler = () => {
    // if (props.branchArray.length > 1 && !branchId) {
    //   toast('error', 'Please select a branch');
    // } else {
    // }
    const dt = {
      name: newClassName,
      school_id: id || branchData?.school_data?.id,
      branch_id: branchId || undefined
    };

    if (props?.editData) {
      updateClass(dt);
    } else {
      addNewClass(dt);
    }
  };

  useEffect(() => {
    clsNameValidator();
  }, [classList]);

  useEffect(() => {
    setNewClassName(props?.editData?.name || '');
  }, [props.editData]);

  useEffect(() => {
    if (isSuccess) {
      setBranchId(schoolData?.data?.response.branch_id);
    }
  }, [isSuccess]);

  const trimmedText = newClassName.toLowerCase().trim();
  const actionDisabled = !!(trimmedText === '' || error || trimmedText === (props?.editData?.name || '').toLowerCase().trim());

  return (
    <RouteLayout navBack={false}>
      <>
        <PageTitle title={props?.title || ''} />
        <div className="flex flex-col gap-y-4 my-4">
          {props?.branchArray?.length > 1 && !branchID && (
            <div>
              <p>Branch Name</p>
              <Select
                variant="outlined" // Add this line to provide the variant prop
                disabledAll={true}
                disabled={!!props?.editData}
                value={branchId || ''}
                onChange={onChangeHandler}
                loading={false}
                dataarray={newBranchArray}
              />
            </div>
          )}
          <div>
            <p className="pb-4">
              Class Name
              {' '}
              <span className="text-red-600">*</span>
            </p>
            <CustomInput size="small" error={!!error} fullWidth={true} value={newClassName} onChange={inputChangeHandler} required={true} />
            <p className="mt-1 text-xs text-red-500">{error}</p>
          </div>
          <div className="flex justify-end">
            <Button className="capitalize" loading={isLoading || classUpdateLoading} disabled={actionDisabled} onClick={onAddHandler}>{props?.editData ? 'Update' : 'Add'}</Button>
          </div>
        </div>
        <hr />
        {!props?.editData ? (
          <div className={`mt-4 h-[200px] w-full border grid ${(!classListLoading && ((classList as any)?.data?.response.length > 0)) ? 'grid-cols-4 gap-4' : 'place-items-center'}  px-10 py-4 overflow-auto rounded`}>
            {classListLoading ? (
              <div className="w-full">
                <Loader />
              </div>
            ) : classList?.data?.response.length > 0 ? (!!classList?.data?.response && classList?.data?.response?.map((ele: any) => ({ name: ele.name, value: id })).map((cls: { id: number; name: string }, index: number) => (
              <button
                key={cls.id}
                type="button"
                className={`text-sm h-[40px] border
                border-t-0 border-l-0 border-r-0 border-b-2  border-[#D2D2D2] ${index === existingClassIndex ? 'bg-gray-200' : ''}`}
              >
                {cls.name}
              </button>
            ))) : (
              <p>Add New Class</p>
            )}
          </div>
        ) : null}
      </>
    </RouteLayout>
  );
}
