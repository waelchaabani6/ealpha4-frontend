/* eslint-disable operator-linebreak */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable comma-dangle */
/* eslint-disable indent */
import CustomCalendar from '@component/CustomeCalendar';
import Button from '@component/button/button';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import Dropdown from '@component/dropdown/Dropdown';
import { ReactComponent as DropdownIcon } from '@images/down arrow.svg';
import { ReactComponent as UpcomingEvent } from '@images/smicons/upcomingEvents.svg';
import RouteLayout from '@layout/routeLayout';
import { Popover } from '@mui/material';
import { usePost, useRAWGetApi } from '@shared/api/useApi';
import Loader, { AloneLoader } from '@shared/loader';
import PageTitle from '@shared/pageTitle';
import { selectUser } from '@shared/store/userSlice';
import moment from 'moment';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import ToastMessage from '@containers/dashboard/ToastMessage';
import CircleGraph from './CircleGraph';
import TeacherIconContainer from './TeacherIconContainer';
import EventForm from './eventForm';
import Tabs from './tabs';

const weekList = [
  { label: 'Select', value: 'select' },
  { label: 'This Week', value: 'This week' },
  { label: 'Next Week', value: 'Next week' },
];

export default function TeacherDashboard() {
  const popOverId = useId();
  const calendarRef = useRef() as any;
  const [selectedWeek, setSelectedWeek] = useState<string>('select');
  const [selectedAssignmentClass, setAssignmentClass] = useState<any>();
  const [selectedAssessmentClass, setAssessmentClass] = useState<any>();
  const [openPopup, setopenPopup] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [openCalendarPopup, setCalendarPopup] = useState<boolean>(false);
  const [calendarDate, setCalendarDate] = useState<Date>(moment().toDate());
  const [eventListDate, setEventListDate] = useState<Date>(moment().toDate());
  const [TeacherClassesArray, setTeacherClassesArray] = useState<any>([]);
  const [eventID, setEventID] = useState<any>();
  const [isVisibleDropdown, setVisibleDropdown] = useState<boolean>(true);
  const {
    user_profile_id: userID,
    userId,
    branch_name,
    school_name,
  } = useSelector(selectUser);
  const schoolServiceBaseURL = import.meta.env.VITE_APP_SCHOOL_SERVICE_URL;
  const assignmentServiceBaseURL = import.meta.env
    .VITE_APP_ASSIGNMENT_SERVICE_URL;
  const assessmentServiceBaseURL = import.meta.env
    .VITE_APP_ASSESSMENT_SERVICE_URL;
  const roasterServiceBaseURL = import.meta.env.VITE_APP_ROSTER_SERVICE_URL;

  const { isLoading: loadClassesForTeacher, mutate: ClassesForTeacher } =
    usePost({
      baseURL: schoolServiceBaseURL,
      url: `schools-service/school-classes/teacher/assigned-class`,
      onSuccess: (resp: any) => {
        const res = resp?.data?.response;
        const formatArr =
          res?.map((ele: any) => ({ label: ele.name, value: ele.class_id })) ||
          [];
        setTeacherClassesArray(formatArr);
        if (formatArr.length) {
          const tmp = formatArr?.[0]?.value;
          setAssignmentClass(tmp);
          setAssessmentClass(tmp);
        }
      },
    });

  const { isLoading: assignmentLoading, data: assignmentData } = useRAWGetApi({
    baseURL: assignmentServiceBaseURL,
    url: `assignments-service/assignment/teacher-dashboard-assignment/${selectedAssignmentClass}/?user_id=${userId}`,
    enabled: !!selectedAssignmentClass,
    cacheTime: 0,
  });

  const { isLoading: assingmentDueLoading, data: assignmentDueData } =
    useRAWGetApi({
      baseURL: assignmentServiceBaseURL,
      url: `assignments-service/assignment/teacher-due-soon-assignments/${selectedAssignmentClass}/?user_id=${userID}${selectedWeek !== 'select' ? `&selected_week=${selectedWeek}` : ''}`,
      enabled: !!(selectedAssignmentClass && selectedWeek !== 'select'),
      cacheTime: 0,
    });

  const { isLoading: assessmentLoading, data: assessmentData } = useRAWGetApi({
    baseURL: assessmentServiceBaseURL,
    // url: `assessments-service/teacher-due-soon-assessment/${selectedAssessmentClass}/?user_id=${userId}${selectedWeek !== 'select' ? `&selected_week=${selectedWeek}` : ''}`,
    url: `assessments-service/teacher-dashboard-assessment/${selectedAssessmentClass}/?user_id=${userId}`,
    enabled: !!selectedAssessmentClass,
    cacheTime: 0,
  });
  const { isLoading: assessmentDueLoading, data: assessmentDueData } =
    useRAWGetApi({
      baseURL: assessmentServiceBaseURL,
      url: `assessments-service/teacher-due-soon-assessment/${selectedAssessmentClass}/?user_id=${userId}${selectedWeek !== 'select' ? `&selected_week=${selectedWeek}` : ''}`,
      enabled: !!(selectedAssessmentClass && selectedWeek !== 'select'),
      cacheTime: 0,
    });

  const {
    isLoading: filteredEventDataLoading,
    data: filteredEventData,
    refetch,
  } = useRAWGetApi({
    baseURL: roasterServiceBaseURL,
    url: `roster-service/events/?user_id=${userId}&selected_date=${moment(eventListDate).format('yyyy-MM-DD')}`,
    enabled: !!eventListDate,
    cacheTime: 0,
  });
  const { data: eventData, refetch: refreshEvents } = useRAWGetApi({
    baseURL: roasterServiceBaseURL,
    url: `roster-service/events/?user_id=${userId}`,
    cacheTime: 0,
  });

  const { data: singleEvent, refetch: SingleEvents } = useRAWGetApi({
    baseURL: roasterServiceBaseURL,
    url: `roster-service/events${eventID ? `/${eventID}` : ''}/?user_id=${userId}`,
    enabled: !!eventID,
    cacheTime: 0,
  });

  useEffect(() => {
    if (userID) {
      ClassesForTeacher({
        teacher_id: userID,
      });
    }
  }, [userID]);

  function convertAndLogLocalTime(utcTimeStr: string) {
    const utcTime = moment.utc(utcTimeStr);
    const userTimezoneOffset = moment().utcOffset();
    const localTime = utcTime.clone().add(userTimezoneOffset, 'minutes');
    const formattedLocalTime = localTime.format('hh:mm A');
    return formattedLocalTime;
  }

  const eventList = useMemo(
    () =>
      filteredEventData?.data?.response?.map((evt: any) => (
        <div className="flex flex-row p-2" key={evt?.event_name}>
          <div className="rounded-full mr-4">
            <UpcomingEvent />
          </div>
          <div>
            <div
              className="text-sm font-bold cursor-pointer"
              onClick={() => {
                setShowPopup(true);
                setEventID(evt?.id);
              }}
            >
              {evt?.event_name}
            </div>
            <div className="text-sm text-gray-500">
              {`${convertAndLogLocalTime(evt?.start_date)} - ${convertAndLogLocalTime(evt?.end_date)}`}
            </div>
          </div>
        </div>
      )),
    [filteredEventData]
  );

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

  const [isVisible, setIsVisible] = useState(true);

  // Close the toast after 10 seconds
  setTimeout(() => {
    setIsVisible(false);
  }, 10000);

  return (
    <RouteLayout navBack={false} overflow={true}>
      <ToastMessage />
      <div className="flex-1 flex flex-col gap-y-4 lg:flex-row gap-x-4 lg:overflow-hidden mt-3">
        <div className="w-full lg:w-[280px] h-max lg:h-full border overflow-auto">
          <PageTitle title={`${branch_name || school_name || 'Test'}`} />
          <div className="inline-flex flex-col justify-start bg-white rounded-md mt-4 shadow-lg">
            <CustomCalendar
              parentClass="teacher_dashboard_left"
              value={calendarDate}
              onSelect={(val: Date) => setCalendarDate(val)}
              events={markEvents || []}
            />
            <div className="w-full flex items-center justify-end pb-2 pr-4">
              <Button onClick={() => setopenPopup(true)}>Add Events</Button>
            </div>
          </div>
          <div className="bg-white flex flex-col gap-y-4 p-2 mr-2 mt-4">
            <div
              ref={calendarRef}
              role="presentation"
              className="h-[40px] w-full border border-linegray rounded-md px-2 flex items-center justify-between active:bg-gray-100 hover:cursor-pointer"
              onClick={() => setCalendarPopup(true)}
            >
              {moment(eventListDate).format('DD MMMM')}
              <div className={`${openCalendarPopup ? 'rotate-180' : ''}`}>
                <DropdownIcon />
              </div>
            </div>
            <div className="w-full h-full">
              <div className="pb-3 flex items-center justify-between">
                <PageTitle title="Upcoming" />
                {filteredEventDataLoading && <AloneLoader size={16} />}
              </div>
              <div className="max-h-[300px] overflow-auto">
                {filteredEventData?.data?.response?.length < 1 ? (
                  <p>No Event Found</p>
                ) : (
                  eventList
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 pt-1 overflow-hidden">
          <PageTitle title="Class Info" />

          <div className="max-w-[1000px] overflow-hidden py-4 pr-4 flex flex-col lg:flex-row gap-y-4 lg:gap-x-4">
            <div className=" bg-white grow p-5 overflow-hidden hover:shadow-lg transition-all">
              <div className="mb-2 flex items-center justify-between">
                <div className="font-bold"> Average Score By Class </div>
              </div>

              <div className="grid grid-cols-1 gap-y-2 lg:grid-cols-2 lg:gap-x-4 justify-center align-center">
                <CircleGraph
                  title="Assignments"
                  parentClass="bg-light-accent grow"
                  progress={
                    +(
                      assignmentData?.data?.response?.assignments_in_percent ||
                      0
                    )
                  }
                  color="#32cf1b"
                  total={
                    +(assignmentData?.data?.response?.total_assignments || 0)
                  }
                  dropdown={{
                    dataArray: TeacherClassesArray,
                    value: selectedAssignmentClass,
                    onSelect: (e: any) => setAssignmentClass(e),
                    loading: loadClassesForTeacher,
                  }}
                  loading={assignmentLoading || assingmentDueLoading}
                />
                <CircleGraph
                  title="Assessments"
                  parentClass="bg-light-sunlight grow"
                  progress={
                    +(
                      assessmentData?.data?.response?.assessments_in_percent ||
                      0
                    )
                  }
                  color="#fe8c32"
                  total={
                    +(assessmentData?.data?.response?.total_assessments || 0)
                  }
                  dropdown={{
                    dataArray: TeacherClassesArray,
                    value: selectedAssessmentClass,
                    onSelect: (e: any) => setAssessmentClass(e),
                    loading: loadClassesForTeacher,
                  }}
                  loading={assessmentDueLoading || assessmentLoading}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden mt-3">
            <div className="relative">
              <div
                className={`relative lg:absolute right-0 -top-6 ${isVisibleDropdown ? '' : 'hidden'}`}
              >
                <Dropdown
                  title="Select Branch"
                  value={selectedWeek}
                  dataArray={weekList}
                  onChangeHandler={(val: string) => setSelectedWeek(val)}
                  sxClass={{ width: '150px' }}
                />
              </div>
              {assignmentLoading ||
              assingmentDueLoading ||
              assessmentLoading ||
              assessmentDueLoading ? (
                <div className="h-56">
                  <Loader />
                </div>
              ) : (
                <Tabs
                  dueData={{
                    assessment:
                      selectedWeek !== 'select'
                        ? assessmentDueData?.data?.response
                            ?.due_soon_assessments || []
                        : assessmentData?.data?.response
                            ?.due_soon_assessments || [],
                    assignment:
                      selectedWeek !== 'select'
                        ? assignmentDueData?.data?.response
                            ?.due_soon_assignments || []
                        : assignmentData?.data?.response
                            ?.due_soon_assignments || [],
                  }}
                  inCompleteData={{
                    assessment:
                      assessmentData?.data?.response?.incomplete_assessments ||
                      [],
                    assignment:
                      assignmentData?.data?.response?.incomplete_assignments ||
                      [],
                  }}
                  currentSelectedTab={(selectedTab) => {
                    if (selectedTab === 'InComplete') {
                      setVisibleDropdown(false);
                    } else {
                      setVisibleDropdown(true);
                    }
                  }}
                />
              )}
            </div>
            <TeacherIconContainer />
          </div>
        </div>
      </div>
      <CustomizedDialogs
        title="Add Event"
        open={openPopup}
        setOpen={setopenPopup}
        onclose={() => setopenPopup(false)}
      >
        <EventForm
          close={() => setopenPopup(false)}
          refetch={() => {
            refreshEvents();
            refetch();
          }}
        />
      </CustomizedDialogs>
      <Popover
        id={popOverId}
        open={openCalendarPopup}
        anchorEl={calendarRef?.current}
        onClose={() => setCalendarPopup(false)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
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
      <CustomizedDialogs
        title="Event"
        open={showPopup}
        setOpen={setShowPopup}
        onclose={() => setShowPopup(false)}
      >
        <EventForm
          close={() => setShowPopup(false)}
          disabled={true}
          data={singleEvent?.data?.response[0]}
        />
      </CustomizedDialogs>
    </RouteLayout>
  );
}
