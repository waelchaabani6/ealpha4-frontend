import { useEffect, useState, useRef } from 'react';
import ReactToPrint from 'react-to-print';
import Dropdown from '@component/dropdown/Dropdown';
import { COMPONENTS, RESULTS_PER_PAGE, STATUS_ITEMS, TABLE_LABELS, TOOLBAR_LABELS } from '@constants/constants';
import { BRANCH, NEW_BRANCH, PANEL, SCHOOL, SCHOOL_MANAGEMENT } from '@constants/routes';
import { ReactComponent as Delete } from '@images/longMenuIcons/Delete.svg';
import { ReactComponent as License } from '@images/longMenuIcons/license.svg';
import { ReactComponent as Download } from '@images/pageHeaderIcons/download.svg';
import { ReactComponent as Share } from '@images/pageHeaderIcons/share.svg';
import AddIcon from '@mui/icons-material/Add';
import EmailIcon from '@mui/icons-material/Email';
import PrintIcon from '@mui/icons-material/Print';
import { CSVLink } from 'react-csv';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import { getNoOfPages, userRole } from '@utility/utility';
import { useNavigate, Link, useParams } from 'react-router-dom';
import CustomPagination from '@component/pagination/CustomPagination';
import Wrapper from '@shared/wrapper/Wrapper';
import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import PermanentlyRemoveBranch from '@containers/schoolManagement/components/PermanentlyRemoveBranch';
import MigrateUser from '@containers/schoolManagement/components/MigrateUser';
import RemoveBranchPopup from '@containers/schoolManagement/components/RemoveBranchPopup';
import ExtendLicensePopupForm from '@containers/schoolManagement/components/ExtendLicensePopupForm';
import RouteLayout from '@layout/routeLayout';
import { useGet, usePatch, usePost } from '@shared/api/useApi';
import toast from '@shared/toast';
import SimpleBackdrop from '@component/Backdrop';
import moment from 'moment';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import { selectSchoolData } from '@shared/store/schoolSlice';
import { useSelector } from 'react-redux';
import Loader from '@shared/loader';

const printButton = () => <PrintIcon />;

type removedBranchObjectType = {
  school_id: string;
  current_branch_id: string;
}

