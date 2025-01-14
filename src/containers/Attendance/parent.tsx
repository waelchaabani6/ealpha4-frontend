/* eslint-disable react/jsx-curly-newline */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable comma-dangle */
/* eslint-disable indent */
import { useMemo, useRef, useState, useEffect } from "react";
import RouteLayout from "@layout/routeLayout";
import Dropdown from "@component/dropdown/Dropdown";
import DatePicker from "@component/datepicker";
import SimpleTableAttendanceReport from "@component/SimpleTableAttendanceReport";
import { useSelector } from "react-redux";
import { selectSchoolData } from "@shared/store/schoolSlice";
import { useGet } from "@shared/api/useApi";
import toast from "@shared/toast";
import Loader from "@shared/loader";
import EmailIcon from "@mui/icons-material/Email";
import { HeaderMenus } from "@shared/pageHeaderMenu/HeaderMenus";
import { RESULTS_PER_PAGE, TOOLBAR_LABELS } from "@constants/constants";
import ReactToPrint from "react-to-print";
import PrintIcon from "@mui/icons-material/Print";
import { getNoOfPages, sortData, userRole } from "@utility/utility";
import { selectUser } from "@shared/store/userSlice";
import moment from "moment";

const printButton = () => <PrintIcon />;

type DateNavigation = {
  start_date: string;
  end_date: string;
  flag: boolean;
};
type SortByType = "Present" | "Absent" | "All";

function formatData(data: any, page: number, subject: string) {
  const cData = [] as any;
  const headerDates = [] as any;
  let isNext = {
    start_date: "",
    end_date: "",
    flag: false,
  } as DateNavigation;

  let isPrev = {
    start_date: "",
    end_date: "",
    flag: false,
  } as DateNavigation;
  // eslint-disable-next-line array-callback-return, consistent-return
  const SubjectArr = data?.data?.response.filter((ele: any) => {
    if (Object.keys(ele).includes(subject)) {
      return ele;
    }
  });

  const newData: [] = SubjectArr?.map((item: any) => {
    const objectKey = Object.keys(item).find(
      (key) => typeof item[key] === "object" && item[key] !== null
    );
    if (objectKey) {
      const newObj = {
        Subject: item[objectKey],
        ...item,
        SubjectName: objectKey,
      };
      delete newObj[objectKey];
      return newObj;
    }
    return item;
  });

  newData?.forEach((item: any, index: number) => {
    if (index === 0) {
      if (item?.Subject?.previous) {
        const prevUrl = new URL(item.Subject.previous);
        const searchParams = new URLSearchParams(prevUrl.search);
        isPrev = {
          start_date: searchParams.get("start_date") || "",
          end_date: searchParams.get("end_date") || "",
          flag: true,
        };
      }
      if (item?.Subject?.next) {
        const nextUrl = new URL(item?.Subject?.next);
        const searchParams = new URLSearchParams(nextUrl.search);
        isNext = {
          start_date: searchParams.get("start_date") || "",
          end_date: searchParams.get("end_date") || "",
          flag: true,
        };
      }
    }
    if (userRole().isParent) {
      const tmp = {
        sr_no: (page - 1) * 10 + index + 1,
        TotalPresent: item?.total_present,
        TotalAbsent: item?.total_absent,
        AttendanceReport: item.Subject?.results?.map((itm: any) => {
          const dt = new Date(itm.present_on_date).getDate();
          if (headerDates.indexOf(dt) < 0) {
            headerDates.push(dt);
          }
          return itm.present
            ? "Checked"
            : itm.is_weekend
            ? "Weekend"
            : itm.is_holiday
            ? "HoliDay"
            : itm.present === null
            ? "UnChecked"
            : "Absent";
        }),
        subject: item?.SubjectName,
      } as any;
      cData.push(tmp);
    }
  });

  return { cData, headerDates, isNext, isPrev };
}

