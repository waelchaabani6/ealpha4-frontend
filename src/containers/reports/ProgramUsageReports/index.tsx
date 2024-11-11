/* eslint-disable linebreak-style */
/* eslint-disable react/jsx-curly-newline */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable operator-linebreak */
/* eslint-disable comma-dangle */
/* eslint-disable jsx-a11y/control-has-associated-label */
import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import ButtonToggle from '@component/ToggleButton/ToggleButton';
import DatePicker from '@component/datepicker';
import Dropdown from '@component/dropdown/Dropdown';
import { CustomInput } from '@component/input';
import {
  TABLE_LABELS,
  RESULTS_PER_PAGE,
  TOOLBAR_LABELS,
  USER_TYPE,
} from '@constants/constants';
import { ReactComponent as Share } from '@images/pageHeaderIcons/share.svg';
import RouteLayout from '@layout/routeLayout';
import PrintIcon from '@mui/icons-material/Print';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import { useGet } from '@shared/api/useApi';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import { selectSchoolData } from '@shared/store/schoolSlice';
import toast from '@shared/toast';
import Wrapper from '@shared/wrapper/Wrapper';
import { getNoOfPages, sortData } from '@utility/utility';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import { selectUser } from '@shared/store/userSlice';
import { useSelector } from 'react-redux';
import { Link, useLocation, useParams } from 'react-router-dom';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import ReactToPrint from 'react-to-print';
// import ProgramUsageOverview from '../BarChart/ProgramUsageOverview';
import GraphView from './GraphView';

const ReportURL = import.meta.env.VITE_APP_REPORTS_SERVICE_URL;

const csvSubHeaders = [
  TABLE_LABELS?.SR_NO,
  TABLE_LABELS?.COURSES,
  TABLE_LABELS?.TOTAL_CLASS,
  TABLE_LABELS?.TOTAL_STUDENT,
  TABLE_LABELS?.TOTAL_TEACHER,
  TABLE_LABELS?.TOTAL_TIME_STUDENT,
  TABLE_LABELS?.AVG_TIME_STUDENT,
  TABLE_LABELS?.TOTAL_TIME_TEACHER,
  TABLE_LABELS?.AVG_TIME_TEACHER,
  TABLE_LABELS?.TOTAL_TIME_TEACH_STD,
];

const TableColumns: any = [
  {
    label: TABLE_LABELS?.SR_NO,
    mapper: 'SR_NO',
    align: 'center',
  },
  {
    label: TABLE_LABELS?.COURSES,
    mapper: 'Program',
    align: 'center',
  },
  // {
  //   label: TABLE_LABELS?.NO_OF_SCHOOL,
  //   mapper: 'NoOfSchool',
  //   align: 'center'
  // },
  {
    label: TABLE_LABELS?.TOTAL_CLASS,
    mapper: 'Class',
    align: 'center',
  },
  {
    label: TABLE_LABELS?.TOTAL_STUDENT,
    align: 'center',
    mapper: 'TotalStudent',
  },
  {
    label: TABLE_LABELS?.TOTAL_TEACHER,
    align: 'center',
    mapper: 'TotalTeacher',
  },
  {
    label: TABLE_LABELS?.TOTAL_TIME_STUDENT,
    align: 'center',
    mapper: 'TotalTimeStudent',
  },
  {
    label: TABLE_LABELS?.AVG_TIME_STUDENT,
    mapper: 'AvgTimeStudent',
    align: 'center',
  },
  {
    label: TABLE_LABELS?.TOTAL_TIME_TEACHER,
    mapper: 'TotalTimeTeacher',
    align: 'center',
  },
  {
    label: TABLE_LABELS?.AVG_TIME_TEACHER,
    mapper: 'AvgTimeTeacher',
    align: 'center',
  },
  {
    label: TABLE_LABELS?.TOTAL_TIME_TEACH_STD,
    mapper: 'TotalTimeTeacherStd',
    align: 'center',
  },
];

const DialogTableColumns = [
  {
    label: TABLE_LABELS?.SR_NO,
    mapper: 'id',
  },
  {
    label: 'Name',
    mapper: 'name',
  },
];

