/* eslint-disable comma-dangle */
import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import Button from '@component/button/button';
import DatePicker from '@component/datepicker';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import DebounceInput from '@component/input/DebounceInput';
import CustomPagination from '@component/pagination/CustomPagination';
import { RESULTS_PER_PAGE, TABLE_LABELS, TOOLBAR_LABELS } from '@constants/constants';
import { ReactComponent as Share } from '@images/pageHeaderIcons/share.svg';
import RouteLayout from '@layout/routeLayout';
import EmailIcon from '@mui/icons-material/Email';
import PrintIcon from '@mui/icons-material/Print';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DeletePopup from '@shared/DeletePopup';
import {api, useDelete, useGet} from '@shared/api/useApi';
import Loader from '@shared/loader';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import PageTitle from '@shared/pageTitle';
import toast from '@shared/toast';
import Wrapper from '@shared/wrapper/Wrapper';
import {getNoOfPages, userRole} from '@utility/utility';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import { useSelector } from 'react-redux';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import ReactToPrint from 'react-to-print';
import Dropdown from '@component/dropdown/Dropdown';
// eslint-disable-next-line import/no-extraneous-dependencies
import encryptMessage from '@utility/encrypt';

const printButton = () => <PrintIcon />;
interface Message {
  key: string;
  user_name: string;
  user_id: string;
  obeasses_id: string | null;
  date_time: Date;
  role: String;
  redirectionPath?: String;
  user_ting: String;
  report_details?: {teacher?:String, start_date?:String, end_date?:String};
}
export default function OBE_CompletedAssessments() {
  const { schoolName } = useParams();
  const { user } = useSelector((state: any) => state);
  const navigate = useNavigate();
  const location = useLocation();

  const CompletedTableColumns = [
    {
      label: 'First Name',
      mapper: 'first_name'
    },
    {
      label: 'Last Name',
      mapper: 'last_name'
    }
  ];

  const PendingTableColumns = [
    {
      label: 'First Name',
      mapper: 'first_name'
    },
    {
      label: 'Last Name',
      mapper: 'last_name'
    }
  ];

  const headers = [
    TABLE_LABELS?.ASSESSMENT_NAME,
    TABLE_LABELS?.TEACHERS,
    TABLE_LABELS?.START_DATE,
    TABLE_LABELS?.END_DATE
  ];

  const [csvData, setCsvData] = useState<[]>([]);
  const [tableData, setTableData] = useState<any>([]);
  const [userRoles, setUserRoles] = useState<any>({});
  const [adminDeleteDialog, setAdminDeleteDialog] = useState(false);

  const TableColumns = [
    {
      label: TABLE_LABELS?.SR_NO,
      align: 'center'
    },
    {
      label: TABLE_LABELS?.ASSESSMENT_NAME,
      mapper: 'assessment_name',
      isSort: true
    },
    {
      label: TABLE_LABELS?.TEACHERS,
      mapper: 'teacher',
      isSort: true
    },
    {
      label: TABLE_LABELS?.START_DATE,
      isSort: true,
      mapper: 'start_date',
      format: 'DD-MM-YYYY'
    },
    {
      label: TABLE_LABELS?.DUE_DATE,
      isSort: true,
      mapper: 'submission_date',
      format: 'DD-MM-YYYY'
    },
    {
      label: TABLE_LABELS?.ACTION,
      mapper: 'action'
    }
  ];
  interface UserData {
    user_ting: string;
    role?: { name: string };
  }

  const [rowsPerPage, setRowsPerPage] = useState(RESULTS_PER_PAGE?.[0]);
  const [page, setPage] = useState(1);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [popupData, setpopupData] = useState<any>({});

  const [searchString, setSearchString] = useState('');
  const [playloadData, setPlayloadData] = useState<any | undefined>({});
  const [order, setOrder] = useState<any>('desc');
  const [orderBy, setOrderBy] = useState<any>('created_at');
  const [fromDate, setFromDate] = useState<any>('');
  const [toDate, setToDate] = useState<any>('');
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const completedAssignRef = useRef(null);
  const userData = useSelector((state: any) => state?.user) as UserData;
  const searchParams = new URLSearchParams(location.search);
  const assessmentId = searchParams.get('assessment_id');
  const obeassesId = searchParams.get('obeasses_id');



  const noOfpages = getNoOfPages(totalDataCount, rowsPerPage);
  const componentRef = useRef(null);


  const handleDialog = () => {
    setDialogOpen(false);
  };

  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };

  const handleToolbarAction = async (title: string) => {
    if (title === TOOLBAR_LABELS.EMAIL) {
      fetchEmailApi();
    } else if (title === TOOLBAR_LABELS.IMPORT) {
      fetchEmailApi();
    }
  };

  const handleSearch = (value: any) => {
    setSearchString(value);
  };

  const actionHandler = (data: any, handlername: string) => {
    if (handlername === 'delete') {
      deleteHandler(data);
    } else if (handlername === 'view') {
      window.location.replace(`preview_myassessment_question/${data?.assessment_id}`);
    }
  };

  const deleteHandler = (row: any) => {
    setPlayloadData({
      id: row?.assessment_id
    });
    setAdminDeleteDialog(true);
  };

  const handleAdminDelete = () => {
    setAdminDeleteDialog(false);
    mutateDelete(playloadData);
  };

  const reset = () => {
    setToDate('');
    setFromDate('');
  };

  /*  const handleButtonClick = (data: any) => {
    navigate(`/${schoolName}/assessments/assigned/assessment-report/${data?.assessment_id}?assessment=${data?.assessment_name}`, { state: { page, obeasses_id: data?.obeasses_id, path: `/${schoolName}/assessments/completed-assessments` } });
  }; */
  const handleButtonClick = (data: any) => {
    const obeasses_id = data?.obeasses_id;
    const user_ting = data?.user_ting;
    const currentDate = new Date();
    const schoolName = decodeURIComponent(location.pathname.split('/')[1]);
    const targetPagePath = `/${schoolName}/obe-assessments/assigned/completed_assessments`; // Update this to the path of the page you want to redirect to
    const targetPageUrl = `${window.location.origin}${targetPagePath}`; // Constructs the full URL
    const domain_name = import.meta.env.VITE_OBESASS_domain_name;
    const reportDetails = {teacher:data?.teacher,start_date:data?.start_date,end_date:data?.submission_date};
    const message: Message = {
      key: import.meta.env.VITE_OBESASS_API_ENC_KEY as string,
      user_name: `${user?.first_name} ${user?.last_name}`,
      user_id: user?.user_ting,
      obeasses_id: obeasses_id || null,
      date_time: currentDate,
      role: user?.role?.name,
      redirectionPath: targetPageUrl,
      user_ting,
      report_details:reportDetails
    };
    const encryptedData = encryptMessage(JSON.stringify(message));
    window.open(`${import.meta.env.VITE_APP_IFRAME_APP_SDK}/student-reports/${obeasses_id}?token=${encodeURIComponent(encryptedData)}&domain_name=${domain_name}`, '_blank');
  };
  // ----------------------------------------API-------------------------
  // Get Assessment List
  const ordering = orderBy ? order === 'asc' ? orderBy : `-${orderBy}` : '';
  const { isFetching: assignmentLoading, refetch: fetchAssignedAssignments } = useGet({
    baseURL: import.meta.env.VITE_APP_OBE_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/completed-assign-assessment-student-list/?student_id=${user?.user_profile_id}&limit=${rowsPerPage}&offset=${(page - 1) * Number(rowsPerPage)}&ordering=${ordering}&search=${searchString}&start_date=${fromDate ? moment(fromDate).format('YYYY-MM-DD') : ''}&submission_date=${toDate ? moment(toDate).format('YYYY-MM-DD') : ''}`,
    onSuccess: (res: any) => {
      const accData = res?.data?.response;
      const respData = accData?.results;
      setTotalDataCount(accData.count);
      const body: any = [];
      const newTableData = respData?.map((item: any) => {
        body.push([
          item?.assessment_name,
          item?.teacher,
          item?.start_date,
          item?.submission_date
        ]);

        const temp = {
          ...item,
          action: <Button onClick={() => handleButtonClick(item)}>Get report</Button>
        };
        return temp;
      });
      setCsvData(body);
      setTableData(newTableData);
    }
  });

  // Delete Admin
  const { isLoading: loadingDelete, mutate: mutateDelete } = useDelete({
    baseURL: import.meta.env.VITE_APP_OBE_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/delete-assign-assessment/${playloadData?.id}/`,
    onSuccess: (response: any) => {
      toast('success', 'Record Deleted successfully');
      fetchAssignedAssignments();
    },
    onError: ({ response }: any) => {
      toast('error', response?.data?.message || response?.statusText || 'Error');
    }
  });

  const {
    isLoading: loadSync,
    refetch: fetchUpdateStatus,
  } = useGet({
    baseURL: import.meta.env.VITE_APP_OBE_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/update-assessment-status/?user_ting=${userData?.user_ting}&domain_name=${import.meta.env.VITE_OBESASS_domain_name}&obeasses_id=${obeassesId}&assessment_id=${assessmentId}`,
    enabled: false, // prevent auto call
  });

  // Toolbar Email
  const { isLoading: emailLoaded, isRefetching: refetchEmail, refetch: fetchEmailApi } = useGet({
    baseURL: import.meta.env.VITE_APP_OBE_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/assign-assessment-student-list/pdf-download/?student_id=${user?.user_profile_id}`,
    onSuccess: (response: any) => {
      toast('success', 'Email sent successfully');
    },
    onError: ({ response }: any) => {
      toast('error', response?.data?.message || 'Error');
    },
    enabled: false
  });

  // ----------------------------------------END API---------------------

  const ADMIN_TOOLBAR_MENU = [
    // {
    //   title: TOOLBAR_LABELS.EMAIL,
    //   icon: (emailLoaded || refetchEmail) ? <Loader size={20} /> : <EmailIcon />
    // },
    {
      title: TOOLBAR_LABELS.EXPORT,
      icon: (
        <CSVLink
          filename="Completed Student Assessment List.csv"
          data={csvData}
          headers={headers}
          enclosingCharacter=""
        >
          <Share />
        </CSVLink>
      )
    },
    {
      title: TOOLBAR_LABELS.PRINT,
      icon: <ReactToPrint
        trigger={printButton}
        content={() => componentRef.current}
      />
    }
  ];

  useEffect(() => {
    const updateAndFetchData = async () => {
      if (obeassesId && assessmentId) {
        try {
          await fetchUpdateStatus(); // update status first
        } catch (e) {
          console.error("Failed to update assessment status", e);
          // optionally show toast or handle error
        }
      }
      fetchAssignedAssignments(); // fetch DataTable after update
    };
  
    updateAndFetchData();
  }, [rowsPerPage, page, orderBy, order, searchString, toDate, fromDate, obeassesId, assessmentId]);

  useEffect(() => {
    if (location?.state?.page) {
      setPage(location?.state?.page);
    }
  }, []);



  if (emailLoaded) {
    <div className="backdrop-blur-sm bg-white/30 w-screen h-screen absolute z-50 top-0 left-0 grid place-items-center">
      <Loader size={50} />
    </div>;
  }

  const handlePerPage = (e: any) => {
    setPage(page);
    setRowsPerPage(e);
  };

  return (
    <RouteLayout>
      <HeaderMenus title="Completed Assessments" menuArray={ADMIN_TOOLBAR_MENU} handleToolbarAction={handleToolbarAction} />
      <div className="flex gap-2 mt-7 lg:items-end items-center lg:flex-row flex-col ">
        <div className="flex md:justify-start justify-center gap-2 lg:grow grow-0 items-end">
          <div className="pt-[30px]">
            <DebounceInput
              onChange={handleSearch}
              loading={assignmentLoading}
            />
          </div>
          <div>
            <DatePicker
              value={fromDate}
              label="From"
              handlePickerChange={(date: string) => setFromDate(date)}
              sxType={1}
              defaultStyle={true}
              format="YYYY-MM-DD"
              disableFuture={toDate}
              disablePast={false}
            />
          </div>
          <div>
            <DatePicker
              value={toDate}
              label="To"
              handlePickerChange={(date: string) => setToDate(date)}
              sxType={1}
              defaultStyle={true}
              format="YYYY-MM-DD"
              disablePast={false}
              disableOld={fromDate}
            />
          </div>
          <Dropdown
            title="Result Of Pages"
            value={rowsPerPage}
            dataArray={RESULTS_PER_PAGE}
            onChangeHandler={handlePerPage}
            sxClass={{ width: '206px', marginRight: '5px' }}
          />
          <div className="flex gap-2 justify-center items-center h-[36px]">
            {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
            <span tabIndex={0} title="Clear dates" onClick={reset} role="button">
              <RestartAltIcon />
            </span>
            <Link to={`/${schoolName}/obe-assessments`} className="cursor-pointer h-full font-medium underline flex items-center md:border-l-2 px-2 border-gray-300 text-accent">
              My Assessments
            </Link>
          </div>
        </div>
        <CustomPagination
          totalPages={noOfpages}
          paginateHandler={handlePagination}
          currentPage={page}
        />
      </div>
      {/* Table Section */}
      <div className="wrapperBorder mt-3" ref={componentRef}>
        <Wrapper>
          <AdvanceTable
            tableData={tableData}
            headerRows={TableColumns}
            totalPages={noOfpages}
            paginateHandler={handlePagination}
            currentPage={page}
            setPage={setPage}
            rowsPerPage={rowsPerPage}
            orderBy={orderBy}
            setOrderBy={setOrderBy}
            order={order}
            setOrder={setOrder}
            actionHandler={actionHandler}
            isLoading={assignmentLoading || loadingDelete}
          />
        </Wrapper>
      </div>
      <CustomizedDialogs
        maxwidth="sm"
        open={dialogOpen}
        setOpen={() => {
          handleDialog();
        }}
        title="Completed Assessments"
      >
        <div ref={completedAssignRef}>
          <div className="flex gap-2 justify-between items-center mb-3">
            <PageTitle title="Submitted" />
            <ReactToPrint
              trigger={printButton}
              content={() => completedAssignRef.current}
            />
          </div>
          <Wrapper>
            <AdvanceTable
              tableData={popupData?.completed || []}
              headerRows={CompletedTableColumns}
            />
          </Wrapper>
          <div className="flex mb-3">
            <PageTitle title="Pending" />
          </div>
          <Wrapper>
            <AdvanceTable
              tableData={popupData?.incomplete || []}
              headerRows={PendingTableColumns}
            />
          </Wrapper>
        </div>
      </CustomizedDialogs>
      {/* Delete Assignment */}
      <DeletePopup
        title="Delete Assessment"
        description="Are you sure you want to delete Assessment?"
        open={adminDeleteDialog}
        setOpen={setAdminDeleteDialog}
        handleDelete={handleAdminDelete}
      />
    </RouteLayout>
  );
}