export default function Branches() {
  const navigate = useNavigate();
  const { id } = useParams();
  const componentRef = useRef(null);
  const { schoolData, branchData } = useSelector(selectSchoolData);

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

  const [csvData, setCsvData] = useState<[]>([]);

  const headers = [
    TABLE_LABELS?.SCHOOL_ID,
    TABLE_LABELS?.SCHOOL_NAME,
    TABLE_LABELS?.BRANCH_ID,
    TABLE_LABELS?.BRANCH_NAME,
    TABLE_LABELS?.BRANCH_TYPE,
    TABLE_LABELS?.CREATED_ON,
    TABLE_LABELS?.EXPIRATION,
    TABLE_LABELS?.EXPIRATION_DAYS_LEFT,
    TABLE_LABELS?.STATUS
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
      icon: <CSVLink filename="Branch List.csv" data={csvData} headers={headers} enclosingCharacter=""><Share /></CSVLink>
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
      label: TABLE_LABELS?.BRANCH_ID,
      align: 'center',
      isSort: true,
      mapper: 'id'
    },
    {
      label: TABLE_LABELS?.BRANCH_NAME,
      isSort: true,
      mapper: 'name'
    },
    {
      label: TABLE_LABELS?.BRANCH_TYPE,
      align: 'center',
      isSort: true,
      mapper: 'branch_type'
    },
    {
      label: TABLE_LABELS?.CREATED_ON,
      isSort: true,
      mapper: 'created_at',
      format: 'DD-MM-YYYY'
    },
    {
      label: TABLE_LABELS?.EXPIRATION,
      isSort: true,
      mapper: 'activation_end_date',
      format: 'DD-MM-YYYY'
    },
    {
      label: TABLE_LABELS?.EXPIRATION_DAYS_LEFT,
      isSort: true,
      mapper: 'expiration_days_left'
    },
    {
      label: TABLE_LABELS?.STATUS,
      align: 'center',
      mapper: 'status',
      component: COMPONENTS?.switch,
      showInHeader: false
    },
    {
      label: TABLE_LABELS?.ACTION,
      component: COMPONENTS?.longmenu
    }
  ];
  const ALL = {
    label: 'All',
    value: 'All'
  };
  let noOfpages = 1;
  const [selectData, setSelectData] = useState(ALL?.value);
  const [page, setPage] = useState(1);
  const [selectedAcademicYear, setselectedAcademicYear] = useState(ALL?.value);
  const [academicYearArray, setAcademicYearArray] = useState<any>([ALL]);
  const [tableData, setTableData] = useState<any>([]);
  const [rowsPerPage, setRowsPerPage] = useState(RESULTS_PER_PAGE?.[0]);
  const [order, setOrder] = useState<any>('desc');
  const [orderBy, setOrderBy] = useState<any>('created_at');
  const [licenseDialog, setLicenseDialog] = useState(false);
  const [playloadData, setPlayloadData] = useState<any | undefined>({});
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [popupData, setpopupData] = useState({});
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [migrateDialog, setMigrateDialog] = useState(false);
  const [permanentyRemoveDialog, setPermanentyRemoveDialog] = useState(false);
  const [schoolName, setSchoolName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [migrateTo, setMigrateTo] = useState('');
  const [schoolDetails, setSchoolDetails] = useState<any>({});
  const [removedBranchObject, setRemovedBranchObject] = useState<removedBranchObjectType | null>(null);

  const handleStatus = (e: any) => {
    setSelectData(e);
  };
  const handleAcademic = (e: any) => {
    setselectedAcademicYear(e);
  };
  const handlePerPage = (e: any) => {
    setRowsPerPage(e);
  };
  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };
  const statusHandler = (e: any, data: object | any) => {
    const payload = {
      status: (e.target.checked) ? 'Active' : 'Inactive'
    };
    setPlayloadData({
      apicall: 'branchStatus',
      payload,
      id: data?.id
    });
  };
  const handleMoreOption = (id2: any, rowData: any) => {
    setpopupData(rowData);
    if (id2 === moreMenuOptions[0]?.value) {
      setLicenseDialog(true);
    } else if (id2 === moreMenuOptions[1]?.value) {
      setDeleteDialog(true);
    }
  };

  const tableReset = () => {
    setPage(1);
    setTableData([]);
    setTotalDataCount(0);
  };

  const allStateReset = () => {
    tableReset();
    tempDataReset();
  };

  const tempDataReset = () => {
    setPlayloadData({});
    setpopupData({});
  };

  const handleToolbarAction = (title: string) => {
    if (title === TOOLBAR_LABELS.ADD) {
      if (userRole().isSchoolAdmin) {
        navigate(`/${schoolData?.school_name}/dashboard/${id}/new-branch`);
      } else {
        navigate(`${SCHOOL_MANAGEMENT}/${SCHOOL}/${id}/${NEW_BRANCH}`);
      }
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
        documentFormData.append('school_id', id);
        mutateImport(documentFormData);
      } else {
        toast('error', 'Please upload CSV filetype only');
      }
    };
    input.click();
  };

  const handelSendEmail = () => {
    const payload = {
      list_type: 'branch-list',
      school_id: id
    };
    setPlayloadData({
      apicall: 'sendEmail',
      payload
    });
  };

  //  Get Academiic Year
  const { isLoading: academicYearLoading, refetch: academicFetch } = useGet({
    baseURL: import.meta.env.VITE_APP_MASTER_SERVICE_URL,
    url: 'master-service/academic-year/',
    cacheTime: 2000,
    onSuccess: (res: any) => {
      const resp = res?.data || [];
      setAcademicYearArray([ALL, ...resp]);
    }
  });

  // Import CSV
  const { isLoading: importLoaded, mutate: mutateImport } = usePost({
    baseURL: import.meta.env.VITE_APP_MASTER_SERVICE_URL,
    url: `master-service/school-branches/csv-upload`,
    onSuccess: (response: any) => {
      tempDataReset();
      const res = response?.data?.response;
      const text = (
        <div className="font-semibold">
          <p>Manage Branches CSV Import </p>
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

  const temps = (rowsPerPage === 'all') ? totalDataCount : rowsPerPage;
  const ordering = order === 'asc' ? orderBy : `-${orderBy}`;
  const { isLoading, refetch } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-branches/?school_id=${id}&status=${selectData !== 'All' ? selectData : ''}&academic_year=${selectedAcademicYear !== 'All' ? selectedAcademicYear : ''}&limit=${temps}&offset=${(page - 1) * Number(temps)}&ordering=${ordering}`,
    onSuccess: (resp: any) => {
      const accData = resp?.data?.response;
      const respData = accData?.results;
      if (respData?.length) {
        const body: any = [];
        setTotalDataCount(accData?.count);
        const newtableData = respData?.map((item: any, i: any): any => {
          if (removedBranchObject && removedBranchObject.current_branch_id === item.id) {
            return null;
          }
          body.push([
            item?.school_data?.id,
            item?.school_data?.name,
            item?.id,
            item?.name,
            item?.branch_type,
            moment(item?.created_at).format('DD-MM-YYYY'),
            item?.activation_end_date,
            item?.expiration_days_left,
            item?.status
          ]);
          let link = `${SCHOOL_MANAGEMENT}/${BRANCH}/${item?.id}/${PANEL}`;
          if (!(userRole().isSubAdmin || userRole().isSuperAdmin)) {
            link = `/${schoolData?.school_name}/dashboard/branch/${item?.id}/edit`;
          }
          if (userRole().isSchoolAdmin) {
            link = `/${schoolData?.school_name}/dashboard/branch/${item?.id}/panel`;
          }
          const temp = {
            ...item,
            name: (
              <Link to={link}>
                <span className="navigateLink">{item?.name}</span>
              </Link>
            ),
            school_name: item?.name,
            branch_name: item?.name
          };
          return temp;
        }).filter((ele: any) => ele);
        setCsvData(body);
        setTableData(newtableData);
      } else {
        tableReset();
      }
    },
    onError: ({ response }: any) => {
      allStateReset();
    },
    enabled: false
  });

  // Update Status
  const { isLoading: loadingBranchStatus, mutate: mutateBranchStatus } = usePatch({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-branches/change-status/${playloadData?.id}`,
    onSuccess: (response: any) => {
      refetch();
      tempDataReset();
      toast('success', 'Status Updated successfully');
    },
    onError: ({ response }: any) => {
      refetch();
      toast('error', response?.statusText || 'Error');
    }
  });

  // Get School Details
  // const { isLoading: schoolDetailsLoader, refetch: mutateSchoolDetails } = useGet({
  //   url: `schools-service/schools/${id}/`,
  //   onSuccess: (res: any) => {
  //     const resp = res?.data;
  //     setSchoolDetails(resp);
  //   },
  //   onError: ({ response }: any) => {
  //     toast('error', response?.statusText || 'Error');
  //   }
  // });

  // Toolbar Email
  const { isLoading: emailLoaded, mutate: mutateEmail } = usePost({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/branch-list/pdf-download`,
    onSuccess: (response: any) => {
      tempDataReset();
      toast('success', 'Email sent successfully');
    },
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
      tempDataReset();
    }
  });

  useEffect(() => {
    if (Object.keys(playloadData).length) {
      if (playloadData?.apicall === 'branchStatus') {
        mutateBranchStatus(playloadData?.payload);
      } else if (playloadData?.apicall === 'sendEmail') {
        mutateEmail(playloadData?.payload);
      }
    }
  }, [playloadData]);

  useEffect(() => {
    refetch();
  }, [rowsPerPage, page, selectData, orderBy, order, selectedAcademicYear]);

  useEffect(() => {
    academicFetch();
    // mutateSchoolDetails();
  }, []);

  noOfpages = getNoOfPages(totalDataCount, rowsPerPage);
  if (isLoading || loadingBranchStatus || importLoaded || emailLoaded) {
    return (<Loader />);
  }
  return (
    <>
      <RouteLayout navBack={true}>
        <HeaderMenus
          title="Manage Branches"
          subtitle={`School : ${schoolData?.school_name || branchData?.school_data?.school_name}`}
          subtitle2={branchData?.name ? `Branch : ${branchData?.name}` : ''}
          menuArray={ADMIN_TOOLBAR_MENU}
          handleToolbarAction={handleToolbarAction}
        />
        <div className="flex gap-2 mt-7 lg:items-end items-center lg:flex-row flex-col ">
          <div className="flex flex-wrap md:justify-start justify-center gap-2 lg:grow grow-0">
            <Dropdown
              title="Select : Status"
              value={selectData}
              dataArray={STATUS_ITEMS}
              onChangeHandler={handleStatus}
            />
            <Dropdown
              title="Academic Year"
              value={selectedAcademicYear}
              dataArray={academicYearArray}
              onChangeHandler={handleAcademic}
            />
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
              setPage={setPage}
            />
          </Wrapper>
        </div>

        {/* Extend License Dialog */}
        <ExtendLicensePopupForm
          propDatas={popupData}
          title={moreMenuOptions[0].label}
          licenseDialog={licenseDialog}
          setLicenseDialog={setLicenseDialog}
          refetch={refetch}
        />

        {/* Remove Branch */}
        <RemoveBranchPopup
          title="Remove Branch"
          propDatas={popupData}
          refetch={refetch}
          deleteDialog={deleteDialog}
          setDeleteDialog={setDeleteDialog}
          setMigrateDialog={setMigrateDialog}
          setRemovedBranchObject={setRemovedBranchObject}
        />

        {/* Migrate User */}
        <MigrateUser
          title="Migrate User"
          migrateDialog={migrateDialog}
          setMigrateDialog={setMigrateDialog}
          schoolName={schoolName}
          setSchoolName={setSchoolName}
          branchName={branchName}
          setBranchName={setBranchName}
          migrateTo={migrateTo}
          setMigrateTo={setMigrateTo}
          migraToData={moreMenuOptions}
        />

        {/* Permanently Remove Branch */}
        <PermanentlyRemoveBranch
          title="Remove Branch"
          permanentyRemoveDialog={permanentyRemoveDialog}
          setPermanentyRemoveDialog={setPermanentyRemoveDialog}
          schoolName={schoolName}
          setSchoolName={setSchoolName}
          branchName={branchName}
          setBranchName={setBranchName}
        />
        {/* <SimpleBackdrop
          open={isLoading || loadingBranchStatus || importLoaded || emailLoaded}
        /> */}
      </RouteLayout>
    </>
  );
}
