import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import DatePicker from '@component/datepicker';
import Dropdown from '@component/dropdown/Dropdown';
import DebounceInput from '@component/input/DebounceInput';
import { ReactComponent as Share } from '@images/pageHeaderIcons/share.svg';
import EmailIcon from '@mui/icons-material/Email';
import PrintIcon from '@mui/icons-material/Print';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Divider from '@mui/material/Divider/Divider';
import { useGet } from '@shared/api/useApi';
import Loader from '@shared/loader';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import { selectUser } from '@shared/store/userSlice';
import toast from '@shared/toast';
import { getNoOfPages, sortData } from '@utility/utility';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import { useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ReactToPrint from 'react-to-print';
import CustomPagination from '../../../components/pagination/CustomPagination';
import { RESULTS_PER_PAGE, TABLE_LABELS, TOOLBAR_LABELS } from '../../../constants/constants';
import Wrapper from '../../../shared/wrapper/Wrapper';
import RouteLayout from '../../layout/routeLayout';

const printButton = () => <PrintIcon />;

export default function Index() {
  const location = useLocation();

  const headers = [
    TABLE_LABELS?.SR_NO,
    TABLE_LABELS?.ASSIGNMET_NAME,
    TABLE_LABELS?.TEACHER,
    TABLE_LABELS?.STATUS,
    TABLE_LABELS?.START_DATE,
    TABLE_LABELS?.DUE_DATE
  ];

  const [exportData, setExportData] = useState<[]>([]);
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
      label: TABLE_LABELS?.TEACHERS,
      isSort: true,
      mapper: 'teacher'
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
      mapper: 'submission_date',
      format: 'DD-MM-YYYY'

    }
  ];

  const statusArray = [
    { label: 'All', value: 'All' },
    { label: 'Ongoing', value: 'Ongoing' },
    { label: 'Submitted', value: 'Submitted' },
    { label: 'Yet to Start', value: 'Yet to start' }
  ];

  const [rowsPerPage, setRowsPerPage] = useState(RESULTS_PER_PAGE?.[0]);
  const [page, setPage] = useState(1);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [searchString, setSearchString] = useState('');

  const [playloadData, setPlayloadData] = useState<any | undefined>({});
  const [order, setOrder] = useState<any>('desc');
  const [orderBy, setOrderBy] = useState<any>('created_at');
  const [fromDate, setFromDate] = useState<any>();
  const [toDate, setToDate] = useState<any>();
  const noOfpages = getNoOfPages(totalDataCount, rowsPerPage);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedChild, setSelectedChild] = useState('');
  // const [statusArray, setStatusArray] = useState();
  // const [childArray, setChildArray] = useState([{ label: 'Select', value: 'Select' }]);
  const [childrenData, setChildrenData] = useState<any>([]);
  const { userId } = useSelector(selectUser);
  // noOfpages = getNoOfPages(totalDataCount, rowsPerPage);
  const componentRef = useRef(null);

  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };

  const handleToolbarAction = async (title: string) => {
    if (title === TOOLBAR_LABELS.EMAIL) {
      fetchEmailApi();
    } else if (title === TOOLBAR_LABELS.IMPORT) {
      // importData();
    }
  };

  const handleSearch = (value: any) => {
    setSearchString(value);
  };

  const handleButtonClick = (data: any) => {
    window.location.replace(`assessments/perform-assessment/${data?.assessment_id}`);
  };

  // Toolbar Email
  const { isLoading: emailLoaded, refetch: fetchEmailApi, isRefetching: refetchEmail } = useGet({
    baseURL: import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/assign-assessment-student-email/pdf-download/?student_id=${selectedChild}`,
    onSuccess: (response: any) => {
      toast('success', 'Email sent successfully to you, please check your inbox');
    },
    onError: ({ response }: any) => {
      toast('error', response?.data?.message || 'Error');
    },
    enabled: false
  });

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
          data={exportData}
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

  // ----------------------------------------API-------------------------
  // Get Childrens List
  const { isLoading: childrenLoading, refetch: childrenFetch } = useGet({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/parent-student-details/${userId}/`,
    onSuccess: (res: any) => {
      const resp = res?.data?.response?.students;
      const body: any = [];
      resp?.map((i: any) => {
        body.push(
          {
            label: `${i?.first_name} ${i?.last_name}`,
            value: i?.id,
            class: i?.class_name
          }
        );
        body.sort(sortData);
        return body;
      });
      setChildrenData([...body]);
    },
    onError: () => { }
  });

  // ----------------------------------------API-------------------------
  // Get Assessment List
  const ordering = orderBy ? order === 'asc' ? orderBy : `-${orderBy}` : '';
  const { isFetching: assignmentLoading, refetch: fetchAssignedAssignments } = useGet({
    baseURL: import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/student--assign-assessment-list/?limit=${rowsPerPage}&offset=${(page - 1) * Number(rowsPerPage)}${searchString ? `&assessment_name=${searchString}` : ''}${selectedStatus !== 'All' ? `&status=${selectedStatus}` : ''}${selectedChild ? `&student_id=${selectedChild}` : ''}${fromDate ? `&start_date=${moment(fromDate).format('YYYY-MM-DD')}` : ''}${toDate ? `&submission_date=${moment(toDate).format('YYYY-MM-DD')}` : ''}`,
    onSuccess: (res: any) => {
      const accData = res?.data?.response;
      const respData = accData?.results;
      setTotalDataCount(accData.count);
      const body: any = [];
      // const schoolNameInURL = decodeURIComponent(location.pathname.split('/')[1]);
      const newTableData = respData?.map((item: any) => {
        body.push([
          item?.id,
          item?.assessment_name,
          item?.teacher,
          item?.status,
          item?.start_date,
          item?.submission_date
        ]);
        // const buttonRender = (item?.assessment_status === 'Yet to start') ? 'Start' : (item?.assessment_status === 'Completed') ? 'Completed' : 'Continue';
        // const link = `/${schoolNameInURL}/assessments/assigned/assessment-report/${item?.assessment_id}?assessment=${item?.assessment_name}`;
        const temp = {
          ...item
          // action: <Button disabled={item?.assessment_status === 'Completed'} onClick={() => handleButtonClick(item)}>{buttonRender}</Button>
        };
        return temp;
      });
      setTableData(newTableData);
      setExportData(body);
    },
    enabled: false
  });

  // ----------------------------------------END API---------------------

  const reset = () => {
    setToDate('');
    setFromDate('');
  };

  useEffect(() => {
    if (userId) {
      childrenFetch();
    }
  }, [userId]);

  useEffect(() => {
    if (childrenData.length) {
      setSelectedChild(childrenData[0].value);
    }
  }, [childrenData]);

  useEffect(() => {
    if (selectedChild) {
      fetchAssignedAssignments();
    }
  }, [searchString, rowsPerPage, page, orderBy, order, selectedStatus, selectedChild, toDate, fromDate]);

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
          <Dropdown
            title="Sort by: Status"
            value={selectedStatus}
            dataArray={statusArray}
            onChangeHandler={(value) => setSelectedStatus(value)}
          />
          <Dropdown
            title="Select Child"
            value={selectedChild}
            dataArray={childrenData}
            displayEmpty={true}
            onChangeHandler={(value) => setSelectedChild(value)}
            loading={childrenLoading}
          />
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
            {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
            <span tabIndex={0} title="Clear dates" onClick={reset} role="button">
              <RestartAltIcon />
            </span>
            <Divider orientation="vertical" flexItem={true} className="border-[#D2D2D2] pl-2" />
            <Link to={`${location?.pathname}/completed-assessments`}>
              <div className="text-accent underline cursor-pointer text-base font-medium pl-2">
                Completed Assessment
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
      <div className="flex mt-3">
        <div className="mr-12">
          <span className="text-sm font-semibold">Child Name: </span>
          <span className="text-sm font-normal">{childrenData?.find((obj: any) => obj?.value === selectedChild)?.label}</span>
        </div>
        <div>
          <span className="text-sm font-semibold">Class: </span>
          <span className="text-sm font-normal">{childrenData?.find((obj: any) => obj?.value === selectedChild)?.class}</span>
        </div>
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
