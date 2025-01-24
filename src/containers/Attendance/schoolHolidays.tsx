import React, { useState, useEffect, useRef } from "react";
import "./customTimetable.css";
import Button from "@component/button/button";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "moment/locale/en-gb";
import RouteLayout from "@layout/routeLayout";
import { useGet, usePost, usePut } from "@shared/api/useApi";
import { selectSchoolData } from "@shared/store/schoolSlice";
import { useSelector } from "react-redux";
import { selectUser } from "@shared/store/userSlice";
import toast from "@shared/toast";
import PrintIcon from "@mui/icons-material/Print";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { useParams } from "react-router-dom";
import AddHolidayModal from "./components/add_holiday_modal";
import PageTitle from "@shared/pageTitle";

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
  const [desiderPopup, SetDesiderPopup] = useState(false);
  const [holidayResponseStatus, setHolidayStatus] = useState(false);
  const [isCreateLoading, setIsCreateLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [currentEditData, setCurrentEditData] = useState<any>(null);
  const [selectedTimeFrom, setSelectedTimeFrom] = useState(new Date());
  const [selectedTimeTo, setSelectedTimeTo] = useState(new Date());
  const [currentView, setCurrentView] = useState("create");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedHolidayId, setSelectedHolidayId] = useState(null);

  const { schoolId } = useSelector(selectUser);

  // Fetch holidays and set them as calendar events
  const { refetch: fetchHolidays } = useGet({
    baseURL: "https://school.development.ealpha.net/api/v1/",
    url: `schools-service/holiday-management/holidays/list/${schoolId}/`,
    onSuccess: (resp: any) => {
      const holidays = resp?.data?.data || [];
      const events = holidays.map((holiday: any) => ({
        id: holiday.id,
        title: holiday.holiday_name,
        description: holiday.description,
        start: new Date(holiday.start_date),
        end: new Date(holiday.end_date),
        holidayType: holiday.holiday_type,
        hexColor: "#FEE6C9",
      }));

      setEventsData(events);
    },
    onError: (error: any) => {
      console.error("Failed to fetch holidays:", error);
    },
    enabled: true, // Will manually trigger fetch
  });

  // Save new holiday
  const { isLoading: isSavingHoliday, mutate: saveHoliday } = usePost({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: "schools-service/holiday-management/holidays/",
    onSuccess: () => {
      toast("success", "Holiday added successfully!");
      setHolidayStatus(true);
      setIsCreateLoading(false);
      fetchHolidays(); // Refresh holidays after creation
    },
    onError: (error: any) => {
      toast("error", error?.response?.data?.message || "Failed to add holiday");
      setHolidayStatus(false);
      setIsCreateLoading(false);
    },
  });

  // Edit existing holiday
  const { isLoading: isUpdatingHoliday, mutate: updateHoliday } = usePut({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/holiday-management/holidays/${currentEditData?.id}/`,
    onSuccess: () => {
      toast("success", "Holiday updated successfully!");
      setHolidayStatus(true);
      fetchHolidays(); // Refresh holidays after edit
    },
    onError: (error: any) => {
      toast(
        "error",
        error?.response?.data?.message || "Failed to update holiday"
      );
      setHolidayStatus(false);
      SetDesiderPopup(false);
    },
  });

  // Delete existing holiday
  const { isLoading: isDeletingHoliday, mutate: deleteHoliday } = usePut({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/holiday-management/holidays/delete/${selectedHolidayId}/`,
    onSuccess: () => {
      toast("success", "Holiday deleted successfully!");
      setHolidayStatus(true);
      fetchHolidays(); // Refresh holidays after delete
      SetDesiderPopup(false);
    },
    onError: (error: any) => {
      toast(
        "error",
        error?.response?.data?.message || "Failed to delete holiday"
      );
      setHolidayStatus(false);
    },
  });

  useEffect(() => {
    if (selectedHolidayId !== null) {
      deleteHoliday(selectedHolidayId);
    }
  }, [selectedHolidayId]);

  const handleSaveHoliday = (saveData: any) => {
    setIsCreateLoading(true);
    const payload = {
      holiday_name: saveData.holidayName,
      description: saveData.description,
      start_date: saveData.startDate,
      end_date: saveData.endDate,
      holiday_type: saveData.dayType === "full" ? "full_day" : "half_day",
      school: schoolId,
    };

    saveHoliday(payload); // Save new holiday
  };

  const handleEditHoliday = (editData: any) => {
    const payload = {
      holiday_name: editData.holidayName,
      description: editData.description,
      start_date: editData.startDate,
      end_date: editData.endDate,
      holiday_type: editData.dayType === "full" ? "full_day" : "half_day",
      school: schoolId,
    };

    updateHoliday(payload); // Update existing holiday
  };

  const handleDeleteHoliday = (id: number) => {
    setSelectedHolidayId(id);
  };

  const handleEditClick = (event: any) => {
    setCurrentEditData(event); // Set the selected event data for editing
    SetDesiderPopup(true); // Open the modal
    setCurrentView("edit"); // Set to edit view
  };

  const handleSelect = (obj: { start: Date; end: Date }) => {
    const { start, end } = obj;
    setCurrentEditData(null); // Clear current edit data
    setSelectedTimeFrom(start);
    setSelectedTimeTo(end);
    SetDesiderPopup(true); // Open the modal
    setCurrentView("create"); // Set to create view
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
          </div>
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
                  <div
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setCurrentView("list");
                      SetDesiderPopup(true);
                    }}
                  >
                    View
                  </div>
                  <div
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setCurrentView("create");
                      SetDesiderPopup(true);
                    }}
                  >
                    Add
                  </div>
                  <div
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setCurrentView("list");
                      SetDesiderPopup(true);
                    }}
                  >
                    Edit
                  </div>
                  <div
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setCurrentView("list");
                      SetDesiderPopup(true);
                    }}
                  >
                    Delete
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <AddHolidayModal
          desiderPopup={desiderPopup}
          SetDesiderPopup={SetDesiderPopup}
          holidayResponseStatus={holidayResponseStatus}
          onSave={(holidayData: any) => {
            currentEditData
              ? handleEditHoliday(holidayData) // Handle edit
              : handleSaveHoliday(holidayData); // Handle create
          }}
          onEdit={(holidayData: any) => handleEditHoliday(holidayData)}
          onDelete={(holidayId: any) => handleDeleteHoliday(holidayId)}
          eventsData={eventsData}
          isCreateLoading={isSavingHoliday}
          isEditLoading={isUpdatingHoliday}
          setIsCreateLoading={setIsCreateLoading}
          setIsEditLoading={setIsEditLoading}
          isEdit={!!currentEditData}
          currentView={currentView}
          setCurrentView={setCurrentView}
          editDataOnSelect={currentEditData}
        />

        <div className="mt-5 bg-white" ref={componentRef}>
          <DnDCalendar
            views={["month"]}
            selectable={true}
            localizer={localizer}
            defaultView="month"
            events={eventsData}
            style={{ width: "100%", height: "100vh" }}
            onSelectSlot={handleSelect}
            onSelectEvent={handleEditClick}
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
