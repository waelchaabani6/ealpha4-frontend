/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable operator-linebreak */
/* eslint-disable linebreak-style */
/* eslint-disable arrow-body-style */
/* eslint-disable react/no-unstable-nested-components */
import { Typography } from '@mui/material';
import { useGet } from '@shared/api/useApi';
import { selectUser } from '@shared/store/userSlice';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { ref } from 'yup';
import Loader from '@shared/loader';

interface AttendanceData {
  date: string;
  attendance_marked: boolean;
  is_holiday: boolean;
  is_weekend: boolean;
}

interface CalendarDayProps {
  day: number | null;
  // isWeekend: boolean;
  // attendanceMarked: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  // isHoliday: boolean;
  onSelectDay: (day: number) => void;
  month: number;
  year: number;
  attendanceData: AttendanceData;
}

const CalendarDay: React.FC<CalendarDayProps> = ({
  day,
  // isWeekend,
  // attendanceMarked,
  isSelected,
  isDisabled,
  // isHoliday,
  onSelectDay,
  month,
  year,
  attendanceData = {
    // Provide default value in case attendanceData is undefined
    date: '',
    attendance_marked: false,
    is_holiday: false,
    is_weekend: false,
  },
}) => {
  const { is_holiday, is_weekend, attendance_marked } = attendanceData;

  // Memoizing the handleClick callback to prevent unnecessary re-renders
  const handleClick = useCallback(() => {
    if (day !== null && !is_weekend && !isDisabled && !is_holiday) {
      // Check if it's not a holiday
      onSelectDay(day);
    }
  }, [is_weekend, onSelectDay, day, isDisabled, is_holiday]);

  // Early return if day is null (empty cell for alignment)
  if (day === null) {
    return <div className="p-2" />;
  }

  // Memoizing currentDate and isToday for performance optimization
  const currentDate = useMemo(
    () => new Date(year, month, day),
    [year, month, day]
  );

  const isToday = useMemo(
    () =>
      moment(new Date()).format('yyyy-DD-MM') ===
      moment(currentDate).format('yyyy-DD-MM'),
    [currentDate]
  );

  // Memoizing the className string to prevent unnecessary re-renders
  const buttonClassName = useMemo(() => {
    const baseClassName = `MuiButtonBase-root MuiPickersDay-root
      ${isDisabled || is_holiday ? 'text-gray-300 cursor-not-allowed' : 'hover:cursor-pointer hover:scale-105 hover:text-gray-500'}
      ${isToday ? 'border border-gray-800 rounded-full' : ''}
      ${!is_weekend && !attendance_marked && !isSelected && !isDisabled && !is_holiday ? `after:w-[5px] after:h-[5px] after:rounded-full relative top-[3.5px] after:bg-[#1B82EC]` : ''}
      grid place-items-center
      ${isSelected ? 'text-red font-semibold' : is_weekend ? 'text-gray-400' : 'text-black'} text-xs w-9 h-9 mx-[2px]`;

    return baseClassName;
  }, [
    isDisabled,
    is_holiday,
    is_weekend,
    attendance_marked,
    isSelected,
    isToday,
  ]);

  return (
    <button
      type="button"
      role="gridcell"
      tabIndex={-1}
      disabled={is_weekend || isDisabled || is_holiday} // Disable if holiday
      className={buttonClassName}
      onClick={handleClick}
    >
      <span
        className={`block text-center ${is_weekend || isDisabled || is_holiday ? 'text-gray-500' : 'text-black'}`}
      >
        {day}
      </span>
    </button>
  );
};

const AttendanceCalednar = ({
  setSelectedDate,
  selectedDate,
  selectedCourse,
  selectedClass,
  isCalendarDisabled,
  refetchCalendar,
}: {
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  selectedDate: Date;
  selectedCourse: number | string;
  selectedClass: number | string;
  isCalendarDisabled: boolean;
  refetchCalendar: boolean;
}) => {
  const [calendarData, setCalendarData] = useState<AttendanceData[]>([]);
  // const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [month, setMonth] = useState<number>(new Date().getMonth());
  const [year, setYear] = useState<number>(2025);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const wrapperRef = useRef(null);

  const { schoolId, branchId } = useSelector(selectUser);

  const attencanceServiceBaseURL = import.meta.env
    .VITE_APP_ATTENDANCE_SERVICE_URL;

  const { isLoading: loading, refetch: fetchCalendar } = useGet({
    baseURL: attencanceServiceBaseURL,
    url: `attendance_service/calendar-status/?year=${year}&month=${month + 1}&school_id=${schoolId}&branch_id=${branchId}&class_id=${selectedClass}&course_id=${selectedCourse}`,
    onSuccess: (res: any) => {
      setCalendarData(res.data);
    },
    onError: ({ response }: any) => {},
    enabled: false,
  });

  useEffect(() => {
    fetchCalendar();
  }, [month, year, refetchCalendar]);

  const getDaysInMonth = useMemo(() => {
    const days: number[] = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [month, year]);

  const startDayOfWeek = useMemo(() => {
    // Get the weekday of the 1st of the month (0 = Sunday, 1 = Monday, etc.)
    return new Date(year, month, 1).getDay();
  }, [month, year]);

  const currentDate = useMemo(() => new Date(), []); // Get today's date for comparison

  const isDisabled = useCallback(
    (day: number): boolean => {
      const date = new Date(year, month, day);
      return date > currentDate; // Disable days after today
    },
    [month, year, currentDate]
  );

  const handleSelectDay = useCallback(
    (day: number) => {
      const selected = new Date(year, month, day);
      setSelectedDate(selected);
      setIsCalendarOpen(false); // Close calendar after selection
    },
    [month, year]
  );

  const handleMonthChange = useCallback(
    (delta: number) => {
      let newMonth = month + delta;
      let newYear = year;
      if (newMonth < 0) {
        newMonth = 11;
        newYear -= 1;
      } else if (newMonth > 11) {
        newMonth = 0;
        newYear += 1;
      }
      setMonth(newMonth);
      setYear(newYear);
    },
    [month, year]
  );

  const handleInputClick = useCallback(() => {
    setIsCalendarOpen((prev) => !prev); // Toggle calendar visibility
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const date = new Date(e.target.value);
      if (!Number.isNaN(date.getTime())) {
        setSelectedDate(date);
        setMonth(date.getMonth());
        setYear(date.getFullYear());
      }
    },
    []
  );

  const totalCells = useMemo(() => {
    // Calculate the total number of cells needed for the grid
    return getDaysInMonth.length + startDayOfWeek;
  }, [getDaysInMonth, startDayOfWeek]);

  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event: Event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    }

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

  useEffect(() => {
    fetchCalendar();
  }, [selectedClass, selectedCourse, month]);

  return (
    <div ref={wrapperRef} className="relative min-w-[280px] ">
      <div className="min-w-[200px]">
        <Typography
          className={`capitalize pb-2 `}
          variant="caption"
          display="block"
        >
          Select a date
        </Typography>

        <input
          type="text"
          value={selectedDate ? moment(selectedDate).format('yyyy-MM-DD') : ''}
          onClick={handleInputClick}
          onChange={handleInputChange}
          placeholder="Select a date"
          className="h-full w-full p-2 outline-none placeholder:text-black text-sm border-2 rounded-md disabled:border disabled:border-black disabled:rounded-md"
          disabled={isCalendarDisabled}
        />
      </div>

      {isCalendarOpen && (
        <div className="absolute top-full mt-2 w-full bg-white border rounded-lg shadow-lg z-10">
          <div className="flex justify-between p-2 bg-gray-200 rounded-t-lg">
            <button
              aria-label="left"
              type="button"
              onClick={() => handleMonthChange(-1)}
            >
              <ChevronLeftIcon />
            </button>
            <span className="font-semibold">
              {moment(new Date(year, month)).format('MMMM yyyy')}
            </span>
            <button
              aria-label="right"
              type="button"
              onClick={() => handleMonthChange(1)}
            >
              <ChevronRightIcon />
            </button>
          </div>
          {loading ? (
            <Loader />
          ) : (
            <div className="grid grid-cols-7 gap-2 p-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                (dayName) => (
                  <span
                    key={dayName}
                    className="text-xs w-9 h-10 mx-[2px] flex items-center justify-center"
                  >
                    {dayName}
                  </span>
                )
              )}
              {/* Create empty cells before the first day of the month */}
              {Array.from({ length: startDayOfWeek }).map((_, index) => (
                <div key={index} className="p-2" />
              ))}
              {getDaysInMonth.map((day) => {
                const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                const attendance = calendarData.find(
                  (item) => item.date === dateStr
                );

                return (
                  <CalendarDay
                    key={day}
                    day={day}
                    attendanceData={attendance}
                    isSelected={selectedDate?.getDate() === day}
                    isDisabled={isDisabled(day)} // Pass the isDisabled prop to CalendarDay
                    onSelectDay={handleSelectDay}
                    month={month}
                    year={year}
                  />
                );
              })}
              {/* Create empty cells after the last day of the month to fill the grid */}
              {Array.from({ length: totalCells % 7 }).map((_, index) => (
                <div key={index} className="p-2" />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceCalednar;
