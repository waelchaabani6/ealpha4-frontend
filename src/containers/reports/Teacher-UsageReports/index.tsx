/* eslint-disable linebreak-style */
/* eslint-disable no-confusing-arrow */
/* eslint-disable indent */
/* eslint-disable jsx-a11y/control-has-associated-label */
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import React, { useState, useRef, useEffect } from 'react';
import Dropdown from '@component/dropdown/Dropdown';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from '@mui/material';
import { useGet, usePost } from '@shared/api/useApi';
import toast from '@shared/toast';
import moment from 'moment';
import {
  GRAPH_LABELS,
  RESULTS_PER_PAGE,
  TABLE_LABELS,
  TOOLBAR_LABELS,
  USER_TYPE,
} from '@constants/constants';
import Loader from '@shared/loader';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
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
import { useSelector } from 'react-redux';
import { selectSchoolData } from '@shared/store/schoolSlice';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { selectUser } from '@shared/store/userSlice';
import { CustomInput } from '@component/input';
import { sortData } from '@utility/utility';
import TeacherUsageAllGraph from '../BarChart/TeacherUsageAllGraph';

export default function Index() {
  const { userId } = useSelector(selectUser);
  const { user } = useSelector((state: any) => state);
  const userData = useSelector((state: any) => state?.user);
  const USER_ROLE = userData?.role?.name;
  const { schoolData, branchData } = useSelector(selectSchoolData);
  const { SCHOOL_ADMIN, BRANCH_ADMIN, TEACHER } = USER_TYPE;
  const ALL = { label: 'All', value: 'Select' };
  const SCHOOL_ID = schoolData?.id || branchData?.school_data?.id || '';
  const BRANCH_ID = branchData?.school_data?.id || '';
  const [totalRecords, setTotalRecords] = useState(0);
  // const recordsPerPage = 10;
  const [rowsPerPage, setRowsPerPage] = useState<any>(RESULTS_PER_PAGE?.[0]);
  const noOfpages = Math.ceil(totalRecords / rowsPerPage);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [popupData, setpopupData] = useState<any>([]);
  const [csvData, setCsvData] = useState<[]>([]);
  const [graph, setGraph] = useState('');
  const [view, setView] = React.useState('default');
  const [page, setPage] = useState(1);
  const [fromDate, setFromDate] = useState<any>();
  const [toDate, setToDate] = useState<any>();
  const printButton = () => <PrintIcon />;
  const [selectedprogram, selectedProgram] = useState<any>(`Select`);
  const [classArray, setClassArray] = useState<any>([]);
  const [selectedClass, setSelectedClass] = useState<any>(`Select`);
  const [branchArray, setBranchArray] = useState<any>([]);
  const [selectedBranch, setselectedBranch] = useState(
    `${branchData?.name || 'Select'}`
  );
  const [selectedTeacher, setselectedTeacher] = useState('Select');
  const [tableData, setTableData] = useState<any>([]);
  const [assessmentGraphData, setAssessmentGraphData] = useState<any>([]);
  const [assignmentGraphData, setAssignmentGraphData] = useState<any>([]);
  const [timeOpendedGraphData, setTimeOpendedGraphData] = useState<any>([]);
  const ReportURL = import.meta.env.VITE_APP_REPORTS_SERVICE_URL;

  // email api
  const {
    isRefetching: emailSendLoading,
    refetch: sendEmail,
    isLoading: emailLoad,
  } = useGet({
    baseURL: ReportURL,
    url: `reports-service/teacher_usage_report/?school_id=${SCHOOL_ID}${selectedTeacher !== 'Select' ? `&teacher_id=${selectedTeacher}` : ''}${selectedClass !== 'Select' ? `&selected_class=${selectedClass}` : ''}${toDate ? `&from_date=${moment(fromDate).format('YYYY-MM-DD')}` : ''}${toDate ? `&to_date=${moment(toDate).format('YYYY-MM-DD')}` : ''}&is_email=true`,
    onSuccess: () => {
      toast('success', 'Email sent successfully');
    },
    enabled: false,
  }) as any;

  const handelSendEmail = () => {
    sendEmail();
  };

  const componentRef = useRef(null);

  const csvSubHeaders = [
    TABLE_LABELS?.SR_NO,
    TABLE_LABELS?.TEACHER,
    TABLE_LABELS?.TOTAL_CLASSVal,
    TABLE_LABELS?.TOTAL_LOGINS,
    TABLE_LABELS?.TIME_PER_LOGIN,
    TABLE_LABELS?.FIRST_LOGIN,
    TABLE_LABELS?.LAST_LOGIN,
    TABLE_LABELS?.NO_OF_TIME_OPENED,
    TABLE_LABELS?.DISTINCT_ASSIGNMENT,
    TABLE_LABELS?.DISTINCT_ASSESSMENT,
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
          filename="Usage Reports Teacher.csv"
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

  const TableColumns: any = [
    {
      label: TABLE_LABELS?.SR_NO,
      mapper: 'SR_NO',
      align: 'center',
    },
    {
      label: TABLE_LABELS?.TEACHER,
      mapper: 'teacher_name',
      bodyAlign: 'center',
    },
    {
      label: TABLE_LABELS?.TOTAL_CLASSVal,
      mapper: 'total_class',
      bodyAlign: 'center',
    },
    {
      label: TABLE_LABELS?.TOTAL_LOGINS,
      bodyAlign: 'center',
      mapper: 'total_logins',
    },
    {
      label: TABLE_LABELS?.TIME_PER_LOGIN,
      bodyAlign: 'center',
      mapper: 'avg_time_per_logins',
    },
    {
      label: TABLE_LABELS?.FIRST_LOGIN,
      bodyAlign: 'center',
      mapper: 'first_login',
    },
    {
      label: TABLE_LABELS?.LAST_LOGIN,
      bodyAlign: 'center',
      mapper: 'last_login',
    },
    {
      label: TABLE_LABELS?.NO_OF_TIME_OPENED,
      bodyAlign: 'center',
      mapper: 'no_of_time_opened',
    },
    {
      label: TABLE_LABELS?.DISTINCT_ASSIGNMENT,
      bodyAlign: 'center',
      mapper: 'distinct_assignment',
    },
    {
      label: TABLE_LABELS?.DISTINCT_ASSESSMENT,
      bodyAlign: 'center',
      mapper: 'distinct_assessment',
    },
  ];

  // Fetch Classes for School
  const { isLoading: loadClassesForSchool, refetch: ClassesForSchool } = useGet(
    {
      baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
      url: `schools-service/school-classes/?limit=1000&school_id=${SCHOOL_ID}${selectedBranch !== 'Select' ? `&branch_name=${selectedBranch}` : ''}`,
      onSuccess: (res: any) => {
        const resp = res?.data?.response?.results;
        const body: any = [];
        resp?.map((i: any) => {
          body.push({
            label: i?.name,
            value: i?.id,
          });
          body?.sort(sortData);
          return body;
        });
        setClassArray(body);
      },
      enabled: false,
    }
  );

  // Fetch Classes for Teacher
  const { isLoading: loadClassesForTeacher, mutate: ClassesForTeacher } =
    usePost({
      baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
      url: `schools-service/school-classes/teacher/assigned-class`,
      onSuccess: (resp: any) => {
        const res = resp?.data?.response;
        const formatArr =
          res?.map((ele: any) => ({ label: ele.name, value: ele.class_id })) ||
          [];
        setClassArray(formatArr);
      },
    });

  // FETCH Branches
  const { isLoading: schoolLoading } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-branches/?limit=100&school_id=${SCHOOL_ID}`,
    // cacheTime: 2000,
    onSuccess: (resp: any) => {
      const accData = resp?.data?.response;
      const respData = accData?.results;
      const branchArr: never[] = respData.map((i: any) => ({
        label: i?.name,
        value: i?.name,
        id: i?.id,
      }));
      branchArr.sort(sortData);
      setBranchArray(branchArr);
    },
    enabled: USER_ROLE === SCHOOL_ADMIN || USER_ROLE === BRANCH_ADMIN,
  });

  // FETCH teacher
  const { data: dataTeacher, isLoading: isLoadingTeacher } = useGet({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/teachers-list/?limit=1000&ordering=-created_at&school_id=${SCHOOL_ID}${selectedBranch !== 'Select' ? `&branch_name=${selectedBranch}` : ''}`,
    enabled: !!SCHOOL_ID,
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

  const TeacherArr = dataTeacher?.data?.response?.results?.sort(compare);

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
  const ProgramArr = programs?.sort(sortData);

  const fetchClassList = () => {
    if (USER_ROLE === SCHOOL_ADMIN || USER_ROLE === BRANCH_ADMIN) {
      if (selectedTeacher === 'Select') {
        ClassesForSchool();
      } else {
        ClassesForTeacher({
          teacher_id: selectedTeacher,
        });
      }
    } else if (USER_ROLE === TEACHER && user?.user_profile_id) {
      ClassesForTeacher({
        teacher_id: user?.user_profile_id,
      });
    }
  };

  const { isFetching: reportLoading, refetch: FetchUsageReportsTeacher } =
    useGet({
      baseURL: ReportURL,
      url: `reports-service/teacher_usage_report/?school_id=${SCHOOL_ID}${selectedBranch !== 'Select' ? `&branch_id=${branchArray?.find((obj: any) => obj?.value === selectedBranch)?.id || branchData?.id}` : ''}${selectedTeacher !== 'Select' ? `&teacher_id=${selectedTeacher}` : ''}${selectedClass !== 'Select' ? `&selected_class=${selectedClass}` : ''}${graph === 'yes' ? '&is_graph=true' : ''}${toDate ? `&from_date=${moment(fromDate).format('YYYY-MM-DD')}` : ''}${toDate ? `&to_date=${moment(toDate).format('YYYY-MM-DD')}` : ''}&page=${page}&page_size=${rowsPerPage}${selectedprogram !== 'Select' ? `&program_id=${selectedprogram}` : ''}`,
      onSuccess: (res: any) => {
        const accData = res?.data?.response;
        const respData = accData?.data;
        const records = accData?.total_records;
        const body: any = [];
        // table data
        if (graph !== 'yes') {
          const newtableData = respData?.map((i: any, index: any) => {
            const serialNumber =
              rowsPerPage !== 'all'
                ? (page - 1) * rowsPerPage + index + 1
                : index + 1;
            body.push([
              serialNumber,
              i?.teacher_name,
              i?.total_class,
              i?.total_logins,
              i?.avg_time_per_logins,
              i?.first_login
                ? moment(i?.first_login).format('YYYY-MM-DD HH:mm:ss')
                : '',
              i?.last_login
                ? moment(i?.last_login).format('YYYY-MM-DD HH:mm:ss')
                : '',
              displayData(i?.no_of_time_opened),
              displayData(i?.distinct_assignment),
              displayData(i?.distinct_assessment),
            ]);
            const temp = {
              ...i,
              SR_NO: serialNumber,
              first_login: i?.first_login
                ? moment(i?.first_login).format('DD-MM-YYYY HH:mm:ss')
                : '',
              last_login: i?.last_login
                ? moment(i?.last_login).format('DD-MM-YYYY HH:mm:ss')
                : '',
              distinct_assignment: (
                <span
                  role="presentation"
                  className="text-accent underline cursor-pointer text-xs font-medium"
                  onClick={() => handleDataPopup(i?.distinct_assignment)}
                >
                  {displayData(i?.distinct_assignment)}
                </span>
              ),
              no_of_time_opened: (
                <span
                  role="presentation"
                  className="text-accent underline cursor-pointer text-xs font-medium"
                  onClick={() => handleDataPopup(i?.no_of_time_opened)}
                >
                  {displayData(i?.no_of_time_opened)}
                </span>
              ),
              distinct_assessment: (
                <span
                  role="presentation"
                  className="text-accent underline cursor-pointer text-xs font-medium"
                  onClick={() => handleDataPopup(i?.distinct_assessment)}
                >
                  {displayData(i?.distinct_assessment)}
                </span>
              ),
            };
            return temp;
          });

          setTableData(newtableData);
          setCsvData(body);
          setTotalRecords(records);
        } else {
          setAssessmentGraphData(accData?.assessment_graph);
          setAssignmentGraphData(accData?.assignment_graph);
          setTimeOpendedGraphData(accData?.time_opended_graph);
        }
      },
      onError: ({ response }: any) => {},
      enabled: false,
    });

  const renderTableHead = () => {
    const keys = popupData?.reduce(
      (allKeys: any, obj: any) => allKeys.concat(Object.keys(obj)),
      []
    );
    return (
      <TableHead>
        <TableRow>
          {keys.map((key: any, index: any) => (
            <TableCell
              key={index}
              align="center"
              sx={{
                backgroundColor: 'var(--light-accent) !important',
              }}
            >
              {key}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
  };
  const renderTableCells = () =>
    popupData?.map((item: any, index: any) => {
      const key = Object.keys(item)[0]; // Get the key of the first property

      return (
        <TableCell
          key={index}
          align="center"
          sx={{
            backgroundColor: 'var(--white) !important',
          }}
        >
          {item[key]}
        </TableCell>
      );
    });

  const displayData = (dt: any) => {
    let dtValue = '';
    dt?.map((element: any) => {
      const label: any = Object.keys(element)[0];
      const value: any = Object.values(element)[0];
      let x = '';
      if (label === 'null') {
        x = 'Subject';
      }
      dtValue += `${value} ${label !== 'total' ? ' | ' : ''}`;
      return dtValue;
    });

    const numbers = dtValue.split(' | ');
    const lastNum = numbers.pop();
    const joinedNum = numbers.join(' | ');
    return dtValue ? `(${joinedNum}) | ${lastNum}` : '';
  };

  const handleDialog = () => {
    setDialogOpen(false);
  };

  const handleDataPopup = (subj: any) => {
    const arr = subj;
    arr.forEach((obj: any) => {
      // eslint-disable-next-line no-prototype-builtins
      if (obj?.hasOwnProperty('null')) {
        obj.Marks = obj.null;
        delete obj.null;
      }
    });
    setDialogOpen(true);
    setpopupData(arr);
  };

  const reset = () => {
    setFromDate('');
    setToDate('');
  };

  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };

  useEffect(() => {
    if (view === 'secondary') {
      setGraph('yes');
    } else {
      setGraph('');
      selectedProgram('Select');
    }
    reset();
  }, [view]);

  useEffect(() => {
    setSelectedClass('Select');
    setselectedTeacher('Select');
    if (selectedBranch) {
      fetchClassList();
    }
  }, [selectedBranch]);

  useEffect(() => {
    setSelectedClass('Select');
    if (selectedTeacher) {
      fetchClassList();
    }
  }, [selectedTeacher]);

  useEffect(() => {
    if (branchData) {
      setselectedBranch(branchData?.name);
    }
  }, [selectedBranch]);

  useEffect(() => {
    FetchUsageReportsTeacher();
  }, [
    graph,
    selectedClass,
    selectedBranch,
    selectedprogram,
    selectedTeacher,
    fromDate,
    toDate,
    page,
    rowsPerPage,
  ]);

  const handlePerPage = (e: any) => {
    setPage(page);
    setRowsPerPage(e);
  };

  return (
    <RouteLayout>
      <HeaderMenus
        title={`Report - Usage for Teacher - 2 ${view === 'default' ? '' : ' - Graph View'}`}
        menuArray={
          view === 'default' ? ADMIN_TOOLBAR_MENU : ADMIN_TOOLBAR_MENU_GRAPH
        }
        handleToolbarAction={handleToolbarAction}
      />
      <div className="flex gap-2 mt-7 lg:items-end items-center lg:flex-row flex-col ">
        <>
          <div className="flex md:justify-start justify-center gap-2 lg:grow grow-0 items-end">
            {userData && USER_ROLE === USER_TYPE.SCHOOL_ADMIN && (
              <Dropdown
                displayEmpty={false}
                title="Select Branch"
                value={selectedBranch || 'Select'}
                dataArray={[{ label: 'All', value: 'Select' }, ...branchArray]}
                onChangeHandler={(val) => {
                  setselectedBranch(val);
                }}
                sxClass={{ width: '206px', marginRight: '10px' }}
              />
            )}
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
            <div>
              <Dropdown
                title="Result Of Pages"
                value={rowsPerPage}
                dataArray={RESULTS_PER_PAGE}
                onChangeHandler={handlePerPage}
                sxClass={{ width: '206px', marginRight: '10px' }}
              />
            </div>
            {userData &&
            (USER_ROLE === SCHOOL_ADMIN ||
              USER_ROLE === BRANCH_ADMIN ||
              USER_ROLE === TEACHER) &&
            view === 'default' ? (
              <div>
                <Dropdown
                  title="Select a class"
                  value={selectedClass || 'Select'}
                  dataArray={[ALL, ...classArray]}
                  onChangeHandler={(val) => {
                    setSelectedClass(val);
                  }}
                  sxClass={{ width: '206px' }}
                />
              </div>
            ) : null}
            {(USER_ROLE === SCHOOL_ADMIN || USER_ROLE === BRANCH_ADMIN) &&
            view === 'default' ? (
              <>
                <div>
                  <Dropdown
                    title="Teacher Name"
                    value={selectedTeacher || 'Select'}
                    dataArray={[
                      ALL,
                      ...(TeacherArr?.map((item: any) => ({
                        label: `${item?.first_name} ${item?.last_name}`,
                        value: item?.id,
                      })) || []),
                    ]}
                    onChangeHandler={(val) => {
                      setselectedTeacher(val);
                    }}
                    sxClass={{ width: '206px' }}
                  />
                </div>
              </>
            ) : null}
            <div>
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
            <div>
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
            {(USER_ROLE === SCHOOL_ADMIN || USER_ROLE === BRANCH_ADMIN) &&
            view === 'secondary' ? (
              <>
                <div>
                  <Dropdown
                    title="Select Course"
                    value={selectedprogram}
                    dataArray={[ALL, ...ProgramArr]}
                    onChangeHandler={(val) => {
                      selectedProgram(val);
                    }}
                    sxClass={{ width: '206px', marginRight: '10px' }}
                  />
                </div>
              </>
            ) : null}
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
      {view && view === 'default' ? (
        <div className="wrapperBorder mt-3" ref={componentRef}>
          <Wrapper>
            <div>
              {reportLoading && <LinearProgress />}
              <TableContainer className="relative" sx={{ maxHeight: '100%' }}>
                <Table stickyHeader={true} aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      {TableColumns?.map((item: any, index: number) =>
                        item?.label ? (
                          <TableCell
                            key={`${index}`}
                            align={item?.align || 'center'}
                          >
                            {item?.label}
                          </TableCell>
                        ) : (
                          ''
                        )
                      )}
                    </TableRow>
                    <TableRow
                      sx={{
                        'th.MuiTableCell-root': {
                          backgroundColor: 'var(--white)',
                        },
                      }}
                    >
                      <TableCell
                        colSpan={4}
                        align="center"
                        sx={{
                          backgroundColor: 'var(--light-accent) !important',
                        }}
                      />
                      <TableCell
                        align="center"
                        sx={{
                          backgroundColor: 'var(--light-accent) !important',
                        }}
                      >
                        HH : MM : SS
                      </TableCell>
                      <TableCell
                        colSpan={1}
                        align="center"
                        sx={{
                          backgroundColor: 'var(--light-accent) !important',
                        }}
                      />
                      <TableCell
                        align="center"
                        sx={{
                          backgroundColor: 'var(--light-accent) !important',
                        }}
                      />
                      <TableCell
                        align="center"
                        sx={{
                          backgroundColor: 'var(--light-accent) !important',
                        }}
                      >
                        (Subject Marks) | Total
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          backgroundColor: 'var(--light-accent) !important',
                        }}
                      >
                        (Subject Marks) | Total
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          backgroundColor: 'var(--light-accent) !important',
                        }}
                      >
                        (Subject Marks) | Total
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tableData?.length ? (
                      tableData?.map(
                        (row: any, index: number): JSX.Element => (
                          <TableRow
                            key={`${row?.id}-${index}`}
                            sx={{ '& > *': { borderBottom: 'unset' } }}
                          >
                            {TableColumns?.map((item: any, inn: number) => (
                              <TableCell
                                key={`${item?.label || row?.id}-${inn}`}
                                align="center"
                                style={{ height: '50px' }}
                              >
                                {row[item?.mapper]}
                              </TableCell>
                            ))}
                          </TableRow>
                        )
                      )
                    ) : (
                      <TableRow>
                        <TableCell colSpan={13} align="center">
                          <p>No data found</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {noOfpages && noOfpages > 1 ? (
                <NumberedPagination
                  totalPages={noOfpages}
                  paginateHandler={handlePagination}
                  currentPage={page}
                />
              ) : null}
            </div>
          </Wrapper>
        </div>
      ) : (
        <>
          <div ref={componentRef} className="p-5">
            {/* <h1 className="font-semibold text-l">Teacher</h1> */}
            <div className="py-4 h-full grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
              <div className="p-4 bg-white border border-accent rounded-md overflow-x-auto">
                <p className="font-semibold text-lg">
                  {GRAPH_LABELS.TIME_OPENED}
                </p>
                {reportLoading || FetchUsageReportsTeacher ? (
                  <TeacherUsageAllGraph graphData={timeOpendedGraphData} />
                ) : (
                  <div className="h-[90%] relative">
                    <Loader />
                  </div>
                )}
              </div>
              <div className="p-4 bg-white border border-accent rounded-md overflow-x-auto">
                <p className="font-semibold text-lg">Assignments</p>
                {reportLoading || FetchUsageReportsTeacher ? (
                  <TeacherUsageAllGraph graphData={assignmentGraphData} />
                ) : (
                  <div className="h-[90%] relative">
                    <Loader />
                  </div>
                )}
              </div>
              <div className="p-4 bg-white border border-accent rounded-md overflow-x-auto">
                <p className="font-semibold text-lg">Assessments</p>
                {reportLoading || FetchUsageReportsTeacher ? (
                  <TeacherUsageAllGraph graphData={assessmentGraphData} />
                ) : (
                  <div className="h-[90%] relative">
                    <Loader />
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
      <CustomizedDialogs
        maxwidth="sm"
        open={dialogOpen}
        setOpen={() => {
          handleDialog();
        }}
        title="Subjects"
      >
        <div>
          <Wrapper>
            <Table>
              {renderTableHead()}
              <TableBody>
                <TableRow>{renderTableCells()}</TableRow>
              </TableBody>
            </Table>
          </Wrapper>
        </div>
      </CustomizedDialogs>
    </RouteLayout>
  );
}
