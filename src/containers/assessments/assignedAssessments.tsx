/* eslint-disable comma-dangle */
import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import DatePicker from '@component/datepicker';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import DebounceInput from '@component/input/DebounceInput';
import { ReactComponent as Share } from '@images/pageHeaderIcons/share.svg';
import EmailIcon from '@mui/icons-material/Email';
import PrintIcon from '@mui/icons-material/Print';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DeletePopup from '@shared/DeletePopup';
import { useDelete, useGet, usePost } from '@shared/api/useApi';
import Loader from '@shared/loader';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import PageTitle from '@shared/pageTitle';
import toast from '@shared/toast';
import { getNoOfPages } from '@utility/utility';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import { useSelector } from 'react-redux';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import ReactToPrint from 'react-to-print';
import Dropdown from '@component/dropdown/Dropdown';
import { selectSchoolData } from '@shared/store/schoolSlice';
import CustomPagination from '../../components/pagination/CustomPagination';
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

interface Assessment {
  assign_assessment_id: number[];
  assessment_id: string;
  assessment_name: any; // Use proper typing here based on your actual data structure
  subject_name: string;
  class_name: string[];
  student_count: string;
  start_date: string;
  submission_date: string;
  completed: any[]; // Use proper typing here based on your actual data structure
  incomplete: any[]; // Use proper typing here based on your actual data structure
  is_printed: string;
  score: number;
  obeasses_id: string;
  student_details: any[]; // Use proper typing here based on your actual data structure
  class_or_student: any; // Use proper typing here based on your actual data structure
}

