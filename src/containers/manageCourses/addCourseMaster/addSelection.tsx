import Button from '@component/button/button';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDelete, usePatch, usePost } from '@shared/api/useApi';
import Input from '@shared/form/Input';
import toast from '@shared/toast';
import { ReactComponent as Edit } from '@images/longMenuIcons/Edit.svg';
import { AxiosError, AxiosResponse } from 'axios';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useCallback, useEffect, useState } from 'react';
import Checkbox from '@component/checkbox';
import { FormControlLabel } from '@mui/material';
import DeletePopup from '@shared/DeletePopup';
import { addCategorySchema } from './schema';
import EditListDialog from './EditListDIalog';

interface FormInput {
  category: string;
}
type Props = {
  updatelist: () => void;
  dataArray: any;
  shouldReset: boolean;
  setshouldReset: any;
}

export default function AddSelection(props: Props) {
  const { dataArray, updatelist, shouldReset, setshouldReset } = props;
  const { control, handleSubmit, reset, setError } = useForm<FormInput>({
    resolver: yupResolver(addCategorySchema)
  });

  const [checkedData, setCheckedData] = useState<any>([]);
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
  const [playloadData, setplayloadData] = useState<any>({});
  const [editDialog, setEditDialog] = useState<boolean>(false);

  // -------------------------API------------------------------------------------------
  const { isLoading, mutate } = usePost({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: 'course-code-service/courses/selection/',
    onSuccess: (res: AxiosResponse) => {
      reset();
      updatelist();
      toast('success', res?.data.message);
    },
    onError: (err: AxiosError) => {
      const { errors } = err?.response?.data as { errors: any };
      setError('name' as any, { message: errors?.name[0] }, { shouldFocus: true });
    }
  });
  const { isLoading: deleteLoading, mutate: bulkDelete } = useDelete({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: 'course-code-service/courses/bulk-selection/delete/',
    onSuccess: (res: AxiosResponse) => {
      setshouldReset(true);
      updatelist();
      toggleModal();
      setCheckedData([]);
      toast('success', 'Selection deleted successfully');
    }
  });

  // Update List
  const { isLoading: loadingListItem, mutate: mutateListItem } = usePatch({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/selection/${playloadData?.value}/`,
    onSuccess: (response: any) => {
      updatelist();
      reset();
      setplayloadData({});
      toast('success', 'Selection updated successfully');
    },
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
    }
  });
  // ---------------------------END API-------------------------------------------

  const onSubmit: SubmitHandler<FormInput> = (values) => {
    return false;
    mutate(values);
  };

  const onCheckboxSelect = useCallback((value: string | number) => {
    if (checkedData.includes(value)) {
      setCheckedData(checkedData.filter((ele: string | number) => ele !== value));
    } else {
      setCheckedData([...checkedData, value]);
    }
  }, [checkedData]);

  const deleteHandler = () => bulkDelete({ selection_list: checkedData } as any);

  const toggleModal = useCallback(() => {
    setDeleteDialog((prev: boolean) => !prev);
  }, []);

  const resets = () => {
    setplayloadData({});
  };

  const handleCallAPI = (data: any) => {
    mutateListItem({
      name: data
    });
  };

  useEffect(() => {
    if (Object.keys(playloadData).length) {
      setEditDialog(true);
    } else {
      setEditDialog(false);
    }
  }, [editDialog, playloadData]);

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="border border-linegray shadow-md rounded p-4 flex flex-col justify-between gap-y-1"
      >
        <div className="flex-1">
          {/* <p className="text-lg font-semibold pb-11">Add Selection</p>
          <Input control={control} name="name" placeholder="eg. Category" /> */}
          <div>
            {/* <hr /> */}
            <p className="text-lg font-semibold pb-5">Selection List</p>
            <div className="w-full overflow-auto h-[360px]">
              {
                dataArray?.map((item: any) => {
                  const checked = checkedData.includes(item?.value);
                  return (
                    <div key={item?.value} className="flex items-center justify-between">
                      <li>{item.label}</li>
                      {/* <p className="text-sm font-semibold py-2">{item.label}</p> */}
                      {/* <FormControlLabel
                        key={item.id}
                        className="hover:bg-gray-100"
                        control={(
                          <Checkbox checked={checked} size="small" onChange={() => onCheckboxSelect(+item.value)} />
                        )}
                        label={<p className="text-sm font-semibold">{item.label}</p>}
                      /> */}
                      {/* <span role="button" tabIndex={0} onClick={() => setplayloadData(item)}>
                        <Edit width="50px" height="20px" style={{ color: 'red' }} />
                      </span> */}
                    </div>
                  );
                })
              }
            </div>
          </div>
        </div>
        <div className="self-end pt-4">
          {/* Will be enabled in the future */}
          {/* <Button
            type="button"
            onClick={toggleModal}
            disabled={checkedData.length < 1}
          >
            Delete
          </Button>
          {' '}
          <Button
            loading={isLoading}
            disabled={isLoading}
          >
            Add
          </Button> */}
        </div>
      </form>
      <DeletePopup
        title="Delete"
        description="Are you sure you want to Delete the Data?"
        open={deleteDialog}
        setOpen={toggleModal}
        handleDelete={deleteHandler}
        isLoading={deleteLoading}
      />
      <EditListDialog
        title="Update"
        open={editDialog}
        setOpen={setEditDialog}
        callUpdateAPI={handleCallAPI}
        isLoading={loadingListItem}
        playloadData={playloadData}
        onclose={resets}
      />
    </>
  );
}
