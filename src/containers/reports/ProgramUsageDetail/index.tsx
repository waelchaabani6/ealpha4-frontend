/* eslint-disable linebreak-style */
/* eslint-disable indent */
/* eslint-disable comma-dangle */
import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import ButtonToggle from '@component/ToggleButton/ToggleButton';
import DatePicker from '@component/datepicker';
import Dropdown from '@component/dropdown/Dropdown';
import { CustomInput } from '@component/input';
import {
  GRAPH_LABELS,
  TABLE_LABELS,
  TOOLBAR_LABELS,
} from '@constants/constants';
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
import { Link, useLocation, useParams } from 'react-router-dom';
import ReactToPrint from 'react-to-print';
import { CSVLink } from 'react-csv';
import { ReactComponent as Share } from '@images/pageHeaderIcons/share.svg';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import PageTitle from '@shared/pageTitle';
import DetailGraphView from './DetailGraphView';

const TableColumns: any = [
  {
    label: TABLE_LABELS?.SR_NO,
    align: 'center',
  },
  {
    label: TABLE_LABELS?.CLASS,
    mapper: 'class_name',
    align: 'center',
  },
  {
    label: TABLE_LABELS?.TEACHER,
    mapper: 'teacher',
    align: 'center',
  },
  {
    label: TABLE_LABELS?.NO_OF_STUDENT,
    mapper: 'total_students',
    align: 'center',
  },
  {
    label: TABLE_LABELS?.NO_OF_ACTIVE_STD,
    mapper: 'number_of_active_students',
    align: 'center',
  },
  {
    label: TABLE_LABELS?.NO_OF_NONACTIVE_STD,
    mapper: 'number_of_non_active_students',
    align: 'center',
  },
  {
    label: TABLE_LABELS?.NO_OF_ASSIGNMENT,
    align: 'center',
    mapper: 'total_assignment',
  },
  {
    label: TABLE_LABELS?.NO_OF_ASSESSMENT,
    align: 'center',
    mapper: 'total_assessments',
  },
];

