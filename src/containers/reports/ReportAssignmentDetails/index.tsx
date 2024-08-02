/* eslint-disable comma-dangle */
import ButtonToggle from '@component/ToggleButton/ToggleButton';
import { IconButton } from '@component/button/button';
import DatePicker from '@component/datepicker';
import Dropdown from '@component/dropdown/Dropdown';
import { CustomInput } from '@component/input';
import { NumberedPagination } from '@component/pagination/CustomPagination';
import { ReactComponent as Share } from '@images/pageHeaderIcons/share.svg';
import EmailIcon from '@mui/icons-material/Email';
import PrintIcon from '@mui/icons-material/Print';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useGet } from '@shared/api/useApi';
import Loader from '@shared/loader';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import { selectSchoolData } from '@shared/store/schoolSlice';
import { selectUser } from '@shared/store/userSlice';
import toast from '@shared/toast';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import { useDispatch, useSelector } from 'react-redux';
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import ReactToPrint from 'react-to-print';
import {
  TABLE_LABELS,
  TOOLBAR_LABELS,
  USER_TYPE,
} from '../../../constants/constants';
import Wrapper from '../../../shared/wrapper/Wrapper';
import RouteLayout from '../../layout/routeLayout';
import StudentLeveAreaBar from '../BarChart/StudentLeveAreaBar';
import StudentLeveBar from '../BarChart/StudentLeveBar';
import StudentLevelChart from '../LineChart/StudentLevelChart';
import Setting from '../setting';
import StudentModal from './StudentModal';

const printButton = () => <PrintIcon />;

