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
import EmailIcon from '@mui/icons-material/Email';
import { CSVLink } from 'react-csv';
import PrintIcon from '@mui/icons-material/Print';
import { ReactComponent as Share } from '@images/pageHeaderIcons/share.svg';
import ReactToPrint from 'react-to-print';
import RouteLayout from '@layout/routeLayout';
import DatePicker from '@component/datepicker';
import ButtonToggle from '@component/ToggleButton/ToggleButton';
import { NumberedPagination } from '@component/pagination/CustomPagination';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CustomInput } from '@component/input';
import { selectSchoolData } from '@shared/store/schoolSlice';
import { getNoOfPages, sortByName, userRole } from '@utility/utility';
import { selectUser } from '@shared/store/userSlice';
import { useGet } from '@shared/api/useApi';
import Wrapper from '@shared/wrapper/Wrapper';
import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import moment from 'moment';
import Loader from '@shared/loader';
import toast from '@shared/toast';
import ProgramUsageOverview from '../BarChart/ProgramUsageOverview';
import TotalStudentGraph from '../BarChart/TotalStudentGraph';
import AverageActiveStudent from '../BarChart/AverageActiveStudent';
import BarChartType1 from '../BarChart/barChartType1';
import TotalAssessment from '../BarChart/TotalAssessment';

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
  const [NoOfDaysArr, SetNoOfDaysArr] = useState([]);
  const componentRef = useRef(null);
  const [graph, setGraph] = useState('');
  const location = useLocation();
  // const rowsPerPage = 10;
  const [rowsPerPage, setRowsPerPage] = useState<any>(RESULTS_PER_PAGE?.[0]);
  const ReportURL = import.meta.env.VITE_APP_REPORTS_SERVICE_URL;
  const noOfpages = getNoOfPages(totalDataCount, rowsPerPage);
  const schoolNameInURL = decodeURIComponent(location.pathname.split('/')[1]);
  const link = `/${schoolNameInURL}/reports/student-detail-view`;

  const csvSubHeaders = [
    TABLE_LABELS?.CLASS,
    TABLE_LABELS?.TEACHER,
    TABLE_LABELS?.STUDENT_IN_CLASS,
    TABLE_LABELS?.COURSES,
    TABLE_LABELS?.ACTIVE_STUDENT,
    TABLE_LABELS?.AVG_ACTIVE_PER_STUDENT,
  ];
  const {
    isRefetching: emailSendLoading,
    refetch: sendEmail,
    isLoading: emailLoad,
  } = useGet({
    baseURL: ReportURL,
    url: `reports-service/usage-report-teacher-detail/send-email/?school_id=${schoolData?.id || branchData?.school_data?.id}`,
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
    {
      title: TOOLBAR_LABELS.EMAIL,
      icon:
        emailSendLoading || emailLoad ? <Loader size={20} /> : <EmailIcon />,
    },
    {
      title: 'Export',
      icon: (
        <CSVLink
          filename="Report Teacher Detail.csv"
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
  const handleToolbarAction = async (title: string) => {
    if (title === TOOLBAR_LABELS.EMAIL) {
      handelSendEmail();
    }
  };

  const TableColumns: any = [
    {
      label: TABLE_LABELS?.SR_NO,
      align: 'left',
    },
    {
      label: TABLE_LABELS?.CLASS,
      mapper: 'Class',
      bodyAlign: 'left',
    },
    {
      label: TABLE_LABELS?.TEACHER,
      mapper: 'Teacher',
      bodyAlign: 'left',
    },
    {
      label: TABLE_LABELS?.STUDENT_IN_CLASS,
      mapper: 'StudentInClass',
      bodyAlign: 'left',
    },
    {
      label: TABLE_LABELS?.COURSES,
      bodyAlign: 'left',
      mapper: 'Program',
    },
    {
      label: TABLE_LABELS?.ACTIVE_STUDENT,
      bodyAlign: 'left',
      mapper: 'ActiveStudents',
    },
    {
      label: TABLE_LABELS?.AVG_ACTIVE_PER_STUDENT,
      bodyAlign: 'center',
      mapper: 'AvgActiveStudent',
    },
  ];

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
  const SchooClassList =
    schoolClassList?.data?.response?.results?.sort(sortByName);

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

  const teacherName = useMemo(() => {
    const obj = teacherList?.data?.response?.results?.find(
      (itm: any) => itm.user_id === selectedteacher
    );
    if (obj) {
      return `${obj?.first_name} ${obj?.last_name}`;
    }
    return '';
  }, [selectedteacher]) as string;
  const { isLoading, data } = useGet({
    baseURL: ReportURL,
    url: `reports-service/usage-report-teacher-detail/?school_id=${schoolData?.id || branchData?.school_data?.id}${selectedBranch !== 'select' ? `&branch_id=${selectedBranch}` : userRole().isBranchAdmin || branchData ? `&branch_id=${branchData?.id}` : ''}${selectedteacher !== 'select' ? `&teacher=${teacherName}` : ''}${selectedClass !== 'select' ? `&class_id=${selectedClass}` : ''}${fromDate ? `&from_date=${moment(fromDate).format('yyyy-MM-DD')}` : ''}${toDate ? `&to_date=${moment(toDate).format('yyyy-MM-DD')}` : ''}&page=${page}&page_size=${rowsPerPage}&is_graph=${graph}${selectedprogram !== 'select' ? `&program=${selectedprogram}` : ''}`,
    onSuccess: (res: any) => {
      setTotalDataCount(res?.data?.response?.total_records);
      const Graph1 = res?.data?.response?.total_students_vs_active_students;
      setTotalData(Graph1);
      const Graph2 = res?.data?.response?.average_active_days_per_students;
      SetNoOfDaysArr(Graph2);
    },
  });

  const tableData =
    useMemo(
      () =>
        data?.data?.response?.data?.map((itm: any) => ({
          Class: itm?.class_name,
          Teacher: (
            <Link
              state={{ page }}
              to={`${link}/${itm?.class_name}/${itm?.teacher_name}/${itm?.school_id}/${itm?.class_id}/${itm?.start_date}/${itm?.end_date}`}
            >
              <span className="text-accent underline cursor-pointer text-xs font-medium">
                {itm?.teacher_name}
              </span>
            </Link>
          ),
          StudentInClass: itm?.students_in_class,
          Program: itm?.program,
          ActiveStudents: itm?.active_students,
          AvgActiveStudent: itm?.avg_active_days_per_student,
          TotalTeacher: '',
        })),
      [data]
    ) || [];
  const CSVDataFunction = () => {
    const csvdata = tableData.map((i: any) => [
      i?.Class,
      i?.Teacher?.props?.children?.props?.children || '',
      i?.StudentInClass,
      i?.Program,
      i?.ActiveStudents,
      i?.AvgActiveStudent,
    ]);

    setCsvData(csvdata);
  };
  //   const csvdata: any = [];
  //   // eslint-disable-next-line array-callback-return
  //   tableData.map((i: any) => {
  //     csvdata.push([i?.Class, i?.StudentInClass, i?.Program, i?.ActiveStudents, i?.AvgActiveStudent]);
  //     setCsvData(csvdata);
  //   });
  // };

  const chartData1 = (NoOfDaysArr || []).map((i: any) => ({
    name: i?.class_name,
    count1: i?.avg_active_days_per_student,
  }));

  const tempStudent = (totalData || []).map((i: any) => ({
    name: i?.class_name,
    count1: Number(i?.total_student) - Number(i?.active_students),
    count2: Number(i?.active_students),
  }));

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
    setPage(page);
    setRowsPerPage(e);
  };

  return (
    <RouteLayout>
      <HeaderMenus
        title="Report - Usage Report"
        menuArray={ADMIN_TOOLBAR_MENU}
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
              title="Result Of Pages"
              value={rowsPerPage}
              dataArray={RESULTS_PER_PAGE}
              onChangeHandler={handlePerPage}
              sxClass={{ width: '100%' }}
            />
            <Dropdown
              title="Teacher Name"
              loading={teacherListLoading}
              value={selectedteacher}
              dataArray={[
                { label: 'All', value: 'select' },
                ...(TeacherArr?.map((itm: any) => ({
                  label: `${itm?.first_name} ${itm?.last_name}`,
                  value: itm?.user_id,
                })) || []),
              ]}
              onChangeHandler={(val) => setSelectedTeacher(val)}
              sxClass={{ width: '100%' }}
            />
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

        <DatePicker
          fullWidth={true}
          sxType={1}
          value={fromDate}
          label="From"
          disabled={false}
          defaultStyle={true}
          disablePast={false}
          disableFuture={toDate} // disableOld={userRole().isTeacher ? minStartDate : currentUserAcademicDate()?.start || new Date()}
          // disableFuture={new Date() <= currentUserAcademicDate()?.end ? new Date() : currentUserAcademicDate()?.end}
          handlePickerChange={(date: string) => setFromDate(date)}
          shouldDisableDate={() => false}
        />
        <DatePicker
          fullWidth={true}
          sxType={1}
          value={toDate}
          label="To"
          disabled={false}
          defaultStyle={true}
          disablePast={false}
          disableOld={fromDate} // disableOld={userRole().isTeacher ? minStartDate : currentUserAcademicDate()?.start || new Date()}
          // disableFuture={new Date() <= currentUserAcademicDate()?.end ? new Date() : currentUserAcademicDate()?.end}
          handlePickerChange={(date: string) => setToDate(date)}
          shouldDisableDate={() => false}
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
        <div
          className={`${view === 'default' ? 'lg:col-auto' : 'lg:col-span-3'} mt-3 flex justify-end`}
        >
          <ButtonToggle view={view} setView={setView} />
        </div>

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
            <div className="py-4 h-full grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white border border-accent rounded-md">
                <div className="flex flex-col items-center justify-center">
                  <p className="font-semibold text-xl">
                    {GRAPH_LABELS.TOTAL_VS_ACTIVE}
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <TotalStudentGraph data={tempStudent || []} />
                </div>{' '}
              </div>
              <div className="p-4 bg-white border border-accent rounded-md">
                <div className="flex flex-col items-center justify-center">
                  <p className="font-semibold text-xl">
                    {GRAPH_LABELS.AVG_ACTIVE_STUDENTS}
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <TotalAssessment
                    data={chartData1 || []}
                    title={GRAPH_LABELS.NOOFDAYS}
                  />
                </div>{' '}
              </div>
            </div>
          </div>
        </>
      )}
    </RouteLayout>
  );
}
