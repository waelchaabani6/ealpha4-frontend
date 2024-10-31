/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-confusing-arrow */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable operator-linebreak */
/* eslint-disable indent */
/* eslint-disable comma-dangle */
import ButtonToggle from "@component/ToggleButton/ToggleButton";
import { IconButton } from "@component/button/button";
import DatePicker from "@component/datepicker";
import Dropdown from "@component/dropdown/Dropdown";
import { ReactComponent as Share } from "@images/pageHeaderIcons/share.svg";
import PrintIcon from "@mui/icons-material/Print";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SettingsIcon from "@mui/icons-material/Settings";

import { useGet, usePost } from "@shared/api/useApi";
import { HeaderMenus } from "@shared/pageHeaderMenu/HeaderMenus";
import { selectSchoolData } from "@shared/store/schoolSlice";
import { selectUser } from "@shared/store/userSlice";
import toast from "@shared/toast";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { CSVLink } from "react-csv";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import ReactToPrint from "react-to-print";
import { CustomInput } from "@component/input";
import { sortData } from "@utility/utility";
import {
  TABLE_LABELS,
  RESULTS_PER_PAGE,
  TOOLBAR_LABELS,
  USER_TYPE,
} from "../../../constants/constants";
import RouteLayout from "../../layout/routeLayout";

import RadialBarChartOne from "../RadialBarChart/RadialBarChartOne";
import Setting from "../setting";
import ReportTable from "./ReportTable";
import ReportGraph from "./ReportGraph";

const printButton = () => <PrintIcon />;

const TableColumns: any = [
  {
    label: TABLE_LABELS?.SR_NO,
    mapper: "SR_NO",
    align: "center",
  },
  {
    label: TABLE_LABELS?.CLASS,
    mapper: "Class",
    isSort: true,
  },
  {
    label: TABLE_LABELS?.TEACHER,
    isSort: true,
    mapper: "Teacher",
  },
  {
    label: TABLE_LABELS?.PROGRAM,
    isSort: true,
    mapper: "Program",
  },
  {
    label: TABLE_LABELS?.ASSIGNMENT_NAME,
    isSort: true,
    mapper: "AssessmentName",
  },
  {
    label: TABLE_LABELS?.AVG_CLASS,
    isSort: true,
    bodyAlign: "center",
    colspan: 2,
    mapper: "AvgClassScore",
  },
  {
    isSort: true,
    bodyAlign: "center",
    mapper: "AvgClassPercentage",
  },
  {
    label: TABLE_LABELS?.AVG_COHORT,
    isSort: true,
    bodyAlign: "center",
    colspan: 2,
    mapper: "AvgCohortScore",
  },
  {
    isSort: true,
    bodyAlign: "center",
    mapper: "AvgCohortPercentage",
  },
  {
    label: TABLE_LABELS?.START_DATE,
    isSort: true,
    mapper: "StartDate",
  },
  {
    label: TABLE_LABELS?.END_DATE,
    isSort: true,
    mapper: "EndDate",
  },
  {
    label: TABLE_LABELS?.PERFORMANCE_EXPECTATION,
    isSort: true,
    mapper: "PerformanceExpectation",
  },
];

const ReportURL = import.meta.env.VITE_APP_REPORTS_SERVICE_URL;

const csvSubHeaders = [
  TABLE_LABELS?.CLASS_NAME,
  // TABLE_LABELS?.TEACHER,
  TABLE_LABELS?.PROGRAM,
  TABLE_LABELS?.ASSIGNMET_NAME,
  TABLE_LABELS?.AVG_CLASS,
  TABLE_LABELS?.CLASS_PER,
  TABLE_LABELS?.AVG_COHORT,
  TABLE_LABELS?.COHORT_PER,
  TABLE_LABELS?.START_DATE,
  TABLE_LABELS?.END_DATE,
  TABLE_LABELS?.PERFORMANCE_EXPECTATION,
];

