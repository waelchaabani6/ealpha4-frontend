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

interface AttendanceData {
  date: string;
  attendance_marked: boolean;
}

interface CalendarDayProps {
  day: number | null;
  isWeekend: boolean;
  attendanceMarked: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  onSelectDay: (day: number) => void;
  month: number;
  year: number;
}

const CalendarDay: React.FC<CalendarDayProps> = ({
  day,
  isWeekend,
  attendanceMarked,
  isSelected,
  isDisabled,
  onSelectDay,
  month,
  year,
}) => {
  const handleClick = useCallback(() => {
    if (day !== null && !isWeekend && !isDisabled) {
      onSelectDay(day);
    }
  }, [isWeekend, onSelectDay, day, isDisabled]);

  if (day === null) {
    return <div className="p-2" />; // Empty cell for alignment
  }

  const currentDate = new Date(year, month, day);
  const isToday =
    moment(new Date()).format('yyyy-DD-MM') ===
    moment(currentDate).format('yyyy-DD-MM');

  return (
    <button
      type="button"
      role="gridcell"
      tabIndex={-1}
      disabled={isWeekend || isDisabled}
      className={`MuiButtonBase-root MuiPickersDay-root
        ${isDisabled ? 'text-gray-300' : 'hover:cursor-pointer hover:scale-105 hover:text-gray-500'} ${isToday && 'border border-gray-800 rounded-full'} ${!isWeekend && !attendanceMarked && !isSelected && !isDisabled ? `after:w-[5px] after:h-[5px] after:rounded-full relative top-[3.5px] after:bg-[#1B82EC]` : ''} 
      grid place-items-center 
      ${isSelected ? 'text-red font-semibold' : isWeekend ? 'text-gray-400' : 'text-black'} text-xs w-9 h-9 mx-[2px]`}
      onClick={handleClick}
    >
      <span
        className={`block text-center ${isWeekend || isDisabled ? 'text-gray-500' : 'text-black'}`}
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
}: {
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  selectedDate: Date;
  selectedCourse: number | string;
  selectedClass: number | string;
}) => {
  const [calendarData, setCalendarData] = useState<AttendanceData[]>([]);
  // const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [month, setMonth] = useState<number>(0); // January
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
  }, [month, year]);

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

  const isWeekend = useCallback(
    (day: number): boolean => {
      const date = new Date(year, month, day);
      return date.getDay() === 0 || date.getDay() === 6; // Sunday (0) or Saturday (6)
    },
    [month, year]
  );

  const isAttendanceMarked = useCallback(
    (day: number): boolean => {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const attendance = calendarData.find((item) => item.date === dateStr);
      return attendance ? attendance.attendance_marked : true;
    },
    [calendarData, month, year]
  );

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
  }, [selectedClass, selectedCourse]);

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
          className="h-full w-full p-2 outline-none placeholder:text-black text-sm border-2 rounded-md"
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
            {getDaysInMonth.map((day) => (
              <CalendarDay
                key={day}
                day={day}
                isWeekend={isWeekend(day)}
                attendanceMarked={isAttendanceMarked(day)}
                isSelected={selectedDate?.getDate() === day}
                isDisabled={isDisabled(day)} // Pass the isDisabled prop to CalendarDay
                onSelectDay={handleSelectDay}
                se
                month={month}
                year={year}
              />
            ))}
            {/* Create empty cells after the last day of the month to fill the grid */}
            {Array.from({ length: totalCells % 7 }).map((_, index) => (
              <div key={index} className="p-2" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceCalednar;
