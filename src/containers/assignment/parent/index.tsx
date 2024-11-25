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
import { useLocation, useNavigate } from "react-router-dom";
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
const baseURL = import.meta.env.VITE_APP_ASSIGNMENT_SERVICE_URL;
const USER_SERVICE = import.meta.env.VITE_APP_USER_SERVICE_URL;

export default function Index() {
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state);
  const { userId } = useSelector(selectUser);
  const location = useLocation();

  const headers = [
    TABLE_LABELS?.SR_NO,
    TABLE_LABELS?.ASSIGNMENT_NAME,
    TABLE_LABELS?.COURSES,
    TABLE_LABELS?.TEACHER,
    TABLE_LABELS?.LESSONS,
    TABLE_LABELS?.STATUS,
    TABLE_LABELS?.START_DATE,
    TABLE_LABELS?.END_DATE,
    TABLE_LABELS?.SCORE,
  ];

  const [exportData, setExportData] = useState<[]>([]);
  const [tableData, setTableData] = useState<any>([]);

  const TableColumns = [
    {
      label: TABLE_LABELS?.SR_NO,
      align: "center",
    },
    {
      label: TABLE_LABELS?.ASSIGNMET_NAME,
      mapper: "assignment_name",
      isSort: true,
    },
    {
      label: TABLE_LABELS?.COURSES,
      isSort: true,
      mapper: "course_name",
    },
    {
      label: TABLE_LABELS?.TEACHER,
      isSort: true,
      mapper: "teacher_name",
    },
    {
      label: TABLE_LABELS?.LESSONS,
      mapper: "lesson_name",
    },
    {
      label: TABLE_LABELS?.STATUS,
      align: "center",
      mapper: "state",
    },
    {
      label: TABLE_LABELS?.START_DATE,
      isSort: true,
      mapper: "start_date",
      format: "DD-MM-YYYY",
    },
    {
      label: TABLE_LABELS?.DUE_DATE,
      isSort: true,
      mapper: "end_date",
      format: "DD-MM-YYYY",
    },
    {
      label: TABLE_LABELS?.SCORE,
      isSort: true,
      mapper: "score",
    },
    {
      label: TABLE_LABELS?.ACTION,
      mapper: "action",
      align: "center",
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
  const noOfpages = getNoOfPages(totalDataCount, rowsPerPage);
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedChild, setSelectedChild] = useState("");
  const [childrenData, setChildrenData] = useState<any>([]);

  const componentRef = useRef(null);

  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };

  const handleToolbarAction = async (title: string) => {
    if (title === TOOLBAR_LABELS.EMAIL) {
      fetchEmailApi();
    }
  };

  const handleSearch = (value: any) => {
    setSearchString(value);
  };

  const handleButtonClick = (data: any) => {
    navigate(`assignment-details/${data?.id}/${selectedChild}`);
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
    refetch: fetchEmailApi,
    isRefetching: refetchEmail,
  } = useGet({
    baseURL,
    url: `assignments-service/student-assigned-pdf-download/?student_id=${selectedChild}`,
    onSuccess: (response: any) => {
      toast(
        "success",
        "Email sent successfully to you, please check your inbox"
      );
    },
    retry: false,
    onError: ({ response }: any) => {
      toast("error", response?.data?.message || "Unable to send email");
    },
    enabled: false,
  });

  const ADMIN_TOOLBAR_MENU = [
    // {
    //   title: TOOLBAR_LABELS.EMAIL,
    //   icon: (emailLoaded || refetchEmail) ? <Loader size={20} /> : <EmailIcon />
    // },
    {
      title: TOOLBAR_LABELS.EXPORT,
      icon: (
        <CSVLink
          filename="Student Assignment List.csv"
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

  // ----------------------------------------API-------------------------
  // Get Childrens List
  const { isLoading: childrenLoading, refetch: childrenFetch } = useGet({
    baseURL: USER_SERVICE,
    url: `users-service/parent-student-details/${userId}/`,
    onSuccess: (res: any) => {
      const resp = res?.data?.response?.students;
      const body: any = [];
      resp?.map((i: any) => {
        body.push({
          label: `${i?.first_name} ${i?.last_name}`,
          value: i?.id,
          class: i?.class_name,
        });
        const compare = (a: any, b: any) => {
          if (a.label < b.label) {
            return -1;
          }
          if (a.label > b.label) {
            return 1;
          }
          return 0;
        };
        body.sort(compare);
        return body;
      });
      setSelectedChild(body[0].value);
      setChildrenData([...body]);
    },
    onError: () => {},
  });

  // ----------------------------------------API-------------------------
  // Get Assessment List
  const ordering = orderBy ? (order === "asc" ? orderBy : `-${orderBy}`) : "";
  const { isFetching: assignmentLoading, refetch: fetchAssignedAssignments } =
    useGet({
      baseURL,
      url: `assignments-service/student/assignment/list/?limit=${rowsPerPage}&offset=${(page - 1) * Number(rowsPerPage)}&ordering=${ordering}${searchString ? `&search=${searchString}` : ""}${selectedStatus !== "All" ? `&state=${selectedStatus}` : ""}${selectedChild ? `&student_id=${selectedChild}` : ""}${fromDate ? `&start_date=${moment(fromDate).format("YYYY-MM-DD")}` : ""}${toDate ? `&end_date=${moment(toDate).format("YYYY-MM-DD")}` : ""}`,
      onSuccess: (res: any) => {
        const accData = res?.data;
        const respData = accData?.results;
        setTotalDataCount(accData.count);
        const body: any = [];
        const newTableData = respData?.map((item: any) => {
          body.push([
            item?.id,
            item?.assignment_name,
            item?.subject_name,
            item?.teacher_name,
            item?.lesson_name,
            item?.state,
            item?.start_date,
            item?.end_date,
            item?.score,
          ]);
          const temp = {
            ...item,
            action:
              item.state === "Completed" ? (
                <Button onClick={() => handleButtonClick(item)}>
                  Get Report
                </Button>
              ) : null,
          };
          return temp;
        });
        setTableData(newTableData);
        setExportData(body);
      },
      enabled: false,
    });

  // ----------------------------------------END API---------------------

  useEffect(() => {
    if (userId) {
      childrenFetch();
    }
  }, [userId]);

  useEffect(() => {
    if (childrenData.length) {
      setSelectedChild(childrenData[0].value);
    }
  }, [childrenData]);

  useEffect(() => {
    if (selectedChild) {
      fetchAssignedAssignments();
    }
  }, [
    searchString,
    rowsPerPage,
    page,
    orderBy,
    order,
    selectedStatus,
    selectedChild,
    toDate,
    fromDate,
  ]);
  return (
    <RouteLayout>
      <HeaderMenus
        title="Assignments"
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
              width: "200px", // Override the width to 250px
            }}
          />
          <Dropdown
            title="Select Child"
            value={selectedChild}
            displayEmpty={true}
            dataArray={childrenData}
            onChangeHandler={(value) => setSelectedChild(value)}
            loading={childrenLoading}
            sxClass={{
              width: "230px", // Override the width to 250px
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
              disablePast={false}
              disableFuture={toDate}
            />
          </div>
          <div>
            <DatePicker
              value={toDate}
              label="To"
              disablePast={false}
              disableOld={fromDate}
              handlePickerChange={(date: string) => setToDate(date)}
              sxType={1}
              defaultStyle={true}
              format="YYYY-MM-DD"
            />
          </div>
          <Dropdown
            title="Result Of Pages"
            value={rowsPerPage}
            dataArray={RESULTS_PER_PAGE}
            onChangeHandler={handlePerPage}
            sxClass={{ width: "95px", marginRight: "5px" }}
          />
          {fromDate || toDate ? (
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
          ) : null}
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
            isLoading={assignmentLoading || childrenLoading}
          />
        </Wrapper>
      </div>
    </RouteLayout>
  );
}
