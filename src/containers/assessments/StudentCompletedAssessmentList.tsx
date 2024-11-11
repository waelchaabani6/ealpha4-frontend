import AdvanceTable from "@component/AdvancedTable/AdvanceTable";
import { CustomInput } from "@component/input";
import DebounceInput from "@component/input/DebounceInput";
import { ReactComponent as Share } from "@images/pageHeaderIcons/share.svg";
import EmailIcon from "@mui/icons-material/Email";
import PrintIcon from "@mui/icons-material/Print";
import { useGet } from "@shared/api/useApi";
import Loader from "@shared/loader";
import { HeaderMenus } from "@shared/pageHeaderMenu/HeaderMenus";
import toast from "@shared/toast";
import { getNoOfPages } from "@utility/utility";
import { useEffect, useRef, useState } from "react";
import { CSVLink } from "react-csv";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import ReactToPrint from "react-to-print";
import { useSelector } from "react-redux";
import CustomPagination from "../../components/pagination/CustomPagination";
import {
  RESULTS_PER_PAGE,
  TABLE_LABELS,
  TOOLBAR_LABELS,
} from "../../constants/constants";
import Wrapper from "../../shared/wrapper/Wrapper";
import RouteLayout from "../layout/routeLayout";

const printButton = () => <PrintIcon />;

