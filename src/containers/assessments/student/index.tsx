import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import Button from '@component/button/button';
import DatePicker from '@component/datepicker';
import DebounceInput from '@component/input/DebounceInput';
import { ReactComponent as Share } from '@images/pageHeaderIcons/share.svg';
import EmailIcon from '@mui/icons-material/Email';
import PrintIcon from '@mui/icons-material/Print';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Divider from '@mui/material/Divider/Divider';
import { useGet } from '@shared/api/useApi';
import Loader from '@shared/loader';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import toast from '@shared/toast';
import { getNoOfPages } from '@utility/utility';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import { useSelector } from 'react-redux';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import ReactToPrint from 'react-to-print';
import CustomPagination from '../../../components/pagination/CustomPagination';
import { RESULTS_PER_PAGE, TABLE_LABELS, TOOLBAR_LABELS } from '../../../constants/constants';
import Wrapper from '../../../shared/wrapper/Wrapper';
import RouteLayout from '../../layout/routeLayout';

const printButton = () => <PrintIcon />;

export default function Index() {
  const { user } = useSelector((state: any) => state);
  const location = useLocation();
  const navigate = useNavigate();
  const { schoolName } = useParams();

  const csvSubHeaders = [
    TABLE_LABELS?.ASSESSMENT_NAME,
    TABLE_LABELS?.SUBJECT,
    TABLE_LABELS?.TEACHERS,
    TABLE_LABELS?.STATUS,
    TABLE_LABELS?.START_DATE,
    TABLE_LABELS?.DUE_DATE
  ];

  const [csvData, setCsvData] = useState<[]>([]);
  const [tableData, setTableData] = useState<any>([]);

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
      label: TABLE_LABELS?.SUBJECT,
      isSort: true,
      mapper: 'subject_name'
    },
    {
      label: TABLE_LABELS?.TEACHERS,
      isSort: true,
      mapper: 'teacher'
    },
    {
      label: TABLE_LABELS?.COMMENTS,
      mapper: 'comments'
    },
    {
      label: TABLE_LABELS?.STATUS,
      isSort: true,
      mapper: 'status'
    },
    {
      label: TABLE_LABELS?.START_DATE,
      isSort: true,
      mapper: 'start_date',
      format: 'DD-MM-YYYY'
    },
    {
      label: TABLE_LABELS?.DUE_DATE,
      align: 'center',
      mapper: 'submission_date',
      format: 'DD-MM-YYYY'
    },
    {
      label: TABLE_LABELS?.ACTION,
      align: 'center',
      mapper: 'action'
    }
  ];

  const [rowsPerPage, setRowsPerPage] = useState(RESULTS_PER_PAGE?.[0]);
  const [page, setPage] = useState(1);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [searchString, setSearchString] = useState('');
  const [order, setOrder] = useState<any>('desc');
  const [orderBy, setOrderBy] = useState<any>('created_at');
  const [fromDate, setFromDate] = useState<any>();
  const [toDate, setToDate] = useState<any>();
  const noOfpages = getNoOfPages(totalDataCount, rowsPerPage);
  const componentRef = useRef(null);

  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };

  const handleToolbarAction = async (title: string) => {
    if (title === TOOLBAR_LABELS.EMAIL) {
      fetchEmailApi();
    }
  };

  const handleSearch = (value: any) => {
    setSearchString(value);
  };

  const handleButtonClick = (data: any) => {
    navigate(`perform-assessment/${data?.assessment_id}`, { state: { page, path: `/${schoolName}/assessments` } });
  };

  const reset = () => {
    setToDate('');
    setFromDate('');
  };

  // ----------------------------------------API-------------------------
  // Get Assessment List
  const ordering = orderBy ? order === 'asc' ? orderBy : `-${orderBy}` : '';
  const { isFetching: assignmentLoading, refetch: fetchAssignedAssignments } = useGet({
    baseURL: import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/assign-assessment-student-list/?limit=${rowsPerPage}&offset=${(page - 1) * Number(rowsPerPage)}&ordering=${ordering}&search=${searchString}&start_date=${fromDate ? moment(fromDate).format('YYYY-MM-DD') : ''}&submission_date=${toDate ? moment(toDate).format('YYYY-MM-DD') : ''}&student_id=${user?.user_profile_id}&domain_name=${window?.location?.hostname}`,
    onSuccess: (res: any) => {
      const accData = res?.data?.response;
      const respData = accData?.results;
      setTotalDataCount(accData.count);
      const body: any = [];
      const newTableData = respData?.map((item: any) => {
        body.push([
          item?.assessment_name,
          item?.subject_name,
          item?.teacher,
          item?.status,
          item?.start_date,
          item?.submission_date
        ]);

        const buttonRender = (item?.assessment_status === 'Yet to start') ? 'Start' : (item?.assessment_status === 'Completed') ? 'Completed' : (item?.assessment_status === 'In Progress') ? 'In Progress' : 'Incomplete';
        const temp = {
          ...item,
          action: <Button disabled={item?.assessment_status === 'Completed' || new Date(item?.submission_date) < new Date(new Date().setHours(0, 0, 0, 0))} onClick={() => handleButtonClick(item)}>{buttonRender}</Button>
        };
        return temp;
      });
      setCsvData(body);
      setTableData(newTableData);
    }
  });

  // Toolbar Email
  const { isLoading: emailLoaded, refetch: fetchEmailApi, isRefetching: refetchEmail } = useGet({
    baseURL: import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/assign-assessment-student-email/pdf-download/?student_id=${user?.user_profile_id}`,
    onSuccess: (response: any) => {
      toast('success', 'Email sent successfully to you, please check your inbox');
    },
    onError: ({ response }: any) => {
      toast('error', response?.data?.message || 'Error');
    },
    enabled: false
  });

  // ----------------------------------------END API---------------------

  const ADMIN_TOOLBAR_MENU = [
    {
      title: TOOLBAR_LABELS.EMAIL,
      icon: (emailLoaded || refetchEmail) ? <Loader size={20} /> : <EmailIcon />
    },
    {
      title: TOOLBAR_LABELS.EXPORT,
      icon: (
        <CSVLink
          filename="Student Asessment List.csv"
          data={csvData}
          headers={csvSubHeaders}
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
    fetchAssignedAssignments();
  }, [searchString, rowsPerPage, page, orderBy, order, searchString, toDate, fromDate]);

  useEffect(() => {
    if (location?.state?.page) {
      setPage(location?.state?.page);
    }
  }, []);

  return (
    <RouteLayout>
      <HeaderMenus title="Assigned Assessments" menuArray={ADMIN_TOOLBAR_MENU} handleToolbarAction={handleToolbarAction} />
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
          <div className="flex gap-2 justify-center items-center h-[36px]">
            <span tabIndex={0} title="Clear dates" onClick={reset} role="button">
              <RestartAltIcon />
            </span>
            <Divider orientation="vertical" flexItem={true} className="border-[#D2D2D2] pl-2" />
            <Link to={`${location?.pathname}/completed-assessments`}>
              <div className="text-accent underline cursor-pointer text-base font-medium pl-2">
                Completed Assessments
              </div>
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
            isLoading={assignmentLoading}
          />
        </Wrapper>
      </div>
    </RouteLayout>
  );
}
