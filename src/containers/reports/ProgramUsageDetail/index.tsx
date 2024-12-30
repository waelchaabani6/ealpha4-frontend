/* eslint-disable linebreak-style */
/* eslint-disable indent */
/* eslint-disable comma-dangle */
import AdvanceTable from "@component/AdvancedTable/AdvanceTable";
import ButtonToggle from "@component/ToggleButton/ToggleButton";
import DatePicker from "@component/datepicker";
import Dropdown from "@component/dropdown/Dropdown";
import { CustomInput } from "@component/input";
import {
  GRAPH_LABELS,
  TABLE_LABELS,
  TOOLBAR_LABELS,
  USER_TYPE,
} from "@constants/constants";
import RouteLayout from "@layout/routeLayout";
import EmailIcon from "@mui/icons-material/Email";
import PrintIcon from "@mui/icons-material/Print";
import { useGet } from "@shared/api/useApi";
import Loader from "@shared/loader";
import { HeaderMenus } from "@shared/pageHeaderMenu/HeaderMenus";
import { selectSchoolData } from "@shared/store/schoolSlice";
import toast from "@shared/toast";
import Wrapper from "@shared/wrapper/Wrapper";
import { getNoOfPages } from "@utility/utility";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation, useParams } from "react-router-dom";
import ReactToPrint from "react-to-print";
import { CSVLink } from "react-csv";
import { ReactComponent as Share } from "@images/pageHeaderIcons/share.svg";
import CustomizedDialogs from "@component/dialog/CustomDialog";
import PageTitle from "@shared/pageTitle";
import DetailGraphView from "./DetailGraphView";

const TableColumns = [
  { label: TABLE_LABELS?.SR_NO, align: "center" },
  { label: TABLE_LABELS?.CLASSES, mapper: "class_name", align: "center" },
  { label: TABLE_LABELS?.TEACHERS, mapper: "teacher", align: "center" },
  {
    label: TABLE_LABELS?.NO_OF_STUDENT,
    mapper: "total_students",
    align: "center",
  },
  {
    label: TABLE_LABELS?.NO_OF_ACTIVE_STD,
    mapper: "number_of_active_students",
    align: "center",
  },
  {
    label: TABLE_LABELS?.NO_OF_NONACTIVE_STD,
    mapper: "number_of_non_active_students",
    align: "center",
  },
  {
    label: TABLE_LABELS?.NO_OF_ASSIGNMENT,
    align: "center",
    mapper: "total_assignment",
  },
  {
    label: TABLE_LABELS?.NO_OF_ASSESSMENT,
    align: "center",
    mapper: "total_assessments",
  },
];

const DialogTableColumns = [
  { label: TABLE_LABELS?.SR_NO, mapper: "id" },
  { label: "Name", mapper: "name" },
];

const ReportURL = import.meta.env.VITE_APP_REPORTS_SERVICE_URL;