export default function () {
  const componentRef = useRef(null);
  const [page, setPage] = useState(1);
  const [datesPerPage, setDatesPerPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortByType>("All");
  const [recordsPerPage, setRecordsPerPage] = useState<number | "all">(10);
  const [selectedSubject, setSelectedSubject] = useState<number | "select">(
    "select"
  );
  const [selectedTeacher, setSelectedTeacher] = useState<
    number | null | "select"
  >("select");
  const [fromDate, setFromDate] = useState<any>("");
  const [toDate, setToDate] = useState<any>("");
  const [totalDataCount, setTotalDataCount] = useState(0);
  const { userId } = useSelector(selectUser);
  const { schoolData, branchData } = useSelector(selectSchoolData);
  const [selectedChild, setSelectedChild] = useState("");
  const [childrenData, setChildrenData] = useState<any>([]);
  const noOfpages = getNoOfPages(totalDataCount, RESULTS_PER_PAGE?.[0]);
  const [courses, setCourses] = useState<any>([]);
  const [TeacherData, SetTeacherData] = useState<any>([]);

  const handleToolbarAction = async (title: string) => {
    if (title === TOOLBAR_LABELS.EMAIL) {
      if (fromDate && toDate) {
        fetchEmailApi();
      } else {
        toast(
          "error",
          "Please select from date and to date to send the email."
        );
      }
    }
  };

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
          branch: i?.branch_name,
          schoolId: i?.school_id,
          assignClassID: i?.assign_class,
          userID: i?.user_id,
          branchID: i?.branch_id,
        });
        body.sort(sortData);
        return body;
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

  const StudentUserID = useMemo(() => {
    const tmp = childrenData?.find(
      (item: any) => item?.value === selectedChild
    );
    return tmp?.userID;
  }, [selectedChild]);

  const AssignedID = childrenData?.find(
    (obj: any) => obj?.value === selectedChild
  );

  const { isLoading: subLoading, refetch: refectSubject } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-classes/subject/get?user_id=${StudentUserID}&class_id=${
      AssignedID?.assignClassID || ""
    }`,
    enabled: false,
    onSuccess: (resp: any) => {
      const respData = resp?.data?.response;
      const temp3: any = [];
      respData?.map((i: any) => {
        temp3.push({ label: i?.name, value: i?.subject_id });
        temp3?.sort(sortData);
        return temp3;
      });
      setCourses([...temp3]);
    },
  });

  const subjectName = useMemo(() => {
    const tmp = courses?.find((item: any) => item?.value === selectedSubject);
    return tmp?.label;
  }, [selectedSubject]);

  const schoolID = useMemo(() => {
    const tmp = childrenData?.find((obj: any) => obj?.value === selectedChild);
    return tmp?.schoolId;
  }, [selectedChild]);

  const BranchID = useMemo(() => {
    const tmp = childrenData?.find((obj: any) => obj?.value === selectedChild);
    return tmp?.branchID;
  }, [selectedChild]);

  const ClassName = useMemo(() => {
    const tmp = childrenData?.find((obj: any) => obj?.value === selectedChild);
    return tmp?.class;
  }, [selectedChild]);

  const ClassId = useMemo(() => {
    const tmp = childrenData?.find((obj: any) => obj?.value === selectedChild);
    return tmp?.assignClassID;
  }, [selectedChild]);

  const compare = (a: any, b: any) => {
    if (a.first_name < b.first_name) {
      return -1;
    }
    if (a.first_name > b.first_name) {
      return 1;
    }
    return 0;
  };

  const { isLoading: isLoadingTeacher, refetch: dataTeacher } = useGet({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/teachers/list/dropdown/?school_id=${schoolID}${
      BranchID ? `&branch_id=${BranchID}` : ""
    }`,
    enabled: false,
    onSuccess: (resp: any) => {
      const respData = resp?.data?.response?.results;
      respData.sort(compare);
      SetTeacherData(respData);
    },
  });

  const teacherId = useMemo(() => {
    const tmp = TeacherData?.find(
      (item: any) => item.user_id === selectedTeacher
    );
    return tmp?.user_id;
  }, [selectedTeacher]);

  useEffect(() => {
    if (selectedChild) {
      refectSubject();
      dataTeacher();
    }
  }, [selectedChild]);

  const {
    data: data2,
    isLoading: isLoading2,
    failureCount,
  } = useGet({
    baseURL: import.meta.env.VITE_APP_ROSTER_SERVICE_URL,
    // url: `roster-service/parent-child-attendance-report-list/?offset=${(datesPerPage - 1) * Number(noOfpages)}&limit=7&student_id=${71 || selectedChild}&start_date=${formatFromDate}&end_date=${formatToDate}${selectedSubject !== 'select' ? `&subject=${subjectName}` : ''}${selectedTeacher !== 'select' ? `&teacher_id=${14229 || teacherId}` : ''}`,
    url: `roster-service/parent-child-attendance-report-list/?offset=${
      (datesPerPage - 1) * Number(noOfpages)
    }&limit=7&student_id=${
      selectedChild || ""
    }&class_id=${ClassId}&start_date=${moment(fromDate).format(
      "yyyy-MM-DD"
    )}&end_date=${moment(toDate).format("yyyy-MM-DD")}${
      selectedSubject !== "select" ? `&subject_name=${subjectName}` : ""
    }${selectedTeacher !== "select" ? `&teacher_id=${teacherId}` : ""}`,
    enabled: !!(fromDate && toDate && selectedChild),
    retry: 0,
    onSuccess: (res: any) => {
      setTotalDataCount(res?.data?.response?.count);
    },
    onError: ({ response }: any) => {
      toast("error", response?.data?.message || "Error");
    },
  });

  // Toolbar Email
  const {
    isLoading: emailLoaded,
    refetch: fetchEmailApi,
    isRefetching: refetchEmail,
  } = useGet({
    baseURL: import.meta.env.VITE_APP_ROSTER_SERVICE_URL,
    url: `roster-service/parent-child-attendance-report-list?student_id=${selectedChild}&start_date=${moment(
      fromDate
    ).format("yyyy-MM-DD")}&end_date=${moment(toDate).format("yyyy-MM-DD")}${
      selectedSubject !== "select" ? `&subject=${subjectName}` : ""
    }${
      selectedTeacher !== "select" ? `&teacher_id=${teacherId}` : ""
    }&is_email=true`,
    onSuccess: (response: any) => {
      toast(
        "success",
        "Email sent successfully to you, please check your inbox"
      );
    },
    onError: ({ response }: any) => {
      toast("error", response?.data?.message || "Error");
    },
    enabled: false,
  });

  const ADMIN_TOOLBAR_MENU = [
    // {
    //   title: TOOLBAR_LABELS.EMAIL,
    //   icon: emailLoaded || refetchEmail ? <Loader size={20} /> : <EmailIcon />,
    // },
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

  const { cData, headerDates, isNext, isPrev } = useMemo(
    () => formatData(data2, page, subjectName || selectedSubject),
    [page, fromDate, toDate, data2, selectedSubject]
  );

  const rowsPerPageHandler = (val: number | "all") => {
    setRecordsPerPage(val);
  };

  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };
  const increaseDates = () => {
    setDatesPerPage(datesPerPage + 7);
  };
  const decreaseDates = () => {
    const aa = datesPerPage - 7;
    setDatesPerPage(aa > 0 ? aa : 1);
  };
  const columns = useMemo(
    () => [
      {
        label: "Sr No.",
        id: "sr_no",
      },
      {
        id: "subject",
        label: "Subject",
      },
      {
        id: "AttendanceReport",
        label: headerDates,
      },
      {
        id: "TotalPresent",
        label: "Total Present",
      },
      {
        id: "TotalAbsent",
        label: "Total Absent",
      },
    ],
    [headerDates]
  );

  const fromDateHandler = (val: any) => {
    setFromDate(val.toDate());
    if (toDate && val.toDate() >= toDate) {
      setToDate(val.toDate());
    }
  };

  return (
    <RouteLayout navBack={true}>
      <div className="flex h-full w-full flex-col">
        <HeaderMenus
          title="Attendance"
          subtitle={
            userRole().isSuperAdmin
              ? `School : ${
                  schoolData
                    ? schoolData?.school_name
                    : branchData?.school_data.school_name
                }`
              : ""
          }
          subtitle2={branchData?.name ? `Branch : ${branchData?.name}` : ""}
          menuArray={ADMIN_TOOLBAR_MENU}
          handleToolbarAction={handleToolbarAction}
        />
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6 my-2">
          <Dropdown
            title="Select Child"
            value={selectedChild}
            dataArray={childrenData}
            displayEmpty={true}
            onChangeHandler={(value) => setSelectedChild(value)}
            loading={childrenLoading}
            sxClass={{ width: "100%" }}
          />
          <Dropdown
            title="Select Teacher"
            value={selectedTeacher}
            loading={isLoadingTeacher}
            dataArray={[
              { label: "Select", value: "select" },
              ...(TeacherData?.map((item: any) => ({
                label: `${item.first_name} ${item.last_name}`,
                value: item.user_id,
              })) || []),
            ]}
            onChangeHandler={(currentTeacher: number) =>
              setSelectedTeacher(currentTeacher)
            }
            sxClass={{ width: "100%" }}
          />
          <Dropdown
            title="Select Subject"
            value={selectedSubject}
            loading={subLoading}
            dataArray={[
              { label: "Select", value: "select" },
              ...(courses?.map((item: any) => ({
                label: item.label,
                value: item?.value,
              })) || []),
            ]}
            onChangeHandler={(currentSubject: number) =>
              setSelectedSubject(currentSubject)
            }
            sxClass={{ width: "100%" }}
          />
          <div className="pb-[5px]">
            <DatePicker
              fullWidth={true}
              sxType={1}
              value={fromDate ? fromDate.toString() : fromDate}
              label="Date From"
              disabled={false}
              disablePast={false}
              disableFuture={new Date()}
              defaultStyle={true}
              handlePickerChange={fromDateHandler}
              // intialdate={selectedDate}
              error={null}
              shouldDisableDate={(dateParam: Date) => false}
            />
          </div>
          <div className="pb-[5px]">
            <DatePicker
              fullWidth={true}
              disabled={!fromDate}
              sxType={1}
              value={toDate ? toDate.toString() : null}
              label="To Date"
              defaultStyle={true}
              {...(fromDate ? { disableOld: fromDate } : null)}
              disableFuture={new Date()}
              disablePast={false}
              handlePickerChange={(val: any) => setToDate(val.toDate())}
              // intialdate={selectedDate}
              error={null}
              shouldDisableDate={(dateParam: Date) => false}
            />
          </div>
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
        <div className=" wrapperBorder overflow-hidden" ref={componentRef}>
          <SimpleTableAttendanceReport
            columns={columns}
            rows={cData}
            paginateHandler={handlePagination}
            rowsPerPageHandler={rowsPerPageHandler}
            totalPages={noOfpages}
            currentPage={page}
            clickLeft={decreaseDates}
            clickRight={increaseDates}
            recordsPerPage={recordsPerPage}
            isNext={isNext.flag}
            isPrev={isPrev.flag}
            isLoading={isLoading2}
            sortBy={sortBy}
          />
        </div>
      </div>
    </RouteLayout>
  );
}