export default function Index() {
  const location = useLocation();
  const printButton = () => <PrintIcon />;
  const userData = useSelector((state: any) => state?.user);

  const { schoolData, branchData } = useSelector(selectSchoolData);
  const schoolNameInURL = decodeURIComponent(location.pathname.split('/')[1]);
  const link = `/${schoolNameInURL}/reports/program-usage-detail`;
  const componentRef = useRef(null);
  const [rowsPerPage, setRowsPerPage] = useState<any>(RESULTS_PER_PAGE?.[0]);
  const USER_ROLE = userData?.role?.name;

  const [csvData, setCsvData] = useState<[]>([]);
  const [view, setView] = React.useState('default');
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [fromDate, setFromDate] = useState<any>('');
  const [toDate, setToDate] = useState<any>('');
  const [xaxis, setXaxis] = useState('class');
  const [selectedBranch, setselectedBranch] = useState('');
  const [BranchArray, setBranchArray] = useState<any>([]);
  const [temp, setTemp] = useState(false);
  const [tableData, setTableData] = useState<any>([]);
  const [barData, setBarData] = useState<(string | number)[]>([]);
  const [graph, setGraph] = useState('');
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [popupData, setpopupData] = useState<any>({});
  const [popupTitle, setPopupTitle] = useState('');

  const { schoolId } = useSelector(selectUser);
  const { schoolName } = useParams();

  const SCHOOL_ID = schoolData?.id || branchData?.school_data?.id || '';
  const BRANCH_ID = branchData?.school_data?.id || '';

  const noOfpages = getNoOfPages(totalRecords, rowsPerPage);

  const {
    isRefetching: emailSendLoading,
    refetch: sendEmail,
    isLoading: emailLoad,
  } = useGet({
    baseURL: ReportURL,
    url: `reports-service/program_usage-report/send-email/?school_id=${SCHOOL_ID}`,
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
    // {
    //   title: TOOLBAR_LABELS.EMAIL,
    //   icon: (emailSendLoading || emailLoad) ? <Loader size={20} /> : <EmailIcon />
    // },
    {
      title: 'Export',
      icon: (
        <CSVLink
          filename="Report Program Usage.csv"
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

  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };

  const branchid =
    selectedBranch !== 'All'
      ? BranchArray?.find((i: any) => i?.label === selectedBranch)?.id ||
        BRANCH_ID ||
        ''
      : '';
  const { isFetching: reportLoading, refetch: FetchProgramUsage } = useGet({
    baseURL: ReportURL,
    url: `reports-service/program_usage_report/?school_id=${SCHOOL_ID}${fromDate ? `&from_date=${moment(fromDate).format('YYYY-MM-DD')}` : ''}${toDate ? `&to_date=${moment(toDate).format('YYYY-MM-DD')}` : ''}&page=${page}&page_size=${rowsPerPage}${graph ? `&is_graph=${graph}` : ''}${branchid ? `&branch_id=${branchid}` : ''}`,
    onSuccess: (res: any) => {
      const ProgramData = res?.data?.response;
      const tableArray = ProgramData?.data;

      const BarData = temp ? ProgramData?.class : ProgramData?.teacher;
      if (tableArray) {
        const body: any = [];
        const csvbody: any = [];

        tableArray?.map((i: any, index: any) => {
          const rowLink = `${link}/${i.start_date}/${i.end_date}/${i.program_id}/${i.program}`;

          body.push({
            SR_NO: i.series_no,
            Program: (
              <Link state={{ page }} to={rowLink}>
                <span className="text-accent underline cursor-pointer text-xs font-medium">
                  {i.program}
                </span>
              </Link>
            ),
            Class: (
              <Link
                state={{ page }}
                to={`/${schoolName}/dashboard/${schoolId}/manage-classes`}
              >
                <span className="text-accent underline cursor-pointer text-xs font-medium">
                  {i.total_classes}
                </span>
              </Link>
            ),
            TotalStudent: (
              <span
                role="presentation"
                className="text-accent underline cursor-pointer text-xs font-medium"
                onClick={() => {
                  setPopupTitle('Students List');
                  handleDataPopup(i.students);
                }}
              >
                {i.total_students}
              </span>
            ),
            TotalTeacher: (
              <span
                role="presentation"
                className="text-accent underline cursor-pointer text-xs font-medium"
                onClick={() => {
                  setPopupTitle('Teachers List');
                  handleDataPopup(i.teachers);
                }}
              >
                {i.total_teachers}
              </span>
            ),
            TotalTimeStudent: i.total_time_students,
            AvgTimeStudent: i.average_time_students,
            TotalTimeTeacher: i.total_time_teacher,
            AvgTimeTeacher: i.average_time_teachers,
            TotalTimeTeacherStd: i.total_time_teachers_and_students,
            ProgramId: i.program_id,
            FromDate: i.start_date,
            ToDate: i.end_date,
          });
          csvbody.push([
            i.series_no,
            i.program,
            i.total_classes,
            i.total_students,
            i.total_teachers,
            i.total_time_students,
            i.average_time_students,
            i.total_time_teacher,
            i.average_time_teachers,
            i.total_time_teachers_and_students,
          ]);
          return true;
        });
        setTableData(body);
        setCsvData(csvbody);
        setTotalRecords(ProgramData?.total_records);
      }
      if (BarData) {
        const body: any = [];
        // eslint-disable-next-line array-callback-return
        BarData?.map((ele: any, index: any) => {
          const total_time_student = ele?.total_time_students;
          const time_teachers = ele?.total_time_teachers;
          const teacherstudent = ele?.total_time_teachers_and_students;

          const [hours1, minutes1, seconds1] = total_time_student
            .split(':')
            .map(Number);
          const [hours2, minutes2, seconds2] = time_teachers
            .split(':')
            .map(Number);
          const [hours3, minutes3, seconds3] = teacherstudent
            .split(':')
            .map(Number);

          const totalSeconds1 = hours1 * 3600 + minutes1 * 60 + seconds1;
          const totalSeconds2 = hours2 * 3600 + minutes2 * 60 + seconds2;
          const totalSeconds3 = hours3 * 3600 + minutes3 * 60 + seconds3;
          let totalDays1: any;
          let totalDay2: any;
          let totalDays3: any;
          if (totalSeconds1 >= 1 || totalSeconds2 >= 1 || totalSeconds3 >= 1) {
            totalDays1 = Math.ceil(totalSeconds1 / (24 * 3600));
            totalDay2 = Math.ceil(totalSeconds2 / (24 * 3600));
            totalDays3 = Math.ceil(totalSeconds3 / (24 * 3600));
          } else {
            totalDays1 = 0;
            totalDay2 = 0;
            totalDays3 = 0;
          }

          body.push({
            ...ele,
            total_time_students: totalDays1,
            total_time_teachers: totalDay2,
            total_time_teachers_and_students: totalDays3,
          });
        });
        setBarData(body);
      }
    },
    onError: ({ response }: any) => {},
    enabled: false,
  });

  const handelSendEmail = () => {
    sendEmail();
  };

  const reset = () => {
    setFromDate('');
    setToDate('');
    // setselectedBranch('');
  };

  const { isLoading: schoolLoading, refetch: fetchBranches } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-branches/?limit=100&school_id=${SCHOOL_ID}`,
    // cacheTime: 2000,
    onSuccess: (resp: any) => {
      const accData = resp?.data?.response;
      const respData = accData?.results;
      const branchArray: never[] = respData.map((i: any) => ({
        label: i?.name,
        value: i?.name,
        id: i?.id,
      }));
      branchArray?.sort(sortData);
      setBranchArray(branchArray);
    },
    enabled: false,
  });

  useEffect(() => {
    if (SCHOOL_ID || BRANCH_ID) {
      FetchProgramUsage();
    }
  }, [
    selectedBranch,
    schoolData,
    branchData,
    fromDate,
    toDate,
    graph,
    page,
    rowsPerPage,
    temp,
  ]);

  useEffect(() => {
    if (view === 'secondary') {
      setGraph('yes');
    } else {
      setGraph('');
    }
    if (xaxis === 'class') {
      setTemp(true);
    }
    if (xaxis === 'teacher') {
      setTemp(false);
    }
    reset();
  }, [view, xaxis]);

  useEffect(() => {
    if (SCHOOL_ID) {
      fetchBranches();
    }
  }, [schoolData, branchData]);

  useEffect(() => {
    if (location?.state?.page) {
      setPage(location?.state?.page);
    }
  }, []);

  const handlePerPage = (e: any) => {
    setPage(page);
    setRowsPerPage(e);
  };

  const handleDataPopup = (data: any) => {
    setDialogOpen(true);
    setpopupData(data);
  };

  const handleDialog = () => {
    setDialogOpen(false);
  };

  return (
    <RouteLayout navBack={true}>
      <HeaderMenus
        title={`Report - Course Usage ${view !== 'default' ? '- Overview' : ''} `}
        menuArray={ADMIN_TOOLBAR_MENU}
        handleToolbarAction={handleToolbarAction}
      />
      <div className="flex gap-2 mt-7 lg:items-end items-center lg:flex-row flex-col ">
        <>
          <div className="flex md:justify-start justify-center gap-2 lg:grow grow-0 items-end">
            {userData && USER_ROLE === USER_TYPE.SCHOOL_ADMIN && (
              <Dropdown
                displayEmpty={false}
                title="Select Branch"
                value={selectedBranch || 'All'}
                dataArray={[{ label: 'All', value: 'All' }, ...BranchArray]}
                onChangeHandler={(val) => {
                  setselectedBranch(val);
                }}
                sxClass={{ width: '206px', marginRight: '10px' }}
              />
            )}
            <div>
              <Dropdown
                title="Result Of Pages"
                value={rowsPerPage}
                dataArray={RESULTS_PER_PAGE}
                onChangeHandler={handlePerPage}
                sxClass={{ width: '206px', marginRight: '10px' }}
              />
            </div>
            {userData && USER_ROLE === USER_TYPE.BRANCH_ADMIN && (
              <div className="w-max">
                <CustomInput
                  name="Branch Name"
                  label="Branch Name"
                  size="small"
                  value={branchData?.name || ''}
                  disabled={true}
                />
              </div>
            )}
            <div className="w-max">
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
            <div className="w-max">
              <DatePicker
                value={toDate}
                label="To"
                handlePickerChange={(date: string) => setToDate(date)}
                sxType={1}
                defaultStyle={true}
                disablePast={false}
                disableOld={fromDate}
              />
            </div>
            {(toDate || fromDate) && (
              <div className="relative top-[-5px]">
                <span
                  tabIndex={0}
                  title="Clear dates"
                  onClick={() => reset()}
                  role="button"
                >
                  <RestartAltIcon />
                </span>
              </div>
            )}
          </div>
        </>
        <div>
          <ButtonToggle view={view} setView={setView} />
        </div>
      </div>

      {/* Table Section */}
      {view === 'default' ? (
        <div className="wrapperBorder mt-3" ref={componentRef}>
          <Wrapper>
            <AdvanceTable
              tableData={tableData}
              headerRows={TableColumns}
              totalPages={noOfpages}
              paginateHandler={handlePagination}
              currentPage={page}
              rowsPerPage={rowsPerPage}
              isLoading={reportLoading}
            />
          </Wrapper>
        </div>
      ) : (
        <GraphView
          componentRef={componentRef}
          barData={barData}
          setXaxis={setXaxis}
          xaxis={xaxis}
        />
      )}

      <CustomizedDialogs
        maxwidth="sm"
        open={dialogOpen}
        setOpen={() => {
          handleDialog();
        }}
        title={popupTitle}
      >
        <Wrapper>
          <AdvanceTable tableData={popupData} headerRows={DialogTableColumns} />
        </Wrapper>
      </CustomizedDialogs>
    </RouteLayout>
  );
}
