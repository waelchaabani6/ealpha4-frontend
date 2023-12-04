import { useState, useRef, useEffect } from 'react';
import { CustomInput } from '@component/input';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import Dropdown from '@component/dropdown/Dropdown';
import toast from '@shared/toast';
import Button from '@component/button/button';
import FileSelect from '@component/fileUpload';
import { usePost } from '@shared/api/useApi';

const digitalLibraryServiceUrl = import.meta.env.VITE_APP_DIGITAL_LIBRARY_SERVICE_URL;

type UploadFolderType = {
  folderID: string;
  isOpen: boolean;
  title: string;
  setOpen: (isOpen: boolean) => void;
  refetchNestedFolderList: any;
  refetchFolderList: any;
  currentFolderName: string;
  setLoading: any;
  tableData: any;
  folderName: any;
};

const UploadFolder = ({
  isOpen,
  title,
  setOpen,
  folderID,
  refetchNestedFolderList,
  refetchFolderList,
  currentFolderName,
  setLoading,
  tableData,
  folderName
}: UploadFolderType) => {
  const [fileName, setFileName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('Select');
  const fileRef = useRef();
  const [file, setFile] = useState<any>();
  const [isFileError, setisFileError] = useState('');
  const [selectedFolderError, setSelctedFolderError] = useState('');

  const AllowerdTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword'
  ];

  useEffect(() => {
    if (currentFolderName) {
      setSelectedFolder(currentFolderName);
    } else {
      setSelectedFolder('Select');
    }
  }, [folderID, currentFolderName]);

  const { mutate: uploadFile } = usePost({
    baseURL: digitalLibraryServiceUrl,
    url: `digital-library/file/`,
    onSuccess: (response: any) => {
      if (folderID) {
        refetchNestedFolderList();
      } else {
        refetchFolderList();
      }
      toast('success', response.data.message || 'Success');
      resetState();
      setLoading(false);
    },
    onError: ({ response }: any) => {
      resetState();
      setLoading(false);
      toast('error', 'Not Found' || 'Error');
    },
    enabled: false
  });

  const bytesToMb = (fileSizeBytes: number) => {
    const fileSizeMB = fileSizeBytes / 1024 ** 2;
    return fileSizeMB;
  };

  const onFileChange = (files: FileList | File[]) => {
    setisFileError('');
    if (files.length > 0) {
      const fileData = Array.from(files).map((item: File, index: number) => ({
        sr_no: index + 1,
        document_name: item.name,
        file: item,
        document_ting: `${item.name}_${index}`,
        sizeInMb: bytesToMb(item.size),
        type: item.type
      }));
      if (fileData && fileData[0]) {
        setFile(files[0]);
        setFileName(fileData[0]?.document_name?.split('.')?.slice(0, -1).join('.') || fileData[0]?.document_name);
        if (fileData[0].sizeInMb > 500) {
          setisFileError('File size excedding limit');
        } else if (!AllowerdTypes.includes(fileData[0].type)) {
          setisFileError('Not supported format');
        } else {
          setisFileError('');
        }
      }
    }
  };

  const UploadFile = () => {
    const errors = [];
    if (!folderID && selectedFolder === 'Select') {
      if (currentFolderName) {
        setSelctedFolderError('Please select folder');
      } else {
        setSelctedFolderError('Please select sub folder');
      }
      errors.push('please select folder');
    }
    if ((file === '' || file === undefined) && !isFileError) {
      setisFileError('Please select file');
      errors.push('please select file');
    }

    if (errors.length !== 0) {
      return;
    }

    if (!isFileError && !selectedFolderError) {
      const formObj = new FormData();
      if (folderID) {
        formObj.append('folder', folderID);
      } else {
        formObj.append('folder', selectedFolder);
      }
      if (fileName !== '') {
        formObj.append('file_name', fileName);
      } else {
        formObj.append('file_name', file.name.split('.').slice(0, -1).join('.') || file.name);
      }
      formObj.append('document', file);
      formObj.append('file_type', file.name.split('.').pop());
      setLoading(true);
      uploadFile(formObj);
      setOpen(false);
    }
  };

  const folderList = currentFolderName ? [{ label: selectedFolder, value: selectedFolder }] : [
    { label: 'Select', value: 'Select' },
    ...tableData.map((item: any) => ({
      label: item.folder_name,
      value: item.id
    }))
  ];

  const currentFolderList = [{ label: folderName, value: folderName }];

  const resetState = () => {
    setSelctedFolderError('');
    setisFileError('');
    setFile('');
    setFileName('');
    if (currentFolderName) {
      setSelectedFolder(currentFolderName);
    } else {
      setSelectedFolder('Select');
    }
  };

  return (
    <CustomizedDialogs
      onclose={() => {
        setOpen(false);
        resetState();
      }}
      open={isOpen}
      setOpen={() => {
        setOpen(false);
      }}
      title={title}
      maxwidth="sm"
    >
      <div className="text-center">
        {!currentFolderName && <Dropdown
          dataArray={currentFolderList}
          onChangeHandler={(val) => {
            setSelectedFolder(val);
          }}
          value={folderName}
          title="Select Folder"
          sxClass={{
            width: '100%',
            border: '1px solid #c4c4c4',
            textAlign: 'left'
          }}
          displayEmpty={false}
          labelParentClass="text-left relative top-[-5px]"
          disabled={true}
        /> }
        <div className="mt-5">
          <Dropdown
            dataArray={folderList}
            onChangeHandler={(val) => {
              setSelectedFolder(val);
              setSelctedFolderError('');
            }}
            value={currentFolderName || selectedFolder}
            title={`${currentFolderName ? 'Select Folder' : 'Select Sub Folder'}`}
            sxClass={{
              width: '100%',
              border: '1px solid #c4c4c4',
              textAlign: 'left'
            }}
            displayEmpty={false}
            labelParentClass="text-left relative top-[-5px]"
            disabled={!!folderID}
          />
          {selectedFolderError && (
          <div className="text-red-500 text-left text-xs">
            {selectedFolderError}
          </div>
          )}
        </div>
        <div className="mt-5">
          <CustomInput
            parentLabelClass="text-left"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setFileName(e.target.value);
            }}
            value={fileName}
            label="File Name"
            name="File_Name"
            size="small"
            sx={{
              width: '100%',
              '.MuiOutlinedInput-input': {
                fontSize: '0.75rem'
              }
            }}
          />
        </div>
        <div className="my-5">
          <FileSelect
            ref={fileRef}
            onChange={onFileChange}
            parentContainerClass="h-[100px]"
          />
          {isFileError && (
            <div className="text-red-500 text-left text-xs">{isFileError}</div>
          )}
          <div>{file && file?.name}</div>
          <div>
            <div className="text-sm">File max size 500MB.</div>
            <div className="text-sm">File type XLSX, Docx, PNG, PDF, JPEG</div>
          </div>
        </div>
        <Button onClick={UploadFile}> Ok </Button>
      </div>
    </CustomizedDialogs>
  );
};

export default UploadFolder;
