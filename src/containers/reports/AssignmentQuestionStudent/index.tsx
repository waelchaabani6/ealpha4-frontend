/* eslint-disable linebreak-style */
/* eslint-disable no-confusing-arrow */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable comma-dangle */
import { IconButton } from '@component/button/button';
import DatePicker from '@component/datepicker';
import { CustomInput } from '@component/input';
import EmailIcon from '@mui/icons-material/Email';
import PrintIcon from '@mui/icons-material/Print';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
// import { CSVLink } from 'react-csv';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import ReactToPrint from 'react-to-print';
// import PageTitle from '@shared/pageTitle';
import ButtonToggle from '@component/ToggleButton/ToggleButton';
import { NumberedPagination } from '@component/pagination/CustomPagination';
import { useGet } from '@shared/api/useApi';
import Loader from '@shared/loader';
import { selectSchoolData } from '@shared/store/schoolSlice';
import { selectUser } from '@shared/store/userSlice';
import toast from '@shared/toast';
import moment from 'moment';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CSVLink } from 'react-csv';
import { ReactComponent as Share } from '@images/pageHeaderIcons/share.svg';
import { TABLE_LABELS, TOOLBAR_LABELS } from '../../../constants/constants';
import Wrapper from '../../../shared/wrapper/Wrapper';
import RouteLayout from '../../layout/routeLayout';
import AssignQuestionLevel from '../LineChart/AssignQuestionLevel';
import Setting from '../setting';

const printButton = () => <PrintIcon />;

