import React, { useState, useEffect, useRef } from "react";
import "./customTimetable.css";
import Button from "@component/button/button";
import { Calendar, momentLocalizer } from "react-big-calendar";
import Loader from "@shared/loader";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "moment/locale/en-gb";
import RouteLayout from "@layout/routeLayout";
import { useGet, usePost, usePatch, useDelete } from "@shared/api/useApi";
import { selectSchoolData } from "@shared/store/schoolSlice";
import { useSelector } from "react-redux";
import { selectUser } from "@shared/store/userSlice";
import toast from "@shared/toast";
import PrintIcon from "@mui/icons-material/Print";
import { HeaderMenus } from "@shared/pageHeaderMenu/HeaderMenus";
import {
  TOOLBAR_LABELS,
  USER_TYPE,
  MAX_TIME,
  START_TIME,
} from "@constants/constants";
import ReactToPrint from "react-to-print";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { useParams } from "react-router-dom";
import { sortData } from "@utility/utility";
import events from "./events";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import AddHolidayModal from "./components/add_holiday_modal";

const SCHOOL_SERVICE = import.meta.env.VITE_APP_SCHOOL_SERVICE_URL;
const ROASTER_SERVICE = import.meta.env.VITE_APP_ROSTER_SERVICE_URL;

const DnDCalendar = withDragAndDrop(Calendar);
moment.locale("en-GB");
const localizer = momentLocalizer(moment);

moment.locale("en-GB", {
  week: {
    dow: 1, // Monday is the first day of the week.
  },
});

type EventTypeData = {
  title: string;
  start: Date;
  end: Date;
  hexColor?: string;
};
const today = new Date();
const plus7 = new Date(new Date().setDate(new Date().getDate() + 7));

