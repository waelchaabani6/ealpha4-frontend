import React, { useState, useEffect } from 'react';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import { CustomInput } from '@component/input';
import Button from '@component/button/button';
import Checkbox from '@mui/material/Checkbox';
// import BigCalendar from "react-big-calendar";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import PageTitle from '@shared/pageTitle';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'moment/locale/en-gb';
import Dropdown from '@component/dropdown/Dropdown';
import './customTimetable.css';
import RouteLayout from '@layout/routeLayout';
import { useGet } from '@shared/api/useApi';
import { useSelector } from 'react-redux';
import { selectUser } from '@shared/store/userSlice';
import CustomeDateRange from './CustomeDateRange/index';
import events from './events';

moment.locale('en-GB');
const localizer = momentLocalizer(moment);

moment.locale('en-GB', {
  week: {
    dow: 1 // Monday is the first day of the week.
  }
});

type EventTypeData = {
  title: string;
  start: Date;
  end: Date;
  hexColor?: string;
}

const today = new Date();
const plus7 = new Date(new Date().setDate(new Date().getDate() + 7));

export default function Index() {
  const [eventsData, setEventsData] = useState<Array<EventTypeData>>(events);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedTimeFrom, setSelectedTimeFrom] = useState('');
  const [selectedTimeTo, setSelectedTimeTo] = useState('');

  const [timeStart, setTimeStart] = useState(new Date());
  const [timeEnd, setTimeEnd] = useState(new Date());
  const [teacher, setTeacher] = useState('');

  const [schoolTimetableEvent, SetSchoolTimetablePopup] = useState(false);
  const [desiderPopup, SetDesiderPopup] = useState(false);

  const [isHolidayCheck, setHolidayCheck] = useState(false);
  const [isSchollTimetableCheck, setSchollTimetableCheck] = useState(false);

  const [resonForHoliday, setResonForHoliday] = useState('');
  const [markAsHolidayPopup, setMarkAsHolidayPopup] = useState(false);
  const [BranchArray, setBranchArray] = useState<any>([]);
  const [ClassesArray, setClassesArray] = useState<any>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedBranch, setselectedBranch] = useState('');
  const { schoolId } = useSelector(selectUser);
  const [startDate, setStartDate] = useState(moment(today).utc().format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment(plus7).utc().format('YYYY-MM-DD'));
  const [classId, setClassId] = useState(-1);
  const [branchId, setBranchId] = useState(-1);

  const formatAMPM = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';

    hours %= 12;
    hours = hours || 12;
    const minutesString = minutes < 10 ? `0${minutes}` : minutes;
    // ${ampm}
    const strTime = `${hours}:${minutesString}`;

    return strTime;
  };

  const handleSelect = (obj: { start: Date; end: Date }) => {
    const { start, end } = obj;

    setSelectedTimeFrom(formatAMPM(start));
    setSelectedTimeTo(formatAMPM(end));

    setTimeStart(start);
    setTimeEnd(end);

    setTeacher('Ron');
    SetDesiderPopup(true);
  };

  const handleOkDialogClick = () => {
    SetSchoolTimetablePopup(false);

    const start = timeStart;
    const end = timeEnd;
    const title = teacher;

    start.setHours(Number(selectedTimeFrom.split(':')[0]));
    start.setMinutes(Number(selectedTimeFrom.split(':')[1]));

    setEventsData([
      ...eventsData,
      {
        start,
        end,
        title
      }
    ]);

    setSchollTimetableCheck(false);
  };

  const submitHolidayForSelectedDay = () => {
    setHolidayCheck(false);
    setSchollTimetableCheck(false);
    setMarkAsHolidayPopup(false);

    // Add Event for whole day
    const start = timeStart;
    start.setHours(9);
    start.setMinutes(30);

    const end = new Date(timeStart);
    end.setHours(17);
    end.setMinutes(30);

    const title = resonForHoliday;

    setResonForHoliday('');
    // 17, 30
    setHolidayCheck(false);
    setSchollTimetableCheck(false);

    setEventsData([
      ...eventsData,
      {
        start,
        end,
        title
      }
    ]);
  };

  // branchArray
  const { isLoading: schoolLoading } = useGet({
    url: `schools-service/school-branches/?school_id=${schoolId}&limit=100&offset=0&ordering=asc`,
    // cacheTime: 2000,
    onSuccess: (resp: any) => {
      const accData = resp?.data?.response;
      const respData = accData?.results;
      const branchArray: never[] = respData.map((i: any) => ({
        label: i?.name,
        value: i?.name,
        id: i?.id
      }));
      setBranchArray(branchArray);
    }
  });

  //  Get Academiic Year
  const { isLoading: academicYearLoading, data } = useGet({
    url: `roster-service/time_tables?start_date=${startDate}&end_date=${endDate}&class_id=${classId}&branch_id=${branchId}`,
    // cacheTime: 2000,
    onSuccess: (res: any) => {
      const resp = res?.data?.response || [];
      let eventData: any[] = [];
      if (resp.length) {
        resp.forEach((dateData: any) => {
          if (dateData.time_blocks && dateData.time_blocks.length !== 0) {
            eventData = [...eventData, ...dateData.time_blocks];
          }
        });
      }
      eventData = eventData.map((ele) => ({
        title: '',
        start: new Date(ele.time_from),
        end: new Date(ele.time_to),
        hexColor: 'FF00FF'
      }));
      setEventsData(eventData);
    },
    onError: ({ response }: any) => false
  });

  // get Branches
  const { isLoading: getBranchLoading, refetch: fetchBranch } = useGet({
    url: `schools-service/school-classes?school_id=${schoolId}`,
    onSuccess: (resp: any) => {
      const respData = resp?.data?.response?.results;
      const temp2: { label: any; value: any; id: any }[] = [];
      respData?.map((i: any) => {
        temp2.push(
          {
            label: i?.name,
            value: i?.name,
            id: i?.id
          }
        );
        return temp2;
      });
      setClassesArray([...temp2]);
    },
    onError: ({ response }: any) => {

    }
  });

  return (
    <div>
      <RouteLayout
        navBack={true}
      >
        <PageTitle title="School timetable" />

        <CustomizedDialogs
          open={schoolTimetableEvent}
          setOpen={(parameter: any) => { SetSchoolTimetablePopup(false); setHolidayCheck(false); setSchollTimetableCheck(false); }}
          title="Add School Timetable"
        >
          <div>

            <div className="flex">
              <Dropdown
                title="Select Course"
                value={selectedCourse}
                dataArray={['English', 'Maths', 'Social science', 'Geometry', 'Algebra']}
                onChangeHandler={(value) => { setSelectedCourse(value); }}
                sxClass={{ border: '1px solid gray', width: '100%' }}
                parentStyle="grow p-4"
              />

              <Dropdown
                title="Teacher"
                value="Ron"
                dataArray={['Ron']}
                onChangeHandler={() => { }}
                sxClass={{ width: '100%', border: '1px solid gray', opacity: '0.5' }}
                parentStyle="grow p-4 pointer-events-none"
              />

            </div>

            <div className="flex">
              <Dropdown
                title="Time From"
                value={selectedTimeFrom}
                dataArray={['8:30', '9:00', '9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '1:00', '1:30', '2:00', '2:30', '3:00', '3:30', '4:00', '4:30', '5:00', '5:30']}
                onChangeHandler={(value) => { setSelectedTimeFrom(value); }}
                sxClass={{ border: '1px solid gray', width: '100%' }}
                parentStyle="grow p-4"
              />

              <Dropdown
                title="Time To"
                value={selectedTimeTo}
                dataArray={['8:30', '9:00', '9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '1:00', '1:30', '2:00', '2:30', '3:00', '3:30', '4:00', '4:30', '5:00', '5:30']}
                onChangeHandler={(value) => { setSelectedTimeTo(value); }}
                sxClass={{ width: '100%', border: '1px solid gray' }}
                parentStyle="grow p-4"
              />
            </div>
          </div>
          <div className="flex justify-end py-6">
            <Button onClick={handleOkDialogClick}> Ok </Button>
          </div>
        </CustomizedDialogs>

        <CustomizedDialogs
          open={markAsHolidayPopup}
          className="mycustomedialog"
          maxWidth="493px"
          fullWidth={false}
          title="Mark as Holiday"
          setOpen={() => { setMarkAsHolidayPopup(false); }}
        >
          <div>
            <div className="text-center mb-5">Reson for holiday</div>
            <CustomInput size="small" icon={true} error={false} fullWidth={true} value={resonForHoliday} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setResonForHoliday(e.target.value); }} />
            <div className="flex justify-end py-6">
              <Button onClick={submitHolidayForSelectedDay}> Add </Button>
            </div>

          </div>
        </CustomizedDialogs>

        <CustomizedDialogs
          open={desiderPopup}
          setOpen={(parameter: any) => { SetDesiderPopup(false); }}
          title=""
          className="mycustomedialog"
          maxWidth="493px"
          fullWidth={false}
        >
          <div className="flex flex-col">
            <div className="text-center font-bold mb-6">
              {moment(timeStart).format('Do MMMM YYYY, dddd')}
            </div>
            <div className="flex mb-4 justify-between">
              <div>

                <Checkbox checked={isHolidayCheck} size="small" onChange={(e) => { setHolidayCheck(e.target.checked); setMarkAsHolidayPopup(true); SetDesiderPopup(false); }} />
                <span> Mark as Holiday </span>
              </div>

              <div>
                <Checkbox checked={isSchollTimetableCheck} size="small" onChange={(e) => { setSchollTimetableCheck(e.target.checked); SetSchoolTimetablePopup(true); SetDesiderPopup(false); }} />
                <span> Add School Timetable </span>
              </div>
            </div>
          </div>
        </CustomizedDialogs>

        <div className="flex m-3 justify-between">

          <div className="flex">
            <Dropdown
              title="Select Branch"
              value={selectedBranch}
              dataArray={BranchArray}
              onChangeHandler={(val) => {
                const obj: any = BranchArray.filter((ele: { label: any; }) => ele.label === val)[0];
                setBranchId(obj.id);
                setselectedBranch(val);
              }}
              sxClass={{ width: '206px', marginRight: '10px' }}
            />
            <Dropdown
              title="Select a class"
              value={selectedClass}
              dataArray={ClassesArray}
              onChangeHandler={(val) => {
                const obj: any = ClassesArray.filter((ele: { label: any; }) => ele.label === val)[0];
                setClassId(obj.id);
                setSelectedClass(val);
              }}
              sxClass={{ width: '206px' }}
            />
          </div>

          {/* setStartDate, setEndDate */}
          <CustomeDateRange
            parentClass="forEventCalendar"
            fromValProps={(fromVal) => { setStartDate(fromVal); }}
            toValProps={(toVal) => { setEndDate(toVal); }}
            fromInitialDate={today}
            toInitialDate={plus7}
            onSearchButtonClick={() => { }}
            resetDateRange={() => { }}
          />

        </div>

        <div className="bg-white">
          <Calendar
            views={['week']} // ["day", "agenda", "work_week", "month","week"]
            selectable={true}
            localizer={localizer}
            min={new Date(2023, 0, 1, 9, 30)} // 09.30 AM
            max={new Date(2023, 0, 1, 17, 30)} // Max will be 05.30 PM!
            defaultDate={new Date()}
            defaultView="week"
            events={eventsData}
            style={{ width: '100%', height: '700px' }} // height: "100vh"
            onSelectEvent={(event: { title: string }) => alert(event.title)}
            onSelectSlot={handleSelect}
            formats={{
              dayFormat: (date, culture: any) => localizer.format(date, 'ddd D', culture),
              dayRangeHeaderFormat: (date: any, culture: any) => localizer.format(date, 'ddd YYYY', culture)
            }}
            eventPropGetter={(event, start, end, isSelected) => ({
              event,
              start,
              end,
              isSelected,
              style: { backgroundColor: 'green' }
            })}
            className="studentSchedular pointerHide"
            dayLayoutAlgorithm="overlap"
          />
        </div>
      </RouteLayout>
    </div>
  );
}
