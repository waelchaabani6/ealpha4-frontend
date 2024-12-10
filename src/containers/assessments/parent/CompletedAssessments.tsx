import AdvanceTable from "@component/AdvancedTable/AdvanceTable";
import Button from "@component/button/button";
import DatePicker from "@component/datepicker";
import Dropdown from "@component/dropdown/Dropdown";
import DebounceInput from "@component/input/DebounceInput";
import { ReactComponent as Share } from "@images/pageHeaderIcons/share.svg";
import EmailIcon from "@mui/icons-material/Email";
import PrintIcon from "@mui/icons-material/Print";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useGet } from "@shared/api/useApi";
import Loader from "@shared/loader";
import { HeaderMenus } from "@shared/pageHeaderMenu/HeaderMenus";
import { selectUser } from "@shared/store/userSlice";
import toast from "@shared/toast";
import { getNoOfPages } from "@utility/utility";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { CSVLink } from "react-csv";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import ReactToPrint from "react-to-print";
import CustomPagination from "../../../components/pagination/CustomPagination";
import {
  RESULTS_PER_PAGE,
  TABLE_LABELS,
  TOOLBAR_LABELS,
} from "../../../constants/constants";
import Wrapper from "../../../shared/wrapper/Wrapper";
import RouteLayout from "../../layout/routeLayout";

const printButton = () => <PrintIcon />;