const csvSubHeaders = [
  TABLE_LABELS?.CLASS_NAME,
  TABLE_LABELS?.TEACHER,
  TABLE_LABELS?.COURSES,
  TABLE_LABELS?.ASSIGNMET_NAME,
  TABLE_LABELS?.START_DATE,
  TABLE_LABELS?.END_DATE,
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

const ReportURL = import.meta.env.VITE_APP_REPORTS_SERVICE_URL;

export default function Index() {
  const location = useLocation();
  const componentRef = useRef(null);
  const { FromDate, ToDate, ProgramID, ProgramName, schoolName } = useParams();
  const { schoolData, branchData } = useSelector(selectSchoolData);
  // const userData = useSelector((state: any) => state?.user);

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
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [popupTitle, setPopupTitle] = useState('');
  // const [popupData, setpopupData] = useState<any>({});
  const [popupData, setpopupData] = useState<any>({
    inactive_students: [],
    active_students: [],
  });

  const {
    isRefetching: emailSendLoading,
    refetch: sendEmail,
    isLoading: emailLoad,
  } = useGet({
    baseURL: ReportURL,
    url: `reports-service/program_usage-report/send-email/?school_id=${SCHOOL_ID}${selectedprogram ? `&selected_program=${selectedprogram}` : ''}`,
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
          filename="Course Usage-Details.csv"
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
    //       filename="Program Usage-Details.csv"
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

  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };

  const { isFetching: reportdetailLoading, refetch: ProgramDetails } = useGet({
    baseURL: ReportURL,
    url: `reports-service/program_usage_details_report/?school_id=${SCHOOL_ID}${selectedprogram ? `&selected_program=${selectedprogram}` : ''}&is_graph=${graph}&page=${page}&page_size=${rowsPerPage}`,
    onSuccess: (res: any) => {
      const ProgramData = res?.data?.response;
      const body: any = [];
      if (graph !== 'yes') {
        ProgramData?.data.map((i: any) => {
          body.push({
            ...i,
            number_of_active_students: (
              <span
                role="presentation"
                className="text-accent underline cursor-pointer text-xs font-medium"
                onClick={() => {
                  setPopupTitle('Students List');
                  setDialogOpen(true);
                  setpopupData((prev) => ({
                    ...prev,
                    active_students: i.active_students,
                    inactive_students: [],
                  }));
                }}
              >
                {i.number_of_active_students}
              </span>
            ),
            total_students: (
              <span
                role="presentation"
                className="text-accent underline cursor-pointer text-xs font-medium"
                onClick={() => {
                  setPopupTitle('Students List');
                  setDialogOpen(true);
                  setpopupData((prev) => ({
                    ...prev,
                    active_students: i.active_students,
                    inactive_students: i.inactive_students,
                  }));
                }}
              >
                {i.total_students}
              </span>
            ),
            number_of_non_active_students: (
              <span
                role="presentation"
                className="text-accent underline cursor-pointer text-xs font-medium"
                onClick={() => {
                  setPopupTitle('Students List');
                  setDialogOpen(true);
                  setpopupData((prev) => ({
                    ...prev,
                    active_students: [],
                    inactive_students: i.inactive_students,
                  }));
                }}
              >
                {i.number_of_non_active_students}
              </span>
            ),
            total_assessments: (
              <Link state={{ page }} to={`/${schoolName}/assessments`}>
                <span className="text-accent underline cursor-pointer text-xs font-medium">
                  {i.total_assessments}
                </span>
              </Link>
            ),
            total_assignment: (
              <Link state={{ page }} to={`/${schoolName}/assignment`}>
                <span className="text-accent underline cursor-pointer text-xs font-medium">
                  {i.total_assignment}
                </span>
              </Link>
            ),
          });
          return body;
        });

        setTableData(body);
        // setTableData(ProgramData?.data);

        setCsvData([]);
      } else {
        // Total Students
        const tempStudent = (ProgramData?.total_vs_active_students || []).map(
          (i: any) => ({
            name: i?.name,
            count1: Number(i?.total_students) - Number(i?.active_students),
            count2: Number(i?.active_students),
          })
        );

        setTotalStudent(tempStudent);

        // Total Assignment
        const tempAssignment = (ProgramData?.total_assignments || []).map(
          (i: any) => ({
            name: i?.name,
            count1: Number(i?.total_assignment),
          })
        );
        settotalAssignments(tempAssignment);

        // Total Assessment
        const tempAssessment = (ProgramData?.total_assessments || []).map(
          (i: any) => ({
            name: i?.name,
            count1: Number(i?.total_assessments),
          })
        );
        settotalAssessments(tempAssessment);
      }
      setTotalRecords(ProgramData?.total_records);
    },
    onError: () => {},
    enabled: false,
  });

  const {
    isRefetching: programRefetching,
    isLoading: loadProgram,
    data,
  } = useGet({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/content/?ordering=-created_at&limit=1000&selection=Course`,
    enabled: true,
  });

  const programs = (data?.data?.response?.results || [])?.map((item: any) => ({
    label: item?.content,
    value: item?.id,
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

  const handleDialog = () => {
    setDialogOpen(false);
  };
  return (
    <RouteLayout
      state={location?.state ? { page: location?.state?.page } : {}}
      path={`/${schoolName}/reports/program-usage-reports`}
    >
      <HeaderMenus
        title={`Report - Course Usage - ${view !== 'default' ? 'Graph View' : 'Detailed View'} `}
        menuArray={
          view === 'default' ? ADMIN_TOOLBAR_MENU : ADMIN_TOOLBAR_MENU_GRAPH
        }
        handleToolbarAction={handleToolbarAction}
      />
      <div className="flex gap-2 mt-7 lg:items-end items-center lg:flex-row flex-col ">
        <div className="flex md:justify-start justify-center gap-2 lg:grow grow-0 items-end">
          {view === 'default' ? (
            <div className="max-w-[200px]">
              <CustomInput
                name="Program"
                label="Course"
                size="small"
                value={ProgramName}
                disabled={true}
              />
            </div>
          ) : (
            <div>
              <p className="mb-4 text-sm">Course</p>
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
          )}
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
        <DetailGraphView
          totalAssessments={totalAssessments}
          totalAssignments={totalAssignments}
          totalStudent={totalStudent}
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
        {popupData?.active_students.length > 0 && (
          <>
            <PageTitle title="Active students" />
            <Wrapper>
              <AdvanceTable
                tableData={popupData?.active_students}
                headerRows={DialogTableColumns}
              />
            </Wrapper>
          </>
        )}

        {popupData?.inactive_students.length > 0 && (
          <>
            <PageTitle title="Inactive students" />
            <Wrapper>
              <AdvanceTable
                tableData={popupData?.inactive_students}
                headerRows={DialogTableColumns}
              />
            </Wrapper>
          </>
        )}
      </CustomizedDialogs>
    </RouteLayout>
  );
}
