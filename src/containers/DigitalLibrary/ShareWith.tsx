import { useEffect, useState } from 'react';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import Wrapper from '@shared/wrapper/Wrapper';
import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import { COMPONENTS, MY_FILES } from '@constants/constants';
import { useGet, useDelete } from '@shared/api/useApi';
import { selectUser } from '@shared/store/userSlice';
import { useSelector } from 'react-redux';
import toast from '@shared/toast';

const digitalLibraryServiceUrl = import.meta.env.VITE_APP_DIGITAL_LIBRARY_SERVICE_URL;

type ShareWithType = { refetchNestedFolderList: any; folderID: string; folderName: string | undefined; refetchFolderList: any; refetchSharedFiles: any; selectedFolderFileId: number | undefined; selectedfileType: string; isOpen: boolean; title: string; setOpen: (isOpen: boolean) => void }

const TableColumns = [
  {
    label: 'First Name',
    mapper: 'first_name'
  },
  {
    label: 'Last Name',
    mapper: 'last_name'
  },
  {
    component: COMPONENTS?.delete,
    showInHeader: false
  }
];

type tableInfoType = { first_name: string; last_name: string; user_id: number }

const ShareWith = ({ isOpen, title, setOpen, selectedFolderFileId, selectedfileType, refetchSharedFiles, refetchFolderList, folderName, folderID, refetchNestedFolderList } : ShareWithType) => {
  const [tableData, setTableData] = useState<tableInfoType[]>([]);
  const { userId } = useSelector(selectUser);
  const [selectedUserId, setSelectedUserId] = useState();

  const { refetch: refetchFolderAccess } = useGet({
    baseURL: digitalLibraryServiceUrl,
    url: `digital-library/folder-access/${selectedFolderFileId}/`,
    onSuccess: (res: any) => {
      const tableInfo = res?.data?.response?.results;
      setTableData([...tableInfo]);
    },
    onError: ({ response }: any) => {},
    enabled: !!(isOpen && selectedFolderFileId && selectedfileType === 'Folder')
  });

  const { refetch: refetchFileAccess } : any = useGet({
    baseURL: digitalLibraryServiceUrl,
    url: `digital-library/file-access/${selectedFolderFileId}/`,
    onSuccess: (res: any) => {
      const tableInfo = res?.data?.response?.results;
      setTableData([...tableInfo]);
    },
    onError: ({ response }: any) => {},
    enabled: !!(isOpen && selectedFolderFileId && selectedfileType === 'File')
  });

  const refreshHandler = () => {
    setSelectedUserId(undefined);
    if (folderName === MY_FILES) {
      if (folderID) {
        refetchNestedFolderList();
      } else {
        refetchFolderList();
      }
    } else {
      refetchSharedFiles();
    }
  };

  const { isLoading: multipleDownloadLoading, mutate: deleteFolderAccess } = useDelete({
    baseURL: digitalLibraryServiceUrl,
    url: `digital-library/access/user_id/${selectedUserId}/folder/${selectedFolderFileId}/delete/`,
    onSuccess: (response: any) => {
      if (selectedfileType === 'Folder') {
        refetchFolderAccess();
      }
      toast('success', response?.data?.message);
      refreshHandler();
    },
    onError: ({ response }: any) => {
      toast('error', 'Error');
      setSelectedUserId(undefined);
    }
  });

  const { isLoading: multipleFileDownloadLoading, mutate: deleteFileAccess } = useDelete({
    baseURL: digitalLibraryServiceUrl,
    url: `digital-library/access/user_id/${selectedUserId}/file/${selectedFolderFileId}/delete/`,
    onSuccess: (response: any) => {
      if (selectedfileType === 'File') {
        refetchFileAccess();
      }
      toast('success', response?.data?.message);
      refreshHandler();
    },
    onError: ({ response }: any) => {
      toast('error', 'Error');
      setSelectedUserId(undefined);
    }
  });

  const deleteHandler = (val: any) => {
    setSelectedUserId(val?.user_id);
  };

  useEffect(() => {
    if (selectedUserId) {
      if (selectedfileType === 'File') {
        deleteFileAccess(selectedUserId);
      }
      if (selectedfileType === 'Folder') {
        deleteFolderAccess(selectedUserId);
      }
    }
  }, [selectedUserId]);

  return (
    <CustomizedDialogs
      onclose={() => { setOpen(false); }}
      open={isOpen}
      setOpen={() => { setOpen(false); }}
      title={title}
      maxwidth="sm"
    >
      <div className="wrapperBorder mt-3">
        <Wrapper>
          <AdvanceTable
            tableData={tableData}
            headerRows={TableColumns}
            deleteHandler={deleteHandler}
          />
        </Wrapper>
      </div>
    </CustomizedDialogs>
  );
};

export default ShareWith;