export default function Index() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  const { schoolData, branchData } = useSelector(selectSchoolData);
  const [searchParams] = useSearchParams();
  const userData = useSelector((state: any) => state?.user);
  const { schoolId, userId } = useSelector(selectUser);
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [graph, setGraph] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const recordsPerPage = 10;
  const noOfpages = Math.ceil(totalRecords / recordsPerPage);
  const [createdDate, setCreatedDate] = useState<any>('01-09-2022');
  const [dueDate, setDueDate] = useState<any>('10-09-2022');
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [studentArr, setStudentArr] = useState<string[]>([]);
  const [view, setView] = React.useState('default');
  const [details, SetDetails] = useState([]);
  const schoolNameInURL = decodeURIComponent(location.pathname.split('/')[1]);
  const link = `/${schoolNameInURL}/reports/assignment-question-level-student`;
  const [ScoreArray, SetScoreArray] = useState([]);
  const [perArray, SetPerArray] = useState([]);
  const [percentage, setPercentage] = useState('false');
  const [performance, SetPerformanceData] = useState([]);
  const [linearr, setLineArray] = useState([]);
  const [SecondTabledata, setSecondTable] = useState<DataItem[]>([]);
  const { assignID, CourseID, ClassID, schoolName } = useParams();
  const [student, setStudentData] = useState([]);
  const [studentid, setID] = useState('');
  const [selectedstudent, setSelectedStudent] = useState<any>('');
  const USER_ROLE = userData?.role?.name;
  const SCHOOL_ID = schoolData?.id || branchData?.school_data?.id || '';
  const BRANCH_ID = branchData?.school_data?.id || '';

  const ReportURL = import.meta.env.VITE_APP_REPORTS_SERVICE_URL;

  const program = state?.program || '';
  const assignmentName = state?.assignment || '';
  const classname = state?.class || '';
  const startData = state?.startData || '';
  const endDate = state?.endDate || '';
  const [csvData, setCsvData] = useState<[]>([]);

  const {
    isRefetching: emailSendLoading,
    refetch: sendEmail,
    isLoading: emailLoad,
  } = useGet({
    baseURL: ReportURL,
    url: `reports-service/assignment_details_report/send_email/?user_id=${userId}&school_id=${SCHOOL_ID}`,
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
  const headers = [
    TABLE_LABELS?.ASSIGNMET_NAME,
    TABLE_LABELS?.FIRST_NAME,
    TABLE_LABELS?.LAST_NAME,
    TABLE_LABELS.SUBMITTED_DATE,
    TABLE_LABELS?.SCORE,
    TABLE_LABELS?.PERCENTAGE,
    TABLE_LABELS?.PERFORMANCE_EXPECTATION,
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
          filename="Report Assignment Details.csv"
          data={csvData}
          headers={headers}
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

  const TableColumns = [
    {
      label: TABLE_LABELS?.SR_NO,
      mapper: 'SR_NO',
      align: 'center',
    },
    {
      label: 'Student First Name',
      mapper: 'StudentFirstName',
      isSort: true,
    },
    {
      label: 'Student Last Name',
      isSort: true,
      mapper: 'StudentLastName',
    },
    {
      label: 'Date Submitted',
      isSort: true,
      mapper: 'DateSubmitted',
    },
    {
      label: 'Score',
      isSort: true,
      mapper: 'Score',
    },
    {
      label: 'Percentage %',
      isSort: true,
      mapper: 'Percentage',
    },
    {
      label: 'Time (HH:MM)',
      isSort: true,
      mapper: 'Time',
    },
    {
      label: 'Checks',
      isSort: true,
      mapper: 'Check',
    },
    {
      label: 'Performance Expectation',
      isSort: true,
      mapper: 'PerformanceExpectation',
    },
  ];

  interface DataItem {
    names: string[];
    performance_status: string;
  }
  const componentRef = useRef(null);
  const handleDialog = () => {
    setDialogOpen(!dialogOpen);
  };
  const handleStudentModal = () => {
    setOpenModal(!openModal);
  };

  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };

  const handleToolbarAction = async (title: string) => {
    if (title === TOOLBAR_LABELS.EMAIL) {
      handelSendEmail();
    }
  };

  const { isFetching: reportLoading, refetch: AssignmentDetails } = useGet({
    baseURL: ReportURL,
    url: `reports-service/assignment_details_report/?user_id=${userId}&school_id=${SCHOOL_ID}${graph ? `&is_graph=${graph}` : ''}${studentid ? `&selected_student=${studentid}` : ''}${page ? `&page=${page}` : ''}${startData ? `&from_date=${moment(startData).format('YYYY-MM-DD')}` : ''}${endDate ? `&to_date=${moment(endDate).format('YYYY-MM-DD')}` : ''}&selected_program=${CourseID}&selected_class=${ClassID}&selected_assignment=${assignID}`,
    onSuccess: (res: any) => {
      const accData = res?.data?.response;
      const respData = accData?.data;
      const ScoreData = accData?.data?.score_data;
      const PerData = accData?.data?.percent_data;
      const PerformanData = accData?.data?.performance_expectation;
      const LineData = accData?.data?.line_graph;
      const records = accData?.total_records;
      const SecondTable = accData?.second_table;
      SetScoreArray(ScoreData);
      SetPerArray(PerData);
      // performance data
      SetPerformanceData(PerformanData);
      // linedata
      if (LineData) {
        setLineArray(LineData);
      }
      // table data
      if (respData) {
        const body: any = [];
        const csvbody: any = [];
        const studentbody: any = [];
        respData?.map((i: any, index: any) => {
          const date = new Date(i.submitted_at);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          const formattedDate = `${day}-${month}-${year}`;
          body.push({
            SR_NO: i.Sr_No,
            StudentFirstName: i.first_name,
            StudentLastName: i.last_name,
            DateSubmitted: i.submitted_at ? formattedDate : '',
            Score: `${i.score_value ? i.score_value : ''}/ ${i.total_score ? i.total_score : ''} `,
            Percentage: i.score_in_percent
              ? Number(i.score_in_percent).toFixed(2)
              : '',
            Time: i.time,
            PerformanceExpectation: i.performance_expectation,
            Check: i.checks,
            AssignmentName: i.assignment_name,
            StudentID: i.student_id,
            ClassName: classname,
            assignmentID: i.assignment_id,
          });
          studentbody.push({
            label: i.first_name,
            value: i.first_name,
            id: i.student_id,
          });
          setStudentData(studentbody);
          csvbody.push([
            i.assignment_name,
            i.first_name,
            i.last_name,
            i.submitted_at ? formattedDate : '',
            `${i.score_value ? i.score_value : ''}/ ${i.total_score ? i.total_score : ''} `,
            i.score_in_percent,
            i.performance_expectation,
          ]);
          return true;
        });
        const modifiedRows = body
          .map((row: any) => {
            if (row.PerformanceExpectation === 'Meets') {
              return {
                ...row,
                PerformanceExpectation: (
                  <div className="bg-[#BECCFF] p-4">
                    {row?.PerformanceExpectation}
                  </div>
                ),
              };
            }
            if (row.PerformanceExpectation === 'Does Not Meet') {
              return {
                ...row,
                PerformanceExpectation: (
                  <div className="bg-[#FCD4C6] p-4">
                    {row?.PerformanceExpectation}
                  </div>
                ),
              };
            }
            if (row.PerformanceExpectation === 'Exceeds') {
              return {
                ...row,
                PerformanceExpectation: (
                  <div className="bg-[#d9ffc8] p-4">
                    {row?.PerformanceExpectation}
                  </div>
                ),
              };
            }
            if (row.PerformanceExpectation === 'Approaching') {
              return {
                ...row,
                PerformanceExpectation: (
                  <div className="bg-[#FFF9BE] p-4">
                    {row?.PerformanceExpectation}
                  </div>
                ),
              };
            }
            return row;
          })
          .sort(
            (a: { SR_NO: number }, b: { SR_NO: number }) => a.SR_NO - b.SR_NO
          );
        setCsvData(csvbody);
        SetDetails(modifiedRows);
        setTotalRecords(records);
      }
      // second table
      if (SecondTable) {
        const modifiedRows = SecondTable?.map((row: any) => {
          if (row.performance_status === 'Meets') {
            return {
              ...row,
              performance_status: (
                <div className="bg-[#D9FFC8] p-4">
                  {row?.performance_status}
                </div>
              ),
            };
          }
          if (row.performance_status === 'Does Not Meet') {
            return {
              ...row,
              performance_status: (
                <div className="bg-[#FCD4C6] p-4">
                  {row?.performance_status}
                </div>
              ),
            };
          }
          if (row.performance_status === 'Exceeds') {
            return {
              ...row,
              performance_status: (
                <div className="bg-[#BECCFF] p-4">
                  {row?.performance_status}
                </div>
              ),
            };
          }
          if (row.performance_status === 'Approaching') {
            return {
              ...row,
              performance_status: (
                <div className="bg-[#FFF9BE] p-4">
                  {row?.performance_status}
                </div>
              ),
            };
          }
          return row;
        });
        setSecondTable(modifiedRows);
      }
    },
    onError: ({ response }: any) => {},
    enabled: false,
  });

  const handleOptionChange = (event: any) => {
    setPercentage(event.target.value);
  };
  const reset = () => {
    setPercentage('false');
    setID('');
  };

  useEffect(() => {
    if (view === 'secondary') {
      setGraph('1');
    } else {
      setGraph('');
    }
    reset();
  }, [view]);

  useEffect(() => {
    if (SCHOOL_ID) {
      AssignmentDetails();
    }
  }, [percentage, SCHOOL_ID, graph, studentid, CourseID, page]);

  return (
    <RouteLayout
      state={location?.state ? { page: location?.state?.page } : {}}
      path={`/${schoolName}/reports`}
    >
      <HeaderMenus
        title={`Report -  ${view === 'default' ? 'Assignments Details' : 'Multiple Assignments Student Level'}`}
        menuArray={ADMIN_TOOLBAR_MENU}
        handleToolbarAction={handleToolbarAction}
      />
      <div className="flex gap-2 mt-7 lg:items-end items-center lg:flex-row flex-col ">
        {view && view === 'default' ? (
          <div className="flex md:justify-start justify-center gap-2 lg:grow grow-0 items-end">
            <div className="w-[150px]">
              <CustomInput
                name="program"
                label="Program"
                size="small"
                value={program || ''}
                disabled={true}
              />
            </div>
            <div className="w-[150px]">
              <CustomInput
                name="assignment_name"
                label="Assignment Name"
                size="small"
                value={assignmentName || ''}
                disabled={true}
              />
            </div>
            <div className="w-[150px]">
              <CustomInput
                name="class"
                label="Class"
                size="small"
                value={classname || ''}
                disabled={true}
              />
            </div>
            <div className="w-[150px]">
              <DatePicker
                value={startData}
                label="Created Date"
                handlePickerChange={(date: string) => setCreatedDate(date)}
                // sxType={1}
                defaultStyle={true}
                disabled={true}
              />
            </div>
            <div className="w-[150px]">
              <DatePicker
                value={endDate}
                label="Due Date"
                handlePickerChange={(date: string) => setDueDate(date)}
                // sxType={1}
                defaultStyle={true}
                disabled={true}
              />
            </div>
            <IconButton onClick={handleDialog} sx={{ boxShadow: 'none' }}>
              <SettingsIcon fontSize="small" />
            </IconButton>
          </div>
        ) : (
          <>
            <div className="flex md:justify-start justify-center gap-2 lg:grow grow-0 items-end">
              <div className="w-[150px]">
                <CustomInput
                  name="class"
                  label="Class"
                  size="small"
                  value={classname || ''}
                  disabled={true}
                />
              </div>
              {userData && USER_ROLE === USER_TYPE.TEACHER && (
                <div className="w-[150px]">
                  <CustomInput
                    label="Teacher Name"
                    size="small"
                    value={`${userData?.first_name} ${userData?.last_name}`}
                    disabled={true}
                  />
                </div>
              )}
              <div className="w-[150px]">
                <DatePicker
                  value={startData}
                  label="From"
                  handlePickerChange={(date: string) => setCreatedDate(date)}
                  // sxType={1}
                  defaultStyle={true}
                  disabled={true}
                />
              </div>
              <div className="w-[150px]">
                <DatePicker
                  value={endDate}
                  label="To"
                  handlePickerChange={(date: string) => setCreatedDate(date)}
                  // sxType={1}
                  defaultStyle={true}
                  disabled={true}
                />{' '}
              </div>
              <IconButton onClick={handleDialog} sx={{ boxShadow: 'none' }}>
                <SettingsIcon fontSize="small" />
              </IconButton>
            </div>
          </>
        )}
        <div>
          <ButtonToggle view={view} setView={setView} />
        </div>
      </div>
      {/* Table Section */}
      {view && view === 'default' ? (
        <>
          <div className="wrapperBorder mt-3" ref={componentRef}>
            <Wrapper>
              <TableContainer className="relative" sx={{ maxHeight: '100%' }}>
                <Table stickyHeader={true} aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      {TableColumns?.map((item: any, index: number) =>
                        item?.label ? (
                          <TableCell
                            key={`${item?.label}-${index}`}
                            align={item?.align || 'left'}
                            colSpan={item?.colspan || 1}
                          >
                            {item?.label}
                          </TableCell>
                        ) : (
                          ''
                        )
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {details.length ? (
                      details?.map(
                        (row: any, index: number): JSX.Element => (
                          <TableRow
                            hover={true}
                            onClick={() => {
                              const {
                                StudentID,
                                StudentFirstName,
                                StudentLastName,
                                AssignmentName,
                                ClassName,
                                Score,
                                Percentage,
                                DateSubmitted,
                              } = row;
                              const stateData2 = {
                                studentID: StudentID,
                                studentName: `${StudentFirstName} ${StudentLastName}`,
                                assignmentName: AssignmentName,
                                className: ClassName,
                                Score,
                                percentage: Percentage,
                                Submitteddate: DateSubmitted,
                              };
                              navigate(
                                `${link}/${row.StudentID}/${row.assignmentID}`,
                                { state: { stateData2 } }
                              );
                            }}
                            key={`${row?.id}-${index}`}
                            sx={{
                              '& > *': { borderBottom: 'unset' },
                              cursor: 'pointer',
                            }}
                          >
                            {TableColumns?.map((item: any, inn: number) => (
                              <TableCell
                                key={`${item?.label || row?.id}-${inn}`}
                                align={item?.bodyAlign || item?.align || 'left'}
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
              <TableContainer
                className="relative"
                sx={{ maxHeight: '100%', paddingTop: '40px' }}
              >
                <Table stickyHeader={true} aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell key="1" align="left" style={{ width: 120 }}>
                        Performance Expectation
                      </TableCell>
                      <TableCell key="2" align="center" style={{ width: 220 }}>
                        Students Name
                      </TableCell>
                      {/* <TableCell key="3" align="left" style={{ width: 220 }}>
                        Resources
                      </TableCell>
                      <TableCell key="4" align="left">
                        Message
                      </TableCell> */}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {SecondTabledata &&
                      SecondTabledata?.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell align="center">
                            {row.performance_status}
                          </TableCell>
                          <TableCell align="center">
                            {row?.names?.length > 2
                              ? `${row?.names?.slice(0, 2).join(', ')} `
                              : row?.names?.join(', ')}
                            {row?.names?.length > 2 && (
                              <p
                                className="text-green-500 underline"
                                onClick={() => {
                                  handleStudentModal();
                                  setStudentArr(row.names);
                                }}
                              >
                                +{row.names.length - 2} more
                              </p>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Wrapper>
          </div>
        </>
      ) : (
        <div ref={componentRef}>
          <div className="wrapperBorder mt-3">
            <div className="flex flex-col items-center justify-center">
              <p className="font-semibold text-2xl">Score at Student Level</p>
              <div className="flex">
                <p className="m-2"> Select to view values on Y-Axis:</p>
                <FormControl>
                  <RadioGroup
                    aria-labelledby="demo-radio-buttons-group-label"
                    defaultValue="score"
                    name="radio-buttons-group"
                    row={true}
                    onChange={handleOptionChange}
                    value={percentage}
                  >
                    <FormControlLabel
                      value={false}
                      defaultChecked={true}
                      control={
                        <Radio
                          sx={{
                            color: 'var(--sunlight)',
                            '&.Mui-checked': {
                              color: 'var(--sunlight)',
                            },
                          }}
                        />
                      }
                      label="Score"
                    />
                    <FormControlLabel
                      value={true}
                      control={
                        <Radio
                          sx={{
                            color: 'var(--sunlight)',
                            '&.Mui-checked': {
                              color: 'var(--sunlight)',
                            },
                          }}
                        />
                      }
                      label="Percentage"
                    />
                  </RadioGroup>
                </FormControl>
              </div>
            </div>
            <div>
              <StudentLeveBar
                tabledata={ScoreArray}
                PerData={perArray}
                Per={percentage}
              />
            </div>
          </div>
          <div className="wrapperBorder mt-5">
            <Wrapper>
              <div>
                <StudentLeveAreaBar
                  performance={performance}
                  Per={percentage}
                />
              </div>
            </Wrapper>
          </div>
          <div className="wrapperBorder mt-5">
            <Wrapper>
              <div className="flex flex-col items-center justify-center">
                <p className="font-semibold text-2xl">
                  Attainment over Data Range at Student Level
                </p>
                <div className="flex ml-auto">
                  <p className="m-4 mb-5">Select Student :</p>
                  <Dropdown
                    value={selectedstudent}
                    dataArray={student}
                    displayEmpty={true}
                    onChangeHandler={(val) => {
                      const obj: any = student.filter(
                        (ele: { label: any }) => ele.label === val
                      )[0];
                      setID(obj.id);
                      setSelectedStudent(val);
                    }}
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <StudentLevelChart linedata={linearr} />
              </div>
            </Wrapper>
          </div>
        </div>
      )}
      <Setting
        dialogOpen={dialogOpen}
        openModal={() => setDialogOpen(!dialogOpen)}
        closeModal={() => setDialogOpen(false)}
      />
      <StudentModal
        open={openModal}
        openModal={() => setOpenModal(!openModal)}
        closeModal={() => setOpenModal(false)}
        student={studentArr}
      />
    </RouteLayout>
  );
}
