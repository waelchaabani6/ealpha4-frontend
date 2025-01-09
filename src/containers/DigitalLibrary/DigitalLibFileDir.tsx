import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import AddEditFolder from '@containers/DigitalLibrary/AddEditFolder';
import ShareFile from '@containers/DigitalLibrary/ShareFile';
import ShareWith from '@containers/DigitalLibrary/ShareWith';
import UploadFolder from '@containers/DigitalLibrary/UploadFolder';
import DebounceInput from '@component/input/DebounceInput';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Dropdown from '@component/dropdown/Dropdown';
import DatePicker from '@component/datepicker';
import moment from 'moment';
import { useParams, useNavigate } from 'react-router-dom';
import { useGet, useDelete, usePost, useMultiDownload } from '@shared/api/useApi';
import { useEffect, useMemo, useState } from 'react';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import { MULTIPLE_SELECT_OPTIONS, TOOLBAR_LABELS, HEADERMENUS, COMPONENTS, TABLE_DIGILIB, RESULTS_PER_PAGE, SHARED_FILES, MY_FILES, RECEIVED_FILES, FILE_TYPES } from '@constants/constants';
import Wrapper from '@shared/wrapper/Wrapper';
import DeletePopup from '@shared/DeletePopup';
import toast from '@shared/toast';
import FolderIcon from '@mui/icons-material/Folder';
import { getNoOfPages } from '@utility/utility';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ImageIcon from '@mui/icons-material/Image';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import RouteLayout from '../layout/routeLayout';

const digitalLibraryServiceUrl = import.meta.env.VITE_APP_DIGITAL_LIBRARY_SERVICE_URL;

const Columns = [
  {
    label: TABLE_DIGILIB?.SR_NO,
    align: 'center'
  },
  {
    label: '',
    align: 'center',
    component: COMPONENTS?.checkbox,
    selector: 'id',
    showInHeader: true
  },
  {
    label: TABLE_DIGILIB?.NAME,
    isSort: true,
    mapper: 'name'
  },
  {
    label: TABLE_DIGILIB?.UPLOADED_ON,
    isSort: true,
    mapper: 'created_at'
  },
  {
    label: TABLE_DIGILIB?.FILE_SIZE,
    isSort: true,
    mapper: 'size'
  },
  {
    label: TABLE_DIGILIB?.FILE_TYPE,
    mapper: 'document_type'
  },
  {
    label: TABLE_DIGILIB?.SHARING,
    mapper: 'sharing',
    sx: { width: '250px' }
  },
  {
    label: TABLE_DIGILIB?.ACTION,
    colspan: 4,
    align: 'center',
    component: COMPONENTS?.download,
    showInHeader: false
  },
  {
    component: COMPONENTS?.share,
    showInHeader: false
  }
];

const TableColumns = [
  ...Columns,
  {
    component: COMPONENTS?.edit,
    showInHeader: false
  },
  {
    component: COMPONENTS?.delete,
    showInHeader: false
  }
];

const ADMIN_TOOLBAR_MENU = [
  {
    title: TOOLBAR_LABELS.ADD_FOLDER,
    type: HEADERMENUS.BUTTON
  },
  {
    title: TOOLBAR_LABELS.UPLOAD_FILE,
    type: HEADERMENUS.BUTTON
  }
];

const FILE_TYPE_LABELS = {
  SELECT: 'All',
  WORD: 'Word',
  PDF: 'PDF',
  IMAGE: 'Image',
  EXCEL: 'Excel'
};

const SELECT = 'Select';

const fileTypesData = [
  {
    label: FILE_TYPE_LABELS.SELECT,
    value: SELECT
  },
  {
    label: FILE_TYPE_LABELS.WORD,
    value: FILE_TYPES.WORD
  },
  {
    label: FILE_TYPE_LABELS.PDF,
    value: FILE_TYPES.PDF
  },
  {
    label: FILE_TYPE_LABELS.IMAGE,
    value: FILE_TYPES.IMAGE
  },
  {
    label: FILE_TYPE_LABELS.EXCEL,
    value: FILE_TYPES.EXCEL
  }
];

type multipleDeleteDataType = {
  folder_ids: any[];
  file_ids: any[];
};

