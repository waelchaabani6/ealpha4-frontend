/* eslint-disable linebreak-style */
import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import ButtonToggle from '@component/ToggleButton/ToggleButton';
import DatePicker from '@component/datepicker';
import Dropdown from '@component/dropdown/Dropdown';
import {
  GRAPH_LABELS,
  RESULTS_PER_PAGE,
  TABLE_LABELS,
  TOOLBAR_LABELS,
} from '@constants/constants';
import { ReactComponent as Share } from '@images/pageHeaderIcons/share.svg';
import RouteLayout from '@layout/routeLayout';
import EmailIcon from '@mui/icons-material/Email';
import PrintIcon from '@mui/icons-material/Print';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useGet } from '@shared/api/useApi';
import Loader from '@shared/loader';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import { selectSchoolData } from '@shared/store/schoolSlice';
import { selectUser } from '@shared/store/userSlice';
import toast from '@shared/toast';
import Wrapper from '@shared/wrapper/Wrapper';
import { getNoOfPages, sortByName, sortData, userRole } from '@utility/utility';
import moment from 'moment';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import { useSelector } from 'react-redux';
import ReactToPrint from 'react-to-print';
import ActiveDaysUsage from '../BarChart/ActiveDaysUsage';
import ContentOpened from '../BarChart/ContentOpened';
import TimePerClass from '../BarChart/TimePerClass';

