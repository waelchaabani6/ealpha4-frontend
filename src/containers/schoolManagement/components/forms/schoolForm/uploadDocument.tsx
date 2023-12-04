/* eslint-disable no-console */
import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import FileSelect from '@component/fileUpload';
import { COMPONENTS, TABLE_LABELS } from '@constants/constants';
import { ReactComponent as Eye } from '@images/eye.svg';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDelete } from '@shared/api/useApi';
import Loader from '@shared/loader';
import toast from '@shared/toast';
import Wrapper from '@shared/wrapper/Wrapper';
import { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';

type FileArrayType = {
  sr_no: number;
  name: string;
  file: File;
}

export default function UploadDocuments() {
  const fileRef = useRef();
  const { setValue, watch } = useFormContext();
  const [deleteDocId, setDeleteDocId] = useState<string | false>(false);

  const { isLoading: deleteLoading, mutate: deleteFile } = useDelete({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/schools/documents/${deleteDocId}/delete/`,
    onSuccess: ({ res }: any) => {
      setValue('documents', watch('documents').filter((ele: any) => ele.school_document_ting !== deleteDocId));
      setDeleteDocId(false);
      toast('success', 'File Deleted');
    },
    onError: () => {
      toast('error', 'Something went wrong');
    },
    enabled: !!deleteDocId
  });

  useEffect(() => {
    if (deleteDocId) {
      deleteFile();
    }
  }, [deleteDocId]);

  const onChange = (files: FileList) => {
    if (files.length > 0) {
      const fileData = Array.from(files).map((item: File, index: number) => ({
        sr_no: (watch('documents') && watch('documents').length > 0) ? watch('documents').length + (index + 1) : index + 1,
        document_name: item.name,
        file: item,
        school_document_ting: `${item.name}_${index}`
      }));
      setValue('documents', [...watch('documents'), ...fileData]);
    }
  };
  const TableColumns = [
    {
      label: 'Sr No.',
      mapper: 'sr_no'
    },
    {
      label: 'Document Name',
      mapper: 'document_name'
    },
    {
      label: TABLE_LABELS?.ACTION,
      component: COMPONENTS?.longmenu
    }
  ];

  const moreMenuOptions = [
    {
      icon: <Eye className="scale-75" />,
      label: 'Preview',
      value: 'preview'
    },
    // {
    //   icon: <PenIcon className="scale-75" />,
    //   label: 'Edit',
    //   value: 'edit'
    // },
    {
      icon: <DeleteIcon className="scale-75" />,
      label: 'Delete',
      value: 'delete'
    }
  ];

  const handleMoreOption = (id: any, rowData: any) => {
    if (id === 'delete') {
      if (typeof rowData.file === 'string') {
        // console.log('server file');
        setDeleteDocId(rowData.school_document_ting);
      } else {
        const dt = watch('documents');
        const updatedDt = dt.filter((ele: FileArrayType) => ele.sr_no !== rowData.sr_no);
        setValue('documents', updatedDt.map((ele: FileArrayType, i: any) => ({ ...ele, sr_no: i + 1 })));
      }
      // setData(data.filter((ele: FileArrayType) => ele.sr_no !== rowData.sr_no));
    }
    if (id === 'preview') {
      if (typeof rowData.file === 'string') {
        window.open(rowData.file);
      } else {
        window.open(URL.createObjectURL(rowData.file));
      }
    }
  };

  return (
    <div className="w-full h-max border border-accent rounded-md p-6 overflow-auto">
      <h4 className="text-base text-accent font-bold pb-4">Upload Documents</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 content-center gap-y-3 sm:gap-x-6">
        <div className="min-h-[180px]">
          <FileSelect
            ref={fileRef}
            onChange={onChange}
          />
        </div>
        <div className="max-h-[180px] overflow-auto">
          {
            !deleteLoading && watch('documents') && watch('documents').length > 0
              ? (
                <Wrapper>
                  <AdvanceTable
                    moreMenuOptions={moreMenuOptions}
                    handleMoreOption={handleMoreOption}
                    headerRows={TableColumns}
                    tableData={watch('documents')}
                  />
                </Wrapper>
              )
              : (
                <div className="bg-sandgray h-full grid place-items-center">
                  {
                    deleteLoading
                      ? <Loader />
                      : <p className="text-xl">No Data</p>
                  }
                </div>
              )
          }
        </div>
      </div>
    </div>
  );
}