export default function AssignedAssessments() {
  const location = useLocation();
  const { schoolName } = useParams();
  const userData = useSelector((state: any) => state?.user);
  const navigate = useNavigate();

  const CompletedTableColumns = [
    {
      label: 'First Name',
      mapper: 'first_name',
    },
    {
      label: 'Last Name',
      mapper: 'last_name',
    },
    {
      label: 'Class',
      mapper: 'class_name',
    },
  ];

  const PendingTableColumns = [
    {
      label: 'First Name',
      mapper: 'first_name',
    },
    {
      label: 'Last Name',
      mapper: 'last_name',
    },
    {
      label: 'Class',
      mapper: 'class_name',
    },
  ];

  const ALL: Array<any> = [
    {
      label: 'Select',
      value: 'Select',
    },
  ];

  const Csvheaders = [
    TABLE_LABELS?.ASSESSMENT_NAME,
    TABLE_LABELS?.COURSES,
    TABLE_LABELS?.CLASS_STUDENTS,
    TABLE_LABELS?.START_DATE,
    TABLE_LABELS?.END_DATE,
    TABLE_LABELS?.TYPE,
  ];

  const [csvData, setCsvData] = useState<[]>([]);
  const [tableData, setTableData] = useState<any>([]);
  const [adminDeleteDialog, setAdminDeleteDialog] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(ALL[0].value);
  const [selectedGrade, setselectedGrade] = useState(ALL[0].value);
  const { schoolData, branchData } = useSelector(selectSchoolData);
  const userRole = useSelector((state: any) => state?.user?.role);
  const { SCHOOL_ADMIN, BRANCH_ADMIN, TEACHER } = USER_TYPE;
  const [TeacherClassesArray, setTeacherClassesArray] = useState<any>([]);
  const { user } = useSelector((state: any) => state);

  // console.log('tabel data =', tableData)

  const TableColumns = [
    {
      label: TABLE_LABELS?.SR_NO,
      align: 'center',
    },
    {
      label: TABLE_LABELS?.ASSESSMENT_NAME,
      mapper: 'assessment_name',
      isSort: true,
    },
    {
      label: TABLE_LABELS.COURSES,
      // isSort: true,
      align: 'center',
      mapper: 'subject_name',
    },
    {
      label: TABLE_LABELS?.CLASS_STUDENTS,
      align: 'center',
      mapper: 'class_or_student',
    },
    {
      label: TABLE_LABELS?.START_DATE,
      isSort: true,
      mapper: 'start_date',
      format: 'DD-MM-YYYY',
    },
    {
      label: TABLE_LABELS?.END_DATE,
      // isSort: true,
      mapper: 'submission_date',
      format: 'DD-MM-YYYY',
    },
    {
      label: TABLE_LABELS?.TYPE,
      isSort: true,
      mapper: 'is_printed',
    },
    {
      label: TABLE_LABELS?.ACTION,
      colspan: 2,
      align: 'center',
      bodyAlign: 'right',
      component: COMPONENTS?.view,
      showInHeader: false,
    },
    // {
    //   bodyAlign: 'center',
    //   component: COMPONENTS?.,
    //   showInHeader: false
    // },
    {
      bodyAlign: 'left',
      component: COMPONENTS?.delete,
      showInHeader: false,
    },
  ];

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
    }
  };

  const handleSearch = (value: any) => {
    setSearchString(value);
  };

  const actionHandler = (data: any, handlername: string) => {
    const obeasses_id = data?.obeasses_id;

    if (handlername === 'delete') {
      deleteHandler(data);
    } else if (handlername === 'view') {
      navigate(
        `/${schoolName}/assessments/preview_myassessment_question/${data?.assessment_id}`,
        {
          state: {
            page,
            obeasses_id,
            path: `/${schoolName}/assessments/assigned`,
          },
        }
      );
    }
  };

  const deleteHandler = (row: any) => {
    setPlayloadData({
      id: (row?.assign_assessment_id || []).join(','),
    });
    setAdminDeleteDialog(true);
  };

  const handleAdminDelete = () => {
    setAdminDeleteDialog(false);
    mutateDelete(playloadData);
  };
  const handleDataPopup = (data: any) => {
    setDialogOpen(true);
    setpopupData(data);
  };

  const reset = () => {
    setToDate('');
    setFromDate('');
  };

  // console.log('[Assigned assessments] selected grade =', selectedGrade)

  // ----------------------------------------API-------------------------
  // Get Assessment List
  const ordering = order === 'asc' ? orderBy : `-${orderBy}`;
  const { isFetching: assignmentLoading, refetch: fetchAssignedAssignments } =
    useGet({
      baseURL: import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL,
      url: `assessments-service/get-assign-assessment-list/?limit=${rowsPerPage}&offset=${(page - 1) * Number(rowsPerPage)}&ordering=${ordering}&search=${searchString}&course_name=${currentCourse !== ALL[0].value ? currentCourse : ''}&class_name=${selectedGrade !== ALL[0].value ? selectedGrade : ''}&start_date=${fromDate ? moment(fromDate).format('YYYY-MM-DD') : ''}&submission_date=${toDate ? moment(toDate).format('YYYY-MM-DD') : ''}&user_id=${userData?.userId}&domain_name=${window?.location?.hostname}&order_by=${ordering}`,
      //    url: `assessments-service/alpha-assessment/activities/?limit=${rowsPerPage}&offset=${(page - 1) * Number(rowsPerPage)}&ordering=${ordering}&alpha_course=${currentCourse !== ALL[0].value ? currentCourse : ''}&grade_id=${selectedGrade !== ALL[0].value ? selectedGrade : ''}&is_paperscorer_type=${assmentFilter}&category_id=${selectedCategory !== ALL[0].value ? selectedCategory : ''}&user_id=${user?.userId}`,

      onSuccess: (res: any) => {
        const accData = res?.data?.response;
        const respData = accData?.results;
        setTotalDataCount(accData.count);
        const schoolNameInURL = decodeURIComponent(
          location.pathname.split('/')[1]
        );
        const body: any = [];
        const newTableData = respData?.map((item: any) => {
          body.push([
            item?.assessment_name,
            item?.subject_name,
            `${item.class_name}(${item?.student_count})`,
            item?.start_date,
            item?.submission_date,
            item?.is_printed ? 'Printed' : 'Online',
          ]);
          //   const assessmentName = data?.assessment_name?.props?.children?.props?.children || "";
          // navigate(
          //   `/${schoolName}/assessments/assigned/assessment-report/${data?.assessment_id}?assessment=${assessmentName}`,
          //   {
          //     state: {
          //       page,
          //       obeasses_id,
          //       path: `/${schoolName}/assessments/assigned`
          //     }
          //   }
          // );
          const obeasses_id = item?.obeasses_id;
          // const link = `/${schoolName}/assessments/preview_myassessment_question/${item?.assessment_id}`;
          const link = `/${schoolName}/assessments/assigned/assessment-report/${item?.assessment_id}?assessment=${item?.assessmentName}`;
          const joinedClasses = Array.isArray(item.class_name)
            ? item.class_name?.filter((j: any) => j).join(', ')
            : item.class_name;
          const temp = {
            ...item,
            assessment_name: (
              <Link
                state={{
                  page,
                  obeasses_id,
                  path: `/${schoolName}/assessments/assigned`,
                }}
                to={link}
              >
                <span className="text-accent underline cursor-pointer text-xs font-medium">
                  {item.assessment_name}
                </span>
              </Link>
            ),
            class_or_student: (
              <span
                role="presentation"
                className="text-accent underline cursor-pointer text-xs font-medium"
                onClick={() => handleDataPopup(item)}
              >{`${joinedClasses}(${item?.student_count})`}</span>
            ),
            is_printed: item?.is_printed ? 'Printed' : 'Online',
          };
          return temp;
        });
        setCsvData(body);
        setTableData(newTableData);
      },
    });

  // Delete Admin
  const { isLoading: loadingDelete, mutate: mutateDelete } = useDelete({
    baseURL: import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/delete-assign-assessment/?assign_assessment_id=${playloadData?.id}`,
    onSuccess: (response: any) => {
      toast('success', 'Record Deleted successfully');
      fetchAssignedAssignments();
    },
    onError: ({ response }: any) => {
      toast('error', response?.data?.message || 'Error');
    },
  });

  // Toolbar Email
  const {
    isLoading: emailLoaded,
    refetch: fetchEmailApi,
    isRefetching: refetchEmail,
  } = useGet({
    baseURL: import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/assign-assessment-teacher-email/pdf-download/?user_id=${userData?.userId}`,
    onSuccess: (response: any) => {
      toast(
        'success',
        'Email sent successfully to you, please check your inbox'
      );
    },
    onError: ({ response }: any) => {
      toast('error', response?.data?.message || 'Error');
    },
    enabled: false,
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
          filename="Assigned Assessment List.csv"
          data={csvData}
          headers={Csvheaders}
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

  useEffect(() => {
    fetchAssignedAssignments();
  }, [rowsPerPage, page, orderBy, order, searchString, toDate, fromDate]);

  useEffect(() => {
    if (location?.state?.page) {
      setPage(location?.state?.page);
    }
  }, []);

  const handlePerPage = (e: any) => {
    setRowsPerPage(e);
  };

  const { isLoading: loadCourses, data: Courses } = useGet({
    baseURL: import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/alpha-assessment/courses/`,
  });

  const filteredCourses =
    Courses?.data
      .filter((i: any) => i?.name)
      ?.map((ele: any) => ({ label: ele.name, value: ele.name })) || [];

  // const { isLoading: loadCourses, data: Courses } = useGet({
  //   baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
  //   url: `course-code-service/courses/assigned_courses/${user?.userId}/details`
  // });
  // const filteredCourses = Courses?.data?.response
  //   ?.filter((i: any) => i?.short_name)
  //   ?.map((ele: any) => ({ label: ele.short_name, value: ele.short_name }))
  //   || [];
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
        title="Assigned Assessments"
        menuArray={ADMIN_TOOLBAR_MENU}
        handleToolbarAction={handleToolbarAction}
      />
      <div className="flex gap-2 mt-7 lg:items-end items-center lg:flex-row flex-col ">
        <div className="flex md:justify-start justify-center gap-2 lg:grow grow-0 items-end">
          <div className="pt-[30px]">
            <DebounceInput onChange={handleSearch} />
          </div>
        </div>
        <Dropdown
          title="Select Course"
          value={currentCourse}
          dataArray={[...ALL, ...filteredCourses]}
          onChangeHandler={(d: any) => {
            setCurrentCourse(d);
            setPage(1);
          }}
          sxClass={{ width: '206px' }}
          loading={loadCourses}
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
          <DatePicker
            value={fromDate}
            label="From"
            handlePickerChange={(date: string) => setFromDate(date)}
            sxType={2}
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
            sxType={2}
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
          sxClass={{ width: '150px', marginRight: '5px' }}
        />
        <div className="flex gap-2 justify-center items-center h-[36px]">
          {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
          <span tabIndex={0} title="Clear dates" onClick={reset} role="button">
            <RestartAltIcon />
          </span>
          <Link
            to="completed_assessments"
            className="cursor-pointer h-full font-medium underline flex items-center md:border-l-2 px-2 border-gray-300 text-accent"
          >
            Completed Assessments
          </Link>
          <CustomPagination
            totalPages={noOfpages}
            paginateHandler={handlePagination}
            currentPage={page}
          />
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
            actionHandler={actionHandler}
            isLoading={assignmentLoading || loadingDelete}
          />
        </Wrapper>
      </div>
      <CustomizedDialogs
        maxwidth="sm"
        open={dialogOpen}
        setOpen={handleDialog}
        title="Assessment Status"
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
