/* eslint-disable linebreak-style */
/* eslint-disable comma-dangle */
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import React, { useState, useRef, useEffect } from 'react';
import {
  GRAPH_LABELS,
  RESULTS_PER_PAGE,
  TABLE_LABELS,
  TOOLBAR_LABELS,
} from '@constants/constants';
import EmailIcon from '@mui/icons-material/Email';
import { CSVLink } from 'react-csv';
import PrintIcon from '@mui/icons-material/Print';
import { ReactComponent as Share } from '@images/pageHeaderIcons/share.svg';
import ReactToPrint from 'react-to-print';
import RouteLayout from '@layout/routeLayout';
import DatePicker from '@component/datepicker';
import ButtonToggle from '@component/ToggleButton/ToggleButton';
import Wrapper from '@shared/wrapper/Wrapper';
import { NumberedPagination } from '@component/pagination/CustomPagination';
import { Link, useLocation, useParams } from 'react-router-dom';
import { CustomInput } from '@component/input';
import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import { useGet } from '@shared/api/useApi';
import { selectSchoolData } from '@shared/store/schoolSlice';
import { useSelector } from 'react-redux';
import { getNoOfPages } from '@utility/utility';
import Loader from '@shared/loader';
import toast from '@shared/toast';
import ActiveDaysUsage from '../BarChart/ActiveDaysUsage';
import ContentOpened from '../BarChart/ContentOpened';
import TotalTime from '../BarChart/TotalTime';

