import  { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import DatePicker from '@component/datepicker';
import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import PrintIcon from '@mui/icons-material/Print';
import { CSVLink } from 'react-csv';
import ReactToPrint from 'react-to-print';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import { ReactComponent as Share } from '@images/pageHeaderIcons/share.svg';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import PageTitle from '@shared/pageTitle';
import DebounceInput from '@component/input/DebounceInput';
import { useDelete, useGet, usePost } from '@shared/api/useApi';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { getNoOfPages } from '@utility/utility';
import toast from '@shared/toast';
import DeletePopup from '@shared/DeletePopup';
import moment from 'moment';
import { useSelector } from 'react-redux';
import Dropdown from '@component/dropdown/Dropdown';
import { selectSchoolData } from '@shared/store/schoolSlice';
import RouteLayout from '../layout/routeLayout';
import {
  RESULTS_PER_PAGE,
  COMPONENTS,
  TABLE_LABELS,
  TOOLBAR_LABELS,
  USER_TYPE
} from '../../constants/constants';
import CustomPagination from '../../components/pagination/CustomPagination';
import Wrapper from '../../shared/wrapper/Wrapper';
import encryptMessage from '@utility/encrypt';

const printButton = () => <PrintIcon />;
interface Message {
  key: string;
  user_name: string;
  user_id: string;
  obeasses_id: string | null;
  date_time: Date;
  role: String;
  redirectionPath: String;
  user_ting: string;
  report_details?: {teacher?:String, start_date?:String, end_date?:String};
  students?:any[];

}
const ALL: Array<any> = [
  {
    label: 'Select',
    value: 'Select'
  }
];

export default function OBE_CompletedAssessments() {
  const location = useLocation();
  const { schoolName } = useParams();
  const { user } = useSelector((state: any) => state);
  const CompletedTableColumns = [
    {
      label: 'First Name',
      mapper: 'first_name'
    },
    {
      label: 'Last Name',
      mapper: 'last_name'
    },
    {
      label: 'Class',
      mapper: 'class_name'
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
    },
    {
      label: 'Class',
      mapper: 'class_name'
    }
  ];

  const headers = [
    TABLE_LABELS?.ASSESSMENT_NAME,
    TABLE_LABELS?.COURSES,
    TABLE_LABELS?.CLASS_STUDENTS,
    TABLE_LABELS?.START_DATE,
    TABLE_LABELS?.END_DATE,
    TABLE_LABELS?.SCORE
  ];

  const [csvData, setCsvData] = useState<[]>([]);
  const [tableData, setTableData] = useState<any>([]);
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
      label: TABLE_LABELS?.COURSES,
      isSort: true,
      mapper: 'subject_name'
    },
    {
      label: TABLE_LABELS?.CLASS_STUDENTS,
      align: 'center',
      mapper: 'class_or_student'
    },
    {
      label: TABLE_LABELS?.START_DATE,
      isSort: true,
      mapper: 'start_date',
      format: 'DD-MM-YYYY'
    },
    {
      label: TABLE_LABELS?.DUE_DATE,
      // isSort: true,
      mapper: 'submission_date',
      format: 'DD-MM-YYYY'
    },
    {
      label: TABLE_LABELS?.SCORE_AVG,
      isSort: true,
      mapper: 'score',
      sx:{ width: '12%'},
    },
    {
          label: TABLE_LABELS?.ACTION,
          sx:{ width: '10%'},
          align: 'center',
          bodyAlign: 'center',
          component: COMPONENTS?.view,
          showInHeader: false
        },
  ];

  const [rowsPerPage, setRowsPerPage] = useState(RESULTS_PER_PAGE?.[0]);
  const [page, setPage] = useState(1);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [popupData, setpopupData] = useState<any>({});

  const [searchString, setSearchString] = useState('');
  const [playloadData, setPlayloadData] = useState<any | undefined>({});
  const [order, setOrder] = useState<any>('desc');
  const [orderBy, setOrderBy] = useState<any>('');
  const [fromDate, setFromDate] = useState<any>('');
  const [toDate, setToDate] = useState<any>('');
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const completedAssignRef = useRef(null);
  const [pageSize, setPageSize] = useState<any>(RESULTS_PER_PAGE?.[0]);
  const [currentCourse, setCurrentCourse] = useState(ALL[0].value);
  const [selectedGrade, setselectedGrade] = useState(ALL[0].value);
  const { schoolData, branchData } = useSelector(selectSchoolData);
  const userRole = useSelector((state: any) => state?.user?.role);
  const { SCHOOL_ADMIN, BRANCH_ADMIN, TEACHER } = USER_TYPE;
  const [TeacherClassesArray, setTeacherClassesArray] = useState<any>([]);

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
      // importData();
    }
  };

  const handleSearch = (value: any) => {
    setSearchString(value);
  };

  const actionHandler = (data: any, handlername: string) => {
    if (handlername === 'delete') {
      deleteHandler(data);
    } else if (handlername === 'view') {
      const obeasses_id = data?.obeasses_id;
         const currentDate = new Date();
            const schoolName = decodeURIComponent(location.pathname.split('/')[1]);
            const targetPagePath = `/${schoolName}/obe-assessments/assigned`; // Update this to the path of the page you want to redirect to
            const targetPageUrl = `${window.location.origin}${targetPagePath}`; // Constructs the full URL
            const domain_name = import.meta.env.VITE_OBESASS_domain_name;
            const reportDetails = {teacher:`${user?.first_name} ${user?.last_name}`,start_date:data?.start_date,end_date:data?.submission_date};
            const completed_students = data?.completed;
            const message: Message = {
              key: import.meta.env.VITE_OBESASS_API_ENC_KEY as string,
              user_name: `${user?.first_name} ${user?.last_name}`,
              user_id: user?.user_ting,
              obeasses_id: obeasses_id || null,
              date_time: currentDate,
              role: user?.role?.name,
              redirectionPath: targetPageUrl,
              user_ting: user?.user_ting,
              report_details: reportDetails,
              students:completed_students
            };
            const encryptedData = encryptMessage(JSON.stringify(message));
            window.open(`${import.meta.env.VITE_APP_IFRAME_APP_SDK}/reports/${obeasses_id}?token=${encodeURIComponent(encryptedData)}&domain_name=${domain_name}`, '_blank');
          
      // window.location.replace(`preview_myassessment_question/${data?.assessment_id}`);
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
  const handleDataPopup = (data: any) => {
    setDialogOpen(true);
    setpopupData(data);
  };

  const reset = () => {
    setToDate('');
    setFromDate('');
  };

  // ----------------------------------------API-------------------------
  // Get Assessment List
  const ordering = orderBy ? order === 'asc' ? orderBy : `-${orderBy}` : '';
  const { isFetching: assignmentLoading, refetch: fetchAssignedAssignments } = useGet({
    baseURL: import.meta.env.VITE_APP_OBE_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/completed-assign-assessment-list/?limit=${rowsPerPage}&offset=${(page - 1) * Number(rowsPerPage)}&ordering=${ordering}&search=${searchString}&start_date=${fromDate ? moment(fromDate).format('YYYY-MM-DD') : ''}&submission_date=${toDate ? moment(toDate).format('YYYY-MM-DD') : ''}&user_id=${user?.userId}`,
    onSuccess: (res: any) => {
      const accData = res?.data?.response;
      const respData = accData?.results;
      setTotalDataCount(accData.count);
      const schoolNameInURL = decodeURIComponent(location.pathname.split('/')[1]);
      const body: any = [];
      const newTableData = respData?.map((item: any) => {
          const obeasses_id = item?.obeasses_id;
             const currentDate = new Date();
                const schoolName = decodeURIComponent(location.pathname.split('/')[1]);
                const targetPagePath = `/${schoolName}/obe-assessments/assigned`; // Update this to the path of the page you want to redirect to
                const targetPageUrl = `${window.location.origin}${targetPagePath}`; // Constructs the full URL
                const domain_name = import.meta.env.VITE_OBESASS_domain_name;
                const reportDetails = {teacher:`${user?.first_name} ${user?.last_name}`,start_date:item?.start_date,end_date:item?.submission_date};
                const completed_students = item?.completed;
                const message: Message = {
                  key: import.meta.env.VITE_OBESASS_API_ENC_KEY as string,
                  user_name: `${user?.first_name} ${user?.last_name}`,
                  user_id: user?.user_ting,
                  obeasses_id: obeasses_id || null,
                  date_time: currentDate,
                  role: user?.role?.name,
                  redirectionPath: targetPageUrl,
                  user_ting: user?.user_ting,
                  report_details: reportDetails,
                  students:completed_students
                };
                const encryptedData = encryptMessage(JSON.stringify(message));
                // window.open(`${import.meta.env.VITE_APP_IFRAME_APP_SDK}/reports/${obeasses_id}?token=${encodeURIComponent(encryptedData)}&domain_name=${domain_name}`, '_blank');

        body.push([
          item?.assessment_name,
          item?.subject_name,
          `${item.class_name}(${item?.student_count})`,
          item?.start_date,
          item?.submission_date,
          item?.score
        ]);
        // const link = `/${schoolNameInURL}/assessments/assigned/assessment-report/${item?.assessment_id}?assessment=${item?.assessment_name}`;
        const joinedClasses = Array.isArray(item.class_name) ? (item.class_name)?.filter((j: any) => j).join(', ') : item.class_name;
        const link2 = `${import.meta.env.VITE_APP_IFRAME_APP_SDK}/reports/${obeasses_id}?token=${encodeURIComponent(encryptedData)}&domain_name=${domain_name}`;
        const temp = {
          ...item,
          assessment_name: <a href={link2} target="_blank"><span className="text-accent underline cursor-pointer text-xs font-medium">{item.assessment_name}</span></a>,
          class_or_student: <span role="presentation" className="text-accent underline cursor-pointer text-xs font-medium" onClick={() => handleDataPopup(item)}>{`${joinedClasses}(${item?.student_count})`}</span>,
          is_printed: (item?.is_printed) ? 'Printed' : 'Online'
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
      toast('error', response?.statusText || 'Error');
    }
  });

  // Toolbar Email
  const { isLoading: emailLoaded, isRefetching: refetchEmail, refetch: fetchEmailApi } = useGet({
    baseURL: import.meta.env.VITE_APP_OBE_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/assign-assessment-list/pdf-download/?user_id=${user?.userId}`,
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
          filename="Completed Assessments List.csv"
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
    fetchAssignedAssignments();
  }, [rowsPerPage, page, orderBy, order, searchString, toDate, fromDate]);

  useEffect(() => {
    if (location?.state?.page) {
      setPage(location?.state?.page);
    }
  }, []);

  const handlePerPage = (e: any) => {
    setPage(page);
    setPageSize(e);
    setRowsPerPage(e);
  };

  const { isLoading: loadCourses, data: Courses } = useGet({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/assigned_courses/${user?.userId}/details`
  });
  const filteredCourses = Courses?.data?.response
    ?.filter((i: any) => i?.short_name)
    ?.map((ele: any) => ({ label: ele.short_name, value: ele.short_name }))
    || [];
  const { isLoading: loadClassesForSchool, data: ClassesForSchool } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-classes/?limit=1000&school_id=${schoolData?.id || branchData?.school_data?.id}&branch_name=${branchData?.name || ''}`,
    enabled: !!(
      (userRole?.name === SCHOOL_ADMIN && schoolData?.id)
      || userRole?.name === BRANCH_ADMIN
      || branchData?.school_id?.id
    )
  });
  const formatSchoolClasses = ClassesForSchool?.data?.response?.results?.map((ele: any) => ({
    label: ele.name,
    value: ele.name
  })) || [];
  const CLASS_ARRAY = (userRole?.name === TEACHER ? TeacherClassesArray : formatSchoolClasses)
    || [];

  const { isLoading: loadClassesForTeacher, mutate: ClassesForTeacher } = usePost({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-classes/teacher/assigned-class`,
    onSuccess: (resp: any) => {
      const res = resp?.data?.response;
      const formatArr = res?.map((ele: any) => ({ label: ele.name, value: ele.name })) || [];
      setTeacherClassesArray(formatArr);
    }
  });

  useEffect(() => {
    if (userRole?.name === TEACHER && user?.user_profile_id) {
      ClassesForTeacher({
        teacher_id: user?.user_profile_id
      });
    }
  }, [userRole, user]);

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
              sxType={4}
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
              sxType={4}
              defaultStyle={true}
              format="YYYY-MM-DD"
              disablePast={false}
              disableOld={fromDate}
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
          <div className="flex gap-2 justify-center items-center h-[36px]">
            {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
            <span
              tabIndex={0}
              title="Clear dates"
              onClick={reset}
              role="button"
            >
              <RestartAltIcon />
            </span>
            <Link
              to={`/${schoolName}/assessments/my-assessments`}
              className="cursor-pointer h-full font-medium underline flex items-center md:border-l-2 px-2 border-gray-300 text-accent"
            >
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