export default function Index() {
  const [selectedteacher, setSelectedTeacher] = useState<any>('select');
  const [selectedprogram, setSelectedProgram] = useState<any>('select');
  const [selectedClass, setSelectedClass] = useState<any>('select');
  const [csvData, setCsvData] = useState<[]>([]);
  const printButton = () => <PrintIcon />;
  const [page, setPage] = useState(1);
  const [fromDate, setFromDate] = useState<any>();
  const [toDate, setToDate] = useState<any>();
  const componentRef = useRef(null);
  const [selectedBranch, setselectedBranch] = useState('select');
  const { schoolData, branchData } = useSelector(selectSchoolData);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [Graph1arr, setGraph1arr] = useState([]);
  const [Graph2Arr, setGraph2arr] = useState([]);
  const [Graph3Arr, setGraph3Arr] = useState([]);

  const [rowsPerPage, setRowsPerPage] = useState<any>(RESULTS_PER_PAGE?.[0]);
  const noOfpages = getNoOfPages(totalDataCount, rowsPerPage);
  const { role, user_profile_id: userId } = useSelector(selectUser);
  const [graph, setGraph] = useState('');
  const ReportURL = import.meta.env.VITE_APP_REPORTS_SERVICE_URL;
  const [view, setView] = React.useState('default');

  const {
    isRefetching: emailSendLoading,
    refetch: sendEmail,
    isLoading: emailLoad,
  } = useGet({
    baseURL: ReportURL,
    url: `reports-service/usage-report/send-email/?school_id=${schoolData?.id || branchData?.school_data?.id}`,
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
  const csvSubHeaders = [
    TABLE_LABELS?.CLASS,
    TABLE_LABELS?.CLASSES_TAUGHT,
    TABLE_LABELS?.TEACHER,
    TABLE_LABELS?.COURSES,
    TABLE_LABELS?.ACTIVE_DAYS,
    TABLE_LABELS?.CONTENT_OPENED,
    TABLE_LABELS?.CONTENT_COMPLETED,
    TABLE_LABELS?.TOTAL_TIME,
  ];

  const ADMIN_TOOLBAR_MENU = [
    // {
    //   title: TOOLBAR_LABELS.EMAIL,
    //   icon: (emailSendLoading || emailLoad) ? <Loader size={20} /> : <EmailIcon />
    // },
    {
      title: 'Export',
      icon: (
        <CSVLink
          filename="Teacher-1 usage Report.csv"
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
    // {
    //   title: 'Export',
    //   icon: (
    //     <CSVLink
    //       filename="Teacher-1 usage Report.csv"
    //       data={csvData}
    //       headers={csvSubHeaders}
    //       enclosingCharacter=""
    //     >
    //       <Share />
    //     </CSVLink>
    //   ),
    // },
  ];

  const handleToolbarAction = async (title: string) => {
    if (title === TOOLBAR_LABELS.EMAIL) {
      handelSendEmail();
    }
  };

  const TableColumns: any = [
    {
      label: TABLE_LABELS?.SR_NO,
      align: 'center',
    },
    {
      label: TABLE_LABELS?.CLASS,
      mapper: 'Class',
    },
    {
      label: TABLE_LABELS?.CLASSES_TAUGHT,
      mapper: 'ClassesTaught',
      align: 'center',
    },
    {
      label: TABLE_LABELS?.TEACHER,
      mapper: 'Teacher',
    },
    {
      label: TABLE_LABELS?.COURSES,
      mapper: 'Program',
    },
    {
      label: TABLE_LABELS?.ACTIVE_DAYS,
      align: 'center',
      mapper: 'ActiveDays',
    },
    {
      label: TABLE_LABELS?.CONTENT_OPENED,
      align: 'center',
      mapper: 'ContentOpened',
    },
    {
      label: TABLE_LABELS?.CONTENT_COMPLETED,
      mapper: 'ContentCompleted',
      align: 'center',
    },
    {
      label: TABLE_LABELS?.TOTAL_TIME,
      mapper: 'TotalTime',
      align: 'center',
    },
  ];

  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
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
    url: `reports-service/usage-report/?school_id=${schoolData?.id || branchData?.school_data?.id}${selectedBranch !== 'select' ? `&branch_id=${selectedBranch}` : userRole().isBranchAdmin || branchData ? `&branch_id=${branchData?.id}` : ''}${selectedteacher !== 'select' ? `&teacher=${teacherName}` : ''}${selectedClass !== 'select' ? `&class_id=${selectedClass}` : ''}${fromDate ? `&from_date=${moment(fromDate).format('yyyy-MM-DD')}` : ''}${toDate ? `&to_date=${moment(toDate).format('yyyy-MM-DD')}` : ''}&page=${page}&page_size=${rowsPerPage}${selectedprogram !== 'select' ? `&program=${selectedprogram}` : ''}${graph ? `&is_graph=${graph}` : ''}`,
    onSuccess: (res: any) => {
      setTotalDataCount(res?.data?.response?.total_records);
      const Graph1 = res?.data?.response?.active_day_per_program;
      const Graph2 = res?.data?.response?.content_open_vs_completed_graph;
      const Graph3 = res?.data?.response?.class_vs_total_time;
      if (Graph1) {
        const body: any = [];
        // eslint-disable-next-line array-callback-return
        Graph1?.map((ele: any) => {
          const convertedArray = [
            ele?.programs?.reduce(
              (acc: any, curr: any) => ({
                ...acc,
                [curr?.name]: curr?.total_active_days,
              }),
              {}
            ),
          ];
          body.push({
            name: ele?.class_name,
            Program: convertedArray,
          });
        });
        setGraph1arr(body);
      }
      if (Graph2) {
        const body: any = [];
        Graph2?.map((i: any) => {
          body.push({
            content_completed_sum: i?.no_of_content_completed,
            Opened: i?.content_opened_sum,
            name: i?.class_name,
          });
          return true;
        });
        setGraph2arr(body);
      }
      if (Graph3) {
        const body: any = [];
        // eslint-disable-next-line array-callback-return
        Graph3?.map((i: any) => {
          // eslint-disable-next-line array-callback-return
          i?.programs?.filter((ele: any) => {
            const total_time_sum = ele?.total_time;
            const [hours, minutes, seconds] = total_time_sum
              .split(':')
              .map(Number);
            const totalSeconds = hours * 3600 + minutes * 60 + seconds;
            let totalDays: any;
            if (totalSeconds >= 1) {
              totalDays = Math.ceil(totalSeconds / (24 * 3600));
            } else {
              totalDays = 0;
            }
            const convertedArray = [
              i?.programs?.reduce(
                (acc: any, curr: any) => ({ ...acc, [curr?.name]: totalDays }),
                {}
              ),
            ];
            body.push({
              name: i?.class_name,
              program: convertedArray,
            });
            setGraph3Arr(body);
          });

          // // eslint-disable-next-line array-callback-return
        });
      }
    },
  });

  const { isLoading: subjectsLoading, data: subjectList } = useGet({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/content/?ordering=-created_at&limit=100&offset=0&selection=Course`,
  });
  const SubjectArr = subjectList?.data?.response?.results?.sort(sortByName);

  const { isLoading: graphLoading, data: graphData } = useGet({
    baseURL: ReportURL,
    url: `reports-service/usage-report/?is_graph=1${selectedprogram !== 'select' ? `&program=${selectedprogram}` : ''}`,
    enabled: view !== 'default',
  });

  const tableData =
    useMemo(
      () =>
        data?.data?.response?.data?.map((itm: any) => ({
          Program: itm?.program,
          Class: itm?.class_name,
          Teacher: itm?.teacher_name,
          ClassesTaught: itm?.no_of_classes_taught,
          TotalClass: '',
          TotalStudent: '',
          ActiveDays: itm?.active_days,
          ContentOpened: itm?.content_opened,
          ContentCompleted: itm?.no_of_content_completed,
          TotalTime: itm?.total_time,
        })),
      [data]
    ) || [];

  const CSVDataFunction = () => {
    const csvdata = tableData.map((i: any) => [
      i?.Class,
      i?.ClassesTaught,
      i?.Teacher?.props?.children?.props?.children?.props?.children
        ?.teacher_name ||
        i?.Teacher ||
        '',
      i?.Program,
      i?.ActiveDays,
      i?.ContentOpened,
      i?.ContentCompleted,
      i?.TotalTime,
    ]);

    setCsvData(csvdata);
  };
  //   const csvdata: any = [];
  //   // eslint-disable-next-line array-callback-return
  //   tableData.map((i: any) => {
  //     csvdata.push([i?.Class, i?.ClassesTaught, i?.Teacher, i?.Program, i?.ContentOpened, i?.ContentCompleted, i?.TotalTime]);
  //     setCsvData(csvdata);
  //   });
  // };
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

  const handlePerPage = (e: any) => {
    setPage(page);
    setRowsPerPage(e);
  };

  return (
    <RouteLayout>
      <HeaderMenus
        title={`Report - Usage for Teacher - 1 ${view === 'default' ? '' : ' - Graph View'}`}
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
            loading={subjectsLoading}
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
          disableFuture={toDate}
          // disableOld={userRole().isTeacher ? minStartDate : currentUserAcademicDate()?.start || new Date()}
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
          disableOld={fromDate}
          // disableOld={userRole().isTeacher ? minStartDate : currentUserAcademicDate()?.start || new Date()}
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
              maxHeight={620}
            />
          </Wrapper>
        </div>
      ) : (
        <>
          <div ref={componentRef} className="p-5">
            <h1 className="font-semibold text-l">Students</h1>
            <div className="py-4 h-full grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
              <div className="p-4 bg-white border border-accent rounded-md">
                <div className="flex flex-col items-center justify-center">
                  <p className="font-semibold text-lg">
                    {GRAPH_LABELS.ACTIVE_DAYS}
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <ActiveDaysUsage data={Graph1arr || []} />
                </div>
              </div>
              <div className="p-4 bg-white border border-accent rounded-md">
                <p className="font-semibold text-lg">
                  {GRAPH_LABELS.CONTENT_OPENED_COMPLETED}
                </p>
                <div className="overflow-x-auto">
                  <ContentOpened data={Graph2Arr} />
                </div>
              </div>
              <div className="p-4 bg-white border border-accent rounded-md">
                <p className="font-semibold text-lg">
                  {GRAPH_LABELS.TOTAL_TIME}
                </p>
                <div className="overflow-x-auto">
                  <TimePerClass data={Graph3Arr || []} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </RouteLayout>
  );
}