export default function Index() {
  const navigate = useNavigate();
  const [csvData, setCsvData] = useState<[]>([]);
  const { schoolId, userId } = useSelector(selectUser);
  const { StudentID, AssignID } = useParams();
  const { state: linkState } = useLocation();
  const [page, setPage] = useState(1);
  const { schoolData, branchData } = useSelector(selectSchoolData);
  const userData = useSelector((state: any) => state?.user);
  const [createdDate, setCreatedDate] = useState<any>('01-09-2022');
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [view, setView] = React.useState('default');
  const [checked, setChecked] = useState(false);
  const [TableColumn, setTableColumn] = useState([]);
  const [queData, SetQueData] = useState([]);
  const [linearr, SetLineArr] = useState([]);
  const componentRef = useRef(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [graph, setGraph] = useState('');
  const recordsPerPage = 10;
  const USER_ROLE = userData?.role?.name;
  const noOfpages = Math.ceil(totalRecords / recordsPerPage);
  const assignmentName = linkState?.stateData2?.assignmentName || '';
  const score = `${linkState?.stateData2?.Score} ${linkState?.stateData2?.percentage ? `${linkState?.stateData2?.percentage}%` : ''}`;
  const Submitteddate = linkState?.stateData2?.Submitteddate || '';
  const className = linkState?.stateData2?.className || '';
  const percentage = linkState?.stateData2?.percentage || '';
  const studentID = linkState?.stateData2?.studentID || '';
  const studentName = linkState?.stateData2?.studentName || '';
  const FinalSubmittedDate = Submitteddate?.split('-')?.reverse()?.join('-');
  const SCHOOL_ID = schoolData?.id || branchData?.school_data?.id || '';
  const BRANCH_ID = branchData?.school_data?.id || '';

  const {
    isRefetching: emailSendLoading,
    refetch: sendEmail,
    isLoading: emailLoad,
  } = useGet({
    baseURL: import.meta.env.VITE_APP_REPORTS_SERVICE_URL,
    url: `reports-service/question_level_assignments/send_email/?user_id=${userId}&school_id=${schoolId}${StudentID ? `&student_id=${StudentID}` : ''}`,
    onSuccess: () => {
      toast('success', 'Email sent successfully');
    },
    retry: false,
    onError: ({ response }: any) => {
      toast('error', response?.data?.message || 'Unable to send email');
    },
    enabled: false,
  }) as any;

  const headers = [
    TABLE_LABELS?.QUESTIONS,
    TABLE_LABELS?.PERCENTAGE,
    TABLE_LABELS?.STANDARD,
    TABLE_LABELS.PERFORMANCE_EXPECTATION,
    TABLE_LABELS?.CLASS_AVG,
    TABLE_LABELS?.ClassAverage,
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
          filename="Assigned Students.csv"
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

  const ADMIN_TOOLBAR_MENU_GRAPH = [
    // {
    //   title: 'Export',
    //   icon: (
    //     <CSVLink
    //       filename="Assigned Students.csv"
    //       data={csvData}
    //       headers={headers}
    //       enclosingCharacter=""
    //     >
    //       <Share />
    //     </CSVLink>
    //   ),
    // },
  ];

  const TableColumns: any = [
    {
      label: 'Question',
      mapper: 'Question',
    },
    {
      label: 'Points Scored',
      mapper: 'PointsScored',
    },
    {
      label: 'Percentage %',
      mapper: 'Percentage',
    },
    {
      label: 'Standard',
      mapper: 'Standard',
    },
    {
      label: 'Check',
      mapper: 'Check',
    },
    {
      label: 'Performance Expectation',
      isSort: true,
      mapper: 'PerformanceExpectation',
    },
    {
      label: 'Class Average Points',
      isSort: true,
      mapper: 'ClassAveragePoints',
    },
    {
      label: 'Class Average %',
      isSort: true,
      mapper: 'ClassAverage',
    },
  ];

  const handleDialog = () => {
    setDialogOpen(!dialogOpen);
  };

  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };

  const handelSendEmail = () => {
    sendEmail();
  };
  const { isFetching: loading, refetch: QuestionLevel } = useGet({
    baseURL: import.meta.env.VITE_APP_REPORTS_SERVICE_URL,
    url: `reports-service/question_level_assignments/?user_id=${userId}&school_id=${SCHOOL_ID}${page ? `&page=${page}` : ''}${StudentID ? `&selected_student=${StudentID}` : ''}${AssignID ? `&selected_assignment=${AssignID}` : ''}${FinalSubmittedDate ? `&submitted_date=${FinalSubmittedDate}` : ''}${graph ? `&is_graph=${graph}` : ''}`,
    onSuccess: (res: any) => {
      const respData = res?.data?.response;
      const astData = respData?.data;
      const Records = respData?.total_records;
      const LineData = respData?.line_data;
      if (astData) {
        const body: any = [];
        const csvbody: any = [];
        astData?.map((i: any, index: any) => {
          body.push({
            Question: i.page_number,
            PointsScored: `${i.scores_val ? i.scores_val : ''}/ ${
              i.max_scores ? i.max_scores : ''
            } `,
            Percentage: i.score_in_percent ? i.score_in_percent.toFixed(2) : '',
            Standard: '',
            Check: i.checks_count,
            PerformanceExpectation: i.performance_expectation,
            ClassAveragePoints: `${i.class_average_score ? i.class_average_score : ''}/ ${i.class_average_max_score ? i.class_average_max_score : ''} `,
            ClassAverage: i.class_score_in_percent,
          });
          csvbody.push([
            index + 1,
            `${i.scores_val ? i.scores_val : ''}/ ${
              i.max_scores ? i.max_scores : ''
            } `,
            i.score_in_percent,
            '',
            i.performance_expectation,
            `${i.class_average_score ? i.class_average_score : ''}/ ${i.class_average_max_score ? i.class_average_max_score : ''} `,
            i.class_score_in_percent,
          ]);
          return true;
        });
        const modifiedRows = body.map((row: any) => {
          if (row.PerformanceExpectation === 'Meets') {
            return {
              ...row,
              PerformanceExpectation: (
                <div className="bg-[#FFF9BE] p-4">
                  {row?.PerformanceExpectation}
                </div>
              ),
            };
          }
          if (row.PerformanceExpectation === 'Above') {
            return {
              ...row,
              PerformanceExpectation: (
                <div className="bg-[#d9ffc8] p-4">
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
                <div className="bg-[#BECCFF] p-4">
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
        });
        setCsvData(csvbody);
        SetQueData(modifiedRows);
        setTotalRecords(Records);
      }
      if (LineData) {
        SetLineArr(LineData);
      }
    },
    onError: ({ response }: any) => {},
    enabled: false,
  });

  useEffect(() => {
    if (page) {
      QuestionLevel();
    }
  }, [page]);

  const handleToolbarAction = async (title: string) => {
    if (title === TOOLBAR_LABELS.EMAIL) {
      handelSendEmail();
    }
  };

  const handleCheckBox = (e: any) => {
    setChecked(e.target.checked);
  };
  const userColumn = () => {
    const FilteredArray = TableColumns.slice(0, -2);
    if (!checked) {
      setTableColumn(FilteredArray);
    } else {
      setTableColumn(TableColumns);
    }
  };

  useEffect(() => {
    if (SCHOOL_ID) {
      userColumn();
      QuestionLevel();
    }
  }, [checked, SCHOOL_ID, graph]);

  useEffect(() => {
    if (view === 'secondary') {
      setGraph('1');
    } else {
      setGraph('');
    }
  }, [view]);

  return (
    <RouteLayout>
      <HeaderMenus
        title="Report -  Assignments Question Level for Students"
        menuArray={
          view === 'default' ? ADMIN_TOOLBAR_MENU : ADMIN_TOOLBAR_MENU_GRAPH
        }
        handleToolbarAction={handleToolbarAction}
      />
      <div className="flex gap-2 mt-7 lg:items-end items-center lg:flex-row flex-col ">
        <div className="flex md:justify-start justify-center gap-2 lg:grow grow-0 items-end">
          <div className="min-w-max">
            <CustomInput
              name="assignment_name"
              label="Assignment Name"
              size="small"
              value={assignmentName}
              disabled={true}
            />
          </div>
          {view && view !== 'default' && (
            <div className="m-w-fit">
              <CustomInput
                name="teacher"
                label="Teacher Name"
                size="small"
                value={`${userData?.first_name} ${userData?.last_name}`}
                disabled={true}
              />
            </div>
          )}
          <div className="m-w-min">
            <CustomInput
              name="studentname"
              label="Student Name"
              size="small"
              value={studentName}
              disabled={true}
            />
          </div>
          <div className="w-[130px]">
            <CustomInput
              name="class"
              label="Class"
              size="small"
              value={className}
              disabled={true}
            />
          </div>
          <div className="w-[155px]">
            <CustomInput
              name="score"
              label="Score"
              size="small"
              value={score}
              disabled={true}
            />
          </div>
          <div className="w-[180px]">
            <DatePicker
              value={FinalSubmittedDate}
              label="Submitted Date"
              handlePickerChange={(date: string) => setCreatedDate(date)}
              defaultStyle={true}
              disabled={true}
            />
          </div>
          <IconButton onClick={handleDialog} sx={{ boxShadow: 'none' }}>
            <SettingsIcon fontSize="small" />
          </IconButton>
        </div>
        <div>
          <ButtonToggle view={view} setView={setView} />
        </div>
      </div>
      {/* Table Section */}
      {view && view === 'default' ? (
        <>
          <div className="wrapperBorder mt-3" ref={componentRef}>
            <Wrapper>
              <div>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        color="success"
                        checked={checked}
                        onChange={handleCheckBox}
                        inputProps={{ 'aria-label': 'checkbox' }}
                      />
                    }
                    label="Select to see Class Average Score and Class Average in %"
                  />
                </FormGroup>
              </div>
              <TableContainer className="relative" sx={{ maxHeight: '100%' }}>
                <Table stickyHeader={true} aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      {TableColumn?.map((item: any, index: number) =>
                        item?.label ? (
                          <TableCell
                            key={`${item?.label}-${index}`}
                            align="center"
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
                    {queData.length ? (
                      queData?.map(
                        (row: any, index: number): JSX.Element => (
                          <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                            {TableColumn?.map((item: any, inn: number) => (
                              <TableCell key={`${row.id}`} align="center">
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
              {/* //will be use in future
              <TableContainer
                className="relative"
                sx={{ maxHeight: '100%', paddingTop: '40px' }}
              >
                <Table stickyHeader={true} aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell key="1" align="left" style={{ width: 220 }}>
                        Performance Expectation
                      </TableCell>
                      <TableCell key="2" align="left" style={{ width: 150 }}>
                        Standards
                      </TableCell>
                      <TableCell key="3" align="left" style={{ width: 220 }}>
                        Resources Message
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                      <TableCell key="1" align="left">
                        <div className="bg-[#D9FFC8] p-4">Exceeds</div>
                      </TableCell>
                      <TableCell key="2" align="left">
                        N.C.4.2
                      </TableCell>
                      <TableCell key="3" align="left">
                        Lorem Ipsum
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                      <TableCell key="1" align="left">
                        <div className="bg-[#BECCFF] p-4">Meets</div>
                      </TableCell>
                      <TableCell key="2" align="left">
                        NC.4.1
                      </TableCell>
                      <TableCell key="3" align="left">
                        Lorem Ipsum
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                      <TableCell key="1" align="left">
                        <div className="bg-[#FFF9BE] p-4">Approaching</div>
                      </TableCell>
                      <TableCell key="2" align="left">
                        NC.4.3
                        {' '}

                      </TableCell>
                      <TableCell key="3" align="left">
                        Lorem Ipsum
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                      <TableCell key="1" align="left">
                        <div className="bg-[#FCD4C6] p-4">Does Not Meet</div>
                      </TableCell>
                      <TableCell key="2" align="left">
                        NC.4.2
                      </TableCell>
                      <TableCell key="3" align="left">
                        Lorem Ipsum
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer> */}
            </Wrapper>
          </div>
          {/* //will be use in future
          <div className="wrapperBorder mt-5">
            <Wrapper>
              <HeaderMenus title="Standard Overall Graph" />
              <div className="mt-5 grid grid-cols-5 gap-4 ">
                <div className="col-span-4">
                  <StandardOverallGraph />
                </div>
              </div>
            </Wrapper>
          </div> */}
        </>
      ) : (
        <>
          <div className="wrapperBorder mt-3" ref={componentRef}>
            <Wrapper>
              <div className="flex flex-col items-center justify-center">
                <div className="flex">
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          color="success"
                          checked={checked}
                          onChange={handleCheckBox}
                          inputProps={{ 'aria-label': 'checkbox' }}
                        />
                      }
                      label="Select to see Class Average Score and Class Average in %"
                    />
                  </FormGroup>
                </div>
              </div>
              <div className="overflow-x-auto">
                <AssignQuestionLevel checked={checked} linedata={linearr} />
              </div>
            </Wrapper>
          </div>
        </>
      )}
      <Setting
        dialogOpen={dialogOpen}
        openModal={() => setDialogOpen(!dialogOpen)}
        closeModal={() => setDialogOpen(false)}
      />
    </RouteLayout>
  );
}