export default function Index() {
  const location = useLocation();
  const componentRef = useRef(null);
  const { FromDate, ToDate, ProgramID, ProgramName, schoolName } = useParams();
  const { schoolData, branchData } = useSelector(selectSchoolData);

  const rowsPerPage = 10;
  const [csvData, setCsvData] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(ProgramID || "");
  const [view, setView] = useState("default");
  const [page, setPage] = useState(1);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [tableData, setTableData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [graph, setGraph] = useState("");
  const [totalStudent, setTotalStudent] = useState([]);
  const [totalAssignments, setTotalAssignments] = useState([]);
  const [totalAssessments, setTotalAssessments] = useState([]);
  const SCHOOL_ID = schoolData?.id || branchData?.school_data?.id || "";
  const noOfPages = getNoOfPages(totalRecords, rowsPerPage);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inactiveDialogOpen, setInactiveDialogOpen] = useState(false);
  const [totalStudentsDialogOpen, setTotalStudentsDialogOpen] = useState(false);
  const [popupTitle, setPopupTitle] = useState("");
  const [popupData, setPopupData] = useState({
    inactive_students: [],
    active_students: [],
    total_students_data: [],
  });

  const { refetch: ProgramDetails } = useGet({
    baseURL: ReportURL,
    url: `reports-service/program_usage_details_report/?school_id=${SCHOOL_ID}${selectedProgram ? `&selected_program=${selectedProgram}` : ""}&is_graph=${graph}&page=${page}&page_size=${rowsPerPage}`,
    onSuccess: (res) => {
      const ProgramData = res?.data?.response;
      const body = ProgramData?.data.map((i) => ({
        ...i,
        number_of_active_students: (
          <span
            role="presentation"
            className="text-accent underline cursor-pointer text-xs font-medium"
            onClick={() => {
              setPopupTitle("Active Students");
              setDialogOpen(true);
              setPopupData({
                active_students: i.active_students || [],
                inactive_students: [],
                total_students_data: [],
              });
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
              setPopupTitle("Total Students");
              setTotalStudentsDialogOpen(true);
              setPopupData({
                active_students: [],
                inactive_students: [],
                total_students_data: i.total_students_data || [],
              });
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
              setPopupTitle("Inactive Students");
              setInactiveDialogOpen(true);
              setPopupData({
                active_students: [],
                inactive_students: i.inactive_students || [],
                total_students_data: [],
              });
            }}
          >
            {i.number_of_non_active_students}
          </span>
        ),
      }));

      setTableData(body);
      setTotalRecords(ProgramData?.total_records);
    },
    enabled: false,
  });

  useEffect(() => {
    if (SCHOOL_ID) {
      ProgramDetails();
    }
  }, [page, SCHOOL_ID, graph, selectedProgram]);

  useEffect(() => {
    setGraph(view === "secondary" ? "yes" : "");
  }, [view]);

  const handlePagination = (currPage) => {
    setPage(currPage || 1);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleInactiveDialogClose = () => {
    setInactiveDialogOpen(false);
  };

  const handleTotalStudentsDialogClose = () => {
    setTotalStudentsDialogOpen(false);
  };

  return (
    <RouteLayout
      state={location?.state ? { page: location?.state?.page } : {}}
      navBack
    >
      <HeaderMenus
        title={`Report - Course Usage - ${view !== "default" ? "Graph View" : "Detailed View"}`}
        menuArray={[]}
      />
      <div className="flex gap-2 mt-7 lg:items-end items-center lg:flex-row flex-col">
        <div className="flex md:justify-start justify-center gap-2 lg:grow grow-0 items-end">
          {view === "default" && (
            <div className="max-w-[200px]">
              <CustomInput
                name="Program"
                label="Course"
                size="small"
                value={ProgramName}
                disabled={true}
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
              disableFuture={toDate ? new Date(toDate) : undefined}
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
              disableOld={fromDate ? new Date(fromDate) : undefined}
            />
          </div>
        </div>
        <ButtonToggle view={view} setView={setView} />
      </div>

      {view === "default" ? (
        <div className="wrapperBorder mt-3" ref={componentRef}>
          <Wrapper>
            <AdvanceTable
              tableData={tableData}
              headerRows={TableColumns}
              totalPages={noOfPages}
              paginateHandler={handlePagination}
              currentPage={page}
              rowsPerPage={rowsPerPage}
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
        open={totalStudentsDialogOpen}
        setOpen={handleTotalStudentsDialogClose}
        title={popupTitle}
      >
        {popupData?.total_students_data.length > 0 ? (
          <>
            <PageTitle title="Total Students" />
            <Wrapper>
              <AdvanceTable
                tableData={popupData.total_students_data}
                headerRows={DialogTableColumns}
              />
            </Wrapper>
          </>
        ) : (
          <p>No active students found</p>
        )}
      </CustomizedDialogs>
      <CustomizedDialogs
        maxwidth="sm"
        open={dialogOpen}
        setOpen={handleDialogClose}
        title={popupTitle}
      >
        {popupData?.active_students.length > 0 ? (
          <>
            <PageTitle title="Active Students" />
            <Wrapper>
              <AdvanceTable
                tableData={popupData.active_students}
                headerRows={DialogTableColumns}
              />
            </Wrapper>
          </>
        ) : (
          <p>No active students found</p>
        )}
      </CustomizedDialogs>

      <CustomizedDialogs
        maxwidth="sm"
        open={inactiveDialogOpen}
        setOpen={handleInactiveDialogClose}
        title={popupTitle}
      >
        {popupData?.inactive_students.length > 0 ? (
          <>
            <PageTitle title="Inactive Students" />
            <Wrapper>
              <AdvanceTable
                tableData={popupData.inactive_students}
                headerRows={DialogTableColumns}
              />
            </Wrapper>
          </>
        ) : (
          <p>No inactive students found</p>
        )}
      </CustomizedDialogs>
    </RouteLayout>
  );
}
