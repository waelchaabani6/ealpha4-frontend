import React, { useState, useEffect } from 'react';
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
import toast from '@shared/toast';
import Loader from '@shared/loader';
import { sortData } from '@utility/utility';
import { MAX_TIME, START_TIME } from '@constants/constants';
import CustomeDateRange from './CustomeDateRange';
import events from './events';

const SCHOOL_SERVICE = import.meta.env.VITE_APP_SCHOOL_SERVICE_URL;
const ROASTER_SERVICE = import.meta.env.VITE_APP_ROSTER_SERVICE_URL;
const USER_SERVICE = import.meta.env.VITE_APP_USER_SERVICE_URL;

moment.locale('en-GB');
const localizer = momentLocalizer(moment);

moment.locale('en-GB', {
  week: {
    dow: 1
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
  const reduxData = useSelector(selectUser);
  const { branchId = -1 } = reduxData;
  const [startDate, setStartDate] = useState(moment(today).utc().format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment(plus7).utc().format('YYYY-MM-DD'));
  const [classId, setClassId] = useState(-1);
  const [dateApplied, setDateApplied] = useState(false);
  const [selectedChild, setSelectedChild] = useState('');
  const [childrenData, setChildrenData] = useState<any>([]);
  const { userId } = useSelector(selectUser);
  const [navigationDate, setNaviagationDate] = useState(new Date());
  const [startTime, setStartTime] = useState(START_TIME);

  // Get Childrens List
  const { isLoading: childrenLoading, refetch: childrenFetch } = useGet({
    baseURL: USER_SERVICE,
    url: `users-service/parent-student-details/${userId}/`,
    onSuccess: (res: any) => {
      const resp = res?.data?.response?.students;
      const body: any = [];
      resp?.map((i: any) => {
        body.push(
          {
            label: `${i?.first_name} ${i?.last_name}`,
            value: i?.id,
            class: i?.class_name,
            classId: i?.assign_class
          }
        );
        body.sort(sortData);
        return body;
      });
      setChildrenData([...body]);
    },
    onError: () => { }
  });

  const { isLoading: timetableLoading, data, refetch: refetchTimetable, isRefetching } = useGet({
    baseURL: ROASTER_SERVICE,
    url: dateApplied ? `roster-service/time_tables?class_id=${classId}&start_date=${startDate}&end_date=${endDate}${(branchId === -1 || branchId === null) ? '' : `&branch_id=${branchId} `}`
      : `roster-service/time_tables?class_id=${classId}${(branchId === -1 || branchId === null) ? '' : `&branch_id=${branchId}`}`,
    // cacheTime: 2000,
    onSuccess: (res: any) => {
      const resp = res?.data?.response || [];
      // eslint-disable-next-line no-console
      let eventData: any[] = [];
      let tempStartTime = MAX_TIME;
      if (resp.length) {
        resp.forEach((dateData: any) => {
          if (dateData.time_blocks && dateData.time_blocks.length !== 0) {
            dateData.time_blocks = dateData.time_blocks.map((ele: { is_holiday: any; subject_name: string }) => ({ ...ele, is_holiday: dateData.is_holiday, reason: dateData.is_holiday ? dateData?.reason : ele?.subject_name, mainEventId: dateData.id }));
            eventData = [...eventData, ...dateData.time_blocks];
          }
        });
      }
      eventData = eventData.map((ele, index) => {
        let hexColor = ele.is_holiday === true ? '#94A3B8' : '#b0db77';
        if (ele.time_from && moment(new Date(ele.time_from)).isValid() && (moment(ele.time_from).day() === 0 || moment(ele.time_from).day() === 6)) {
          hexColor = '#E07B5B';
        }
        if (!ele.is_holiday) {
          const hourValue = Number(moment(new Date(ele.time_from?.replace('Z', ''))).format('HH'));
          tempStartTime = hourValue < tempStartTime ? hourValue : tempStartTime;
        }
        return ({
          ...ele,
          id: ele.id,
          mainEventId: ele.mainEventId,
          reason: ele.reason,
          is_holiday: ele.is_holiday,
          currentIndex: index,
          title: ele.reason,
          start: new Date(ele.time_from?.replace('Z', '')),
          end: new Date(ele.time_to?.replace('Z', '')),
          hexColor
        });
      });
      tempStartTime = tempStartTime === MAX_TIME ? START_TIME : tempStartTime;
      setStartTime(tempStartTime);
      setEventsData(eventData);
    },
    onError: ({ response }: any) => {
      const errorMsg = response?.data?.errors?.time_blocks[0]?.non_field_errors[0];
      toast('error', errorMsg);
    },
    enabled: false
  });

  useEffect(() => {
    if (childrenData.length) {
      setSelectedChild(childrenData[0].value);
      setClassId(childrenData[0].classId);
    }
  }, [childrenData]);

  useEffect(() => {
    if (selectedChild !== '' && classId !== -1) {
      refetchTimetable();
    }
  }, [dateApplied, classId, selectedChild]);

  // eslint-disable-next-line react/no-unstable-nested-components
  const MyLoader = () => (
    <div className="z-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <Loader />
    </div>
  );

  return (
    <div>
      <RouteLayout
        navBack={true}
      >
        <PageTitle title="School Timetable" />
        {(timetableLoading || isRefetching) && <MyLoader />}

        <div className="flex flex-col md:flex-row m-3 items-center justify-between gap-2">

          <Dropdown
            title="Select Child"
            value={selectedChild}
            dataArray={childrenData}
            displayEmpty={true}
            onChangeHandler={(value) => { setSelectedChild(value); setClassId(childrenData.find((obj: any) => obj.value === value).classId); }}
            loading={childrenLoading}
            sxClass={{ width: '100%' }}
          />

          <CustomeDateRange
            parentClass="relative top-[2px] left-[12px]"
            fromValProps={(fromVal) => { setStartDate(fromVal); }}
            toValProps={(toVal) => { setEndDate(toVal); }}
            fromInitialDate={today}
            toInitialDate={plus7}
            onSearchButtonClick={() => { setDateApplied(true); refetchTimetable(); setNaviagationDate(new Date(startDate)); }}
            resetDateRange={() => { setDateApplied(false); }}
          />
        </div>

        {selectedChild !== '' ? <div className="bg-white">
          <Calendar
            views={['week']}
            selectable={true}
            localizer={localizer}
            min={new Date(2023, 0, 1, startTime, 0)}
            max={new Date(2023, 0, 1, 18, 0)}
            date={navigationDate}
            onNavigate={(navDate: Date) => { setNaviagationDate(navDate); }}
            defaultView="week"
            events={eventsData}
            style={{ width: '100%', height: '700px' }}
            onSelectEvent={() => { }}
            onSelectSlot={() => { }}
            formats={{
              dayRangeHeaderFormat: (date: any) => moment(date.start).format('MMM YYYY'),
              dayFormat: (date, culture: any) => localizer.format(date, 'ddd D', culture),
              eventTimeRangeFormat: () => ''
            }}
            eventPropGetter={(event) => {
              const backgroundColor = event.hexColor;
              return { style: { backgroundColor } };
            }}
            className="studentSchedular pointerHide"
            dayLayoutAlgorithm="overlap"
          />
          {/* eslint-disable-next-line react/jsx-closing-tag-location */}
        </div>
          : <div className="flex justify-center items-center bg-white h-[40vh] font-bold"> No student found </div>}
      </RouteLayout>
    </div>
  );
}