export default function StudentCompletedAssessmentList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { aid } = useParams();
  const { user } = useSelector((state: any) => state);
  let formattedClassNames = searchParams.get("class");
  formattedClassNames = formattedClassNames.replace(/\s*\|\s*/g, ",");

  const headers = [
    TABLE_LABELS?.STUDENT_NAME,
    TABLE_LABELS?.START_DATE,
    TABLE_LABELS?.END_DATE,
    TABLE_LABELS?.SCORE,
  ];

  const [csvData, setCsvData] = useState<[]>([]);
  const [tableData, setTableData] = useState<any>([]);

  const TableColumns = [
    {
      label: TABLE_LABELS?.SR_NO,
      align: "center",
    },
    {
      label: TABLE_LABELS?.STUDENT_NAME,
      mapper: "student_name",
      filter_by: "first_name",
      isSort: true,
    },
    {
      label: TABLE_LABELS?.START_DATE,
      isSort: false,
      mapper: "start_date",
    },
    {
      label: TABLE_LABELS?.DUE_DATE,
      isSort: false,
      mapper: "submission_date",
    },
    {
      label: TABLE_LABELS?.SCORE,
      isSort: true,
      filter_by: "score",
      mapper: "percentage",
    },
  ];

  const [rowsPerPage, setRowsPerPage] = useState(RESULTS_PER_PAGE?.[0]);
  const [page, setPage] = useState(1);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [searchString, setSearchString] = useState("");
  const [order, setOrder] = useState<any>("desc");
  const [orderBy, setOrderBy] = useState<any>("");
  const [fromDate, setFromDate] = useState<any>(searchParams.get("start_date"));
  const [toDate, setToDate] = useState<any>(searchParams.get("end_date"));

  const noOfpages = getNoOfPages(totalDataCount, rowsPerPage);
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

  const actionHandler = (data: any, handlername: string) => {};

  const redirect = (url: any, user_ting: string, item: any) => {
    const obeasses_id = item?.obeasses_id;
    setConfig(user_ting, obeasses_id);
    navigate(url, {
      state: {
        obeasses_id,
        user_ting,
      },
    });
  };

  const setConfig = (user_ting: string, obeasses_id: string) => {
    const config = {
      apiKey: `${import.meta.env.VITE_APP_SDK}`,
      user: `${user?.first_name} ${user?.last_name}`,
      role: user?.role?.name,
      user_ting,
      obeasses_id,
    };
    fetch(`${import.meta.env.VITE_APP_IFRAME_APP_SDK}/api/config`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {})
      .catch((e) => {});
  };

  // ----------------------------------------API-------------------------
  // Get Assessment List
  const ordering = orderBy ? (order === "asc" ? orderBy : `-${orderBy}`) : "";
  const { isFetching: assignmentLoading, refetch: fetchAssignedAssignments } =
    useGet({
      baseURL: import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL,
      url: `assessments-service/assessment-student-details/?limit=${rowsPerPage}&offset=${(page - 1) * Number(rowsPerPage)}&ordering=${ordering}&search=${searchString}&assessment_id=${aid}&class_name=${formattedClassNames}`,
      onSuccess: (res: any) => {
        const accData = res?.data?.response;
        const respData = accData?.results;
        setTotalDataCount(accData.count);
        const schoolNameInURL = decodeURIComponent(
          location.pathname.split("/")[1]
        );
        const body: any = [];
        const newTableData = respData?.map((item: any) => {
          body.push([
            item?.student_name,
            item?.start_date,
            item?.submission_date,
            item?.score,
          ]);

          const link2 = `/${schoolNameInURL}/assessments/assigned/completed_assessments/completed_assessment_student_list/student_report/${aid}?user=${item?.user_ting}`;
          const temp = {
            ...item,
            student_name: (
              <span
                role="main"
                onClick={() => redirect(link2, item.user_ting, item)}
                className="text-accent underline cursor-pointer text-xs font-medium"
              >
                {item.student_name}
              </span>
            ),
          };
          return temp;
        });
        setCsvData(body);
        setTableData(newTableData);
      },
    });

  // Toolbar Email
  const {
    isRefetching: emailLoaded,
    isLoading: loadEmail,
    refetch: fetchEmailApi,
  } = useGet({
    baseURL: import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/assign-assessment-student-details-email/pdf-download/?assessment_id=${aid}&class_name=${searchParams.get("class")}`,
    onSuccess: (response: any) => {
      toast("success", "Email sent successfully");
    },
    onError: ({ response }: any) => {
      toast("error", response?.data?.message || "Error");
    },
    enabled: false,
  });

  // ----------------------------------------END API---------------------

  useEffect(() => {
    fetchAssignedAssignments();
  }, [rowsPerPage, page, orderBy, order, searchString, toDate, fromDate]);

  const ADMIN_TOOLBAR_MENU = [
    // {
    //   title: TOOLBAR_LABELS.EMAIL,
    //   icon: (emailLoaded || loadEmail) ? <Loader size={20} /> : <EmailIcon />
    // },
    {
      title: TOOLBAR_LABELS.EXPORT,
      icon: (
        <CSVLink
          filename="Student's Test Result List.csv"
          data={csvData}
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

  return (
    <RouteLayout navBack={true}>
      <HeaderMenus
        title={`${searchParams.get("assessment") || "Test"}`}
        menuArray={ADMIN_TOOLBAR_MENU}
        handleToolbarAction={handleToolbarAction}
      />
      <div className="flex gap-2 mt-7 lg:items-end items-center lg:flex-row flex-col ">
        <div className="flex md:justify-start justify-center gap-2 lg:grow grow-0 items-end">
          <div className="pt-[30px]">
            <DebounceInput onChange={handleSearch} />
          </div>
          <div className="max-w-[150px]">
            <CustomInput
              value={fromDate}
              label="From date"
              name="add_question"
              size="small"
              sx={{ backgroundColor: "var(--white)" }}
              disabled={true}
            />
          </div>
          <div className="max-w-[150px]">
            <CustomInput
              value={toDate}
              label="To date"
              name="add_question"
              size="small"
              sx={{ backgroundColor: "var(--white)" }}
              disabled={true}
            />
          </div>
          <div className="max-w-[150px]">
            <CustomInput
              value={searchParams.get("class")}
              label="Class"
              name="add_question"
              size="small"
              sx={{ backgroundColor: "var(--white)" }}
              disabled={true}
            />
          </div>
        </div>
        <CustomPagination
          totalPages={noOfpages}
          paginateHandler={handlePagination}
          currentPage={page}
        />
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
            actionHandler={actionHandler}
            isLoading={assignmentLoading}
          />
        </Wrapper>
      </div>
    </RouteLayout>
  );
}
