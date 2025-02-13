/* eslint-disable linebreak-style */
/* eslint-disable arrow-body-style */
import React, { useState, useEffect, useRef, useMemo } from "react";
import "./customTimetable.css";
import Button from "@component/button/button";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "moment/locale/en-gb";
import RouteLayout from "@layout/routeLayout";
import { useDelete, useGet, usePost, usePut } from "@shared/api/useApi";
import { selectSchoolData } from "@shared/store/schoolSlice";
import { useSelector } from "react-redux";
import { selectUser } from "@shared/store/userSlice";
import toast from "@shared/toast";
import PrintIcon from "@mui/icons-material/Print";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { useParams } from "react-router-dom";
import AddHolidayModal from "./components/add_holiday_modal";
import PageTitle from "@shared/pageTitle";
import AddWeekendModal from "./components/add_weekend_modal";
import { set } from "react-hook-form";
import HolidayDatesContext from "./context";
import { USER_TYPE } from "@constants/constants";

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
  const [selectedEditHolidayId, setSelectedEditHolidayId] = useState(null);
  const [weekendsData, setWeekendsData] = useState([]); // To store weekends list
  const [isWeekendModalOpen, setIsWeekendModalOpen] = useState(false);
  const [isWeekendRequestLoading, setIsWeekendRequestLoading] = useState(false);
  const [currentWeekendData, setCurrentWeekendData] = useState(null); // For editing a weekend
  const [weekendsResponseeStatus, setWeekendsResponseStatus] = useState(false);
  const [endDateFromResponse, setEndDateFromResponse] = useState("");
  const { schoolId, branchId } = useSelector(selectUser);
  const { SCHOOL_ADMIN, BRANCH_ADMIN } = USER_TYPE;
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const usersRole = useSelector((state: any) => state?.user?.role);
  const isSchoolOrBranchAdmin =
    usersRole?.name === SCHOOL_ADMIN || usersRole?.name === BRANCH_ADMIN;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const calculateWeekendDates = (
    days: string[],
    endsAfter: string,
    endDateFromResponse?: string
  ) => {
    const dayMap: { [key: string]: number } = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1); // Start of the current month
    let endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Default: end of the month

    // Handle different end conditions
    if (endsAfter === "3-month") {
      endDate.setMonth(endDate.getMonth() + 2);
    } else if (endsAfter === "6-month") {
      endDate.setMonth(endDate.getMonth() + 5);
    } else if (endsAfter === "current_academic_year") {
      if (endDateFromResponse) {
        endDate = new Date(endDateFromResponse);
        endDate.setMonth(8);
        endDate.setDate(30);
      }
    } else if (endsAfter === "never") {
      endDate = new Date(today.getFullYear() + 10, 11, 31); // Default: 10 years from now
    }

    const weekends = [];
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      if (days.includes(d.toLocaleDateString("en-GB", { weekday: "long" }))) {
        weekends.push({
          id: `${d.toISOString()}-weekend`,
          title: "Weekend",
          start: new Date(d),
          end: new Date(d),
          hexColor: "#FFD9D9", // Color for weekends
        });
      }
    }

    return weekends;
  };

  // Fetch holidays and set them as calendar events
  const listbranchHolidays = `schools-service/holiday-management/holidays/list/${schoolId}/${branchId}/`;
  const listAllHolidays = `schools-service/holiday-management/holidays/list/${schoolId}/`;
  const { refetch: fetchHolidays } = useGet({
    baseURL: "https://school.development.ealpha.net/api/v1/",
    url: branchId ? listbranchHolidays : listAllHolidays,
    onSuccess: (resp: any) => {
      console.log("resp", resp);
    },
    onError: (error: any) => {
      console.error("Failed to fetch holidays:", error);
    },
    enabled: true, // Will manually trigger fetch
  });

  // Fetch weekends
  const { refetch: fetchWeekends } = useGet({
    baseURL: "https://school.development.ealpha.net/api/v1/",
    url: `schools-service/holiday-management/weekends/list/${schoolId}/`,
    onSuccess: (resp: any) => {
      setWeekendsData(resp?.data?.data || []);
    },
    onError: (error: any) => {
      console.error("Failed to fetch weekends:", error);
    },
    enabled: true,
  });

  const fetchEvents = async () => {
    try {
      // Fetch holidays
      const holidaysResponse = await fetchHolidays();
      const holidays = holidaysResponse?.data?.data?.data || [];
      const holidayEvents = holidays.map((holiday: any) => ({
        id: holiday.id,
        title: holiday.holiday_name,
        description: holiday.description,
        start: new Date(holiday.start_date),
        end: new Date(holiday.end_date),
        holidayType: holiday.holiday_type,
        hexColor: "#D2F0FF", // Color for holidays
      }));

      // Fetch weekends
      const weekendsResponse = await fetchWeekends();
      const weekends = weekendsResponse?.data?.data?.data || [];

      // Handle only the first weekend index
      let weekendEvents: any[] = [];
      if (weekends.length > 0) {
        weekendEvents = calculateWeekendDates(
          weekends[0].days,
          weekends[0].ends_after,
          endDateFromResponse
        );
      }

      // Merge holidays and the first weekend index
      setEventsData([...holidayEvents, ...weekendEvents]);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };
  useEffect(() => {
    fetchEvents();
  }, [fetchHolidays, fetchWeekends]);

  // Create new weekend
  const { isLoading: isCreatingWeekend, mutate: createWeekend } = usePost({
    baseURL: "https://school.development.ealpha.net/api/v1/",
    url: "schools-service/holiday-management/weekends/",
    onSuccess: () => {
      setWeekendsResponseStatus(true);
      toast("success", "Weekend created successfully!");
      fetchWeekends(); // Refresh weekends list
      fetchEvents(); // Fetch events after creating a weekend
      setIsWeekendRequestLoading(false);
    },
    onError: (error: any) => {
      setWeekendsResponseStatus(false);
      toast(
        "error",
        error?.response?.data?.message || "Failed to create weekend"
      );
      setIsWeekendRequestLoading(false);
    },
  });

  // Update existing weekend
  const { isLoading: isUpdatingWeekend, mutate: updateWeekend } = usePut({
    baseURL: "https://school.development.ealpha.net/api/v1/",
    url: `schools-service/holiday-management/weekends/${currentWeekendData?.id}/`,
    onSuccess: (res) => {
      const currentYearendDate = res?.data?.data?.end_date;
      setEndDateFromResponse(currentYearendDate);
      setWeekendsResponseStatus(true);
      toast("success", "Weekend updated successfully!");
      fetchWeekends(); // Refresh weekends list
      fetchEvents(); // Fetch events after updating a weekend
      setIsWeekendRequestLoading(false);
    },
    onError: (error: any) => {
      setWeekendsResponseStatus(false);
      toast(
        "error",
        error?.response?.data?.message || "Failed to update weekend"
      );
      setIsWeekendRequestLoading(false);
    },
  });

  // Delete existing weekend

  const { isLoading: isDeletingWeekend, mutate: deleteWeekend } = usePut({
    baseURL: "https://school.development.ealpha.net/api/v1/",
    url: `schools-service/holiday-management/weekends/delete/${currentWeekendData?.id}/`,
    onSuccess: () => {
      setWeekendsResponseStatus(true); // Set success response status
      toast("success", "Weekend deleted successfully!");
      fetchWeekends(); // Refresh weekends list
    },
    onError: (error: any) => {
      setWeekendsResponseStatus(false); // Set error response status
      toast(
        "error",
        error?.response?.data?.message || "Failed to delete weekend"
      );
    },
  });

  // Save new holiday
  const { isLoading: isSavingHoliday, mutate: saveHoliday } = usePost({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: "schools-service/holiday-management/holidays/",
    onSuccess: () => {
      toast("success", "Holiday added successfully!");
      setHolidayStatus(true);
      setIsCreateLoading(false);
      fetchHolidays();
      fetchEvents();
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
    url: `schools-service/holiday-management/holidays/${
      currentEditData?.id || selectedEditHolidayId
    }/`,
    onSuccess: () => {
      toast("success", "Holiday updated successfully!");
      setHolidayStatus(true);
      fetchHolidays(); // Refresh holidays after edit
      fetchEvents();
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
  const { isLoading: isDeletingHoliday, mutate: deleteHoliday } = useDelete({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/holiday-management/holidays/delete/${selectedHolidayId}/`,
    onSuccess: () => {
      toast("success", "Holiday deleted successfully!");
      setHolidayStatus(true);
      fetchHolidays(); // Refresh holidays after delete
      SetDesiderPopup(false);
      fetchEvents();
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
      holiday_type: saveData.dayType === "full_day" ? "full_day" : "half_day",
      school: schoolId,
      branch: branchId || null,
    };

    saveHoliday(payload); // Save new holiday
  };

  const handleEditHoliday = (editData: any) => {
    const payload = {
      holiday_name: editData.holidayName,
      description: editData.description,
      start_date: editData.startDate,
      end_date: editData.endDate,
      holiday_type: editData.dayType === "full_day" ? "full_day" : "half_day",
      school: schoolId,
    };

    updateHoliday(payload); // Update existing holiday
  };

  const handleonEditIconClick = (event: any) => {
    setSelectedEditHolidayId(event.id);
  };

  const handleDeleteHoliday = (id: number) => {
    setSelectedHolidayId(id);
  };

  const handleEditClick = (event: any) => {
    if (event.title === "Weekend") {
      // Weekend event
      const selectedWeekend = weekendsData.find((weekend: any) =>
        weekend.days.some(
          (day: string) =>
            event.start.toLocaleDateString("en-GB", { weekday: "long" }) === day
        )
      );

      setCurrentWeekendData(selectedWeekend || null); // Set the weekend data for editing
      setIsWeekendModalOpen(true); // Open weekend modal
    } else {
      // Holiday event
      setCurrentEditData(event); // Set the selected holiday data for editing
      SetDesiderPopup(true); // Open holiday modal
      setCurrentView("edit"); // Set to edit view
    }
  };

  const handleSelect = (obj: { start: Date; end: Date }) => {
    const { start, end } = obj;
    setCurrentEditData(null); // Clear current edit data
    setSelectedTimeFrom(start);
    setSelectedTimeTo(start);
    SetDesiderPopup(true); // Open the modal
    setCurrentView("create"); // Set to create view
  };

  const handleSaveOrUpdateWeekend = (weekendData: any) => {
    setIsWeekendRequestLoading(true);

    const payload = {
      school: schoolId,
      branch: branchId,
      days: weekendData.days,
      ends_after: weekendData.ends_after,
    };

    if (currentWeekendData) {
      updateWeekend(payload); // Update existing weekend
    } else {
      createWeekend(payload); // Create new weekend
    }
  };

  const contextValue = useMemo(() => {
    return {
      start: selectedTimeFrom,
      end: selectedTimeTo,
    };
  }, [selectedTimeFrom, selectedTimeTo]);

  const pageTitle = isSchoolOrBranchAdmin
    ? "Manage school calendar"
    : "Manage Weekends and Holidays";

  return (
    <HolidayDatesContext.Provider value={contextValue}>
      <RouteLayout navBack={true}>
        {/* Buttons Section */}
        <div className="flex justify-between items-center p-4 mt-5">
          {/* Page Title */}
          <PageTitle title={pageTitle} />

          <div className="flex items-center space-x-4">
            {/* Edit Weekends Button */}
            <Button
              sx={{
                backgroundColor: "#4A9D2D",
                color: "#FFFFFF",
                "&:hover": { backgroundColor: "#3A7D24" },
              }}
              onClick={() => {
                setCurrentWeekendData(
                  weekendsData.length > 0 ? weekendsData[0] : null
                ); // Reset edit data for new weekend
                setIsWeekendModalOpen(true); // Open modal
              }}
            >
              Manage Weekends
            </Button>
          </div>
          <div className="relative ml-4" ref={dropdownRef}>
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
                      setIsDropdownOpen(false);
                    }}
                  >
                    View
                  </div>
                  <div
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setCurrentView("create");
                      SetDesiderPopup(true);
                      setIsDropdownOpen(false);
                    }}
                  >
                    Add
                  </div>
                  <div
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setCurrentView("list");
                      SetDesiderPopup(true);
                      setIsDropdownOpen(false);
                    }}
                  >
                    Edit
                  </div>
                  <div
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setCurrentView("list");
                      SetDesiderPopup(true);
                      setIsDropdownOpen(false);
                    }}
                  >
                    Delete
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <AddWeekendModal
          isOpen={isWeekendModalOpen}
          onClose={() => {
            setIsWeekendModalOpen(false);
            setCurrentWeekendData({});
          }}
          onSave={handleSaveOrUpdateWeekend}
          isRequestLoading={isWeekendRequestLoading}
          setIsRequestLoading={setIsWeekendRequestLoading}
          initialData={currentWeekendData} // Pass current weekend data
          weekendsResponseeStatus={weekendsResponseeStatus}
        />
        <AddHolidayModal
          desiderPopup={desiderPopup}
          SetDesiderPopup={SetDesiderPopup}
          holidayResponseStatus={holidayResponseStatus}
          onSave={(holidayData: any) => {
            currentView === "edit"
              ? handleEditHoliday(holidayData) // Handle edit
              : handleSaveHoliday(holidayData); // Handle create
          }}
          onEdit={(holidayData: any) => handleonEditIconClick(holidayData)}
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
            className="studentSchedular"
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
    </HolidayDatesContext.Provider>
  );
}
