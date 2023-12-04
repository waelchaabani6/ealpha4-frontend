import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import { COMPONENTS, RESULTS_PER_PAGE, ROLES, TABLE_LABELS, TOOLBAR_LABELS } from '@constants/constants';
import Wrapper from '@shared/wrapper/Wrapper';
import { getNoOfPages, userRole } from '@utility/utility';
import EmailIcon from '@mui/icons-material/Email';
import PrintIcon from '@mui/icons-material/Print';
import AddIcon from '@mui/icons-material/Add';
import { ReactComponent as Delete } from '@images/longMenuIcons/Delete.svg';
import { ReactComponent as License } from '@images/longMenuIcons/license.svg';
import { ReactComponent as Download } from '@images/pageHeaderIcons/download.svg';
import { ReactComponent as Share } from '@images/pageHeaderIcons/share.svg';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import { useEffect, useState, useRef } from 'react';
import ReactToPrint from 'react-to-print';
import Dropdown from '@component/dropdown/Dropdown';
import DebounceInput from '@component/input/DebounceInput';
import CustomPagination from '@component/pagination/CustomPagination';
import RouteLayout from '@layout/routeLayout';
import { useDelete, useGet, usePatch, usePost } from '@shared/api/useApi';
import { Link, useParams } from 'react-router-dom';
import toast from '@shared/toast';
import Loader from '@shared/loader';
import { CSVLink } from 'react-csv';
import DeletePopup from '@shared/DeletePopup';
import moment from 'moment';
import SimpleBackdrop from '@component/Backdrop';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import { useSelector } from 'react-redux';
import { selectSchoolData } from '@shared/store/schoolSlice';
import AddNewAdmin from './addNewAdmin';

const printButton = () => <PrintIcon />;

