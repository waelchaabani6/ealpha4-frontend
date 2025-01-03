/* eslint-disable operator-linebreak */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable linebreak-style */
/* eslint-disable comma-dangle */
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import Dropdown from '@component/dropdown/Dropdown';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import {
  GRAPH_LABELS,
  RESULTS_PER_PAGE,
  TABLE_LABELS,
  TOOLBAR_LABELS,
  USER_TYPE,
} from '@constants/constants';

import { CSVLink } from 'react-csv';
import PrintIcon from '@mui/icons-material/Print';
import { ReactComponent as Share } from '@images/pageHeaderIcons/share.svg';
import ReactToPrint from 'react-to-print';
import RouteLayout from '@layout/routeLayout';
import DatePicker from '@component/datepicker';

import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { selectSchoolData } from '@shared/store/schoolSlice';
import { getNoOfPages, sortByName, userRole } from '@utility/utility';
import { selectUser } from '@shared/store/userSlice';
import { useGet } from '@shared/api/useApi';
import Wrapper from '@shared/wrapper/Wrapper';
import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import moment from 'moment';

import toast from '@shared/toast';

import TeacherGraphComponent from '../BarChart/TeacherGraphComponent';

export default function Index() {
  const [csvData, setCsvData] = useState<[]>([]);
  const [view, setView] = React.useState('default');
  const [selectedteacher, setSelectedTeacher] = useState<any>('select');
  const [selectedprogram, setSelectedProgram] = useState<any>('select');
  const [selectedClass, setSelectedClass] = useState<any>('select');
  const [selectedBranch, setselectedBranch] = useState('select');
  const [page, setPage] = useState(1);
  const [fromDate, setFromDate] = useState<any>();
  const [toDate, setToDate] = useState<any>();
  const printButton = () => <PrintIcon />;
  const [yaxis, setYaxis] = useState('option1');
  const [xaxis, setXaxis] = useState('grade');
  const [totalDataCount, setTotalDataCount] = useState(0);
  const { role, user_profile_id: userId } = useSelector(selectUser);
  const { schoolData, branchData } = useSelector(selectSchoolData);
  const [totalData, setTotalData] = useState([]);
  // const [NoOfDaysArr, SetNoOfDaysArr] = useState([]);
  const componentRef = useRef(null);
  const [graph, setGraph] = useState('');
  const location = useLocation();
  // const rowsPerPage = 10;
  const [rowsPerPage, setRowsPerPage] = useState<any>(RESULTS_PER_PAGE?.[0]);
  const ReportURL = import.meta.env.VITE_APP_REPORTS_SERVICE_URL;
  const noOfpages = getNoOfPages(totalDataCount, rowsPerPage);
  const schoolNameInURL = decodeURIComponent(location.pathname.split('/')[1]);
  // const link = `/${schoolNameInURL}/reports/student-detail-view`;
  const [assignmentGraph, setAssignmentGraph] = useState([]);
  const [assessmentGraph, setAssessmentGraph] = useState([]);
  const [timeOpenedGraph, setTimeOpenedGraph] = useState([]);
  const [tableData, setTableData] = useState<any>([]);

  const userData = useSelector((state: any) => state?.user);
  const USER_ROLE = userData?.role?.name;
  const SCHOOL_ID = schoolData?.id || branchData?.school_data?.id || '';

  const link =
    USER_ROLE === USER_TYPE.SUPER_ADMIN
      ? `/school-management/school/${SCHOOL_ID}/reports/usage-for-teacher`
      : `/${schoolNameInURL}/reports/usage-for-teacher`;

  const linkForCourse =
    USER_ROLE === USER_TYPE.SUPER_ADMIN
      ? `/school-management/school/${SCHOOL_ID}/reports/program-usage-detail`
      : `/${schoolNameInURL}/reports/program-usage-detail`;

  const TableColumns: any = [
    { label: 'Student Name', mapper: 'student_name', align: 'left' },
    { label: 'Class', mapper: 'class_name', align: 'left' },
    { label: 'Teacher Name', mapper: 'teacher_name', align: 'left' },
    { label: 'First Login', mapper: 'first_login', align: 'left' },
    { label: 'Last Login', mapper: 'last_login', align: 'left' },
    { label: 'Total Time', mapper: 'avg_time_per_logins', align: 'left' },
    {
      label: 'Total No. of Assignments Assigned',
      mapper: 'total_assignments',
      align: 'left',
    },
    {
      label: 'Total No. of Assignments Submitted',
      mapper: 'assignments_submitted',
      align: 'left',
    },
    {
      label: 'Pending Assignments',
      mapper: 'assignments_pending',
      align: 'left',
    },
    {
      label: 'Total No. of Assessments Assigned',
      mapper: 'total_assessments',
      align: 'left',
    },
    {
      label: 'Total No. of Assessments Submitted',
      mapper: 'assessments_submitted',
      align: 'left',
    },
    {
      label: 'Pending Assessments',
      mapper: 'assessments_pending',
      align: 'left',
    },
    { label: 'Courses', mapper: 'courses', align: 'left' },
  ];

  const csvSubHeaders = [
    TABLE_LABELS?.STUDENT_NAME,
    TABLE_LABELS?.CLASS,
    'Teacher name',
    TABLE_LABELS?.FIRST_LOGIN,
    TABLE_LABELS?.LAST_LOGIN,
    TABLE_LABELS?.TOTAL_TIME,
    'Total No. of Assignments Assigned',
    'Total No. of Assignments Submitted',
    TABLE_LABELS?.PENDING_ASSIGNMENTS,
    'Total No. of Assessments Assigned',
    'Total No. of Assessments Submitted',
    TABLE_LABELS?.PENDING_ASSESSMENTS,
    TABLE_LABELS?.COURSES,
  ];

  const {
    isRefetching: emailSendLoading,
    refetch: sendEmail,
    isLoading: emailLoad,
  } = useGet({
    baseURL: ReportURL,
    url: `reports-service/usage-report-teacher_enhanced_details/send-email/?school_id=${schoolData?.id || branchData?.school_data?.id}`,
    onSuccess: () => {
      toast('success', 'Email sent successfully');
    },
    retry: false,
    onError: ({ response }: any) => {
      toast('error', response?.data?.message || 'Unable to send email');
    },
    enabled: false,
  }) as any;

  const handelSendEmail = () => {
    sendEmail();
  };

  const ADMIN_TOOLBAR_MENU = [
    // {
    //   title: TOOLBAR_LABELS.EMAIL,
    //   icon:
    //     emailSendLoading || emailLoad ? <Loader size={20} /> : <EmailIcon />,
    // },
    {
      title: 'Export',
      icon: (
        <CSVLink
          filename="Report Student Detail.csv"
          data={csvData}
          headers={csvSubHeaders}
          enclosingCharacter=""
        >
          <Share />
        </CSVLink>
      ),
    },
    {
      title: 'Print',
      icon: (
        <ReactToPrint
          trigger={printButton}
          content={() => componentRef.current}
        />
      ),
    },
  ];

  const ADMIN_TOOLBAR_MENU_GRAPH = [
    {
      title: 'Export',
      icon: (
        <CSVLink
          filename="Usage Reports Teacher.csv"
          data={csvData}
          headers={csvSubHeaders}
          enclosingCharacter=""
        >
          <Share />
        </CSVLink>
      ),
    },
  ];

  const handleToolbarAction = async (title: string) => {
    if (title === TOOLBAR_LABELS.EMAIL) {
      handelSendEmail();
    }
  };

  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };
  const handleOptionChange = (event: any) => {
    setYaxis(event.target.value);
  };
  const handleOptionXaxisChange = (event: any) => {
    setXaxis(event.target.value);
  };
  const { data: branchList, isLoading: branchListLoading } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-branches/?limit=100&school_id=${schoolData?.id || branchData?.school_data?.id}`,
    enabled: !!(schoolData?.id || branchData?.school_data?.id),
  });
  const BranchArr = branchList?.data?.response?.results?.sort(sortByName);

  const branchName = useMemo(
    () =>
      branchList?.data?.response?.results.find(
        (itm: any) => itm.id === selectedBranch
      )?.name || branchData?.name,
    [selectedBranch, branchData]
  );

  const { isLoading: schoolClassLoading, data: schoolClassList } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-classes/?limit=1000&school_id=${schoolData?.id || branchData?.school_data?.id}${branchData || selectedBranch !== 'select' ? `&branch_name=${branchName}` : ''}`,
  });
  const SchooClassList = schoolClassList?.data?.response?.results;

  const { data: teacherList, isLoading: teacherListLoading } = useGet({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/teachers-list/?limit=1000&ordering=-created_at&school_id=${schoolData?.id || branchData?.school_data?.id}${branchData || selectedBranch !== 'select' ? `&branch_name=${branchName}` : ''}`,
  });
  const { isLoading: subjectsLoading, data: subjectList } = useGet({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/content/?ordering=-created_at&limit=100&offset=0&selection=Course`,
  });
  const SubjectArr = subjectList?.data?.response?.results?.sort(sortByName);

  const compare = (a: any, b: any) => {
    if (a.username < b.username) {
      return -1;
    }
    if (a.username > b.username) {
      return 1;
    }
    return 0;
  };
  const TeacherArr = teacherList?.data?.response?.results?.sort(compare);
  const DateTimeRegex = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})\.\d+Z$/;
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const { isLoading, data } = useGet({
    baseURL: ReportURL,
    url: `reports-service/usage-report-student_enhanced_details/?school_id=${schoolData?.id || branchData?.school_data?.id}${
      selectedBranch !== 'select'
        ? `&branch_id=${selectedBranch}`
        : userRole().isBranchAdmin || branchData
          ? `&branch_id=${branchData?.id}`
          : ''
    }${selectedClass !== 'select' ? `&class_id=${selectedClass}` : ''}${
      fromDate ? `&from_date=${moment(fromDate).format('yyyy-MM-DD')}` : ''
    }${
      toDate ? `&to_date=${moment(toDate).format('yyyy-MM-DD')}` : ''
    }&page=${page}&page_size=${rowsPerPage}&is_graph=${graph}${
      selectedprogram !== 'select' ? `&program=${selectedprogram}` : ''
    }&user_timezone=${userTimezone}`,
    onSuccess: (res: any) => {
      setTotalDataCount(res?.data?.response?.total_records);
      const ProgramData = res?.data?.response?.data;
      const body: any = [];

      ProgramData?.forEach((i: any) => {
        body.push({
          ...i,
          first_login: i?.first_login?.replace(DateTimeRegex, '$1- $2'),
          last_login: i?.last_login?.replace(DateTimeRegex, '$1- $2'),
          avg_time_per_logins: i?.avg_time_per_logins || '00:00:00',
          total_assignments: i?.assignments?.total || 0,
          assignments_submitted: i?.assignments?.submitted || 0,
          assignments_pending: i?.assignments?.pending || 0,
          total_assessments: i?.assessments?.total || 0,
          assessments_submitted: i?.assessments?.submitted || 0,
          assessments_pending: i?.assessments?.pending || 0,
          teacher_name: (
            <Link
              to={`${link}`}
              className="text-accent underline cursor-pointer text-xs font-medium"
            >
              {i?.teacher_name?.join('  , ')}
            </Link>
          ),
          courses: (
            <span>
              {Object.entries(i?.courses || {}).map(
                ([courseName, courseId], index) => (
                  <Link
                    key={index}
                    to={`${linkForCourse}/undefined/undefined/${courseId}/${encodeURIComponent(courseName)}`}
                    className="text-accent underline cursor-pointer text-xs font-medium"
                  >
                    {courseName}
                    {index < Object.entries(i?.courses || {}).length - 1
                      ? ', '
                      : ''}
                    {/* Add a comma between course names */}
                  </Link>
                )
              )}
            </span>
          ),
        });
      });

      setTableData(body); // Set the processed table data

      setTotalData(res?.data?.response?.data);

      // Graph data
      const Graph1 = res?.data?.response?.assessment_graph;
      const Graph2 = res?.data?.response?.time_opended_graph;
      const Graph3 = res?.data?.response?.assignment_graph;

      setAssignmentGraph(Graph3);
      setAssessmentGraph(Graph1);
      setTimeOpenedGraph(Graph2);
    },
  });

  // const tableData = useMemo(() => {
  //   if (!data?.data?.response?.data) return []; // Safely handle if data is undefined or empty
  //   return data?.data.response.data.map((itm: any) => ({
  //     student_name: itm.student_name,
  //     class: itm.class,
  //     first_login: itm?.first_login?.replace(DateTimeRegex, "$1, $2"),
  //     last_login: itm?.last_login?.replace(DateTimeRegex, "$1, $2"),
  //     total_logins: itm.total_logins,
  //     avg_time_per_logins: itm.avg_time_per_logins,
  //     assignments_completed: itm.assignments?.completed || 0,
  //     assessments_submitted: itm.assessments?.submitted || 0,
  //     courses: Object.entries(itm?.courses || {}).map(
  //       ([courseName, courseId]) => ({
  //         name: courseName,
  //         link: `/reports/program-usage-reports/${courseId}/${encodeURIComponent(courseName)}`,
  //       })
  //     ),
  //   }));
  // }, [data]);

  useEffect(() => {
    if (data) {
      console.log('API Response:', data?.data?.response);
    }
  }, [data]);

  const extractCourses = (data) => {
    if (!data || !Array.isArray(data.children)) return '';
    const courses = data.children.map(
      (item) => item.props?.children?.[0] || ''
    );
    return courses.filter(Boolean).join(' - '); // Filter out any empty values
  };

  const formatTeacherNames = (teacherString) => {
    return teacherString
      .split(',') // Split by commas
      .map((name) => name.trim()) // Trim any whitespace around names
      .join(' -'); // Join with " -"
  };

  // Example: Formatting teacher_name from an array → comma-separated string,
  // handling default values for assignments, converting dates, etc.
  const CSVDataFunction = () => {
    const csvdata = tableData?.map((row: any) => {
      // 1) Format teacher_name (assume it's an array of strings)
      const teacherNames = Array.isArray(row.teacher_name?.props?.children)
        ? row.teacher_name.props.children.join(' - ')
        : row.teacher_name?.props?.children || '';

      // 2) Format assignments to ensure no "undefined"
      const totalAssignments = row?.assignments?.total ?? 0;
      const submittedAssignments = row?.assignments?.submitted ?? 0;
      const pendingAssignments = row?.assignments?.pending ?? 0;
      // 3) Format assessments
      const totalAssessments = row?.assessments?.total ?? 0;
      const submittedAssessments = row?.assessments?.submitted ?? 0;
      const pendingAssessments = row?.assessments?.pending ?? 0;

      // 4) Convert courses object → comma-separated string (if needed)
      //    (If row.courses is already a single string, skip this step)
      const coursesString = extractCourses(row.courses?.props);

      // 5) Date formatting example (using your own utils or moment)
      //    If you want to parse row.first_login as a date string:
      // const formattedFirstLogin = row.first_login
      //   ? moment(row.first_login).format("YYYY-MM-DD HH:mm")
      //   : "";
      // etc.

      // Finally, return the 13 columns in order:
      return [
        row.student_name || '', // 1 Student Name
        row.class_name || '', // 2 Class
        formatTeacherNames(teacherNames), // 3 Teacher Name
        row?.first_login, // 4 First Login
        row?.last_login, // 5 Last Login
        row.avg_time_per_logins || '', // 6 Total Time
        totalAssignments, // 7 Total Assignments
        submittedAssignments, // 8 Assignments Submitted
        pendingAssignments, // 9 Pending Assignments
        totalAssessments, // 10 Total Assessments
        submittedAssessments, // 11 Assessments Submitted
        pendingAssessments, // 12 Pending Assessments
        coursesString, // 13 Courses
      ];
    });

    setCsvData(csvdata);
  };

  const reset = () => {
    setFromDate('');
    setToDate('');
  };
  useEffect(() => {
    if (view === 'secondary') {
      setGraph('1');
    } else {
      setGraph('');
    }
    CSVDataFunction();
  }, [view, csvData]);

  useEffect(() => {
    if (location?.state?.page) {
      setPage(location?.state?.page);
    }
  }, []);

  const handlePerPage = (e: any) => {
    if (e === 'All') {
      setRowsPerPage(e);
      setPage(1);
    } else {
      setRowsPerPage(e);
      setPage(page);
    }
  };

  return (
    <RouteLayout>
      <HeaderMenus
        title="Report - Student Usage Report"
        menuArray={
          view === 'default' ? ADMIN_TOOLBAR_MENU : ADMIN_TOOLBAR_MENU_GRAPH
        }
        handleToolbarAction={handleToolbarAction}
      />
      <div
        className={`w-full grid grid-cols-1 ${userRole().isBranchAdmin ? 'lg:grid-cols-7' : 'lg:grid-cols-8'} my-2 gap-2 items-center justify-between`}
      >
        {view === 'default' ? (
          <>
            {!userRole().isBranchAdmin && (
              <Dropdown
                title="Select Branch"
                value={selectedBranch}
                dataArray={[
                  { label: 'All', value: 'select' },
                  ...(BranchArr?.map((item: any) => ({
                    label: item.name,
                    value: item.id,
                  })) || []),
                ]}
                onChangeHandler={(val) => {
                  setselectedBranch(val);
                  setSelectedClass('select');
                  setSelectedTeacher('select');
                }}
                loading={branchListLoading}
                sxClass={{ width: '100%' }}
              />
            )}

            <Dropdown
              title="Select a class"
              value={selectedClass}
              loading={schoolClassLoading}
              dataArray={[
                { label: 'All', value: 'select' },
                ...(SchooClassList?.map((item: any) => ({
                  label: item.name,
                  value: item.id,
                })) || []),
              ]}
              onChangeHandler={(val) => setSelectedClass(val)}
              sxClass={{ width: '100%' }}
            />
          </>
        ) : (
          <Dropdown
            title="Select Course"
            value={selectedprogram}
            dataArray={[
              { label: 'Select', value: 'select' },
              ...(SubjectArr?.map((itm: any) => ({
                label: itm?.content,
                value: itm?.content,
              })) || []),
            ]}
            onChangeHandler={(val) => setSelectedProgram(val)}
            sxClass={{ width: '100%' }}
          />
        )}

        <Dropdown
          title="Result Of Pages"
          value={rowsPerPage}
          dataArray={RESULTS_PER_PAGE}
          onChangeHandler={handlePerPage}
          sxClass={{ width: '100%' }}
        />
        <div className={` flex gap-x-4 items-center  pt-2 lg:pt-6`}>
          {(toDate || fromDate) && (
            <span
              tabIndex={0}
              title="Clear dates"
              onClick={() => reset()}
              role="button"
            >
              <RestartAltIcon />
            </span>
          )}
        </div>
        {/* <div
          className={`${view === "default" ? "lg:col-auto" : "lg:col-span-3"} mt-3 flex justify-end`}
        >
          <ButtonToggle view={view} setView={setView} />
        </div> */}

        {/* <CustomInput
          name="Branch Name"
          label="Branch Name"
          size="small"
          value={selectedBranch}
          disabled={true}
        /> */}
      </div>
      {/* Table Section */}
      {view === 'default' ? (
        <div className="bg-white" ref={componentRef}>
          <Wrapper>
            <AdvanceTable
              isLoading={isLoading}
              tableData={tableData}
              headerRows={TableColumns}
              currentPage={page}
              totalPages={noOfpages}
              rowsPerPage={rowsPerPage}
              paginateHandler={handlePagination}
              setPage={setPage}
              // maxHeight={620}
            />
          </Wrapper>
        </div>
      ) : (
        <>
          <div className="p-5" ref={componentRef}>
            <h1 className="font-semibold text-l">Teachers</h1>
            <div className="py-4 h-full grid grid-cols-1 gap-4">
              {/* Assignment Graph */}
              <div className="p-4 bg-white border border-accent rounded-md w-full">
                <div className="flex flex-col items-center justify-center">
                  <p className="font-semibold text-xl">
                    {GRAPH_LABELS.ASSIGNMENT_GRAPH}
                  </p>
                </div>
                <div className="overflow-x-auto w-full">
                  <TeacherGraphComponent
                    data={assignmentGraph}
                    title={GRAPH_LABELS.ASSIGNMENT_GRAPH}
                  />
                </div>
              </div>

              {/* Assessment Graph */}
              <div className="p-4 bg-white border border-accent rounded-md w-full">
                <div className="flex flex-col items-center justify-center">
                  <p className="font-semibold text-xl">
                    {GRAPH_LABELS.ASSESSMENT_GRAPH}
                  </p>
                </div>
                <div className="overflow-x-auto w-full">
                  <TeacherGraphComponent
                    data={assessmentGraph}
                    title={GRAPH_LABELS.ASSESSMENT_GRAPH}
                  />
                </div>
              </div>

              {/* Time Opened Graph */}
              <div className="p-4 bg-white border border-accent rounded-md w-full">
                <div className="flex flex-col items-center justify-center">
                  <p className="font-semibold text-xl">
                    {GRAPH_LABELS.TIME_OPENED_GRAPH}
                  </p>
                </div>
                <div className="overflow-x-auto w-full">
                  <TeacherGraphComponent
                    data={timeOpenedGraph}
                    title={GRAPH_LABELS.TIME_OPENED_GRAPH}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </RouteLayout>
  );
}
