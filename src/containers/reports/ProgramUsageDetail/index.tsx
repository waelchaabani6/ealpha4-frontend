import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import ButtonToggle from '@component/ToggleButton/ToggleButton';
import DatePicker from '@component/datepicker';
import Dropdown from '@component/dropdown/Dropdown';
import { CustomInput } from '@component/input';
import { GRAPH_LABELS, TABLE_LABELS, TOOLBAR_LABELS } from '@constants/constants';
import RouteLayout from '@layout/routeLayout';
import EmailIcon from '@mui/icons-material/Email';
import PrintIcon from '@mui/icons-material/Print';
import { useGet } from '@shared/api/useApi';
import Loader from '@shared/loader';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import { selectSchoolData } from '@shared/store/schoolSlice';
import toast from '@shared/toast';
import Wrapper from '@shared/wrapper/Wrapper';
import { getNoOfPages } from '@utility/utility';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';
import ReactToPrint from 'react-to-print';
import { CSVLink } from 'react-csv';
import { ReactComponent as Share } from '@images/pageHeaderIcons/share.svg';
import TotalAssessment from '../BarChart/TotalAssessment';
import TotalAssignment from '../BarChart/TotalAssignment';
import TotalStudentGraph from '../BarChart/TotalStudentGraph';

export default function Index() {
  const location = useLocation();
  const componentRef = useRef(null);
  const { FromDate, ToDate, ProgramID, ProgramName, schoolName } = useParams();
  const { schoolData, branchData } = useSelector(selectSchoolData);
  const userData = useSelector((state: any) => state?.user);
  const USER_ROLE = userData?.role?.name;

  const rowsPerPage = 10;
  const printButton = () => <PrintIcon />;

  const [csvData, setCsvData] = useState<[]>([]);
  const [selectedprogram, setselectedProgram] = useState(ProgramID || '');
  const [view, setView] = React.useState('default');
  const [page, setPage] = useState(1);
  const [fromDate, setFromDate] = useState<any>('');
  const [toDate, setToDate] = useState<any>('');
  const [tableData, setTableData] = useState<any>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [graph, setGraph] = useState('');
  const [totalStudent, setTotalStudent] = useState<any>([]);
  const [totalAssignments, settotalAssignments] = useState<any>([]);
  const [totalAssessments, settotalAssessments] = useState<any>([]);
  const SCHOOL_ID = schoolData?.id || branchData?.school_data?.id || '';
  const BRANCH_ID = branchData?.school_data?.id || '';
  const noOfpages = getNoOfPages(totalRecords, rowsPerPage);
  // const schoolNameInURL = decodeURIComponent(location.pathname.split('/')[1]);
  const ReportURL = import.meta.env.VITE_APP_REPORTS_SERVICE_URL;

  const csvSubHeaders = [
    TABLE_LABELS?.CLASS_NAME,
    TABLE_LABELS?.TEACHER,
    TABLE_LABELS?.PROGRAM,
    TABLE_LABELS?.ASSIGNMET_NAME,
    TABLE_LABELS?.START_DATE,
    TABLE_LABELS?.END_DATE
  ];
  const { isRefetching: emailSendLoading, refetch: sendEmail, isLoading: emailLoad } = useGet({
    baseURL: ReportURL,
    url: `reports-service/program_usage-report/send-email/?school_id=${SCHOOL_ID}${selectedprogram ? `&selected_program=${selectedprogram}` : ''}`,
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
      title: TOOLBAR_LABELS.EMAIL,
      icon: (emailSendLoading || emailLoad) ? <Loader size={20} /> : <EmailIcon />
    },
    {
      title: 'Export',
      icon: (
        <CSVLink
          filename="Program Usage-Details.csv"
          data={csvData}
          headers={csvSubHeaders}
          enclosingCharacter=""
        >
          <Share />
        </CSVLink>
      )
    },
    {
      title: 'Print',
      icon: (
        <ReactToPrint
          trigger={printButton}
          content={() => componentRef.current}
        />
      )
    }
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
      align: 'center'
    },
    {
      label: TABLE_LABELS?.CLASS,
      mapper: 'class_name',
      align: 'center'

    },
    {
      label: TABLE_LABELS?.TEACHER,
      mapper: 'teacher',
      align: 'center'

    },
    {
      label: TABLE_LABELS?.NO_OF_STUDENT,
      mapper: 'total_students',
      align: 'center'

    },
    {
      label: TABLE_LABELS?.NO_OF_ACTIVE_STD,
      mapper: 'number_of_active_students',
      align: 'center'

    },
    {
      label: TABLE_LABELS?.NO_OF_NONACTIVE_STD,
      mapper: 'number_of_non_active_students',
      align: 'center'

    },
    {
      label: TABLE_LABELS?.NO_OF_ASSIGNMENT,
      align: 'center',
      mapper: 'total_assignment'
    },
    {
      label: TABLE_LABELS?.NO_OF_ASSESSMENT,
      align: 'center',
      mapper: 'total_assessments'
    }
  ];

  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };
  const { isFetching: reportdetailLoading, refetch: ProgramDetails } = useGet({
    baseURL: ReportURL,
    url: `reports-service/program_usage_details_report/?school_id=${SCHOOL_ID}${selectedprogram ? `&selected_program=${selectedprogram}` : ''}&is_graph=${graph}`,
    onSuccess: (res: any) => {
      const ProgramData = res?.data?.response;
      if (graph !== 'yes') {
        setTableData(ProgramData?.data);
        setCsvData([]);
      } else {
        // Total Students
        const tempStudent = (ProgramData?.total_vs_active_students || []).map((i: any) => ({
          name: i?.name,
          count1: Number(i?.total_students) - Number(i?.active_students),
          count2: Number(i?.active_students)
        }));
        setTotalStudent(tempStudent);

        // Total Assignment
        const tempAssignment = (ProgramData?.total_assignments || []).map((i: any) => ({
          name: i?.name,
          count1: Number(i?.total_assignment)
        }));
        settotalAssignments(tempAssignment);

        // Total Assessment
        const tempAssessment = (ProgramData?.total_assessments || []).map((i: any) => ({
          name: i?.name,
          count1: Number(i?.total_assessments)
        }));
        settotalAssessments(tempAssessment);
      }
      setTotalRecords(ProgramData?.total_records);
    },
    onError: ({ response }: any) => {
    },
    enabled: false
  });

  const { isRefetching: programRefetching, isLoading: loadProgram, data } = useGet({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/content/?ordering=-created_at&limit=1000&selection=Course`,
    enabled: true
  });
  const programs = (data?.data?.response?.results || [])?.map((item: any) => ({
    label: item?.content,
    value: item?.id
  }));

  useEffect(() => {
    if (SCHOOL_ID) {
      ProgramDetails();
    }
  }, [page, SCHOOL_ID, BRANCH_ID, graph, selectedprogram]);

  useEffect(() => {
    if (view === 'secondary') {
      setGraph('yes');
    } else {
      setGraph('');
      setselectedProgram(ProgramID || '');
    }
  }, [view]);

  return (
    <RouteLayout state={location?.state ? { page: location?.state?.page } : {}} path={`/${schoolName}/reports/program-usage-reports`}>
      <HeaderMenus
        title={`Report - Program Usage - ${view !== 'default' ? 'Graph View' : 'Detailed View'} `}
        menuArray={ADMIN_TOOLBAR_MENU}
        handleToolbarAction={handleToolbarAction}
      />
      <div className="flex gap-2 mt-7 lg:items-end items-center lg:flex-row flex-col ">
        <div className="flex md:justify-start justify-center gap-2 lg:grow grow-0 items-end">
          {
            view === 'default'
              ? (
                <div className="max-w-[200px]">
                  <CustomInput
                    name="Program"
                    label="Program"
                    size="small"
                    value={ProgramName}
                    disabled={true}
                  />
                </div>
              )
              : (
                <div>
                  <p className="mb-4 text-sm">Program</p>
                  <Dropdown
                    value={selectedprogram}
                    dataArray={programs}
                    onChangeHandler={(val) => {
                      setselectedProgram(val);
                    }}
                    sxClass={{ width: '206px', marginRight: '10px' }}
                    displayEmpty={true}
                    loading={loadProgram || programRefetching}
                  />
                </div>
              )
          }
          <div className="max-w-[200px]">
            <DatePicker
              value={FromDate}
              label="From"
              handlePickerChange={(date: string) => setFromDate(date)}
              defaultStyle={true}
              disablePast={false}
              disabled={true}
              disableFuture={toDate}
            />
          </div>
          <div className="max-w-[200px]">
            <DatePicker
              value={ToDate}
              label="To"
              handlePickerChange={(date: string) => setToDate(date)}
              disabled={true}
              defaultStyle={true}
              disablePast={false}
              disableOld={fromDate}
            />
          </div>
        </div>
        <ButtonToggle view={view} setView={setView} />
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
              isLoading={reportdetailLoading}
            />
          </Wrapper>
        </div>
      ) : (
        <>
          <div className="py-4 h-full grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white border border-accent rounded-md">
              <div className="flex flex-col items-center justify-center">
                <p className="font-semibold text-xl">
                  {GRAPH_LABELS.TOTAL_VS_ACTIVE}
                </p>
              </div>
              <div className="overflow-x-auto">

                <TotalStudentGraph data={totalStudent || []} />
              </div>
            </div>
            <div className="p-4 bg-white border border-accent rounded-md">
              <p className="font-semibold text-xl">
                {GRAPH_LABELS.TOTAL_ASSIGNMENT}
              </p>
              <div className="overflow-x-auto">

                <TotalAssignment data={totalAssignments || []} />
              </div>
            </div>
            <div className="p-4 bg-white border border-accent rounded-md">
              <p className="font-semibold text-xl">
                {GRAPH_LABELS.TOTAL_ASSESSMENT}
              </p>
              <div className="overflow-x-auto">

                <TotalAssessment data={totalAssessments || []} />
              </div>
            </div>
          </div>
        </>
      )}

    </RouteLayout>
  );
}