export default function AdminList() {
  let noOfpages = 1;
  const ALL = {
    label: 'All',
    value: 'All'
  };
  const { schoolData, branchData } = useSelector(selectSchoolData);
  const [selectedRole, setSelectedRole] = useState(ALL?.value);
  const [page, setPage] = useState(1);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [selectedBranch, setSelectedBranch] = useState(ALL?.value);
  const [branchArray, setBranchArray] = useState<any>([ALL]);
  const [tableData, setTableData] = useState<any>([]);
  const [rowsPerPage, setRowsPerPage] = useState(RESULTS_PER_PAGE?.[0]);
  const [playloadData, setPlayloadData] = useState<any | undefined>({});
  const [order, setOrder] = useState<any>('desc');
  const [orderBy, setOrderBy] = useState<any>('created_at');
  const [licenseDialog, setLicenseDialog] = useState(false);
  const [expirationDate, setExpirationDate] = useState('');
  const [popupData, setpopupData] = useState<any>({});
  const [addDialog, setAddDialog] = useState(false);
  const [searchString, setSearchString] = useState('');
  const [adminDeleteDialog, setAdminDeleteDialog] = useState(false);
  const [adminData, setAdminData] = useState<any>('');
  const componentRef = useRef(null);

  const APIS = {
    statusUpdate: 'status update',
    deleteRecord: 'delete Record'
  };

  const [csvData, setCsvData] = useState<[]>([]);

  const headers = [
    TABLE_LABELS?.ID,
    TABLE_LABELS?.USER_NAME,
    TABLE_LABELS?.FIRST_NAME,
    TABLE_LABELS?.LAST_NAME,
    TABLE_LABELS?.EMAIL,
    TABLE_LABELS?.CREATED_ON,
    TABLE_LABELS?.ROLE,
    TABLE_LABELS?.STATUS
  ];

  const moreMenuOptions = [
    {
      icon: <License />,
      label: 'Extend License',
      value: 'extendLicense'
    },
    {
      icon: <Delete />,
      label: 'Delete',
      value: 'delete'
    }
  ];
  const ADMIN_TOOLBAR_MENU = [
    {
      title: TOOLBAR_LABELS.ADD,
      icon: <AddIcon />
    },
    {
      title: TOOLBAR_LABELS.IMPORT,
      icon: <DriveFolderUploadIcon />
    },
    {
      title: TOOLBAR_LABELS.EMAIL,
      icon: <EmailIcon />
    },
    {
      title: TOOLBAR_LABELS.EXPORT,
      icon: <CSVLink filename="School Admin List.csv" data={csvData} headers={headers}><Share /></CSVLink>
    },
    {
      title: TOOLBAR_LABELS.PRINT,
      icon: <ReactToPrint
        trigger={printButton}
        content={() => componentRef.current}
      />
    }
  ];
  const TableColumns = [
    {
      label: TABLE_LABELS?.SR_NO,
      align: 'center'
    },
    {
      label: TABLE_LABELS?.USER_NAME,
      isSort: true,
      mapper: 'user_name'
    },
    {
      label: TABLE_LABELS?.FIRST_NAME,
      isSort: true,
      mapper: 'first_name'
    },
    {
      label: TABLE_LABELS?.LAST_NAME,
      isSort: true,
      mapper: 'last_name'
    },
    {
      label: TABLE_LABELS?.EMAIL,
      isSort: true,
      mapper: 'email'
    },
    {
      label: TABLE_LABELS?.CREATED_ON,
      isSort: true,
      mapper: 'created_at',
      format: 'DD-MM-YYYY'
    },
    {
      label: TABLE_LABELS?.ROLE,
      mapper: 'role'
    },
    {
      label: TABLE_LABELS?.STATUS,
      mapper: 'status',
      align: 'center',
      component: COMPONENTS?.switch,
      showInHeader: false
    },
    {
      label: TABLE_LABELS?.ACTION,
      mapper: 'Action',
      align: 'left',
      component: COMPONENTS?.delete,
      showInHeader: false
    }
  ];
  const handleToolbarAction = (title: string) => {
    if (title === TOOLBAR_LABELS.ADD) {
      setAddDialog(true);
    } else if (title === TOOLBAR_LABELS.IMPORT) {
      importData();
    } else if (title === TOOLBAR_LABELS.EMAIL) {
      handelSendEmail();
    }
  };

  const importData = async () => {
    const input: any = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = () => {
      const file = input?.files?.[0];
      const fileType = file.name.split('.').pop();
      if (fileType === 'csv') {
        const documentFormData: any = new FormData();
        documentFormData.append('csv_file', file);
        documentFormData.append('import_type', 'school-admin');
        mutateImport(documentFormData);
      } else {
        toast('error', 'Please upload CSV filetype only');
      }
    };
    input.click();
  };

  const handelSendEmail = () => {
    const payload = {
      school_id: id
    };
    setPlayloadData({
      apicall: 'sendEmail',
      payload
    });
  };

  const handleToolbarRole = (e: any) => {
    setSelectedRole(e);
  };
  const handleToolbarBranch = (e: any) => {
    setSelectedBranch(e);
  };
  const handlePerPage = (e: any) => {
    setRowsPerPage(e);
  };
  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };
  const statusHandler = (e: any, data: any) => {
    const payload = {
      status: (e.target.checked) ? 'Active' : 'Inactive',
      id: data?.user_id_id
    };
    setPlayloadData({
      apiCall: APIS?.statusUpdate,
      payload
    });
  };

  const handleMoreOption = (id: any, rowData: any) => {
    setpopupData(rowData);
    if (id === moreMenuOptions[0]?.value) {
      setExpirationDate(rowData?.expiration);
      setLicenseDialog(true);
    } else if (id === moreMenuOptions[1]?.value) {
      setAddDialog(true);
    }
  };

  const handleSearch = (value: any) => {
    if (value !== '') {
      allStateReset();
    }
    setSearchString(value);
  };

  const deleteHandler = (row: any) => {
    const payload = {
      id: row?.user_id_id
    };
    setPlayloadData({
      apiCall: APIS?.deleteRecord,
      payload
    });
    setAdminDeleteDialog(true);
  };

  const { id } = useParams();

  const allStateReset = () => {
    setPlayloadData({});
    setPage(1);
    setTableData([]);
    setpopupData({});
  };

  const tempDataReset = () => {
    setPlayloadData({});
    setpopupData({});
  };

  const handleAdminDelete = () => {
    setAdminDeleteDialog(false);
    mutateDelete(popupData);
  };

  const handleEditPopup = (item: any) => {
    setAdminData(item);
    setAddDialog(true);
  };

  const temps = (rowsPerPage === 'all') ? totalDataCount : rowsPerPage;
  const ordering = order === 'asc' ? orderBy : `-${orderBy}`;
  const { isLoading, refetch } = useGet({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/school-admins/?school_id=${id}&search=${searchString}&branch=${selectedBranch !== 'All' ? selectedBranch : ''}&role=${selectedRole !== 'All' ? selectedRole : ''}&limit=${temps}&offset=${(page - 1) * Number(temps)}&ordering=${ordering}`,
    onSuccess: (resp: any) => {
      const accData = resp?.data?.response;
      const respData = accData?.results;
      if (respData?.length) {
        const body: any = [];
        setTotalDataCount(accData?.count);
        const newtableData = respData?.map((item: any): any => {
          body.push([
            item?.user_id_id,
            item?.user_name,
            item?.first_name,
            item?.last_name,
            item?.email,
            moment(item?.created_at).format('YYYY-MM-DD'),
            item?.role,
            item?.status
          ]);
          const temp = {
            ...item,
            user_name: (
              <span role="presentation" className="navigateLink" onClick={() => handleEditPopup(item)}>{item?.user_name}</span>
            )
          };
          return temp;
        });
        setCsvData(body);
        setTableData(newtableData);
      }
    },
    onError: ({ response }: any) => {
      allStateReset();
    },
    enabled: false
  });
  // get Branches
  const { isLoading: getBranchLoading, refetch: fetchBranch } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-branches/branch-list/?school_id=${id}&status=Active&limit=200`,
    onSuccess: (resp: any) => {
      const respData = resp?.data?.response;
      const temp2: { label: any; value: any }[] = [];
      respData?.map((i: any) => {
        temp2.push(
          {
            label: i?.name,
            value: i?.id
          }
        );
        return temp2;
      });
      setBranchArray([ALL, ...temp2]);
    },
    onError: ({ response }: any) => {

    },
    enabled: false
  });

  // Update Admin Status
  const { isLoading: loadingStatus, mutate: mutateAdminStatus } = usePatch({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/school-admins/${playloadData?.payload?.id}/${playloadData?.payload?.status}/`,
    onSuccess: (response: any) => {
      tempDataReset();
      toast('success', 'Status Updated successfully');
      refetch();
    },
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
      setPlayloadData({});
    }
  });

  // Delete Admin
  const { isLoading: loadingDelete, mutate: mutateDelete } = useDelete({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/school-admins/${playloadData?.payload?.id}/`,
    onSuccess: (response: any) => {
      setAdminDeleteDialog(false);
      toast('success', 'Record Deleted successfully');
      tempDataReset();
      refetch();
    },
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
    }
  });

  // Toolbar Email
  const { isLoading: emailLoaded, mutate: mutateEmail } = usePost({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/school-admins/pdf-download`,
    onSuccess: (response: any) => {
      toast('success', response?.data?.message || 'Email sent successfully');
    },
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
    }
  });

  // Import CSV
  const { isLoading: importLoaded, mutate: mutateImport } = usePost({
    baseURL: import.meta.env.VITE_APP_MASTER_SERVICE_URL,
    url: `master-service/admins/csv-upload`,
    onSuccess: (response: any) => {
      tempDataReset();
      const res = response?.data?.response;
      const text = (
        <div className="font-semibold">
          <p>School Admins CSV Import </p>
          <p>
            <span className="mr-2">Total Records :</span>
            {res?.import_process_status?.total}
          </p>
          <p>
            <span className="mr-2">Success :</span>
            {res?.import_process_status?.passed_count}
          </p>
          <p>
            <span className="mr-2">Failure :</span>
            {res?.import_process_status?.failed_count}
          </p>
        </div>
      );
      toast('success', text);
      refetch();
    },
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
      tempDataReset();
    }
  });

  useEffect(() => {
    if (Object.keys(playloadData).length) {
      if (playloadData?.apiCall === APIS?.statusUpdate) {
        mutateAdminStatus(playloadData?.payload);
      } else if (playloadData?.apicall === 'sendEmail') {
        mutateEmail(playloadData?.payload);
      }
    }
  }, [playloadData]);

  useEffect(() => {
    refetch();
  }, [selectedRole, rowsPerPage, page, searchString, selectedBranch, orderBy, order]);

  useEffect(() => {
    fetchBranch();
  }, []);

  noOfpages = getNoOfPages(totalDataCount, rowsPerPage);

  if (importLoaded || emailLoaded) {
    return (<Loader />);
  }

  return (
    <RouteLayout>
      <HeaderMenus
        title="School Admins"
        subtitle={`School : ${schoolData?.school_name || branchData?.school_data?.school_name}`}
        subtitle2={branchData?.name ? `Branch : ${branchData?.name}` : ''}
        menuArray={ADMIN_TOOLBAR_MENU}
        handleToolbarAction={handleToolbarAction}
      />
      <div className="flex gap-2 mt-7 lg:items-end items-center lg:flex-row flex-col ">
        <div className="flex flex-wrap md:justify-start justify-center gap-2 lg:grow grow-0">
          <div className="pt-[30px]">
            <DebounceInput
              onChange={handleSearch}
            />
          </div>
          {
            (userRole().isSuperAdmin || userRole().isSubAdmin || userRole().isSchoolAdmin) && (
              <>
                <Dropdown
                  title="Sort by Role"
                  value={selectedRole}
                  dataArray={[ALL, ...ROLES]}
                  onChangeHandler={handleToolbarRole}
                />
                <Dropdown
                  title="Sort by Branch"
                  value={selectedBranch}
                  dataArray={branchArray}
                  onChangeHandler={handleToolbarBranch}
                />
              </>
            )
          }
          <Dropdown
            title="Result Of Pages"
            value={rowsPerPage}
            dataArray={RESULTS_PER_PAGE}
            onChangeHandler={handlePerPage}
          />
        </div>
        <CustomPagination
          totalPages={noOfpages}
          paginateHandler={handlePagination}
          currentPage={page}
        />
      </div>
      <div className="wrapperBorder mt-3" ref={componentRef}>
        <Wrapper>
          <AdvanceTable
            tableData={tableData}
            headerRows={TableColumns}
            totalPages={noOfpages}
            paginateHandler={handlePagination}
            currentPage={page}
            rowsPerPage={rowsPerPage}
            handleMoreOption={handleMoreOption}
            moreMenuOptions={moreMenuOptions}
            order={order}
            setOrder={setOrder}
            orderBy={orderBy}
            setOrderBy={setOrderBy}
            statusHandler={statusHandler}
            deleteHandler={deleteHandler}
            setPage={setPage}
            isLoading={isLoading || loadingStatus || loadingDelete}
          />
        </Wrapper>
      </div>
      <CustomizedDialogs
        onclose={() => setAdminData('')}
        open={addDialog}
        setOpen={() => setAddDialog(false)}
        title={adminData ? 'Edit Admin' : 'Add New Admin'}
      >
        <AddNewAdmin branchArray={branchArray} refetch={refetch} setAddDialog={setAddDialog} adminData={adminData} setAdminData={setAdminData} />
      </CustomizedDialogs>

      {/* Delete School */}
      <DeletePopup
        title="Remove Admin"
        description="Are you sure you want to remove the Admin?"
        open={adminDeleteDialog}
        setOpen={setAdminDeleteDialog}
        handleDelete={handleAdminDelete}
      />
    </RouteLayout>
  );
}