export default function Index() {
  const location = useLocation();
  const { userId } = useSelector(selectUser);
  const [csvData, setCsvData] = useState<[]>([]);
  const [tableData, setTableData] = useState<any>([]);
  const { schoolData, branchData } = useSelector(selectSchoolData);
  const { SCHOOL_ADMIN, BRANCH_ADMIN, TEACHER } = USER_TYPE;
  const ALL = { label: "All", value: "All" };
  const SCHOOL_ID = schoolData?.id || branchData?.school_data?.id || "";
  const BRANCH_ID = branchData?.id || "";

  // email api
  const {
    isRefetching: emailSendLoading,
    refetch: sendEmail,
    isLoading: emailLoad,
  } = useGet({
    baseURL: ReportURL,
    url: `reports-service/assignment_report/send_email/?user_id=${userId}&school_id=${SCHOOL_ID}`,
    onSuccess: () => {
      toast("success", "Email sent successfully");
    },
    retry: false,
    onError: ({ response }: any) => {
      toast("error", response?.data?.message || "Unable to send email");
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
      title: "Export",
      icon: (
        <CSVLink
          filename="Report Assignment.csv"
          data={csvData}
          headers={csvSubHeaders}
          enclosingCharacter=""
        >
          <Share />
        </CSVLink>
      ),
    },
    {
      title: "Print",
      icon: (
        <ReactToPrint
          trigger={printButton}
          content={() => componentRef.current}
        />
      ),
    },
  ];

  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageSize, setPageSize] = useState<any>(RESULTS_PER_PAGE?.[0]);
  const noOfpages = Math.ceil(totalRecords / pageSize);
  const [fromDate, setFromDate] = useState<any>("");
  const [toDate, setToDate] = useState<any>("");
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [graph, setGraph] = useState("");
  const [view, setView] = React.useState("default");
  const [colvalue, setColValue] = React.useState(5);
  const [TableColumn, setTableColumn] = useState([]);
  const [classArray, setClassArray] = useState<any>([]);
  const userData = useSelector((state: any) => state?.user);
  const { user } = useSelector((state: any) => state);
  const [selectedClass, setSelectedClass] = useState<any>(`All`);
  const [BranchArray, setBranchArray] = useState<any>([]);
  const [selectedBranch, setselectedBranch] = useState(
    `${branchData?.name || "All"}`
  );
  const [lineArray, setLineArray] = useState([]);
  const [line, setLine] = useState(0);
  const componentRef = useRef(null);
  const schoolNameInURL = decodeURIComponent(location.pathname.split("/")[1]);
  const [percentage, setPercentage] = useState("false");
  const [scoreData, setScoreData] = useState([]);
  const [PercengateData, setPerData] = useState([]);
  const [PerformanceData, SetPerformanceData] = useState([]);

  const link = `/${schoolNameInURL}/reports/report-assignment-details`;

  const USER_ROLE = userData?.role?.name;

  const handleDialog = () => {
    setDialogOpen(!dialogOpen);
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

  const userColumn = () => {
    const filteredArray: any = TableColumns?.filter(
      (obj: any) => obj.mapper !== USER_ROLE
    );
    if (USER_ROLE === TEACHER) {
      setTableColumn(filteredArray);
      setColValue(4);
    } else {
      setTableColumn(TableColumns);
    }
  };

  // Fetch Classes for School
  const { isLoading: loadClassesForSchool, refetch: ClassesForSchool } = useGet(
    {
      baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
      url: `schools-service/school-classes/?limit=1000&school_id=${SCHOOL_ID}${selectedBranch !== "All" ? `&branch_name=${selectedBranch}` : ""}&ordering=name`,
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
      const branchArray: never[] = respData.map((i: any) => ({
        label: i?.name,
        value: i?.name,
        id: i?.id,
      }));
      branchArray?.sort(sortData);
      setBranchArray(branchArray);
    },
    enabled: USER_ROLE === SCHOOL_ADMIN || USER_ROLE === BRANCH_ADMIN,
  });

  const branchid =
    selectedBranch !== "All"
      ? BranchArray?.find((i: any) => i?.label === selectedBranch)?.id ||
        BRANCH_ID ||
        ""
      : "";

  const { isFetching: reportLoading, refetch: FetchAssignmentReport } = useGet({
    baseURL: ReportURL,
    url: `reports-service/assignment_report/?user_id=${userId}&page=${page}&page_size=${pageSize}&school_id=${SCHOOL_ID}${fromDate ? `&from_date=${moment(fromDate).format("YYYY-MM-DD")}` : ""}${toDate ? `&to_date=${moment(toDate).format("YYYY-MM-DD")}` : ""}${selectedClass !== "All" ? `&selected_class=${selectedClass}` : ""} ${graph ? `&is_graph=${graph}` : ""}${line ? `&is_line_chart=${line}` : ""}&branch_id=${branchid}`,
    onSuccess: (res: any) => {
      if (line === 1) {
        const accData = res?.data?.response;

        const LineData = accData?.line_chart;
        const linebody: any = [];
        LineData?.map((i: any) => {
          linebody.push({
            Name: i?.name,
            class: i?.class_percent,
            cohort: i.cohort_percent,
          });
          return true;
        });
        setLineArray(linebody);
      } else {
        const accData = res?.data?.response;
        const respData = accData?.data;
        const records = accData?.total_records;
        const ScoreData = accData?.score_data || [];
        const PerData = accData?.percent_data || [];
        const PerformanceValue = accData?.performance_expectation || [];
        const LineData = accData?.line_chart || [];
        const body: any = [];
        const csvbody: any = [];
        // table data
        respData?.map((i: any, index: any) => {
          body.push({
            SR_NO: i.Sr_No,
            Class: i.class_name,
            Teacher: i.teacher_name,
            Program: i.program,
            Assignment_ID: i.assignment_id_id,
            AssessmentName: i.assignment_name,
            AvgClassPercentage: i.score_in_percent
              ? i.score_in_percent.toFixed(2)
              : "",
            PerformanceExpectation: i.performance_expectation,
            AvgClassScore: `${i.class_total_score?.toFixed(2) ? i.class_total_score?.toFixed(2) : ""}/ ${i.class_total_max_score?.toFixed(2) ? i.class_total_max_score?.toFixed(2) : ""} `,
            AvgCohortScore: `${i.cohort_score ? i.cohort_score : ""}/ ${i.cohort_total_score ? i.cohort_total_score : ""} `,
            AvgCohortPercentage: i.cohort_score_in_percent
              ? i.cohort_score_in_percent.toFixed(2)
              : "",
            StartDate: i.start_date,
            EndDate: i.end_date,
            CourseTableId: i.course_table_id,
            classId: i.class_id,
          });
          const avgClassScore = `${
            i.class_total_score ? i.class_total_score : ""
          }/ ${i.class_total_max_score ? i.class_total_max_score : ""} `;
          const avgClassPercen = i.score_in_percent
            ? i.score_in_percent.toFixed(2)
            : "";
          const avgCohortScore = `${i.cohort_score ? i.cohort_score : ""}/ ${
            i.cohort_total_score ? i.cohort_total_score : ""
          } `;
          const avgCohortPercen = i.cohort_score_in_percent
            ? i.cohort_score_in_percent.toFixed(2)
            : "";
          csvbody.push([
            i.class_name,
            // i.teacher_name,
            i.program,
            i.assignment_name,
            avgClassScore,
            avgClassPercen,
            avgCohortScore,
            avgCohortPercen,
            i.start_date,
            i.end_date,
            i.performance_expectation,
          ]);
          return true;
        });

        const modifiedRows = body.map((row: any) => {
          if (row.PerformanceExpectation === "Meets") {
            return {
              ...row,
              PerformanceExpectation: (
                <div className="bg-[#FFF9BE] p-4">
                  {row?.PerformanceExpectation}
                </div>
              ),
            };
          }
          if (row.PerformanceExpectation === "Above") {
            return {
              ...row,
              PerformanceExpectation: (
                <div className="bg-[#d9ffc8] p-4">
                  {row?.PerformanceExpectation}
                </div>
              ),
            };
          }
          if (row.PerformanceExpectation === "Does Not Meet") {
            return {
              ...row,
              PerformanceExpectation: (
                <div className="bg-[#FCD4C6] p-4">
                  {row?.PerformanceExpectation}
                </div>
              ),
            };
          }
          if (row.PerformanceExpectation === "Exceeds") {
            return {
              ...row,
              PerformanceExpectation: (
                <div className="bg-[#BECCFF] p-4">
                  {row?.PerformanceExpectation}
                </div>
              ),
            };
          }
          if (row.PerformanceExpectation === "Approaching") {
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

        setTableData(modifiedRows);
        if (graph !== "yes") {
          setCsvData(csvbody);
        }
        setTotalRecords(records);
        // per data
        const perbody: any = [];
        PerData?.map((i: any) => {
          perbody.push({
            percentage: i?.class_percent,
            cohort: i.cohort_percent,
            name: i.name,
          });
          return true;
        });
        setPerData(perbody);

        // score data
        const scorebody: any = [];
        ScoreData?.map((i: any) => {
          scorebody.push({
            score: i?.class_score,
            cohort: i.cohort_score,
            name: i.name,
          });
          return true;
        });
        setScoreData(scorebody);
        SetPerformanceData(PerformanceValue);
        const linebody: any = [];
        LineData?.map((i: any) => {
          linebody.push({
            Name: i?.name,
            class: i?.class_percent,
            cohort: i.cohort_percent,
          });
          return true;
        });
        setLineArray(linebody);
      }
    },
    onError: ({ response }: any) => {},
    enabled: false,
  });

  const fetchClassList = () => {
    if (USER_ROLE === SCHOOL_ADMIN || USER_ROLE === BRANCH_ADMIN) {
      ClassesForSchool();
    } else if (USER_ROLE === TEACHER && user?.user_profile_id) {
      ClassesForTeacher({
        teacher_id: user?.user_profile_id,
      });
    }
  };

  const reset = () => {
    setFromDate("");
    setToDate("");
    setPercentage("false");
    setLine(0);
  };

  useEffect(() => {
    if (view === "secondary") {
      setGraph("yes");
    } else {
      setGraph("");
    }
    reset();
  }, [view]);

  useEffect(() => {
    setSelectedClass("All");
    if (selectedBranch) {
      fetchClassList();
    }
  }, [selectedBranch]);

  useEffect(() => {
    if (SCHOOL_ID) {
      FetchAssignmentReport();
    }
  }, [
    graph,
    selectedClass,
    fromDate,
    toDate,
    page,
    pageSize,
    selectedBranch,
    SCHOOL_ID,
  ]);

  useEffect(() => {
    if (USER_ROLE) {
      userColumn();
    }
  }, [USER_ROLE]);

  useEffect(() => {
    if (location?.state?.page) {
      setPage(location?.state?.page);
    }
  }, []);

  const handlePerPage = (e: any) => {
    setPage(page);
    setPageSize(e);
  };

  return (
    <RouteLayout navBack={true}>
      <HeaderMenus
        title={`Report -  ${view === "default" ? "" : "Multiple"} Assignments`}
        menuArray={ADMIN_TOOLBAR_MENU}
        handleToolbarAction={handleToolbarAction}
      />

      <div className="flex gap-2 mt-7 lg:items-end items-center lg:flex-row flex-col ">
        <div className="flex md:justify-start justify-center gap-2 lg:grow grow-0 items-end">
          {userData && USER_ROLE === USER_TYPE.SCHOOL_ADMIN && (
            <Dropdown
              displayEmpty={false}
              title="Select Branch"
              value={selectedBranch || "All"}
              dataArray={[{ label: "All", value: "All" }, ...BranchArray]}
              onChangeHandler={(val) => {
                setselectedBranch(val);
              }}
              sxClass={{ width: "206px", marginRight: "10px" }}
            />
          )}

          {userData && USER_ROLE === USER_TYPE.BRANCH_ADMIN && (
            <div className="w-max">
              <CustomInput
                name="Branch Name"
                label="Branch Name"
                size="small"
                value={branchData?.name || ""}
                disabled={true}
              />
            </div>
          )}

          {userData &&
            (USER_ROLE === SCHOOL_ADMIN ||
              USER_ROLE === BRANCH_ADMIN ||
              USER_ROLE === TEACHER) && (
              <div>
                <Dropdown
                  title="Select a class"
                  value={selectedClass || "All"}
                  dataArray={[ALL, ...classArray]}
                  onChangeHandler={(val) => {
                    setSelectedClass(val);
                  }}
                  sxClass={{ width: "206px", marginRight: "5px" }}
                />
              </div>
            )}

          <div>
            <DatePicker
              value={fromDate}
              label="From"
              handlePickerChange={(date: string) => setFromDate(date)}
              sxType={4}
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
              sxType={4}
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

          <div>
            <Dropdown
              title="Result Of Pages"
              value={pageSize}
              dataArray={RESULTS_PER_PAGE}
              onChangeHandler={handlePerPage}
              sxClass={{ width: "206px", marginRight: "5px" }}
            />
          </div>
          <IconButton onClick={handleDialog} sx={{ boxShadow: "none" }}>
            <SettingsIcon fontSize="small" />
          </IconButton>
        </div>
        <div>
          <ButtonToggle view={view} setView={setView} />
        </div>
      </div>

      {/* Table Section */}
      {view === "default" ? (
        <ReportTable
          tableData={tableData}
          componentRef={componentRef}
          handlePagination={handlePagination}
          page={page}
          noOfpages={noOfpages}
          link={link}
          TableColumn={TableColumn}
          colvalue={colvalue}
        />
      ) : (
        <>
          {scoreData.length > 1 ? (
            <ReportGraph
              componentRef={componentRef}
              scoreData={scoreData}
              PercengateData={PercengateData}
              lineArray={lineArray}
              PerformanceData={PerformanceData}
              BranchArray={BranchArray}
              selectedBranch={selectedBranch}
              setselectedBranch={setselectedBranch}
              selectedClass={selectedClass}
              classArray={classArray}
              setSelectedClass={setSelectedClass}
              setLine={setLine}
              percentage={percentage}
              setPercentage={setPercentage}
            />
          ) : (
            <div ref={componentRef}>
              <div className="p-4 bg-white border border-accent rounded-md mt-5">
                {scoreData.length ? (
                  <RadialBarChartOne tabledata={scoreData} />
                ) : (
                  <p>
                    <i>No data</i>
                  </p>
                )}
              </div>
            </div>
          )}
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
