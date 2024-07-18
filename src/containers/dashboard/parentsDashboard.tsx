import CustomCalendar from '@component/CustomeCalendar';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import Dropdown from '@component/dropdown/Dropdown';
import { ReactComponent as DropdownIcon } from '@images/down arrow.svg';
import { ReactComponent as Attendence } from '@images/smicons/Ic_attendance.svg';
import { ReactComponent as SchoolTimetable } from '@images/smicons/Ic_timetable.svg';
import { ReactComponent as ICAssessments } from '@images/smicons/ic_Assessments.svg';
import { ReactComponent as ICAssignments } from '@images/smicons/ic_Assignments.svg';
import { ReactComponent as UpcomingEvent } from '@images/smicons/upcomingEvents.svg';
import RouteLayout from '@layout/routeLayout';
import { Popover } from '@mui/material';
import { useGet, useRAWGetApi } from '@shared/api/useApi';
import Loader, { AloneLoader } from '@shared/loader';
import PageTitle from '@shared/pageTitle';
import { selectUser } from '@shared/store/userSlice';
import { sortData } from '@utility/utility';
import moment from 'moment';
import { useId, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import ToastMessage from '@containers/dashboard/ToastMessage';
import EventForm from './eventForm';
import Tabs from './tabs';

const weekList = [
  { label: 'Select', value: 'select' },
  { label: 'Next Week', value: 'Next week' },
  { label: 'This Week', value: 'This week' }
];

export default function ParentsDashboard() {
  const popOverId = useId();
  const calendarRef = useRef() as any;
  const [selectedWeek, setSelectedWeek] = useState<string>('select');
  const [openCalendarPopup, setCalendarPopup] = useState<boolean>(false);
  const [calendarDate, setCalendarDate] = useState<Date>(moment().toDate());
  const [eventListDate, setEventListDate] = useState<Date>(moment().toDate());
  const [selectedChild, setSelectedChild] = useState();
  const [childrenData, setChildrenData] = useState<any>([]);
  const { userId, branch_name, school_name } = useSelector(selectUser);
  const { schoolName } = useParams();
  const [eventID, setEventID] = useState<any>();
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [isVisibleDropdown, setVisibleDropdown] = useState<boolean>(true);
  const userServiceBaseURL = import.meta.env.VITE_APP_USER_SERVICE_URL;
  const assessmentServiceBaseURL = import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL;
  const assignmentServiceBaseURL = import.meta.env.VITE_APP_ASSIGNMENT_SERVICE_URL;
  const roasterServiceBaseURL = import.meta.env.VITE_APP_ROSTER_SERVICE_URL;

  // ----------------------------------------API-------------------------
  // Get Childrens List
  const { isLoading: childrenLoading, refetch: childrenFetch } = useGet({
    baseURL: userServiceBaseURL,
    url: `users-service/parent-student-details/${userId}/`,
    onSuccess: (res: any) => {
      const resp = res?.data?.response?.students;
      const body: any = [];
      resp?.map((i: any) => {
        body.push(
          {
            label: `${i?.first_name} ${i?.last_name}`,
            value: i?.id,
            class: i?.class_name
          }
        );
        body.sort(sortData);
        return body;
      });
      setSelectedChild(body[0].value);
      setChildrenData([...body]);
    },
    onError: () => { }
  });

  const { isLoading: assessmentLoading, data: assessmentData, refetch: refetchAssessmentData } = useRAWGetApi({
    baseURL: assessmentServiceBaseURL,
    url: `assessments-service/student-dashboard-assessment/?user_id=${selectedChild}`,
    enabled: !!selectedChild,
    cacheTime: 0
  });
  const { isLoading: assignmentLoading, data: assignmentData, refetch: refetchAssignmentData } = useRAWGetApi({
    baseURL: assignmentServiceBaseURL,
    url: `assignments-service/assignment/student-dashboard-assignment/?user_id=${selectedChild}`,
    enabled: !!selectedChild,
    cacheTime: 0
  });

  const { isLoading: assignmentDueLoading, data: assignmentDueData, refetch: refetchAssignmentDueData } = useRAWGetApi({
    baseURL: assignmentServiceBaseURL,
    url: `assignments-service/student-due-soon-assignments/?user_id=${selectedChild}&selected_week=${selectedWeek}`,
    enabled: selectedWeek !== 'select' || !!selectedChild,
    cacheTime: 0
  });
  const { isLoading: assessmentDueLoading, data: assessmentDueData, refetch: refetchAssessmentDueData } = useRAWGetApi({
    baseURL: assessmentServiceBaseURL,
    url: `assessments-service/student-due-soon-assessment/?user_id=${selectedChild}&selected_week=${selectedWeek}`,
    enabled: selectedWeek !== 'select' || !!selectedChild,
    cacheTime: 0
  });
  const { data: singleEvent, refetch: SingleEvents } = useRAWGetApi({
    baseURL: roasterServiceBaseURL,
    url: `roster-service/events${eventID ? `/${eventID}` : ''}/?user_id=${userId}`,
    cacheTime: 0,
    enabled: !!eventID
  });

  const { isLoading: filteredEventDataLoading, data: filteredEventData, refetch } = useRAWGetApi({
    baseURL: roasterServiceBaseURL,
    url: `roster-service/events/?user_id=${userId}&selected_date=${moment(eventListDate).format('yyyy-MM-DD')}`,
    enabled: !!eventListDate,
    cacheTime: 0
  });
  const { data: eventData, refetch: refreshEvents } = useRAWGetApi({
    baseURL: roasterServiceBaseURL,
    url: `roster-service/events/?user_id=${userId}`,
    cacheTime: 0
  });
  function convertAndLogLocalTime(utcTimeStr:string) {
    const utcTime = moment.utc(utcTimeStr);
    const userTimezoneOffset = moment().utcOffset();
    const localTime = utcTime.clone().add(userTimezoneOffset, 'minutes');
    const formattedLocalTime = localTime.format('hh:mm A');
    return formattedLocalTime;
  }
  // useEffect(() => {
  //   if (selectedChild) {

  //   }
  // }, [selectedChild]);

  const eventList = useMemo(() => filteredEventData?.data?.response?.map((evt: any) => (
    <div className="flex flex-row p-2" key={evt?.event_name}>
      <div className="rounded-full mr-4">
        <UpcomingEvent />
      </div>
      <div>
        <div className="text-sm font-bold cursor-pointer" onClick={() => { setShowPopup(true); setEventID(evt?.id); }}>
          {evt?.event_name}
        </div>
        <div className="text-sm text-gray-500">
          {`${convertAndLogLocalTime(evt?.start_date)} - ${convertAndLogLocalTime(evt?.end_date)}`}
        </div>
      </div>
    </div>
  )), [filteredEventData]);

  // const markEvents = useMemo(() => eventData?.data?.response?.map((evt: any) => ({ name: evt?.name, date: moment(evt.start_date) })), [eventData]);

  const markEvents = useMemo(() => {
    const tmp = [] as any;
    const tmp2 = {} as any;
    eventData?.data?.response?.forEach((evt: any) => {
      const start = moment(evt.start_date);
      const end = moment(evt.end_date);
      while (start.format('yyyy-MM-DD') < end.format('yyyy-MM-DD')) {
        tmp.push(moment(start).format('yyyy-MM-DD'));
        const key = moment(start).format('yyyy-MM-DD');
        if (tmp2[key]) {
          tmp2[key] = [...tmp2[key], { name: evt?.event_name, date: start }];
        } else {
          tmp2[key] = [{ name: evt?.event_name, date: start }];
        }
        start.add(1, 'days');
      }
      if (!tmp?.includes(moment(start).format('yyyy-MM-DD'))) {
        tmp.push(moment(start).format('yyyy-MM-DD'));
      }
      const key = moment(start).format('yyyy-MM-DD');
      if (tmp2[key]) {
        tmp2[key] = [...tmp2[key], { name: evt?.event_name, date: start }];
      } else {
        tmp2[key] = [{ name: evt?.event_name, date: start }];
      }
    });
    return tmp2;
  }, [eventData]);

  return (
    <RouteLayout navBack={false} overflow={true}>
      <ToastMessage />
      <div className="flex items-center mb-3">
        <PageTitle title={`${branch_name || school_name || 'Test'}`} />
        <div className="flex items-center">
          {
            selectedChild
            && (
              <>
                <span className="text-sm font-semibold mr-4">Select Child</span>
                <Dropdown
                  value={selectedChild}
                  dataArray={childrenData}
                  displayEmpty={true}
                  onChangeHandler={(value) => setSelectedChild(value)}
                  sxClass={{ width: '300px' }}
                />
              </>
            )
          }
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-y-4 lg:flex-row gap-x-4 lg:overflow-hidden">
        <div className="w-full lg:w-[280px] h-max lg:h-full border overflow-auto">
          <div className="inline-flex flex-col justify-start bg-white rounded-md mt-4 shadow-lg">
            <CustomCalendar
              parentClass="teacher_dashboard_left"
              value={calendarDate}
              onSelect={(val: Date) => setCalendarDate(val)}
              events={markEvents || []}
            />
            {/* <div className="w-full flex items-center justify-end pb-2 pr-4">
              <Button onClick={() => setopenPopup(true)}>Add Events</Button>
            </div> */}
          </div>
          <div className="bg-white flex flex-col gap-y-4 p-2 mr-2 mt-4">
            <div
              ref={calendarRef}
              role="presentation"
              className="h-[40px] w-full border border-linegray rounded-md px-2 flex items-center justify-between active:bg-gray-100 hover:cursor-pointer"
              onClick={() => setCalendarPopup(true)}
            >
              {
                moment(eventListDate).format('DD MMMM')
              }
              <div className={`${openCalendarPopup ? 'rotate-180' : ''}`}>
                <DropdownIcon />
              </div>
            </div>
            <div className="w-full h-full">
              <div className="pb-3 flex items-center justify-between">
                <PageTitle title="Upcoming" />
                {
                  filteredEventDataLoading && (
                    <AloneLoader size={16} />
                  )
                }
              </div>
              <div className="max-h-[300px] overflow-auto">
                {
                  filteredEventData?.data?.response?.length < 1
                    ? (
                      <p>No Event Found</p>
                    )
                    : eventList
                }
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 pt-1 overflow-hidden">
          <PageTitle title="Your Child's Reports and Timetable" />
          <div className="overflow-auto py-4 flex flex-col md:flex-row">
            <div className="sm-container">
              <div className="card-container">
                <Link to={`/${schoolName}/assignment`} className="cards">
                  <ICAssignments />
                  <span>Assignments</span>
                </Link>
                <Link to={`/${schoolName}/assessments`} className="cards">
                  <ICAssessments />
                  <span>Assessments</span>
                </Link>
                <Link to={`/${schoolName}/attandance`} className="cards">
                  <Attendence />
                  <span>Attendance</span>
                </Link>
                <Link to={`/${schoolName}/time-table`} className="cards">
                  <SchoolTimetable />
                  <span>School Timetable</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden mt-3">
            <div className="relative">
              <div className={`absolute right-0 -top-5 ${isVisibleDropdown ? '' : 'hidden'}`}>
                <Dropdown
                  title="Select Branch"
                  value={selectedWeek}
                  dataArray={weekList}
                  onChangeHandler={(val: string) => setSelectedWeek(val)}
                  sxClass={{ width: '150px' }}
                />
              </div>
              {
                (assessmentLoading || assignmentLoading || assignmentDueLoading || assessmentDueLoading)
                  ? (
                    <div className="h-56">
                      <Loader />
                    </div>
                  )
                  : (
                    <Tabs
                      dueData={{
                        assessment: selectedWeek !== 'select'
                          ? assessmentDueData?.data?.response?.due_soon_assessments || []
                          : assessmentData?.data?.response?.due_soon_assessments || [],
                        assignment: selectedWeek !== 'select'
                          ? assignmentDueData?.data?.response?.due_soon_assignments || []
                          : assignmentData?.data?.response?.due_soon_assignments || []
                      }}
                      inCompleteData={{
                        assessment: assessmentData?.data?.response?.incomplete_assessments || [],
                        assignment: assignmentData?.data?.response?.incomplete_assignments || []
                      }}
                      selectedChild={selectedChild}
                      currentSelectedTab={(selectedTab) => { if (selectedTab === 'InComplete') { setVisibleDropdown(false); } else { setVisibleDropdown(true); } }}
                    />
                  )
              }

            </div>
          </div>

        </div>
      </div>
      {/* <CustomizedDialogs title="Add Event" open={openPopup} setOpen={setopenPopup} onclose={() => setopenPopup(false)}>
        <EventForm
          close={() => setopenPopup(false)}
          refetch={() => {
            refreshEvents();
            refetch();
          }}
        />
      </CustomizedDialogs> */}
      <Popover
        id={popOverId}
        open={openCalendarPopup}
        anchorEl={calendarRef?.current}
        onClose={() => setCalendarPopup(false)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
      >
        <div className="h-fit overflow-hidden">
          <CustomCalendar
            value={eventListDate}
            onSelect={(val: Date) => {
              setEventListDate(val);
              setCalendarPopup(false);
            }}
          />
        </div>
      </Popover>
      <CustomizedDialogs title="Event" open={showPopup} setOpen={setShowPopup} onclose={() => setShowPopup(false)}>
        <EventForm
          close={() => setShowPopup(false)}
          disabled={true}
          data={singleEvent?.data?.response[0]}
        />
      </CustomizedDialogs>
    </RouteLayout>
  );
}
