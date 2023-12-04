import Button from '@component/button/button';
import LazyLoadingList from '@component/LazyLoadingList/LazyLoadingList';
import { Typography } from '@mui/material';
import Loader from '@shared/loader';
import DeletePopup from '@shared/DeletePopup';
import { useCallback, useEffect, useState } from 'react';
import { useDelete, usePatch } from '@shared/api/useApi';
import toast from '@shared/toast';
import { AxiosResponse } from 'axios';
import EditListDialog from './EditListDIalog';

type DT = { label: string; value: string | boolean | number };
type Props = {
  selection: string | null;
  isLoading: boolean;
  dataArray: DT[] | [];
  hasMore: boolean;
  fetchMore: () => void;
  deleteFromArray: (arr: (number | string)[]) => void;
  length?: number;
  selectionList?: any;
  fetchList?: any;
  setDataArray?: any;
  shouldReset: boolean;
  setshouldReset: any;
}

export default function AddedList(props: Props) {
  const { shouldReset, setshouldReset } = props;
  const [checkedData, setCheckedData] = useState<(string | number)[] | []>([]);
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
  const [playloadData, setplayloadData] = useState<any>({});
  const [editDialog, setEditDialog] = useState<boolean>(false);

  // -------------------------API------------------------------------------------------
  const { isLoading: deleteLoading, mutate } = useDelete({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: 'course-code-service/courses/bulk-content/delete/',
    onSuccess: (res: AxiosResponse) => {
      toggleModal();
      const tmp = [...checkedData];
      props.deleteFromArray(tmp);
      setCheckedData([]);
      toast('success', `${props?.selection} item deleted successfully`);
    }
  });

  // Update List
  const { isLoading: loadingListItem, mutate: mutateListItem } = usePatch({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/content/${playloadData?.value}/`,
    onSuccess: (response: any) => {
      reset();
      toast('success', `${props?.selection} item updated successfully`);
    },
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
    }
  });
  // ---------------------------END API-------------------------------------------

  const deleteHandler = () => mutate({ content_list: checkedData } as any);

  const toggleModal = useCallback(() => {
    setDeleteDialog((prev: boolean) => !prev);
  }, []);

  const updateListItem = (data: any) => {
    if (data) {
      const findC = props?.selectionList.find((i: any) => i?.label === props?.selection);
      const payload = {
        content: data || '',
        selection: findC?.value || ''
      };
      mutateListItem(payload);
    }
  };
  useEffect(() => {
    if (Object.keys(playloadData).length) {
      setEditDialog(true);
    } else {
      setEditDialog(false);
    }
  }, [editDialog, playloadData]);

  const reset = () => {
    setplayloadData({});
    props?.setDataArray([]);
    props?.fetchList();
  };

  useEffect(() => {
    if (shouldReset) {
      props?.setDataArray([]);
      setCheckedData([]);
    }
  }, [shouldReset]);

  return (
    <div
      className="overflow-hidden border border-linegray shadow-md rounded p-4 h-[400px] md:h-full w-full flex flex-col justify-between gap-y-1"
    >
      <div className="">
        <p className="text-lg font-semibold">Added List</p>
        {
          props.selection && <Typography variant="caption">{`Added ${props.selection}`}</Typography>
        }
      </div>
      {
        props.dataArray.length < 1 && props.isLoading
          ? <Loader size={40} />
          : (
            <>
              <div className="h-full w-full overflow-hidden">
                {
                  props.dataArray.length > 0
                    ? (
                      <LazyLoadingList
                        cusHeight="100%"
                        data={props.dataArray}
                        checkedData={checkedData}
                        setCheckedData={setCheckedData}
                        fetchData={props.fetchMore}
                        hasMore={props.hasMore}
                        length={props?.length}
                        editHandler={(rowData: any) => setplayloadData(rowData)}
                      />
                    )
                    : <p className="font-semibold">No Data</p>
                }
              </div>
              {
                !deleteDialog && (
                  <div className="self-end flex items-end gap-x-4 pt-4">
                    <Button
                      type="button"
                      onClick={toggleModal}
                      disabled={checkedData.length < 1}
                    >
                      Delete
                    </Button>
                  </div>
                )
              }
            </>
          )
      }
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
        callUpdateAPI={updateListItem}
        isLoading={loadingListItem}
        playloadData={playloadData}
        onclose={reset}
      />
    </div>
  );
}