export default function Index() {
  const [csvData, setCsvData] = useState<[]>([]);
  const [view, setView] = React.useState('default');
  const [page, setPage] = useState(1);
  const [fromDate, setFromDate] = useState<any>();
  const [toDate, setToDate] = useState<any>();
  const printButton = () => <PrintIcon />;
  const [selectedclass, selectedClass] = useState('');
  const [selectedteacher, setselectedTeacher] = useState('');
  const [yaxis, setYaxis] = useState('option1');
  const [xaxis, setXaxis] = useState('grade');
  const [totalRecords, SetTotalRecords] = useState(0);
  const [tableData, SetTableData] = useState([]);
  const [ContentArr, setContentData] = useState([]);
  const [TimeArr, setTimeData] = useState([]);
  const [Graph1Arr, SetGraphArr] = useState([]);
  const { schoolData, branchData } = useSelector(selectSchoolData);
  const {
    ClassName,
    TeacherName,
    SchoolID,
    ClassID,
    StartDate,
    LastDate,
    schoolName,
  } = useParams();
  const componentRef = useRef(null);
  const location = useLocation();
  const rowsPerPage = 10;
  const [graph, setGraph] = useState('');
  const ReportURL = import.meta.env.VITE_APP_REPORTS_SERVICE_URL;
  const noOfpages = getNoOfPages(totalRecords, rowsPerPage);

  const {
    isRefetching: emailSendLoading,
    refetch: sendEmail,
    isLoading: emailLoad,
  } = useGet({
    baseURL: ReportURL,
    url: `reports-service/usage-report/student-detail/send-email/?school_id=${schoolData?.id || branchData?.school_data?.id}`,
    onSuccess: () => {
      toast('success', 'Email sent successfully');
    },
    retry: false,
    onError: ({ response }: any) => {
      toast('error', response?.data?.message || 'Unable to send email');
    },
    enabled: false,
  }) as any;

  const csvSubHeaders = [
    TABLE_LABELS?.SR_NO,
    TABLE_LABELS?.STUDENT_FNAME,
    TABLE_LABELS?.STUDENT_LNAME,
    TABLE_LABELS?.COURSES,
    TABLE_LABELS?.ACTIVE_DAYS,
    TABLE_LABELS?.CONTENT_OPENED,
    TABLE_LABELS?.CONTENT_COMPLETED,
    TABLE_LABELS?.TOTAL_TIME_STUDENTS,
  ];

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
    // {
    //   title: 'Export',
    //   icon: (
    //     <CSVLink
    //       filename="Report Student Detail.csv"
    //       data={csvData}
    //       headers={csvSubHeaders}
    //       enclosingCharacter=""
    //     >
    //       <Share />
    //     </CSVLink>
    //   ),
    // },
  ];

  const handelSendEmail = () => {
    sendEmail();
  };
  const handleToolbarAction = async (title: string) => {
    if (title === TOOLBAR_LABELS.EMAIL) {
      handelSendEmail();
    }
  };
  const TableColumns: any = [
    {
      label: TABLE_LABELS?.SR_NO,
      mapper: 'SR_NO',
      align: 'center',
    },
    {
      label: TABLE_LABELS?.STUDENT_FNAME,
      mapper: 'FirstName',
      bodyAlign: 'center',
    },
    {
      label: TABLE_LABELS?.STUDENT_LNAME,
      mapper: 'LastName',
      bodyAlign: 'center',
    },
    {
      label: TABLE_LABELS?.COURSES,
      mapper: 'Program',
      bodyAlign: 'center',
    },
    {
      label: TABLE_LABELS?.ACTIVE_DAYS,
      bodyAlign: 'center',
      mapper: 'ActiveDays',
    },
    {
      label: TABLE_LABELS?.CONTENT_OPENED,
      bodyAlign: 'center',
      mapper: 'ContentOpened',
    },
    {
      label: TABLE_LABELS?.CONTENT_COMPLETED,
      bodyAlign: 'center',
      mapper: 'ContentCompleted',
    },
    {
      label: TABLE_LABELS?.TOTAL_TIME_STUDENTS,
      bodyAlign: 'center',
      mapper: 'TotalTime',
    },
  ];

  const { isLoading, refetch: StudentDetail } = useGet({
    baseURL: ReportURL,
    url: `reports-service/usage-report/student-detail/?school_id=${schoolData?.id || branchData?.school_data?.id}${graph ? `&is_graph=${graph}` : ''}${TeacherName ? `&teacher_name=${TeacherName}` : ''}${ClassID ? `&class_id=${ClassID}` : ''}`,
    onSuccess: (res: any) => {
      const StdData = res?.data?.response;
      const TableData = StdData?.data;
      const Graph1 = StdData?.active_day_per_program;
      const Graph2 = StdData?.content_open_vs_completed_graph;
      const Graph3 = StdData?.student_vs_total_time;
      SetTotalRecords(StdData?.total_records);
      if (TableData) {
        const body: any = [];
        const csvbody: any = [];
        TableData?.map((i: any) => {
          body.push({
            SR_NO: i?.series_no,
            FirstName: i?.first_name,
            LastName: i?.last_name,
            Program: i?.program,
            ActiveDays: i?.active_days,
            ContentOpened: i?.content_opened,
            ContentCompleted: i?.content_completed,
            TotalTime: i?.total_time,
          });
          csvbody.push([
            i?.series_no,
            i?.first_name,
            i?.last_name,
            i?.program,
            i?.active_days,
            i?.content_opened,
            i?.content_completed,
            i?.total_time,
          ]);
          return true;
        });
        SetTableData(body);
        setCsvData(csvbody);
      }
      if (Graph1) {
        const body: any = [];
        // eslint-disable-next-line array-callback-return
        Graph1?.map((i: any) => {
          const convertedArray = [
            i?.programs?.reduce(
              (acc: any, curr: any) => ({
                ...acc,
                [curr?.program_name]: curr?.active_days,
              }),
              {}
            ),
          ];

          body.push({
            name: i?.first_name,
            Program: convertedArray,
          });
        });
        SetGraphArr(body);
      }
      if (Graph2) {
        const body: any = [];
        Graph2?.map((i: any) => {
          body.push({
            Completed: i?.no_of_content_completed,
            Opened: i?.content_opened,
            name: i?.student_name,
          });
          return true;
        });
        setContentData(body);
      }
      if (Graph3) {
        const body: any = [];
        Graph3?.map((i: any) => {
          const total_time_sum = i?.total_time_sum;
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
          body.push({
            time: totalDays,
            name: i?.first_name,
          });
          return true;
        });
        setTimeData(body);
      }
    },
  });

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
  useEffect(() => {
    if (view === 'secondary') {
      setGraph('1');
    } else {
      setGraph('');
    }
    StudentDetail();
  }, [view]);
  return (
    <RouteLayout
      state={location?.state}
      path={`/${schoolName}/reports/usage-for-teacher`}
    >
      <HeaderMenus
        title="Report - Usage Report"
        menuArray={
          view === 'default' ? ADMIN_TOOLBAR_MENU : ADMIN_TOOLBAR_MENU_GRAPH
        }
        handleToolbarAction={handleToolbarAction}
      />
      <div className="flex gap-2 mt-7 lg:items-end items-center lg:flex-row flex-col ">
        <>
          <div className="flex md:justify-start justify-center gap-2 lg:grow grow-0 items-end">
            <div className="w-max">
              <CustomInput
                name="Teacher Name"
                label="Teacher Name"
                size="small"
                value={TeacherName}
                disabled={true}
              />
            </div>
            <div className="w-max">
              <CustomInput
                name="class"
                label="Class"
                size="small"
                value={ClassName}
                disabled={true}
              />
            </div>
            {view && view === 'secondary' && (
              <>
                <div className="w-[150px]">
                  <DatePicker
                    value={StartDate}
                    label="From"
                    handlePickerChange={(date: string) => setFromDate(date)}
                    // sxType={1}
                    defaultStyle={true}
                    disablePast={false}
                    disabled={true}
                    disableFuture={toDate}
                  />
                </div>
                <div className="w-[150px]">
                  <DatePicker
                    value={LastDate}
                    label="To"
                    handlePickerChange={(date: string) => setToDate(date)}
                    // sxType={1}
                    defaultStyle={true}
                    disablePast={false}
                    disabled={true}
                    disableFuture={toDate}
                  />
                </div>
              </>
            )}
          </div>
        </>
        <div>
          <ButtonToggle view={view} setView={setView} />
        </div>
      </div>
      {/* Table Section */}
      {view && view === 'default' ? (
        <div className="wrapperBorder mt-3" ref={componentRef}>
          <Wrapper>
            <AdvanceTable
              isLoading={isLoading}
              tableData={tableData || []}
              headerRows={TableColumns}
              currentPage={page}
              totalPages={noOfpages}
              rowsPerPage={RESULTS_PER_PAGE?.[0]}
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
                  <p className="font-semibold text-xl">
                    {GRAPH_LABELS.ACTIVE_DAYS}
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <ActiveDaysUsage data={Graph1Arr || []} title="students" />
                </div>
              </div>
              <div className="p-4 bg-white border border-accent rounded-md">
                <p className="font-semibold text-xl">
                  {GRAPH_LABELS.CONTENT_OPENED_COMPLETED}
                </p>
                <div className="overflow-x-auto">
                  <ContentOpened data={ContentArr} title="students" />
                </div>
              </div>
              <div className="p-4 bg-white border border-accent rounded-md">
                <p className="font-semibold text-xl">
                  {GRAPH_LABELS.TOTAL_TIME}
                </p>
                <div className="overflow-x-auto">
                  <TotalTime data={TimeArr} title="students" />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </RouteLayout>
  );
}