export default function CompletedAssessments() {
  const { schoolName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const headers = [
    TABLE_LABELS?.SR_NO,
    TABLE_LABELS?.ASSESSMENT_NAME,
    TABLE_LABELS?.TEACHER,
    TABLE_LABELS?.START_DATE,
    TABLE_LABELS?.DUE_DATE,
  ];

  const [exportData, setExportData] = useState<[]>([]);
  const [tableData, setTableData] = useState<any>([]);

  const TableColumns = [
    {
      label: TABLE_LABELS?.SR_NO,
      align: "center",
    },
    {
      label: TABLE_LABELS?.ASSESSMENT_NAME,
      mapper: "assessment_name",
      isSort: true,
    },
    {
      label: TABLE_LABELS?.TEACHERS,
      isSort: true,
      mapper: "teacher",
    },
    {
      label: TABLE_LABELS?.START_DATE,
      isSort: true,
      mapper: "start_date",
      format: "DD-MM-YYYY",
    },
    {
      label: TABLE_LABELS?.DUE_DATE,
      align: "center",
      mapper: "submission_date",
      format: "DD-MM-YYYY",
    },
    {
      label: TABLE_LABELS?.ACTION,
      mapper: "action",
    },
  ];

  const statusArray = [
    { label: "All", value: "All" },
    { label: "Ongoing", value: "Ongoing" },
    { label: "Submitted", value: "Submitted" },
    { label: "Yet to Start", value: "Yet to start" },
  ];

  const [rowsPerPage, setRowsPerPage] = useState(RESULTS_PER_PAGE?.[0]);
  const [page, setPage] = useState(1);
  const [totalDataCount, setTotalDataCount] = useState(0);

  const [searchString, setSearchString] = useState("");
  const [order, setOrder] = useState<any>("desc");
  const [orderBy, setOrderBy] = useState<any>("created_at");
  const [fromDate, setFromDate] = useState<any>("");
  const [toDate, setToDate] = useState<any>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedChild, setSelectedChild] = useState("");
  const [childrenData, setChildrenData] = useState<any>([]);
  const { userId } = useSelector(selectUser);

  const noOfpages = getNoOfPages(totalDataCount, rowsPerPage);
  const componentRef = useRef(null);

  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };

  const handleToolbarAction = async (title: string) => {
    if (title === TOOLBAR_LABELS.EMAIL) {
      fetchEmailApi();
    } else if (title === TOOLBAR_LABELS.IMPORT) {
      fetchEmailApi();
    }
  };

  const handleSearch = (value: any) => {
    setSearchString(value);
  };

  const reset = () => {
    setToDate("");
    setFromDate("");
  };
  const handlePerPage = (e: any) => {
    setRowsPerPage(e);
  };

  // Toolbar Email
  const {
    isLoading: emailLoaded,
    isRefetching: refetchEmail,
    refetch: fetchEmailApi,
  } = useGet({
    baseURL: import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/assign-assessment-student-list/pdf-download/?student_id=${selectedChild}`,
    onSuccess: (response: any) => {
      toast("success", "Email sent successfully");
    },
    onError: ({ response }: any) => {
      toast("error", response?.data?.message || "Error");
    },
    enabled: false,
  });

  const handleButtonClick = (data: any) => {
    const selectedChildId = childrenData?.find(
      (i: any) => i.value === selectedChild
    );
    navigate(
      `/${schoolName}/assessments/assigned/assessment-report/${data?.assessment_id}?assessment=${data?.assessment_name}&user_ting=${selectedChildId?.user_ting || ""}`,
      {
        state: {
          page,
          path: `/${schoolName}/assessments/completed-assessments`,
        },
      }
    );
  };

  // ----------------------------------------API-------------------------
  // Get Childrens List
  const { isLoading: childrenLoading, refetch: childrenFetch } = useGet({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/parent-student-details/${userId}/`,
    onSuccess: (res: any) => {
      const resp = res?.data?.response?.students;
      const body: any = [];
      resp?.map((i: any) => {
        body.push({
          label: `${i?.first_name} ${i?.last_name}`,
          value: i?.id,
          class: i?.class_name,
          user_ting: i?.user_ting,
        });
        return true;
      });
      // setSelectedChild(body[0].value);
      setChildrenData([...body]);
    },
    onError: () => {},
  });

  useEffect(() => {
    if (childrenData.length) {
      setSelectedChild(childrenData[0].value);
    }
  }, [childrenData]);

  // ----------------------------------------API-------------------------
  // Get Assessment List
  const ordering = !orderBy.includes("teacher")
    ? order === "asc"
      ? orderBy
      : `-${orderBy}`
    : "";
  const endpointOrderBy = orderBy.includes("teacher")
    ? order === "asc"
      ? orderBy
      : `-${orderBy}`
    : "";
  const { isFetching: assignmentLoading, refetch: fetchAssignedAssignments } =
    useGet({
      baseURL: import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL,
      url: `assessments-service/completed-assign-assessment-student-list/?student_id=${selectedChild}&limit=${rowsPerPage}&offset=${(page - 1) * Number(rowsPerPage)}&ordering=${ordering}&orderBy=${endpointOrderBy}${searchString ? `&search=${searchString}` : ""}${selectedStatus !== "All" ? `&status=${selectedStatus}` : ""}${fromDate ? `&start_date=${moment(fromDate).format("YYYY-MM-DD")}` : ""}${toDate ? `&submission_date=${moment(toDate).format("YYYY-MM-DD")}` : ""}`,
      onSuccess: (res: any) => {
        const accData = res?.data?.response;
        const respData = accData?.results;
        setTotalDataCount(accData.count);
        const body: any = [];
        const newTableData = respData?.map((item: any) => {
          body.push([
            item?.id,
            item?.assessment_name,
            item?.teacher,
            item?.start_date,
            item?.submission_date,
          ]);

          const temp = {
            ...item,
            action: (
              <Button onClick={() => handleButtonClick(item)}>
                Get Report
              </Button>
            ),
          };
          return temp;
        });
        setExportData(body);
        setTableData(newTableData);
      },
      enabled: false,
    });

  // ----------------------------------------END API---------------------

  const ADMIN_TOOLBAR_MENU = [
    // {
    //   title: TOOLBAR_LABELS.EMAIL,
    //   icon: (emailLoaded || refetchEmail) ? <Loader size={20} /> : <EmailIcon />
    // },
    {
      title: TOOLBAR_LABELS.EXPORT,
      icon: (
        <CSVLink
          filename="Completed Student Assessment List.csv"
          data={exportData}
          headers={headers}
          enclosingCharacter=""
        >
          <Share />
        </CSVLink>
      ),
    },
    {
      title: TOOLBAR_LABELS.PRINT,
      icon: (
        <ReactToPrint
          trigger={printButton}
          content={() => componentRef.current}
        />
      ),
    },
  ];

  useEffect(() => {
    if (selectedChild && selectedChild !== "") {
      fetchAssignedAssignments();
    }
  }, [
    rowsPerPage,
    page,
    orderBy,
    order,
    searchString,
    selectedChild,
    toDate,
    fromDate,
  ]);

  if (emailLoaded) {
    <div className="backdrop-blur-sm bg-white/30 w-screen h-screen absolute z-50 top-0 left-0 grid place-items-center">
      <Loader size={50} />
    </div>;
  }

  useEffect(() => {
    if (location?.state?.page) {
      setPage(location?.state?.page);
    }
  }, []);

  return (
    <RouteLayout>
      <HeaderMenus
        title="Completed Assessments"
        menuArray={ADMIN_TOOLBAR_MENU}
        handleToolbarAction={handleToolbarAction}
      />
      <div className="flex gap-2 mt-7 lg:items-end items-center lg:flex-row flex-col ">
        <div className="flex md:justify-start justify-center gap-2 lg:grow grow-0 items-end">
          <div className="pt-[30px]">
            <DebounceInput onChange={handleSearch} />
          </div>
          <Dropdown
            title="Sort by: Status"
            value={selectedStatus}
            dataArray={statusArray}
            onChangeHandler={(value) => setSelectedStatus(value)}
            sxClass={{
              width: "200px",
            }}
          />
          <Dropdown
            title="Select Child"
            value={selectedChild}
            dataArray={childrenData}
            displayEmpty={true}
            onChangeHandler={(value) => setSelectedChild(value)}
            loading={childrenLoading}
            sxClass={{
              width: "230px",
            }}
          />
          <div>
            <DatePicker
              value={fromDate}
              label="From"
              handlePickerChange={(date: string) => setFromDate(date)}
              sxType={1}
              defaultStyle={true}
              format="YYYY-MM-DD"
              disableFuture={toDate}
              disablePast={false}
            />
          </div>
          <div>
            <DatePicker
              value={toDate}
              label="To"
              handlePickerChange={(date: string) => setToDate(date)}
              sxType={1}
              defaultStyle={true}
              format="YYYY-MM-DD"
              disablePast={false}
              disableOld={fromDate}
            />
          </div>
          <Dropdown
            title="Result Of Pages"
            value={rowsPerPage}
            dataArray={RESULTS_PER_PAGE}
            onChangeHandler={handlePerPage}
            sxClass={{ width: "100px", marginRight: "5px" }}
          />
          <div className="flex gap-2 justify-center items-center h-[36px]">
            <span
              tabIndex={0}
              title="Clear dates"
              onClick={reset}
              role="button"
            >
              <RestartAltIcon />
            </span>
          </div>
          <div className="flex gap-2 justify-center items-center h-[36px]">
            <Link
              to={`/${schoolName}/assessments`}
              className="cursor-pointer h-full font-medium underline flex items-center md:border-l-2 px-2 border-gray-300 text-accent"
            >
              Assigned Assessments
            </Link>
          </div>
        </div>
        <CustomPagination
          totalPages={noOfpages}
          paginateHandler={handlePagination}
          currentPage={page}
        />
      </div>
      <div className="flex mt-3">
        <div className="mr-12">
          <span className="text-sm font-semibold">Child Name: </span>
          <span className="text-sm font-normal">
            {
              childrenData?.find((obj: any) => obj?.value === selectedChild)
                ?.label
            }
          </span>
        </div>
        <div>
          <span className="text-sm font-semibold">Class: </span>
          <span className="text-sm font-normal">
            {
              childrenData?.find((obj: any) => obj?.value === selectedChild)
                ?.class
            }
          </span>
        </div>
      </div>
      {/* Table Section */}
      <div className="wrapperBorder mt-3" ref={componentRef}>
        <Wrapper>
          <AdvanceTable
            tableData={tableData}
            headerRows={TableColumns}
            totalPages={noOfpages}
            paginateHandler={handlePagination}
            currentPage={page}
            setPage={setPage}
            rowsPerPage={rowsPerPage}
            orderBy={orderBy}
            setOrderBy={setOrderBy}
            order={order}
            setOrder={setOrder}
            isLoading={assignmentLoading}
          />
        </Wrapper>
      </div>
    </RouteLayout>
  );
}
