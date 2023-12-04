import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import DatePicker from '@component/datepicker';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import DebounceInput from '@component/input/DebounceInput';
import { ReactComponent as Share } from '@images/pageHeaderIcons/share.svg';
import AddIcon from '@mui/icons-material/Add';
import EmailIcon from '@mui/icons-material/Email';
import PrintIcon from '@mui/icons-material/Print';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Divider from '@mui/material/Divider/Divider';
import { useGet } from '@shared/api/useApi';
import Loader from '@shared/loader';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import PageTitle from '@shared/pageTitle';
import { selectUser } from '@shared/store/userSlice';
import toast from '@shared/toast';
import { getNoOfPages } from '@utility/utility';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import { useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ReactToPrint from 'react-to-print';
import DeletePopup from '@shared/DeletePopup';
import { RESULTS_PER_PAGE, TABLE_LABELS, TOOLBAR_LABELS } from '../../../constants/constants';
import Wrapper from '../../../shared/wrapper/Wrapper';
import RouteLayout from '../../layout/routeLayout';

const printButton = () => <PrintIcon />;
const baseURL = import.meta.env.VITE_APP_ASSIGNMENT_SERVICE_URL;

export default function CompletedAssignment() {
  const navigate = useNavigate();
  const location = useLocation();
  const schoolNameInURL = decodeURIComponent(location.pathname.split('/')[1]);

  const [allClasses, setClasses] = useState('');
  const [ClassesPopup, setClassesPopup] = useState(false);

  const { role, schoolId, branchId, user_profile_id: userID, userId } = useSelector(selectUser);

  const CompletedTableColumns = [
    {
      label: 'First Name',
      mapper: 'FirstName'
    },
    {
      label: 'Last Name',
      mapper: 'LastName'
    }
  ];

  const PendingTableColumns = [
    {
      label: 'First Name',
      mapper: 'FirstName'
    },
    {
      label: 'Last Name',
      mapper: 'LastName'
    }
  ];

  const headers = [
    TABLE_LABELS?.ASSIGNMET_NAME,
    TABLE_LABELS?.SUBJECT,
    TABLE_LABELS?.GRADE,
    TABLE_LABELS?.LESSONS,
    TABLE_LABELS?.CLASS_STUDENTS,
    TABLE_LABELS?.START_DATE,
    TABLE_LABELS?.END_DATE,
    TABLE_LABELS?.SCORE
  ];

  const [csvData, setCsvData] = useState<[]>([]);
  const [tableData, setTableData] = useState<any>([]);

  const [assignmentList, setAssignmentList] = useState<any>([]);
  const [StudentAssignmentData, setStudentAssignmentData] = useState<any>([]);
  const [rowsPerPage, setRowsPerPage] = useState(RESULTS_PER_PAGE?.[0]);
  const [selectedState, setSelectedState] = useState('Submitted');

  const TableColumns = [
    {
      label: TABLE_LABELS?.SR_NO,
      align: 'center'
    },
    {
      label: TABLE_LABELS?.ASSIGNMET_NAME,
      mapper: 'name',
      isSort: true
    },
    {
      label: TABLE_LABELS?.SUBJECT,
      isSort: true,
      mapper: 'subject_name'
    },
    {
      label: TABLE_LABELS?.COMPONENT,
      mapper: 'component_name'
    },
    {
      label: TABLE_LABELS?.LESSONS,
      mapper: 'Lessons'
    },
    {
      label: TABLE_LABELS?.CLASS,
      mapper: 'class_name',
      sx: { maxWidth: '220px' },
      isSort: true
    },
    {
      label: TABLE_LABELS?.STUDENTS,
      mapper: 'Students'
    },
    {
      label: TABLE_LABELS?.START_DATE,
      isSort: true,
      sx: { width: '110px' },
      mapper: 'start_date'
    },
    {
      label: TABLE_LABELS?.DUE_DATE,
      align: 'center',
      isSort: true,
      sx: { width: '110px' },
      mapper: 'end_date'
    }
  ];

  const [page, setPage] = useState(1);
  const [totalDataCount, setTotalDataCount] = useState(0);

  const [order, setOrder] = useState<any>('desc');
  const [orderBy, setOrderBy] = useState<any>('created_at');
  const [fromDate, setFromDate] = useState<any>();
  const [toDate, setToDate] = useState<any>();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number>(-1);
  const [searchVal, setSearchVal] = useState('');
  const noOfpages = getNoOfPages(totalDataCount, rowsPerPage);

  const componentRef = useRef(null);
  const completedAssignRef = useRef(null);

  const handelSendEmail = () => {
    sendEmail();
  };

  const { isRefetching: emailSendLoading, refetch: sendEmail, isLoading: emailLoaded } = useGet({
    baseURL,
    url: `assignments-service/pdf-download-1/?school_id=${schoolId}&status=Completed&user_id=${userId}`,
    onSuccess: () => {
      toast('success', 'Email sent successfully');
    },
    retry: false,
    onError: ({ response }: any) => {
      toast('error', response?.data?.message || 'Unable to send email');
    },
    enabled: false
  }) as any;

  const ADMIN_TOOLBAR_MENU = [
    {
      title: TOOLBAR_LABELS.ADD_ASSIGNMENT,
      icon: <AddIcon />
    },
    {
      title: TOOLBAR_LABELS.EMAIL,
      icon: (emailSendLoading || emailLoaded) ? <Loader size={20} /> : <EmailIcon />
    },
    {
      title: TOOLBAR_LABELS.EXPORT,
      icon: (
        <CSVLink
          filename="Completed Assignments.csv"
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

  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };

  const handleToolbarAction = async (title: string) => {
    if (title === TOOLBAR_LABELS.ADD_ASSIGNMENT) {
      // const schoolNameInURL = decodeURIComponent(location.pathname.split('/')[1]);
      navigate(`/${schoolNameInURL}/assignment/create-assignment`);
    } else if (title === TOOLBAR_LABELS.EMAIL) {
      handelSendEmail();
      setPage(page);
    } else if (title === TOOLBAR_LABELS.IMPORT) {
      // importData();s
    }
  };

  const ordering = order === 'asc' ? orderBy : `-${orderBy}`;
  const { isLoading, data, refetch: refetchAssignmentList, error, isRefetching }: any = useGet({
    baseURL,
    url: `assignments-service/assignment/list/?school_id=${schoolId}${branchId !== null ? `&branch_id=${branchId}` : ''}&offset=${(page - 1) * Number(rowsPerPage)}&ordering=${ordering}&user_id=${userId}${searchVal !== '' ? `&search=${searchVal}` : ''}${fromDate ? `&start_date=${moment(fromDate).format('YYYY-MM-DD')}` : ''}${toDate ? `&end_date=${moment(toDate).format('YYYY-MM-DD')}` : ''}&all_assignments=Completed&limit=10`,
    onSuccess: (res: any) => {
      const assignmentListData = res?.data?.response?.results;
      setAssignmentList(assignmentListData);
      setTotalDataCount(res?.data?.response?.count);
      const csvEleData = assignmentListData.map((assignmentEle: any) => [assignmentEle.name, assignmentEle.course_name, assignmentEle.grade_name, assignmentEle.lesson_name.map((chapterName: any) => chapterName.chapter_name).join(' ').substring(0, 50), assignmentEle.student_count, assignmentEle.start_date, assignmentEle.end_date, assignmentEle.score === null ? 'N/A' : assignmentEle.score]);
      setCsvData(csvEleData);
    },
    onError: ({ response }: any) => {
      // setAssignmentList(Resp.response);
    },
    enabled: false
  });

  const openClass = (classes: string) => {
    setClasses(classes);
    setClassesPopup(true);
  };

  const init = () => {
    const rows2 = assignmentList.map((ele: {
      course_table_id: string;
      completed_student_count: string;
      course_name: any;
      lesson_name: any;
      grade_name: string;
      class_name: string; AssignmentName: string; name: string; student_count: string; subject_name: string; state: string; start_date: string; end_date: string; score: string; id: number; component_name: string;
    }, inde: number) => {
      const link = `/${schoolNameInURL}/assignment/assigned-students/`;
      const subjectLink = `/${schoolNameInURL}/MySubject/${ele.course_name.split(':')[0]}/${ele.grade_name}/${ele.course_table_id}`;
      const Lessons = ele.lesson_name.map((chapterName: any) => chapterName.chapter_name).join(' ').substring(0, 50);
      const classes = ele.class_name;
      let classElement;
      if (classes && classes.length && classes.split(',').length > 2) {
        classElement = (
          <div>
            {' '}
            {classes.split(',')[0]}
            ,
            {' '}
            {classes.split(',')[1]}
            {' '}
            <span role="contentinfo" className="ml-2 text-accent cursor-pointer" onClick={() => openClass(classes)}>
              {' '}
              +
              {' '}
              {`${classes.split(',').length - 2}`}
              {' '}
              more
              {' '}
            </span>
          </div>);
      } else {
        classElement = (
          <div>
            {' '}
            {classes}
          </div>);
      }
      return {
        ...ele,
        name: <Link state={{ page, assignmentId: ele.id, assignmentName: ele.name, startDate: ele.start_date, endData: ele.end_date, grade: ele?.class_name, isFromComplete: true, path: `/${schoolNameInURL}/assignment/completed-assignments` }} to={link}><span className="text-accent underline cursor-pointer font-medium">{ele.name}</span></Link>,
        class_name: classElement,
        Students: <span role="presentation" className="text-accent underline cursor-pointer font-medium" onClick={() => { setDialogOpen(true); setSelectedAssignmentId(ele.id); }}>{ele.completed_student_count}</span>,
        subject_name: <Link state={{ page, isFromComplete: true, path: `/${schoolNameInURL}/assignment/completed-assignments` }} to={subjectLink}><span className={`${ele.state === 'Submitted' ? 'text-accent' : ''} underline cursor-pointer`}>{ele.course_name}</span></Link>,
        State: ele.state,
        end_date: moment(ele.start_date.replace('Z', '')).format('DD-MM-YYYY'),
        start_date: moment(ele.end_date.replace('Z', '')).format('DD-MM-YYYY'),
        SR_NO: inde + 1,
        score: ele.score,
        Lessons: <span>{Lessons.length >= 50 ? `${Lessons}...` : Lessons}</span>,
        component_name: <div>{ele.component_name}</div>
      };
    });
    setTableData([...rows2]);
  };

  useEffect(() => {
    init();
  }, [assignmentList]);

  useEffect(() => {
    if (location?.state?.page) {
      setPage(location?.state?.page);
    }
  }, []);

  useEffect(() => {
    refetchAssignmentList();
  }, [selectedState, fromDate, toDate, orderBy, order, page, searchVal]);

  const handleDialog = () => {
    setDialogOpen(false);
  };

  const reset = () => {
    setToDate('');
    setFromDate('');
    refetchAssignmentList();
  };

  const { isLoading: studentAssignmentStatusLoading }: any = useGet({
    baseURL,
    url: `assignments-service/assignment/assigned-students/${selectedAssignmentId}/list/?limit=1000`,
    onSuccess: (res: any) => {
      setStudentAssignmentData(res?.data?.response?.results);
    },
    onError: ({ response }: any) => {
    },
    enabled: selectedAssignmentId !== -1
  });

  return (
    <RouteLayout>
      <HeaderMenus title="Completed Assignments" menuArray={ADMIN_TOOLBAR_MENU} handleToolbarAction={handleToolbarAction} />
      <div className="flex gap-2 mt-7 lg:items-end items-center lg:flex-row flex-col ">
        <div className="flex md:justify-start justify-center gap-2 lg:grow grow-0 items-end">
          <div className="max-w-xs">
            <DebounceInput
              onChange={(value: string) => setSearchVal(value)}
              loading={isLoading}
            />
          </div>

          <div>
            <DatePicker
              value={fromDate}
              label="From"
              handlePickerChange={(date: string) => setFromDate(date)}
              sxType={1}
              defaultStyle={true}
              disablePast={false}
              disableFuture={toDate}
            />
          </div>
          <div>
            <DatePicker
              value={toDate}
              disableOld={fromDate}
              disablePast={false}
              label="To"
              handlePickerChange={(date: string) => setToDate(date)}
              sxType={1}
              defaultStyle={true}
            />
          </div>

          <div className="flex gap-2 justify-center items-center h-[36px]">
            <span tabIndex={0} title="Clear dates" onClick={reset} role="button">
              <RestartAltIcon />
            </span>
            <Divider orientation="vertical" flexItem={true} className="border-[#D2D2D2] pl-2" />
            <Link to={`/${schoolNameInURL}/assignment/`}>
              <div className="text-accent underline cursor-pointer text-base font-medium pl-2">
                Assigned Assignments
              </div>
            </Link>
          </div>
        </div>
      </div>
      {/* Table Section */}
      <div className="wrapperBorder mt-3" ref={componentRef}>
        <Wrapper>
          <AdvanceTable
            tableData={tableData}
            headerRows={TableColumns}
            paginateHandler={handlePagination}
            totalPages={noOfpages}
            currentPage={page}
            setPage={setPage}
            rowsPerPage={rowsPerPage}
            orderBy={orderBy}
            setOrderBy={setOrderBy}
            order={order}
            setOrder={setOrder}
            isLoading={isLoading || isRefetching}
          />
        </Wrapper>
      </div>
      <CustomizedDialogs
        maxwidth="sm"
        open={dialogOpen}
        setOpen={() => {
          handleDialog();
        }}
        title="Assignment Status"
      >
        <div ref={completedAssignRef}>
          <div className="flex gap-2 justify-between items-center mb-3">
            <PageTitle title="Completed" />
            <ReactToPrint
              trigger={printButton}
              content={() => completedAssignRef.current}
            />
          </div>
          <div className="max-h-80 overflow-x-auto">
            <Wrapper>
              <AdvanceTable
                tableData={StudentAssignmentData && StudentAssignmentData.length && StudentAssignmentData.filter((ele: any) => ele.state === 'Completed').map((ele: any) => ({ FirstName: ele.first_name, LastName: ele.last_name }))}
                headerRows={CompletedTableColumns}
              />
            </Wrapper>
          </div>
          <div className="flex mb-3">
            <PageTitle title="Pending" />
          </div>
          <div className="max-h-80 overflow-x-auto">
            <Wrapper>
              <AdvanceTable
                tableData={StudentAssignmentData && StudentAssignmentData.length && StudentAssignmentData.filter((ele: any) => ele.state !== 'Completed').map((ele: any) => ({ FirstName: ele.first_name, LastName: ele.last_name }))}
                headerRows={PendingTableColumns}
              />
            </Wrapper>
          </div>
        </div>
      </CustomizedDialogs>
      <DeletePopup
        title="Classes"
        description={allClasses}
        open={ClassesPopup}
        setOpen={() => setClassesPopup(false)}
        handleDelete={() => setClassesPopup(false)}
        removeText="Ok"
      />
    </RouteLayout>
  );
}