export default function DigitalLibFileDir() {
  const [isOpenAddEditPopup, setIsOpenAddEditPopup] = useState(false);
  const [isOpenUploadFilePopup, setIsOpenUploadFile] = useState(false);
  const [isOpenShareFilePopup, setisOpenShareFilePopup] = useState(false);
  const [selectedFileType, setSelectedFileType] = useState('Select');
  const [selectedAction, setSelectedAction] = useState('Select');
  const { schoolName, folderName, folderId } = useParams();
  const [tableData, setTableData] = useState<any>([]);
  const [bulkSelect, setBulkSelect] = useState<any>([]);
  const [isOpenShareWithPopup, setIsOpenShareWithPopup] = useState(false);
  const [popupData, setpopupData] = useState<any>({});
  const [deletePopUpData, setDeletePopUpData] = useState<any>({});
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [folderMode, setFolderMode] = useState<string>('');
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(RESULTS_PER_PAGE[0]);
  const [searchString, setSearchString] = useState('');
  const [selectedfileType, setFileType] = useState<string>('');
  const [selectedFolderFileId, setFileFolderId] = useState<number | undefined>();

  const [order, setOrder] = useState<any>('asc');
  const [orderBy, setOrderBy] = useState<any>('created_at');
  const noOfpages = getNoOfPages(totalDataCount, rowsPerPage);

  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [page, setPage] = useState(1);
  const [folderID, setFolderId] = useState<string>('');
  const [currentFolderName, setCurrentFolderName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState<any>([{ uri: '' }]);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleDialog = () => {
    setDialogOpen(false);
  };

  const handleShowPreview = (id: any, fileName: string, fileType: string) => {
    setFileUrl([{
      uri: `${digitalLibraryServiceUrl}digital-library/download/file/${id}`,
      fileName: `${fileName}.${fileType}`
    }]);
    setDialogOpen(true);
  };

  useEffect(() => {
    if (folderId) {
      setFolderId(folderId);
    } else if (folderName === SHARED_FILES || folderName === RECEIVED_FILES) {
      refetchSharedFiles();
      setPage(1);
    } else {
      refetchFolderList();
      setFolderId('');
      setPage(1);
    }
  }, [folderId, searchString, toDate, fromDate]);

  useEffect(() => {
    if (isOpenShareFilePopup === false) {
      setFileFolderId(undefined);
    }
  }, [isOpenShareFilePopup]);

  useEffect(() => {
    if (folderID) {
      refetchNestedFolderList();
      setPage(1);
    }
  }, [folderID, searchString]);

  const selectedTableData = useMemo(() => tableData.filter((ele: any) => bulkSelect.includes(ele?.id)), [bulkSelect]);

  const multipleDeleteData: multipleDeleteDataType = {
    folder_ids: [],
    file_ids: []
  };

  selectedTableData.forEach((item: any) => {
    if (item.file_type === 'folder') {
      multipleDeleteData.folder_ids.push(item.id);
    } else {
      multipleDeleteData.file_ids?.push(item.id);
    }
  });

  useEffect(() => {
    const folderIdsCount = multipleDeleteData.folder_ids.length;
    const fileIdsCount = multipleDeleteData.file_ids.length;
    if (selectedAction === MULTIPLE_SELECT_OPTIONS.DOWNLOAD) {
      if (folderIdsCount > 0 || fileIdsCount > 0) {
        multipleDownload({
          folder_ids: multipleDeleteData.folder_ids.length > 0 ? multipleDeleteData.folder_ids : undefined,
          file_ids: multipleDeleteData.file_ids.length > 0 ? multipleDeleteData.file_ids : undefined
        });
      } else {
        setSelectedAction('Select');
        toast('error', 'Please select data');
      }
    }
    if (selectedAction === MULTIPLE_SELECT_OPTIONS.DELETE) {
      if (folderIdsCount > 0 || fileIdsCount > 0) {
        if (folderIdsCount > 0) {
          multipleFoldersDelete({
            folder_id: multipleDeleteData.folder_ids
          });
        }
        if (fileIdsCount > 0) {
          multipleFilessDelete({
            file_id: multipleDeleteData.file_ids
          });
        }
      } else {
        setSelectedAction('Select');
        toast('error', 'Please select data');
      }
    }
  }, [selectedAction]);

  const ordering = order === 'asc' ? orderBy : `-${orderBy}`;

  const { isLoading: refetchLoading, refetch: refetchFolderList }: any = useGet(
    {
      queryKey: [searchString],
      baseURL: digitalLibraryServiceUrl,
      url: `digital-library/folder/parent/?limit=${rowsPerPage}&offset=${
        (page - 1) * Number(rowsPerPage)
      }${
        searchString !== '' ? `&search=${searchString}` : ``
      }${fromDate ? `&date_range_after=${
        moment(fromDate).format('YYYY-MM-DD')
      }` : ''}${toDate ? `&date_range_before=${
        moment(toDate).format('YYYY-MM-DD')
      }` : ''}${selectedFileType !== 'Select' ? `&file_type=${selectedFileType}` : ''}&ordering=${ordering}`,
      onSuccess: (res: any) => {
        let folderFiletempList: any = res?.data?.response?.results;
        setCurrentFolderName('');
        folderFiletempList = folderFiletempList.map((ele: any, i: number) => {
          const folder_name = ele?.folder_name;
          const created_at = ele?.created_at;
          const folder_size = ele?.folder_size;
          const folder_id = ele?.id;
          const type = ele?.folder_type;
          return ({
            folder_name,
            name: (
              <div
                role="application"
                className="cursor-pointer"
                onClick={() => {
                  navigate(
                    `/${schoolName}/digital-library/${folderName}/${folder_id}`
                  );
                  setCurrentFolderName(folder_name);
                  setBulkSelect([]);
                  setPage(1);
                }}
              >
                <FolderIcon sx={{ fontSize: '2rem', color: 'orange' }} />
                {folder_name}
              </div>
            ),
            created_at: moment(created_at).format('DD-MM-YYYY'),
            size: formatBytes(folder_size),
            file_type: type,
            document_type: type && type.charAt(0).toUpperCase() + type.slice(1),
            sharing: ele?.shared ? (
              <span role="link" tabIndex={i} className="underline cursor-pointer" onClick={() => { getListOfStudetAccess('Folder', folder_id); }}>
                {' '}
                Shared
                {' '}
              </span>) : '',
            id: folder_id
          });
        });
        setTableData(folderFiletempList);
        setTotalDataCount(res?.data?.response?.count);
      },
      onError: ({ response }: any) => {},
      enabled: !folderId && folderName && folderName === MY_FILES
    }
  );

  const renderFileName = (type: string) => {
    if (type === 'Docx' || type === 'Doc') {
      return 'Word';
    } if (type === 'Xlsx') {
      return 'Excel';
    } if (type === 'Pdf') {
      return 'PDF';
    } if (type === 'Jpeg' || type === 'Jpg' || type === 'Png') {
      return 'Image';
    }
    return type;
  };

  const {
    isLoading: refetchNestedLoading,
    refetch: refetchNestedFolderList
  }: any = useGet({
    queryKey: [searchString],
    baseURL: digitalLibraryServiceUrl,
    url: `digital-library/folder/${folderId}/?limit=${rowsPerPage}&offset=${
      (page - 1) * Number(rowsPerPage)
    }${
      searchString !== '' ? `&search=${searchString}` : ``
    }${fromDate ? `&date_range_after=${
      moment(fromDate).format('YYYY-MM-DD')
    }` : ''}${toDate ? `&date_range_before=${
      moment(toDate).format('YYYY-MM-DD')
    }` : ''}${selectedFileType !== 'Select' ? `&file_type=${selectedFileType}` : ''}&ordering=${ordering}`,
    onSuccess: (res: any) => {
      setCurrentFolderName(res.data.response.folder_name);
      let subfolderFiletempList: any = [
        ...res.data.response.sub_folders,
        ...res.data.response.files
      ];
      subfolderFiletempList = subfolderFiletempList.map(
        (ele: any, index: number) => {
          let folder_name = '';
          const created_at = ele?.created_at;
          let folder_size = 0;
          const folder_id = ele?.id;
          let type = '';
          if (ele?.folder_type === 'folder') {
            folder_name = ele?.folder_name;
            folder_size = ele?.folder_size;
            type = ele?.folder_type;
          } else {
            folder_name = ele?.file_name;
            folder_size = ele?.file_size;
            type = ele?.file_type;
          }
          return ({
            folder_name,
            name: (
              <div
                role="application"
                className="cursor-pointer"
                onClick={() => {
                  if (type === 'folder') {
                    navigate(`/${schoolName}/digital-library/${folderName}/${folder_id}`);
                    setCurrentFolderName(folder_name);
                    setBulkSelect([]);
                    setPage(1);
                  } else {
                    handleShowPreview(folder_id, folder_name, type);
                  }
                }}
              >
                {renderIcon(type)}
                {folder_name}
              </div>
            ),
            created_at: moment(created_at).format('DD-MM-YYYY'),
            size: formatBytes(folder_size),
            file_type: type,
            document_type: renderFileName(type.charAt(0).toUpperCase() + type.slice(1)),
            sharing: ele?.shared && (
            <span role="link" tabIndex={index} className="underline cursor-pointer" onClick={() => { getListOfStudetAccess(ele?.file_type ? 'File' : 'Folder', folder_id); }}>
              {' '}
              Shared
              {' '}
            </span>),
            id: folder_id,
            document: ele?.document
          });
        }
      );
      setTableData(subfolderFiletempList.slice((page - 1) * Number(rowsPerPage), page * Number(rowsPerPage)));
      setTotalDataCount(subfolderFiletempList.length);
    },
    onError: ({ response }: any) => {},
    enabled: !!folderId
  });

  const { refetch: refetchSharedFiles }: any = useGet({
    baseURL: digitalLibraryServiceUrl,
    url: `digital-library/access/?type=${folderName === SHARED_FILES ? 'shared' : 'received'}&limit=${rowsPerPage}&offset=${(page - 1) * Number(rowsPerPage)}${searchString !== '' ? `&search=${searchString}` : ``}${fromDate ? `&date_range_after=${moment(fromDate).format('YYYY-MM-DD')}` : ''}${toDate ? `&date_range_before=${moment(toDate).format('YYYY-MM-DD')}` : ''}${selectedFileType !== 'Select' ? `&file_type=${selectedFileType}` : ''}&ordering=${ordering}`,
    onSuccess: (res: any) => {
      let folderFiletempList: any = res?.data?.response?.results;
      setCurrentFolderName('');
      folderFiletempList = folderFiletempList.map((ele: any, i: number) => {
        let folder_name = '';
        let created_at = '';
        let folder_size = 0;
        let folder_id = 0;
        let type = '';
        if (ele.folder_access) {
          folder_name = ele?.folder_access[0].folder_name;
          created_at = ele?.folder_access[0].created_at;
          folder_size = ele?.folder_access[0].folder_size;
          type = ele?.folder_access[0].folder_type;
          folder_id = ele?.folder_access[0].folder_id;
        }
        if (ele.file_access) {
          folder_name = ele?.file_access[0].filename;
          created_at = ele?.file_access[0].created_at;
          folder_size = ele?.file_access[0].file_size;
          type = ele?.file_access[0].file_type;
          folder_id = ele?.file_access[0].id;
        }
        return {
          folder_name,
          name: (
            <div
              role="application"
              className="cursor-pointer"
              onClick={() => {
                if (type === 'folder') {
                  navigate(
                    `/${schoolName}/digital-library/${folderName}/${folder_id}`
                  );
                  setCurrentFolderName(ele?.folder_name);
                  setBulkSelect([]);
                  setPage(1);
                } else {
                  handleShowPreview(folder_id, folder_name, type);
                }
              }}
            >
              {renderIcon(type)}
              {folder_name}
            </div>
          ),
          created_at: moment(created_at).format('DD-MM-YYYY'),
          size: formatBytes(folder_size),
          file_type: type,
          folder_type: type === 'folder' ? 'Folder' : type,
          sharing: folderName === SHARED_FILES ? (
            <span role="link" tabIndex={i} className="underline cursor-pointer" onClick={() => { getListOfStudetAccess(type === 'folder' ? 'Folder' : 'File', folder_id); }}>
              {' '}
              Shared
              {' '}
            </span>) : (ele?.name ? `Received by ${ele.name}` : 'Received'),
          document_type: renderFileName(type.charAt(0).toUpperCase() + type.slice(1)),
          id: folder_id
        };
      });
      setTableData(folderFiletempList);
      setTotalDataCount(res?.data?.response?.count);
    },
    onError: ({ response }: any) => {},
    enabled: !!(!folderId && folderName !== MY_FILES)
  });

  const handleToolbarAction = async (title: string) => {
    if (title === TOOLBAR_LABELS.ADD_FOLDER) {
      setIsOpenAddEditPopup(true);
      setFolderMode('Add');
    } else if (title === TOOLBAR_LABELS.UPLOAD_FILE) {
      setIsOpenUploadFile(true);
    }
  };

  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };

  const getListOfStudetAccess = (type: string, id: number) => {
    setIsOpenShareWithPopup(true);
    if (type === FILE_TYPES.FOLDER) {
      setFileFolderId(id);
      setFileType('Folder');
    } else {
      setFileFolderId(id);
      setFileType('File');
    }
  };

  const downloadLink = (fileUrls: any, data: any) => {
    fetch(fileUrls, {
      method: 'GET',
      headers: {}
    })
      .then((response) => {
        if (response.ok) {
          response.arrayBuffer().then((buffer) => {
            const url = window.URL.createObjectURL(new Blob([buffer]));
            const link = document.createElement('a');
            link.href = url;
            if (data.file_type === 'folder') {
              link.setAttribute('download', `${data.folder_name}.zip`);
            } else {
              link.setAttribute(
                'download',
                `${data.folder_name}.${data.file_type}`
              );
            }
            document.body.appendChild(link);
            link.click();
            setLoading(false);
            toast('success', 'Downloaded successfully');
          });
        } else {
          setLoading(false);
          toast('error', 'Download failed');
        }
      })
      .catch((err) => {
        toast('error', 'Download failed');
      });
  };

  const actionHandler = (data: any, handlername: string) => {
    if (handlername === COMPONENTS.download) {
      if (data.file_type === 'folder') {
        setLoading(true);
        const url = `${digitalLibraryServiceUrl}digital-library/download/folder/${data.id}`;
        downloadLink(url, data);
      } else {
        setLoading(true);
        const url = `${digitalLibraryServiceUrl}digital-library/download/file/${data.id}`;
        downloadLink(url, data);
      }
    }
    if (handlername === COMPONENTS.edit) {
      setIsOpenAddEditPopup(true);
      setFolderMode('Edit');
      setpopupData(data);
    }
    if (handlername === COMPONENTS.share) {
      if (data.file_type === 'folder') {
        setFileType('Folder');
        setFileFolderId(data.id);
      } else {
        setFileType('File');
        setFileFolderId(data.id);
      }
      setisOpenShareFilePopup(true);
    }
  };

  function formatBytes(bytes: any, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
  }

  const renderIcon = (fileType: string) => {
    if (fileType === FILE_TYPES.DOCX || fileType === FILE_TYPES.DOC) {
      return <DescriptionIcon sx={{ fontSize: '2rem', color: 'blue' }} />;
    }
    if (fileType === FILE_TYPES.PDF) {
      return <PictureAsPdfIcon sx={{ fontSize: '2rem', color: 'red' }} />;
    }
    if (fileType === FILE_TYPES.XLSX) {
      return <ListAltIcon sx={{ fontSize: '2rem', color: 'orange' }} />;
    }
    if (fileType === FILE_TYPES.JPEG || fileType === FILE_TYPES.JPG || fileType === FILE_TYPES.PNG) {
      return <ImageIcon sx={{ fontSize: '2rem', color: 'orange' }} />;
    }
    return <FolderIcon sx={{ fontSize: '2rem', color: 'orange' }} />;
  };

  const stateReset = () => {
    setDeleteDialog(false);
    setDeletePopUpData({});
  };

  const { isLoading: loadingFolderDelete, mutate: mutateFolderDelete } = useDelete({
    baseURL: digitalLibraryServiceUrl,
    url: `digital-library/folder/${deletePopUpData.id}/delete/`,
    onSuccess: (resp: any) => {
      if (folderId) {
        refetchNestedFolderList();
      } else {
        refetchFolderList();
      }
      toast('success', resp.data.message);
      stateReset();
    },
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
    },
    enabled: false
  });

  const { isLoading: loadingFileDelete, mutate: mutateFileDelete } = useDelete({
    baseURL: digitalLibraryServiceUrl,
    url: `digital-library/file/${deletePopUpData.id}/delete/`,
    onSuccess: (resp: any) => {
      stateReset();
      if (folderId) {
        refetchNestedFolderList();
      } else {
        refetchFolderList();
      }
      setBulkSelect([]);
      toast('success', resp.data.message);
    },
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
      stateReset();
    },
    enabled: false
  });

  const handleActionDelete = (row: any) => {
    setDeletePopUpData(row);
    setDeleteDialog(true);
  };

  const handelConfirmDelete = () => {
    if (deletePopUpData.file_type === 'folder') {
      mutateFolderDelete();
    } else {
      mutateFileDelete();
    }
  };

  const handleSearch = (value: any) => {
    setSearchString(value);
  };

  const { isLoading: multipleDownloadLoading, mutate: multipleDownload } = useMultiDownload({
    baseURL: import.meta.env.VITE_APP_DIGITAL_LIBRARY_SERVICE_URL,
    url: `digital-library/multiple_download/`,
    onSuccess: async(response: any) => {
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/zip' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'fileName.zip');
      document.body.appendChild(link);
      link.click();
      link?.parentNode?.removeChild(link);

      setSelectedAction('Select');
      setBulkSelect([]);
      toast('success', response.data.message || 'Success');
    },
    onError: ({ response }: any) => {
      setSelectedAction('Select');
      setBulkSelect([]);
      toast('error', 'Download Request failed');
    },
    enabled: false
  });

  const { isLoading: multipleFoldersLoading, mutate: multipleFoldersDelete } = useDelete({
    baseURL: digitalLibraryServiceUrl,
    url: `digital-library/multiple-folder-delete/`,
    onSuccess: (response: any) => {
      if (folderID) {
        refetchNestedFolderList();
      } else {
        refetchFolderList();
      }
      setSelectedAction('Select');
      setBulkSelect([]);
      toast('success', response.data.message || 'Success');
    },
    onError: ({ response }: any) => {
      setSelectedAction('Select');
      toast('error', 'Not Found');
    },
    enabled: false
  });

  const { isLoading: multipleFilessLoading, mutate: multipleFilessDelete } = useDelete({
    baseURL: digitalLibraryServiceUrl,
    url: `digital-library/multiple-file-delete/`,
    onSuccess: (response: any) => {
      if (folderID) {
        refetchNestedFolderList();
      } else {
        refetchFolderList();
      }
      setSelectedAction('Select');
      setBulkSelect([]);
      toast('success', response.data.message || 'Success');
    },
    onError: ({ response }: any) => {
      setSelectedAction('Select');
      toast('error', 'Not Found');
    },
    enabled: false
  });

  const reset = () => {
    setToDate(undefined);
    setFromDate(undefined);
  };

  return (
    <RouteLayout navBack={true}>
      <HeaderMenus
        title={`${currentFolderName || folderName}`}
        menuArray={folderName === MY_FILES ? ADMIN_TOOLBAR_MENU : []}
        handleToolbarAction={handleToolbarAction}
      />
      <AddEditFolder
        isOpen={isOpenAddEditPopup}
        setOpen={setIsOpenAddEditPopup}
        title="Add Folder"
        folderMode={folderMode}
        refetchFolderList={refetchFolderList}
        refetchNestedFolderList={refetchNestedFolderList}
        popupData={popupData}
        setpopupData={setpopupData}
        folderID={folderID}
        setLoading={setLoading}
        currentFolderName={currentFolderName}

      />
      <UploadFolder
        isOpen={isOpenUploadFilePopup}
        setOpen={setIsOpenUploadFile}
        refetchNestedFolderList={refetchNestedFolderList}
        refetchFolderList={refetchFolderList}
        title="Upload File"
        folderID={folderID}
        currentFolderName={currentFolderName}
        setLoading={setLoading}
        tableData={tableData}
        folderName={folderName}
      />
      <ShareFile
        isOpen={isOpenShareFilePopup}
        setOpen={setisOpenShareFilePopup}
        title="Share File"
        fileType={selectedfileType}
        selectedFolderFileId={selectedFolderFileId}
        refetchFolderList={refetchFolderList}
        refetchNestedFolderList={refetchNestedFolderList}
        folderID={folderID}
      />
      <ShareWith
        isOpen={isOpenShareWithPopup}
        setOpen={setIsOpenShareWithPopup}
        selectedFolderFileId={selectedFolderFileId}
        selectedfileType={selectedfileType}
        refetchSharedFiles={refetchSharedFiles}
        refetchFolderList={refetchFolderList}
        refetchNestedFolderList={refetchNestedFolderList}
        folderID={folderID}
        folderName={folderName}
        title="Share With"
      />
      <div className="flex gap-2 mt-7 lg:items-end items-center lg:flex-row flex-col ">
        <div className="flex md:justify-start justify-center gap-2 lg:grow grow-0 items-end">
          <div className="max-w-xs">
            <DebounceInput
              onChange={handleSearch}
            />
          </div>
          <div>
            <Dropdown
              title="File Type"
              value={selectedFileType}
              disabled={folderName === MY_FILES && !folderID}
              dataArray={fileTypesData}
              onChangeHandler={(d: any) => setSelectedFileType(d)}
              displayEmpty={false}
              parentStyle="dropdown-css"
              labelParentClass="dropdown-typography-parent"
            />
          </div>
          <div>
            <DatePicker
              disablePast={false}
              value={fromDate}
              label="From"
              handlePickerChange={(date: Date) => setFromDate(date)}
              sxType={1}
              defaultStyle={true}
              disableFuture={toDate}
              noFontSize={true}
            />
          </div>
          <div>
            <DatePicker
              disablePast={false}
              disableOld={fromDate}
              value={toDate}
              label="To"
              handlePickerChange={(date: Date) => setToDate(date)}
              sxType={1}
              defaultStyle={true}
              noFontSize={true}
            />
          </div>
          <div className="relative top-[-7px]">
            <span
              tabIndex={0}
              title="Clear dates"
              onClick={reset}
              role="button"
            >
              <RestartAltIcon />
            </span>
          </div>
          <div className="flex-1" />
          <div>
            <Dropdown
              title=""
              value={selectedAction}
              dataArray={folderName === MY_FILES ? ['Select', 'Download', 'Delete'] : ['Select', 'Download']}
              onChangeHandler={(d: any) => setSelectedAction(d)}
              displayEmpty={false}
              parentStyle="dropdown-css"
              labelParentClass="dropdown-typography-parent"
              sxClass={{ width: '150px' }}
            />
          </div>
        </div>
      </div>
      <div className="wrapperBorder mt-3">
        <Wrapper>
          <AdvanceTable
            tableData={tableData}
            headerRows={folderName === MY_FILES ? TableColumns : folderName === RECEIVED_FILES ? [...Columns.slice(0, Columns.length - 1)] : Columns}
            totalPages={noOfpages}
            paginateHandler={handlePagination}
            currentPage={page}
            setPage={setPage}
            rowsPerPage={rowsPerPage}
            subTableHeader={[]}
            setBulkSelect={setBulkSelect}
            bulkSelect={bulkSelect}
            orderBy={orderBy}
            setOrderBy={setOrderBy}
            order={order}
            setOrder={setOrder}
            deleteHandler={handleActionDelete}
            actionHandler={actionHandler}
            isLoading={
              loading
              || refetchLoading
              || refetchNestedLoading
              || multipleDownloadLoading
              || multipleFoldersLoading
              || multipleFilessLoading
              || loadingFolderDelete
              || loadingFileDelete
            }
          />
        </Wrapper>
      </div>
      <DeletePopup
        title={deletePopUpData?.file_type === 'folder' ? 'Delete Folder' : 'Delete File'}
        description={`Are you sure you want to delete the ${
          deletePopUpData.file_type === 'folder' ? 'Folder' : 'File'
        }`}
        open={deleteDialog}
        setOpen={setDeleteDialog}
        handleDelete={handelConfirmDelete}
        removeText="Delete"
        onclose={() => {
          setTimeout(() => {
            setDeletePopUpData({});
          }, 0);
        }}
      />
      <CustomizedDialogs
        maxwidth="sm"
        open={dialogOpen}
        setOpen={() => {
          handleDialog();
        }}
        title="Preview"
      >
        <div>Preview</div>
        <DocViewer documents={fileUrl} pluginRenderers={DocViewerRenderers} className="digilab-docviewer" />
      </CustomizedDialogs>
    </RouteLayout>
  );
}
