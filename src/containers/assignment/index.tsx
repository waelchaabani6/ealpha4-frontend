/* eslint-disable comma-dangle */
import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import DatePicker from '@component/datepicker';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import Dropdown from '@component/dropdown/Dropdown';
import DebounceInput from '@component/input/DebounceInput';
import { ReactComponent as Share } from '@images/pageHeaderIcons/share.svg';
import AddIcon from '@mui/icons-material/Add';
import EmailIcon from '@mui/icons-material/Email';
import PrintIcon from '@mui/icons-material/Print';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Divider from '@mui/material/Divider/Divider';
import { useGet, useDelete, usePost } from '@shared/api/useApi';
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
import UseGetProfile from '@utility/Hooks/UseGetProfile';
import { selectSchoolData } from '@shared/store/schoolSlice';
import {
  COMPONENTS,
  RESULTS_PER_PAGE,
  TABLE_LABELS,
  TOOLBAR_LABELS,
  USER_TYPE,
} from '../../constants/constants';
import Wrapper from '../../shared/wrapper/Wrapper';
import RouteLayout from '../layout/routeLayout';

const printButton = () => <PrintIcon />;
const baseURL = import.meta.env.VITE_APP_ASSIGNMENT_SERVICE_URL;

export default function Index() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    schoolId,
    branchId,
    user_profile_id: userID,
    userId,
  } = useSelector(selectUser);
  const { schoolData, branchData } = useSelector(selectSchoolData);

  const CompletedTableColumns = [
    {
      label: 'First Name',
      mapper: 'FirstName',
    },
    {
      label: 'Last Name',
      mapper: 'LastName',
    },
  ];

  const PendingTableColumns = [
    {
      label: 'First Name',
      mapper: 'FirstName',
    },
    {
      label: 'Last Name',
      mapper: 'LastName',
    },
  ];

  const csvSubHeaders = [
    TABLE_LABELS?.ASSIGNMET_NAME,
    TABLE_LABELS?.COURSES,
    TABLE_LABELS?.CLASS,
    TABLE_LABELS?.LESSONS,
    TABLE_LABELS?.STATE,
    TABLE_LABELS?.CLASS_STUDENTS,
    TABLE_LABELS?.START_DATE,
    TABLE_LABELS?.END_DATE,
  ];

  const [csvData, setCsvData] = useState<[]>([]);
  const [tableData, setTableData] = useState<any>([]);

  const [assignmentList, setAssignmentList] = useState<any>([]);
  const [StudentAssignmentData, setStudentAssignmentData] = useState<any>([]);
  const [adminDeleteDialog, setAdminDeleteDialog] = useState(false);
  const userRole = useSelector((state: any) => state?.user?.role);

  const TableColumns = [
    {
      label: TABLE_LABELS?.SR_NO,
      align: 'center',
    },
    {
      label: TABLE_LABELS?.ASSIGNMET_NAME,
      mapper: 'name',
      sx: { width: '180px' },
      isSort: true,
    },
    {
      label: TABLE_LABELS?.COURSES,
      isSort: true,
      sx: { width: '120px' },
      mapper: 'subject_name',
    },
    {
      label: TABLE_LABELS?.COMPONENT,
      mapper: 'component_name',
    },
    {
      label: TABLE_LABELS?.LESSONS,
      mapper: 'Lessons',
    },
    {
      label: TABLE_LABELS?.STATUS,
      // isSort: true,
      mapper: 'State',
    },
    {
      label: TABLE_LABELS?.CLASS,
      isSort: true,
      sx: { maxWidth: '150px' },
      mapper: 'class_name',
    },
    {
      label: TABLE_LABELS?.STUDENTS,
      mapper: 'Students',
    },
    {
      label: TABLE_LABELS?.START_DATE,
      isSort: true,
      mapper: 'start_date',
      sx: { width: '110px' },
    },
    {
      label: TABLE_LABELS?.DUE_DATE,
      // align: 'center',
      isSort: true,
      mapper: 'end_date',
      sx: { width: '110px' },
    },
    {
      bodyAlign: 'left',
      component: COMPONENTS?.delete,
      showInHeader: false,
    },
  ];

  const [rowsPerPage, setRowsPerPage] = useState(RESULTS_PER_PAGE?.[0]);
  const [page, setPage] = useState(1);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const { SCHOOL_ADMIN, BRANCH_ADMIN, TEACHER } = USER_TYPE;

  const [order, setOrder] = useState<any>('desc');
  const [orderBy, setOrderBy] = useState<any>('created_at');
  const [fromDate, setFromDate] = useState<any>();
  const [toDate, setToDate] = useState<any>();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number>(-1);
  const [selectedState, setSelectedState] = useState('Select');
  const [payloadData, setPlayloadData] = useState('');
  const { getUser } = UseGetProfile();

  const componentRef = useRef(null);
  const completedAssignRef = useRef(null);
  const [searchVal, setSearchVal] = useState('');
  const noOfpages = getNoOfPages(totalDataCount, rowsPerPage);
  const schoolNameInURL = decodeURIComponent(location.pathname.split('/')[1]);

  const [allClasses, setClasses] = useState('');
  const [ClassesPopup, setClassesPopup] = useState(false);

  const [pageSize, setPageSize] = useState<any>(RESULTS_PER_PAGE?.[0]);
  const [currentCourse, setCurrentCourse] = useState('Select');
  const [selectedGrade, setselectedGrade] = useState('Select');
  const { user } = useSelector((state: any) => state);
  const [TeacherClassesArray, setTeacherClassesArray] = useState<any>([]);

  const ALL: Array<any> = [
    {
      label: 'All',
      value: 'Select',
    },
  ];

  const {
    isRefetching: emailSendLoading,
    refetch: sendEmail,
    isLoading,
  } = useGet({
    baseURL,
    url: `assignments-service/pdf-download-1/?school_id=${schoolId}&user_id=${userId}`,
    onSuccess: () => {
      toast('success', 'Email sent successfully');
    },
    retry: false,
    onError: ({ response }: any) => {
      toast('error', response?.data?.message || 'Unable to send email');
    },
    enabled: false,
  }) as any;

  const ADMIN_TOOLBAR_MENU = [
    {
      title: TOOLBAR_LABELS.ADD_ASSIGNMENT,
      icon: <AddIcon />,
    },
    // {
    //   title: TOOLBAR_LABELS.EMAIL,
    //   icon: (emailSendLoading || isLoading) ? <Loader size={20} /> : <EmailIcon />
    // },
    {
      title: TOOLBAR_LABELS.EXPORT,
      icon: (
        <CSVLink
          filename="Assigned Assignments.csv"
          data={csvData}
          headers={csvSubHeaders}
          enclosingCharacter=""
        >
          <Share />
        </CSVLink>
      ),
    },
    {
      title: TOOLBAR_LABELS.PRINT,
      icon: (
        <ReactToPrint
          trigger={printButton}
          content={() => componentRef.current}
        />
      ),
    },
  ];

  const { mutate: mutateDelete } = useDelete({
    baseURL,
    url: `assignments-service/assignment/${payloadData}/delete/`,
    onSuccess: (response: any) => {
      toast('success', 'Record Deleted successfully');
      refetchAssignmentList();
      getUser();
    },
    onError: ({ response }: any) => {
      toast('error', response?.data?.message || 'Error');
    },
  });

  const handelSendEmail = () => {
    sendEmail();
  };

  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };

  const actionHandler = (data: any, handlername: string) => {
    if (handlername === 'delete') {
      deleteHandler(data);
    }
  };

  const deleteHandler = (row: any) => {
    setPlayloadData(row?.id);
    setAdminDeleteDialog(true);
  };

  const handleAdminDelete = () => {
    setAdminDeleteDialog(false);
    mutateDelete(payloadData);
  };

  const handleToolbarAction = async (title: string) => {
    if (title === TOOLBAR_LABELS.ADD_ASSIGNMENT) {
      navigate('create-assignment');
    } else if (title === TOOLBAR_LABELS.EMAIL) {
      handelSendEmail();
    }
  };

  const openClass = (classes: string) => {
    setClasses(classes);
    setClassesPopup(true);
  };

  const init = () => {
    const rows2 = assignmentList?.map(
      (
        ele: {
          course_table_id: string;
          lesson_name: any;
          grade_name: any;
          course_name: any;
          class_name: string;
          AssignmentName: string;
          name: string;
          student_count: string;
          subject_name: string;
          state: string;
          start_date: string;
          end_date: string;
          score: string;
          id: number;
          component_name: string;
        },
        inde: number
      ) => {
        const link = `/${schoolNameInURL}/assignment/assigned-students`;
        const course_name = ele?.course_name
          ? ele?.course_name.split(':')[0]
          : '-';
        const subjectLink = `/${schoolNameInURL}/MySubject/${course_name}/${ele.grade_name}/${ele.course_table_id}`;
        const Lessons = ele.lesson_name
          .map((chapterName: any) => chapterName.chapter_name)
          .join(' ')
          .substring(0, 50);
        const classes = ele.class_name;
        let classElement;
        if (classes && classes.length && classes.split(',').length > 2) {
          classElement = (
            <div>
              {' '}
              {classes.split(',')[0]}, {classes.split(',')[1]}{' '}
              <span
                role="contentinfo"
                className="ml-2 text-accent cursor-pointer"
                onClick={() => openClass(classes)}
              >
                {' '}
                + {`${classes.split(',').length - 2}`} more{' '}
              </span>
            </div>
          );
        } else {
          classElement = <div> {classes}</div>;
        }

        return {
          ...ele,
          name: (
            <Link
              to={link}
              state={{
                page,
                assignmentId: ele.id,
                assignmentName: ele.name,
                startDate: ele.start_date,
                endData: ele.end_date,
                grade: ele?.class_name,
                isFromComplete: false,
                path: `/${schoolNameInURL}/assignment`,
              }}
            >
              <span className="underline cursor-pointer font-medium">
                {ele.name}
              </span>
            </Link>
          ),
          class_name: classElement,
          Students: (
            <span
              role="presentation"
              className="underline cursor-pointer font-medium"
              onClick={() => {
                setDialogOpen(true);
                setSelectedAssignmentId(ele.id);
              }}
            >
              {ele.student_count}
            </span>
          ),
          subject_name: (
            <Link
              state={{
                page,
                isFromComplete: false,
                path: `/${schoolNameInURL}/assignment/`,
              }}
              to={subjectLink}
            >
              <span
                className={`${ele.state === 'Submitted' ? 'text-accent' : ''} underline cursor-pointer`}
              >
                {ele.course_name}
              </span>
            </Link>
          ),
          State: (
            <div
              className={`text-left whitespace-nowrap ${ele.state === 'Submitted' ? 'text-accent' : ''}`}
            >
              {ele.state}
            </div>
          ),
          end_date: (
            <span className={ele.state === 'Submitted' ? 'text-accent' : ''}>
              {moment(ele.end_date.replace('Z', '')).format('DD-MM-YYYY')}
            </span>
          ),
          start_date: (
            <span className={ele.state === 'Submitted' ? 'text-accent' : ''}>
              {moment(ele.start_date.replace('Z', '')).format('DD-MM-YYYY')}
            </span>
          ),
          SR_NO: inde + 1,
          score: ele.score,
          Lessons: (
            <span className={ele.state === 'Submitted' ? 'text-accent' : ''}>
              {Lessons.length >= 50 ? `${Lessons}...` : Lessons}
            </span>
          ),
          component_name: (
            <span className={ele.state === 'Submitted' ? 'text-accent' : ''}>
              {ele.component_name}
            </span>
          ),
          assignmentId: ele.id,
          rowSx:
            ele.state === 'Submitted'
              ? { td: { color: 'var(--accent)' } }
              : ele.state === 'Ongoing'
                ? { td: { color: 'var(--sunlight)' } }
                : '',
        };
      }
    );
    setTableData(rows2);
  };

  useEffect(() => {
    init();
  }, [assignmentList, selectedState, fromDate, toDate, orderBy, order]);

  useEffect(() => {
    if (location?.state?.page) {
      setPage(location?.state?.page);
    }
  }, []);

  const handleDialog = () => {
    setDialogOpen(false);
  };

  const ordering = order === 'asc' ? orderBy : `-${orderBy}`;
  const {
    refetch: refetchAssignmentList,
    isLoading: assignmentListLoading,
    isRefetching: assignmentListFetching,
  }: any = useGet({
    baseURL,
    url: `assignments-service/assignment/list/?school_id=${schoolId}${branchId !== null ? `&offset=${(page - 1) * Number(rowsPerPage)}&branch_id=${branchId}` : ''}&user_id=${userId}&offset=${(page - 1) * Number(rowsPerPage)}&ordering=${ordering}${searchVal !== '' ? `&search=${searchVal}` : ''}${selectedState !== 'All' && selectedState !== 'Select' ? `&status=${selectedState}` : ''}${fromDate ? `&start_date=${moment(fromDate).format('YYYY-MM-DD')}` : ''}${toDate ? `&end_date=${moment(toDate).format('YYYY-MM-DD')}` : ''}${selectedGrade && selectedGrade !== 'Select' ? `&class_name=${selectedGrade}` : ''}${currentCourse && currentCourse !== 'Select' ? `&course_name=${currentCourse}` : ''}&limit=${pageSize}&all_assignments=all`,
    onSuccess: (res: any) => {
      const assignmentListData = res?.data?.response?.results;
      setAssignmentList(assignmentListData);
      setTotalDataCount(res?.data?.response?.count);
      const csvEleData = assignmentListData.map((assignmentEle: any) => [
        assignmentEle.name,
        assignmentEle.course_name,
        assignmentEle.grade_name,
        assignmentEle.lesson_name
          .map((chapterName: any) => chapterName.chapter_name)
          .join(' ')
          .substring(0, 50),
        assignmentEle.state,
        assignmentEle.student_count,
        assignmentEle.start_date,
        assignmentEle.end_date,
      ]);
      setCsvData(csvEleData);
    },
    onError: ({ response }: any) => {
      // setAssignmentList(Resp.response);
    },
    enabled: false,
  });

  const { isLoading: studentAssignmentStatusLoading }: any = useGet({
    baseURL,
    url: `assignments-service/assignment/assigned-students/${selectedAssignmentId}/list/?limit=1000`,
    onSuccess: (res: any) => {
      setStudentAssignmentData(res?.data?.response?.results);
    },
    onError: ({ response }: any) => {},
    enabled: selectedAssignmentId !== -1,
  });

  useEffect(() => {
    refetchAssignmentList();
  }, [
    rowsPerPage,
    selectedState,
    fromDate,
    toDate,
    orderBy,
    order,
    page,
    searchVal,
    currentCourse,
    selectedGrade,
  ]);

  const reset = () => {
    setToDate('');
    setFromDate('');
    refetchAssignmentList();
  };

  const handlePerPage = (e: any) => {
    setPage(page);
    setPageSize(e);
    setRowsPerPage(e);
  };
  const { isLoading: loadCourses, data: Courses } = useGet({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/assigned_courses/${user?.userId}/details`,
  });
  const filteredCourses =
    Courses?.data?.response
      ?.filter((i: any) => i?.short_name)
      ?.map((ele: any) => ({ label: ele.short_name, value: ele.short_name })) ||
    [];
  const { isLoading: loadClassesForSchool, data: ClassesForSchool } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-classes/?limit=1000&school_id=${schoolData?.id || branchData?.school_data?.id}&branch_name=${branchData?.name || ''}`,
    enabled: !!(
      (userRole?.name === SCHOOL_ADMIN && schoolData?.id) ||
      userRole?.name === BRANCH_ADMIN ||
      branchData?.school_id?.id
    ),
  });
  const formatSchoolClasses =
    ClassesForSchool?.data?.response?.results?.map((ele: any) => ({
      label: ele.name,
      value: ele.name,
    })) || [];
  const CLASS_ARRAY =
    (userRole?.name === TEACHER ? TeacherClassesArray : formatSchoolClasses) ||
    [];

  const { isLoading: loadClassesForTeacher, mutate: ClassesForTeacher } =
    usePost({
      baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
      url: `schools-service/school-classes/teacher/assigned-class`,
      onSuccess: (resp: any) => {
        const res = resp?.data?.response;
        const formatArr =
          res?.map((ele: any) => ({ label: ele.name, value: ele.name })) || [];
        setTeacherClassesArray(formatArr);
      },
    });

  useEffect(() => {
    if (userRole?.name === TEACHER && user?.user_profile_id) {
      ClassesForTeacher({
        teacher_id: user?.user_profile_id,
      });
    }
  }, [userRole, user]);

  return (
    <RouteLayout>
      <HeaderMenus
        title="Assigned Assignments"
        menuArray={ADMIN_TOOLBAR_MENU}
        handleToolbarAction={handleToolbarAction}
      />
      <div className="flex gap-2 mt-7 lg:items-end items-center lg:flex-row flex-col ">
        <div className="flex md:justify-start justify-center gap-2 lg:grow grow-0 items-end">
          <div className="max-w-xs">
            <DebounceInput onChange={(value: string) => setSearchVal(value)} />
          </div>
          <Dropdown
            title="Select Course"
            value={currentCourse}
            dataArray={[...ALL, ...filteredCourses]}
            onChangeHandler={(d: any) => {
              setCurrentCourse(d);
              setPage(1);
            }}
            loading={loadCourses}
            sxClass={{ width: '206px', marginRight: '5px' }}
          />
          <Dropdown
            title="Select Class"
            value={selectedGrade}
            dataArray={[...ALL, ...CLASS_ARRAY]}
            onChangeHandler={(d: any) => {
              setselectedGrade(d);
              setPage(1);
            }}
            loading={loadClassesForTeacher || loadClassesForSchool}
            sxClass={{ width: '206px', marginRight: '5px' }}
          />
          <div>
            <Dropdown
              title="Sort By: Status"
              value={selectedState}
              dataArray={[
                'Select',
                'All',
                'Ongoing',
                'Submitted',
                'Yet to Start',
              ]}
              onChangeHandler={(d: any) => setSelectedState(d)}
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
              handlePickerChange={(date: string) => setFromDate(date)}
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
              handlePickerChange={(date: string) => setToDate(date)}
              sxType={1}
              defaultStyle={true}
              noFontSize={true}
            />
          </div>
          <div>
            <Dropdown
              title="Result Of Pages"
              value={pageSize}
              dataArray={RESULTS_PER_PAGE}
              onChangeHandler={handlePerPage}
              sxClass={{ width: '150px', marginRight: '5px' }}
            />
          </div>
          {fromDate || toDate ? (
            // eslint-disable-next-line jsx-a11y/control-has-associated-label
            <span
              className="relative top-[-7px]"
              tabIndex={0}
              title="Clear dates"
              onClick={reset}
              role="button"
            >
              <RestartAltIcon />
            </span>
          ) : null}

          <div className="flex gap-2 justify-center items-center h-[36px]">
            <Divider
              orientation="vertical"
              flexItem={true}
              className="border-[#D2D2D2] pl-2"
            />
            <Link to={`/${schoolNameInURL}/assignment/completed-assignments`}>
              <div className="text-accent underline cursor-pointer text-base font-medium pl-2">
                Completed Assignments
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
            totalPages={noOfpages}
            paginateHandler={handlePagination}
            currentPage={page}
            setPage={setPage}
            rowsPerPage={rowsPerPage}
            orderBy={orderBy}
            setOrderBy={setOrderBy}
            order={order}
            actionHandler={actionHandler}
            setOrder={setOrder}
            isLoading={assignmentListLoading || assignmentListFetching}
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
            <PageTitle title="Submitted" />
            <ReactToPrint
              trigger={printButton}
              content={() => completedAssignRef.current}
            />
          </div>
          <div className="max-h-80 overflow-x-auto">
            <Wrapper>
              <AdvanceTable
                tableData={
                  StudentAssignmentData &&
                  StudentAssignmentData.length &&
                  StudentAssignmentData.filter(
                    (ele: any) =>
                      ele.state === 'Submitted' ||
                      ele.state === 'Auto Submitted'
                  ).map((ele: any) => ({
                    FirstName: ele.first_name,
                    LastName: ele.last_name,
                  }))
                }
                headerRows={CompletedTableColumns}
                maxHeight="300"
              />
            </Wrapper>
          </div>
          <div className="flex mb-3">
            <PageTitle title="Pending" />
          </div>
          <div className="max-h-80 overflow-x-auto">
            <Wrapper>
              <AdvanceTable
                tableData={
                  StudentAssignmentData &&
                  StudentAssignmentData.length &&
                  StudentAssignmentData.filter(
                    (ele: any) =>
                      ele.state !== 'Submitted' &&
                      ele.state !== 'Completed' &&
                      ele.state !== 'Auto Submitted'
                  ).map((ele: any) => ({
                    FirstName: ele.first_name,
                    LastName: ele.last_name,
                  }))
                }
                headerRows={PendingTableColumns}
                maxHeight="300"
              />
            </Wrapper>
          </div>
        </div>
      </CustomizedDialogs>
      <DeletePopup
        title="Delete Assignment"
        description="Are you sure you want to delete Assignment?"
        open={adminDeleteDialog}
        setOpen={setAdminDeleteDialog}
        handleDelete={handleAdminDelete}
      />
      <DeletePopup
        title="Students"
        description={allClasses}
        open={ClassesPopup}
        setOpen={() => setClassesPopup(false)}
        handleDelete={() => setClassesPopup(false)}
        removeText="Ok"
      />
    </RouteLayout>
  );
}
