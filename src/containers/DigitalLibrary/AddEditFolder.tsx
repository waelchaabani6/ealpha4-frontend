import { useEffect, useState } from 'react';
import { CustomInput } from '@component/input';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import Dropdown from '@component/dropdown/Dropdown';
import Button from '@component/button/button';
import { useSelector } from 'react-redux';
import { usePost, usePut, useGet } from '@shared/api/useApi';
import toast from '@shared/toast';
import { FILE_TYPES, FOLDER_MODES, USER_TYPE } from '@constants/constants';
import { selectUser } from '@shared/store/userSlice';

const schoolServiceUrl = import.meta.env.VITE_APP_SCHOOL_SERVICE_URL;
const digitalLibraryServiceUrl = import.meta.env.VITE_APP_DIGITAL_LIBRARY_SERVICE_URL;

type AddEditFolder = {
  refetchFolderList: any;
  folderID: string;
  refetchNestedFolderList: any;
  folderMode: string;
  isOpen: boolean;
  title: string;
  setOpen: (isOpen: boolean) => void;
  popupData: any;
  setpopupData: any;
  setLoading: any;
  currentFolderName: string;
};

const AddEditFolder = ({
  isOpen,
  title,
  setOpen,
  folderMode,
  popupData,
  setpopupData,
  refetchFolderList,
  refetchNestedFolderList,
  setLoading,
  folderID = '',
  currentFolderName
}: AddEditFolder) => {
  const [folderName, setFolderName] = useState('');
  const [selectedClass, setSelectedClass] = useState('Select');
  const [classArray, setClassArray] = useState<any>([]);
  const { user } = useSelector((state: any) => state);
  const [folderNameError, setFolderNameError] = useState('');
  const [fileNameError, setFileNameError] = useState('');
  const { role, schoolId, branchId, class_id, branch_name } = useSelector(selectUser);
  const [selectedFolder, setSelectedFolder] = useState<string>('Select');

  const currentFolderList = [{ label: 'My Files', value: 'My Files' }];

  useEffect(() => {
    setFolderName(popupData.folder_name);
  }, [popupData.folder_name]);

  useEffect(() => {
    if (role.name === USER_TYPE.TEACHER) {
      ClassesForTeacher({
        teacher_id: user?.user_profile_id
      });
      setLoading(true);
    }
  }, []);

  useEffect(() => {
    if (currentFolderName) {
      setSelectedFolder(currentFolderName);
    }
  }, [folderID, currentFolderName]);

  useEffect(() => {
    if (role.name === USER_TYPE.STUDENT && class_id) {
      const obj: any = classArray.find((ele: { label: string; id: number }) => Number(ele.id) === Number(class_id));
      setSelectedClass(obj?.label);
    }
  }, [class_id, classArray]);

  const { mutate: createNewFolder } = usePost({
    baseURL: digitalLibraryServiceUrl,
    url: `digital-library/folder/`,
    onSuccess: (resp: any) => {
      setLoading(false);
      toast('success', resp.data.message);
      if (folderID) {
        refetchNestedFolderList();
      } else {
        refetchFolderList();
      }
    },
    onError: ({ response }: any) => {
      setLoading(false);
      toast('error', response?.message || 'Error');
    },
    enabled: false
  });

  const { mutate: updateFolderName } = usePut({
    baseURL: digitalLibraryServiceUrl,
    queryKey: [folderID],
    url: `digital-library/folder/${popupData.id}/update/`,
    onSuccess: (response: any) => {
      setLoading(false);
      if (folderID) {
        refetchNestedFolderList();
      } else {
        refetchFolderList();
      }
      setFolderName('');
      setpopupData({});
      toast('success', response.data.message);
    },
    onError: ({ response }: any) => {
      setLoading(false);
      toast('error', response?.statusText || 'Error');
    },
    enabled: false
  });

  const { mutate: updateFileName } = usePut({
    queryKey: [folderID],
    baseURL: digitalLibraryServiceUrl,
    url: `digital-library/file/${popupData.id}/update/`,
    onSuccess: (response: any) => {
      setLoading(false);
      if (folderID) {
        refetchNestedFolderList();
      } else {
        refetchFolderList();
      }
      setFolderName('');
      setpopupData({});
      toast('success', response.data.message);
    },
    onError: ({ response }: any) => {
      setLoading(false);
      toast('error', response?.statusText || 'Error');
    },
    enabled: false
  });

  useGet({
    baseURL: schoolServiceUrl,
    url: `schools-service/school-classes?school_id=${schoolId}${branch_name ? `&branch_name=${branch_name}` : ''}${branchId ? `&branch_id=${branchId}` : ''}`,
    onSuccess: (resp: any) => {
      const respData = resp?.data?.response?.results;
      const temp2: { label: any; value: any; id: any }[] = [];
      respData?.map((i: any) => {
        temp2.push(
          {
            label: i?.name,
            value: i?.name,
            id: i?.id
          }
        );
        return temp2;
      });
      setClassArray([...temp2]);
    },
    enabled: (role.name === USER_TYPE.STUDENT || role.name === USER_TYPE.SCHOOL_ADMIN || role.name === USER_TYPE.BRANCH_ADMIN)
  });

  const { mutate: ClassesForTeacher } = usePost({
    baseURL: schoolServiceUrl,
    url: `schools-service/school-classes/teacher/assigned-class`,
    onSuccess: (resp: any) => {
      setLoading(false);
      const res = resp?.data?.response;
      const formatArr = res?.map((ele: any) => ({ label: ele.name, value: ele.class_id }))
          || [];
      setClassArray([...formatArr]);
    },
    enabled: false
  });

  const resetErrors = () => {
    setFileNameError('');
    setFolderNameError('');
  };

  const handleOkClick = () => {
    const className = classArray?.find((i: any) => i?.value === selectedClass);
    const errors = [];
    if (folderMode === FOLDER_MODES.ADD) {
      if (folderName === '' || folderName === undefined) {
        setFolderNameError('Please enter folder name');
        errors.push('folder name error');
      }
    } else {
      if (folderName === '' && popupData.file_type === 'folder') {
        setFolderNameError('Please enter folder name');
        errors.push('folder name error');
      } if (folderName === '' && popupData.file_type !== 'folder') {
        setFileNameError('Please enter file name');
        errors.push('file name error');
      }
    }
    if (errors.length !== 0) {
      return;
    }
    if (folderMode === FOLDER_MODES.ADD) {
      createNewFolder({
        parent: folderID,
        folder_name: `${folderName}${className?.label ? `-${className?.label}` : ''}`,
        class_id: selectedClass,
        file_type: 'Folder'
      });
      setLoading(true);
    } else if (folderMode === FOLDER_MODES.EDIT) {
      if (popupData?.file_type === 'folder') {
        updateFolderName({
          folder_name: `${folderName}`
        });
        setLoading(true);
      } else {
        updateFileName({
          file_name: `${folderName}`
        });
        setLoading(true);
      }
    }
    setOpen(false);
    if (role.name !== USER_TYPE.STUDENT) {
      setSelectedClass('Select');
    }
    setFolderName('');
    resetErrors();
    setTimeout(() => {
      setpopupData({});
    }, 0);
  };

  const folderList = [
    { label: selectedFolder, value: selectedFolder }
  ];

  return (
    <CustomizedDialogs
      onclose={() => {
        setOpen(false);
        setFolderName('');
        if (role.name !== USER_TYPE.STUDENT) {
          setSelectedClass('Select');
        }
        resetErrors();
        setTimeout(() => {
          setpopupData({});
        }, 0);
      }}
      open={isOpen}
      setOpen={() => {
        setOpen(false);
      }}
      title={
        folderMode === FOLDER_MODES.ADD
          ? FOLDER_MODES.ADD_FOLDER
          : popupData?.file_type === 'folder'
            ? FOLDER_MODES.EDIT_FOLDER
            : FOLDER_MODES.EDIT_FILE
      }
      maxwidth="sm"
    >
      <div className="text-center">
        {!currentFolderName && folderMode === FOLDER_MODES.ADD && (
        <div className="mb-5">
          <Dropdown
            dataArray={currentFolderList}
            onChangeHandler={(val) => {
              setSelectedFolder(val);
            }}
            value="My Files"
            title="Select Folder"
            sxClass={{
              width: '100%',
              border: '1px solid #c4c4c4',
              textAlign: 'left'
            }}
            displayEmpty={false}
            labelParentClass="text-left relative top-[-5px]"
            disabled={true}
          />
        </div>)}
        {folderMode === FOLDER_MODES.ADD && folderID && (
        <div className="mb-5">
          <Dropdown
            dataArray={folderList}
            onChangeHandler={(val) => {
              setSelectedFolder(val);
            }}
            value={currentFolderName}
            title="Select Folder"
            sxClass={{
              width: '100%',
              border: '1px solid #c4c4c4',
              textAlign: 'left'
            }}
            displayEmpty={false}
            labelParentClass="text-left relative top-[-5px]"
            disabled={true}
          />
        </div>)}
        <CustomInput
          parentLabelClass="text-left"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setFolderName(e.target.value);
            setFolderNameError('');
            setFileNameError('');
          }}
          value={folderName}
          label={
            folderMode === FOLDER_MODES.ADD ? 'Folder Name'
              : popupData?.file_type === 'folder' ? 'Folder Name' : 'File Name'
          }
          name="Folder_Name"
          size="small"
          sx={{
            width: '100%',
            '.MuiOutlinedInput-input': {
              fontSize: '0.75rem'
            }
          }}
        />
        {folderNameError && <div className="text-red-500 text-left text-xs">{folderNameError}</div>}
        {fileNameError && <div className="text-red-500 text-left text-xs">{fileNameError}</div>}
        <div className="mt-5">
          {folderMode === FOLDER_MODES.ADD && (
            <>
              <Dropdown
                disabled={role.name === USER_TYPE.STUDENT}
                dataArray={[{ label: 'Select', value: 'Select' }, ...classArray]}
                onChangeHandler={(val) => {
                  setSelectedClass(val);
                  setFileNameError('');
                }}
                value={selectedClass}
                title="Select Class"
                sxClass={{
                  width: '100%',
                  border: '1px solid #c4c4c4',
                  textAlign: 'left'
                }}
                displayEmpty={false}
                labelParentClass="text-left relative top-[-5px]"
              />
            </>
          )}
        </div>
        <div className="mt-5">
          <Button onClick={handleOkClick}> Ok </Button>
        </div>
      </div>
    </CustomizedDialogs>
  );
};

export default AddEditFolder;
