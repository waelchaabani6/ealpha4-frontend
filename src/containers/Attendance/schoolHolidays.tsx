import React, { useState, useEffect, useRef } from "react";
import "./customTimetable.css";
import Button from "@component/button/button";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "moment/locale/en-gb";
import RouteLayout from "@layout/routeLayout";
import { useGet } from "@shared/api/useApi";
import { selectSchoolData } from "@shared/store/schoolSlice";
import { useSelector } from "react-redux";
import { selectUser } from "@shared/store/userSlice";
import toast from "@shared/toast";
import PrintIcon from "@mui/icons-material/Print";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { useParams } from "react-router-dom";
import AddHolidayModal from "./components/add_holiday_modal";
import PageTitle from "@shared/pageTitle";
import StatusModal from "./components/status_modal";

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

export default function Index() {
  const componentRef = useRef(null);
  const [eventsData, setEventsData] = useState<Array<EventTypeData>>([]);
  const [selectedTimeFrom, setSelectedTimeFrom] = useState<any>(null);
  const [selectedTimeTo, setSelectedTimeTo] = useState<any>(null);
  const [desiderPopup, SetDesiderPopup] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courseId, setSelectedCourseId] = useState(null);
  const [teachers, setTeachers] = useState<any>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<any>("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<any>(null);
  const [classId, setClassId] = useState(-1);
  const [branchId, setBranchId] = useState(-1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [startTime, setStartTime] = useState(8); // Default start time
  const [navigationDate, setNaviagationDate] = useState(new Date());
  const { schoolId, role, branchId: userBranchId } = useSelector(selectUser);
  const { branchData } = useSelector(selectSchoolData);
  const [statusModalOpen, setStatusModalOpen] = useState(true);
  const [statusModalType, setStatusModalType] = useState<"success" | "error">(
    "success"
  );
  const [statusModalMessage, setStatusModalMessage] = useState("");

  const showSuccessModal = (message: string) => {
    setStatusModalType("success");
    setStatusModalMessage(message);
    setStatusModalOpen(true);
  };

  const showErrorModal = (message: string) => {
    setStatusModalType("error");
    setStatusModalMessage(message);
    setStatusModalOpen(true);
  };

  const handleSaveHoliday = (holidayData: any) => {
    // Example Save Logic
    try {
      console.log(holidayData);
      // Simulate API call success
      showSuccessModal("Holiday added successfully!");
    } catch (error) {
      // Handle API call error
      showErrorModal("Failed to add holiday. Please try again.");
    }
  };

  const { refetch: refetchTeacher } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-classes/teacher/get?class_id=${classId}&subject_id=${courseId}`,
    onSuccess: (resp: any) => {
      const respData = resp?.data?.response;
      const tempTeachers =
        respData?.map((i: any) => ({
          label: `${i?.teacher_name}`,
          value: `${i?.teacher_name}`,
          id: i?.user_profile_id,
        })) || [];
      setTeachers(tempTeachers);
    },
    enabled: false,
  });

  useEffect(() => {
    if (classId !== -1 && courseId !== null) {
      refetchTeacher();
    }
  }, [courseId]);

  useEffect(() => {
    if (role.name === "BRANCH_ADMIN") {
      setBranchId(userBranchId);
    }
  }, [branchData]);

  const handleSelect = (obj: { start: Date; end: Date }) => {
    const { start, end } = obj;
    setSelectedTimeFrom(start);
    setSelectedTimeTo(end);
    SetDesiderPopup(true);
  };

  const handleToolbarAction = (title: string) => {
    if (title === "IMPORT") {
      importData();
    }
  };

  const importData = () => {
    const input: any = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = () => {
      const file = input?.files?.[0];
      const fileType = file.name.split(".").pop();
      if (fileType === "csv") {
        const formData = new FormData();
        formData.append("csv_file", file);
        formData.append("import_type", "sub-admin");
      } else {
        toast("error", "Please upload CSV filetype only");
      }
    };
    input.click();
  };

  return (
    <div>
      <RouteLayout navBack={true}>
        {/* Buttons Section */}
        <div className="flex justify-between items-center bg-gray-100 p-4 mt-5">
          {/* Page Title */}
          <PageTitle title="School Holidays" />

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

        <StatusModal
          isOpen={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
          type={statusModalType}
          message={statusModalMessage}
        />

        <AddHolidayModal
          desiderPopup={desiderPopup}
          SetDesiderPopup={SetDesiderPopup}
          onSave={(holidayData: any) => {
            handleSaveHoliday(holidayData);
          }}
        />

        <div className="mt-5 bg-white" ref={componentRef}>
          <DnDCalendar
            views={["week"]}
            selectable={true}
            localizer={localizer}
            date={navigationDate}
            onNavigate={(navDate: Date) => setNaviagationDate(navDate)}
            min={new Date(2023, 0, 1, startTime, 0)}
            max={new Date(2023, 0, 1, 18, 0)}
            defaultView="week"
            events={eventsData}
            style={{ width: "100%", height: "100vh" }}
            onSelectSlot={handleSelect}
            className="studentSchedular"
            formats={{
              dayFormat: (date, culture: any) =>
                localizer.format(date, "ddd D", culture),
              dayRangeHeaderFormat: (date: any, culture: any) =>
                moment(date.start).format("MMM YYYY"),
            }}
            eventPropGetter={(event: any) => {
              const backgroundColor = event.hexColor;
              return { style: { backgroundColor } };
            }}
          />
        </div>
      </RouteLayout>
    </div>
  );
}