export default function Index() {
  const componentRef = useRef(null);
  const [eventsData, setEventsData] = useState<Array<EventTypeData>>(events);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courseId, setSelectedCourseId] = useState(null);
  const [selectedTimeFrom, setSelectedTimeFrom] = useState<any>(null);
  const [selectedTimeTo, setSelectedTimeTo] = useState<any>(null);
  const [timeStart, setTimeStart] = useState(new Date());
  const [DragEventObj, setDragEventObj] = useState<any>("");
  const [updateCounter, setUpdateCounter] = useState(0);
  const [schoolTimetableEvent, SetSchoolTimetablePopup] = useState(false);
  const [desiderPopup, SetDesiderPopup] = useState(false);
  const [PrevEventObj, setPrevEventObj] = useState<any>(null);

  const [isSchollTimetableCheck, setSchollTimetableCheck] = useState(false);

  const [resonForHoliday, setResonForHoliday] = useState("");
  const [markAsHolidayPopup, setMarkAsHolidayPopup] = useState(false);
  const [selectedBranch, setselectedBranch] = useState<string>("Select");
  const {
    schoolId,
    user_profile_id: userID,
    role,
    branch_name,
    branchId: branch_id,
  } = useSelector(selectUser);
  const { schoolData, branchData } = useSelector(selectSchoolData);
  const [startDate, setStartDate] = useState(
    moment(today).utc().format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState(
    moment(plus7).utc().format("YYYY-MM-DD")
  );
  const [classId, setClassId] = useState(-1);
  const [branchId, setBranchId] = useState(-1);
  const [dateApplied, setDateApplied] = useState(false);
  const [courses, setCourses] = useState<any>([]);
  const [teachers, setTeachers] = useState<any>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<any>("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<any>(null);
  const [updateHolidayPopup, setUpdateHolidayPopup] = useState(false);
  const [updateTimetableId, setUpdateTimetableId] = useState(-1);
  const [selectedEvent, setSelectedEvent] = useState<any>({});
  const [HolidayError, setHolidayError] = useState<any>(false);
  const [showToError, setShowToError] = useState<any>(false);
  const [showFromError, setshowFromError] = useState<any>(false);
  const [showCourseError, setShowCourseError] = useState<any>(false);
  const [showTeacherError, setShowTeacherError] = useState<any>(false);
  const [actionConfirmPopup, setActionConfirmPopup] = useState(false);
  const [ConfirmDelete, setConfirmDelete] = useState(false);
  const [eventObj, setEventObj] = useState<any>(null);
  const [navigationDate, setNaviagationDate] = useState(new Date());
  const [disableBranchButton, setDisableBranchButton] = useState(false);
  const { schoolName = "" } = useParams();
  const fileRef = useRef<any>();
  const userData = useSelector((state: any) => state?.user);
  const UserRole = userData?.role?.name;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [startTime, setStartTime] = useState(START_TIME);

  const updateHolidateMsg = () => {
    setHolidayError(false);
    if (resonForHoliday === "") {
      setHolidayError(true);
    } else if (updateHolidayPopup) {
      updateHolidayForSelectedDay();
    } else {
      submitHolidayForSelectedDay();
    }
  };

  const checkIfNoSlotBooked = (newSlot: { start: any; end: any }) => {
    const exhistingDate = eventsData.filter(
      (ele) =>
        new Date(ele.start).toDateString() ===
        new Date(newSlot.start).toDateString()
    );
    let isValid = true;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < exhistingDate.length; i++) {
      const e1start = new Date(exhistingDate[i].start).getTime();
      const e1end = new Date(exhistingDate[i].end).getTime();
      const e2start = new Date(newSlot.start).getTime();
      const e2end = new Date(newSlot.end).getTime();
      // eslint-disable-next-line no-mixed-operators
      if (
        (e1start >= e2start && e1start < e2end) ||
        (e2start >= e1start && e2start < e1end)
      ) {
        isValid = false;
      }
    }
    return isValid;
  };

  const handleSelect = (obj: { start: Date; end: Date }) => {
    const { start, end } = obj;
    if (checkIfNoSlotBooked(obj)) {
      setSelectedTimeFrom(start);
      setSelectedTimeTo(end);
      setTimeStart(start);
      SetDesiderPopup(true);
    }
  };
  const printButton = () => <PrintIcon />;

  const ADMIN_TOOLBAR_MENU = [
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

  const handleToolbarAction = (title: string) => {
    if (title === TOOLBAR_LABELS.IMPORT) {
      importData();
    } else if (title === TOOLBAR_LABELS.EMAIL) {
      handelSendEmail();
    }
  };
  const handelSendEmail = () => {
    // fetchEmailApi();
  };
  const importData = async () => {
    const input: any = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = () => {
      const file = input?.files?.[0];
      const fileType = file.name.split(".").pop();
      if (fileType === "csv") {
        const documentFormData: any = new FormData();
        documentFormData.append("csv_file", file);
        documentFormData.append("import_type", "sub-admin");
        // mutateImport(documentFormData);
      } else {
        toast("error", "Please upload CSV filetype only");
      }
    };
    input.click();
  };

  const handleSelectEvent = (event: any) => {
    if (event.is_holiday === true) {
      setSelectedEvent({
        is_holiday: true,
        reason: event.reason,
        for_date: moment(event.time_from.replace("Z", "")).format("YYYY-MM-DD"),
        time_blocks: [
          {
            id: event.id,
            subject: event.subject,
            branch_id: event.branch_id,
            course: event.course,
            school_class: event.school_class,
            teacher: event.teacher,
            time_from: moment(event.time_from.replace("Z", "")).format(
              "YYYY-MM-DD HH:mm"
            ),
            time_to: moment(event.time_to.replace("Z", "")).format(
              "YYYY-MM-DD HH:mm"
            ),
          },
        ],
      });
      setUpdateTimetableId(event.mainEventId);
      setResonForHoliday(event.reason);
      setUpdateHolidayPopup(true);
      setMarkAsHolidayPopup(true);
    } else {
      SetSchoolTimetablePopup(true);
      setUpdateHolidayPopup(true);
      setUpdateTimetableId(event.mainEventId);

      setSelectedCourseId(event.subject);
      setSelectedCourse(event.subject_name);

      setSelectedTeacher(event.teacher_name);
      setSelectedTeacherId(event.teacher);

      setSelectedTimeFrom(new Date(event.time_from.replace("Z", "")));
      setSelectedTimeTo(new Date(event.time_to.replace("Z", "")));

      setSelectedEvent({ ...event });
    }
  };

  const handleUpdateDialogClick = () => {
    const isValid = validationCheck();
    if (isValid === false) {
      return;
    }

    const Start = moment(selectedEvent.start).toDate();
    const timeFrom = new Date(
      selectedTimeFrom.$d ? selectedTimeFrom.$d : selectedTimeFrom
    );
    const timeTo = new Date(
      selectedTimeTo.$d ? selectedTimeTo.$d : selectedTimeTo
    );
    timeFrom.setDate(Start.getDate());
    timeTo.setDate(Start.getDate());

    const patchEvent: any = {
      is_holiday: false,
      reason: selectedCourse,
      for_date: moment(timeFrom).format("YYYY-MM-DD"),
      class_id: classId,
      school_id:
        role.name === USER_TYPE.SCHOOL_ADMIN
          ? schoolId
          : branchData?.school_data?.id,
      created_by: userID,
      updated_by: userID,
      branch_id: branchId,
      time_blocks: [
        {
          id: selectedEvent.id,
          branch_id: branchId,
          course: 0,
          subject: courseId,
          school_class: selectedEvent.school_class,
          teacher: selectedTeacherId,
          teacher_name: selectedTeacher,
          time_from: moment(timeFrom).format("YYYY-MM-DD HH:mm"),
          time_to: moment(timeTo).format("YYYY-MM-DD HH:mm"),
          subject_name: selectedCourse,
        },
      ],
    };
    if (branchId === -1) {
      delete patchEvent.branch_id;
      delete patchEvent.time_blocks[0].branch_id;
    }
    setUpdateHolidayPopup(false);
  };

  const validationCheck = () => {
    let isValid = true;
    if (selectedCourse === "") {
      setShowCourseError(true);
      isValid = false;
    } else {
      setShowCourseError(false);
    }
    if (selectedTeacher === "") {
      setShowTeacherError(true);
      isValid = false;
    } else {
      setShowTeacherError(false);
    }
    if (!selectedTimeFrom || selectedTimeFrom.$d === "Invalid Date") {
      setshowFromError(true);
      isValid = false;
    } else {
      setshowFromError(false);
    }
    if (!selectedTimeTo || selectedTimeTo.$d === "Invalid Date") {
      setShowToError(true);
      isValid = false;
    } else {
      setShowToError(false);
    }
    return isValid;
  };

  const handleOkDialogClick = () => {
    const isValid = validationCheck();
    if (isValid === false) {
      return;
    }
    SetSchoolTimetablePopup(false);

    const start = timeStart;
    const timeFrom = new Date(
      selectedTimeFrom.$d ? selectedTimeFrom.$d : selectedTimeFrom
    );
    const timeTo = new Date(
      selectedTimeTo.$d ? selectedTimeTo.$d : selectedTimeTo
    );

    timeFrom.setDate(timeStart.getDate());
    timeFrom.setMonth(timeStart.getMonth());
    timeFrom.setFullYear(timeStart.getFullYear());

    timeTo.setDate(timeStart.getDate());
    timeTo.setMonth(timeStart.getMonth());
    timeTo.setFullYear(timeStart.getFullYear());

    const postEvent: any = {
      is_holiday: false,
      reason: selectedCourse,
      for_date: moment(start).format("YYYY-MM-DD"),
      created_by: userID,
      updated_by: userID,
      class_id: classId,
      school_id:
        role.name === USER_TYPE.SCHOOL_ADMIN
          ? schoolId
          : branchData?.school_data?.id,
      branch_id: branchId,
      time_blocks: [
        {
          subject: courseId,
          branch_id: branchId,
          course: 0,
          school_class: classId,
          teacher: selectedTeacherId,
          teacher_name: selectedTeacher,
          time_from: moment(timeFrom).format("YYYY-MM-DD HH:mm"),
          time_to: moment(timeTo).format("YYYY-MM-DD HH:mm"),
        },
      ],
    };
    if (branchId === -1) {
      delete postEvent.branch_id;
      delete postEvent.time_blocks[0].branch_id;
    }

    setSelectedCourse("");
    setSelectedCourseId(null);
    setSelectedTeacherId(null);
    setSelectedTeacher("");
    setSchollTimetableCheck(false);
    setSelectedTimeFrom(null);
    setSelectedTimeTo(null);
  };

  const { refetch: refetchTeacher } = useGet({
    baseURL: SCHOOL_SERVICE,
    url: `schools-service/school-classes/teacher/get?class_id=${classId}&subject_id=${courseId}`,
    onSuccess: (resp: any) => {
      const respData = resp?.data?.response;
      const temp4: { label: any; value: any; id: any }[] = [];
      respData?.map((i: any) => {
        temp4.push({
          label: `${i?.teacher_name}`,
          value: `${i?.teacher_name}`,
          id: i?.user_profile_id,
        });
        temp4?.sort(sortData);
        return temp4;
      });
      setTeachers([...temp4]);
    },
    onError: () => {},
    enabled: false,
  });

  useEffect(() => {
    if (classId !== -1 && courseId !== null) {
      refetchTeacher();
    }
  }, [courseId]);

  // eslint-disable-next-line react/no-unstable-nested-components
  const MyLoader = () => (
    <div className="z-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <Loader />
    </div>
  );

  useEffect(() => {
    if (role.name === USER_TYPE.BRANCH_ADMIN) {
      setselectedBranch(branch_name);
      setBranchId(branch_id);
    }
  }, [branchData]);

  const onEventDrop = (dragEventObj: any) => {
    setUpdateTimetableId(dragEventObj.event.time_table_id);
    setDragEventObj(dragEventObj);
    // modify position.
    const prevEventObj: any = {};
    const tempEventData = eventsData.map((event: any) => {
      if (event.id === dragEventObj.event.id) {
        prevEventObj.start = event.start;
        prevEventObj.end = event.end;
        prevEventObj.id = event.id;
        return { ...event, start: dragEventObj.start, end: dragEventObj.end };
      }
      return { ...event };
    });
    setPrevEventObj(prevEventObj);
    setEventsData(tempEventData);
    setUpdateCounter((counter) => counter + 1);
  };

  const { isLoading: fileUploadLoading, mutate: fileUploadPost } = usePost({
    baseURL: ROASTER_SERVICE,
    url: `roster-service/time-table/upload-excel/`,
    onSuccess: (response: any) => {
      toast("success", "file uploaded successfully");
      refetchTimetable();
    },
    onError: ({ response }: any) => {
      toast("error", response?.statusText || "Error");
    },
  });

  useEffect(() => {
    if (updateCounter !== 0) {
      const patchEvent: any = {
        is_holiday: DragEventObj?.event?.is_holiday,
        reason: DragEventObj?.event?.reason,
        for_date: moment(DragEventObj?.start).format("YYYY-MM-DD"),
        class_id: classId,
        school_id:
          role.name === USER_TYPE.SCHOOL_ADMIN
            ? schoolId
            : branchData?.school_data?.id,
        created_by: userID,
        updated_by: userID,
        branch_id: branchId,
        time_blocks: [
          {
            id: DragEventObj?.event?.id,
            subject: DragEventObj?.event?.subject,
            branch_id: DragEventObj.event.branch_id,
            course: DragEventObj.event.course,
            school_class: DragEventObj.event.school_class,
            teacher: DragEventObj.event.teacher,
            teacher_name: DragEventObj.event.teacher_name,
            time_from: moment(DragEventObj.start).format("YYYY-MM-DD HH:mm"),
            time_to: moment(DragEventObj.end).format("YYYY-MM-DD HH:mm"),
          },
        ],
      };
      if (branchId === -1) {
        delete patchEvent.branch_id;
        delete patchEvent.time_blocks[0].branch_id;
      }
      patchTimeTableEvent(patchEvent);
    }
  }, [updateCounter]);

  const onChange = (files: FileList) => {
    const file = files?.[0];
    const fileType = file.name.split(".").pop();

    if (fileType === "xlsx") {
      const documentFormData: any = new FormData();
      documentFormData.append("timetable_sheet", file);
      documentFormData.append(
        "school_id",
        role.name === USER_TYPE.SCHOOL_ADMIN
          ? schoolId
          : branchData?.school_data?.id
      );
      documentFormData.append("class_id", classId);
      if (branchId && branchId !== -1) {
        documentFormData.append("branch_id", branchId);
      }
      fileUploadPost(documentFormData);
    } else {
      toast("error", "Please upload XLSX filetype only");
    }
  };

  return (
    <div>
      <RouteLayout navBack={true}>
        {/* Buttons Section */}
        <div className="flex justify-between items-center bg-gray-100 p-4 mt-5">
          <HeaderMenus
            title="Manage School Calender"
            menuArray={[]}
            handleToolbarAction={handleToolbarAction}
          />
          <div className="flex items-center space-x-4">
            {/* Edit Weekends Button */}
            <Button
              sx={{
                backgroundColor: "#4A9D2D",
                color: "#FFFFFF",
                "&:hover": { backgroundColor: "#3A7D24" },
              }}
              onClick={() => {
                console.log("Edit Weekends clicked");
              }}
            >
              Edit Weekends
            </Button>

            {/* Manage School Holidays Dropdown */}
            <div className="relative ml-4">
              <Button
                sx={{
                  backgroundColor: "#FFFFFF",
                  color: "#4A9D2D",
                  border: "1px solid #4A9D2D",
                  "&:hover": { backgroundColor: "#F5F5F5" },
                }}
                onClick={() => setIsDropdownOpen((prev) => !prev)}
              >
                Manage School Holidays
              </Button>

              {/* Dropdown Content */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-green-500 shadow-lg rounded-lg z-10">
                  <div className="py-2">
                    <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                      View
                    </div>
                    <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                      Add
                    </div>
                    <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                      Edit
                    </div>
                    <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                      Delete
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <AddHolidayModal
          desiderPopup={desiderPopup}
          SetDesiderPopup={SetDesiderPopup}
          onSave={(holidayData: any) => {
            console.log(holidayData);
          }}
        />

        <div className="mt-5 bg-white" ref={componentRef}>
          <DnDCalendar
            views={["week"]}
            selectable={true}
            localizer={localizer}
            date={navigationDate}
            onNavigate={(navDate: Date) => {
              setNaviagationDate(navDate);
            }}
            min={new Date(2023, 0, 1, startTime, 0)}
            max={new Date(2023, 0, 1, 18, 0)}
            defaultView="week"
            enableAutoScroll={true}
            events={eventsData}
            style={{ width: "100%", height: "100vh" }}
            onSelectEvent={(event: any) => {
              setEventObj(event);
              setActionConfirmPopup(true);
            }}
            onSelectSlot={handleSelect}
            formats={{
              dayFormat: (date, culture: any) =>
                localizer.format(date, "ddd D", culture),
              dayRangeHeaderFormat: (date: any, culture: any) =>
                moment(date.start).format("MMM YYYY"),
              eventTimeRangeFormat: () => "",
            }}
            eventPropGetter={(event: any) => {
              const backgroundColor = event.hexColor;
              return { style: { backgroundColor } };
            }}
            className="studentSchedular"
            dayLayoutAlgorithm="overlap"
            onEventDrop={onEventDrop}
            onEventResize={() => {}}
            resizable={false}
          />
        </div>
      </RouteLayout>
    </div>
  );
}
